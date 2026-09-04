import json
import uuid
import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import psycopg2
import psycopg2.extras
from app.core.config import settings
from app.core.security import hash_password

def get_db_connection():
    """Get PostgreSQL connection with dictionary cursor and robust SSL handling."""
    raw_url = settings.DATABASE_URL
    clean_url = raw_url.split("&channel_binding=")[0] if "&channel_binding=" in raw_url else raw_url
    conn = psycopg2.connect(clean_url, connect_timeout=10)
    return conn

def init_db():
    """Initialize Neon PostgreSQL tables and seed default demo user."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # 1. Users Table (Owner Entity with 50 Free Demo Credits & BYOK Custom Key)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT DEFAULT 'analyst',
            demo_credits INTEGER DEFAULT 50,
            custom_sectors_key TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE users ADD COLUMN IF NOT EXISTS demo_credits INTEGER DEFAULT 50;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_sectors_key TEXT;
    """)
    
    # 2. Chat Sessions Table (Rooms owned by user_id with JSONB messages column)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            primary_ticker TEXT,
            messages JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 3. Research Reports Table (Dossier archives owned by user_id)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_reports (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            query TEXT NOT NULL,
            intent TEXT NOT NULL,
            primary_ticker TEXT,
            comparison_tickers JSONB,
            report_data JSONB NOT NULL,
            total_execution_time_ms INTEGER DEFAULT 0,
            credits_consumed INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 4. User Watchlist Table (Owned by user_id)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_watchlists (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            ticker TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, ticker)
        );
    """)
    
    # 5. Global 24-Hour Sectors API Cache Table (Shared across all users)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sectors_api_cache (
            cache_key TEXT PRIMARY KEY,
            endpoint TEXT,
            params JSONB,
            response_data JSONB NOT NULL,
            status_code INTEGER DEFAULT 200,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMPTZ NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sectors_cache_expires ON sectors_api_cache (expires_at);
        CREATE INDEX IF NOT EXISTS idx_sectors_cache_endpoint ON sectors_api_cache (endpoint);
    """)

    # 6. Comprehensive AI Interaction & Observability Audit Logs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_interaction_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            session_id TEXT,
            query TEXT NOT NULL,
            model_name TEXT,
            vision_model TEXT,
            image_url TEXT,
            intent TEXT,
            primary_ticker TEXT,
            comparison_tickers JSONB,
            context_data JSONB,
            sectors_tool_calls JSONB,
            credits_consumed INTEGER DEFAULT 0,
            execution_time_ms INTEGER DEFAULT 0,
            estimated_cost JSONB,
            output_summary TEXT,
            output_data JSONB,
            reasoning_trace JSONB,
            error_message TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_interaction_logs (user_id);
        CREATE INDEX IF NOT EXISTS idx_ai_logs_session_id ON ai_interaction_logs (session_id);
        CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_interaction_logs (created_at DESC);
    """)
    
    # Pre-seed demo user if not exists
    cursor.execute("SELECT id FROM users WHERE email = %s", ("demo@alphasector.id",))
    if not cursor.fetchone():
        demo_pwd_hash = hash_password("alphasector123")
        cursor.execute("""
            INSERT INTO users (email, full_name, hashed_password, role)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING
        """, ("demo@alphasector.id", "Demo Institutional Analyst", demo_pwd_hash, "pro_analyst"))
        conn.commit()
        
    conn.commit()
    conn.close()

class UserRepository:
    """Neon PostgreSQL repository for User management."""
    
    @staticmethod
    def get_by_email(email: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email.lower().strip(),))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create(email: str, full_name: str, password: str, role: str = "analyst") -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        pwd_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO users (email, full_name, hashed_password, role, demo_credits)
            VALUES (%s, %s, %s, %s, 50)
            RETURNING *
        """, (email.lower().strip(), full_name.strip(), pwd_hash, role))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return dict(row)

    @staticmethod
    def update_custom_api_key(user_id: int, custom_key: Optional[str]) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        clean_key = custom_key.strip() if custom_key else None
        cursor.execute("UPDATE users SET custom_sectors_key = %s WHERE id = %s", (clean_key, user_id))
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def deduct_demo_credits(user_id: int, amount: int = 1) -> int:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            UPDATE users 
            SET demo_credits = GREATEST(0, demo_credits - %s)
            WHERE id = %s
            RETURNING demo_credits
        """, (amount, user_id))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return row["demo_credits"] if row else 0


class ChatRepository:
    """Neon PostgreSQL repository for User-Owned Chat Rooms with JSONB messages column."""

    @staticmethod
    def create_session(user_id: int, title: str, primary_ticker: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        s_id = session_id or str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO chat_sessions (id, user_id, title, primary_ticker, messages)
            VALUES (%s, %s, %s, %s, '[]'::jsonb)
            ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, updated_at = CURRENT_TIMESTAMP
            RETURNING *
        """, (s_id, user_id, title[:80], primary_ticker))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        res = dict(row)
        if res.get("created_at"):
            res["created_at"] = res["created_at"].isoformat()
        if res.get("updated_at"):
            res["updated_at"] = res["updated_at"].isoformat()
        return res

    @staticmethod
    def get_user_sessions(user_id: int, limit: int = 30) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT id, user_id, title, primary_ticker, 
                   jsonb_array_length(COALESCE(messages, '[]'::jsonb)) as message_count,
                   created_at, updated_at
            FROM chat_sessions
            WHERE user_id = %s
            ORDER BY updated_at DESC
            LIMIT %s
        """, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        sessions = []
        for r in rows:
            s = dict(r)
            if s.get("created_at"):
                s["created_at"] = s["created_at"].isoformat()
            if s.get("updated_at"):
                s["updated_at"] = s["updated_at"].isoformat()
            sessions.append(s)
        return sessions

    @staticmethod
    def get_session(session_id: str, user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM chat_sessions WHERE id = %s AND user_id = %s", (session_id, user_id))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        res = dict(row)
        if res.get("created_at"):
            res["created_at"] = res["created_at"].isoformat()
        if res.get("updated_at"):
            res["updated_at"] = res["updated_at"].isoformat()
        return res

    @staticmethod
    def update_session(session_id: str, user_id: int, title: Optional[str] = None, primary_ticker: Optional[str] = None) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE chat_sessions
            SET title = COALESCE(%s, title),
                primary_ticker = COALESCE(%s, primary_ticker),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND user_id = %s
        """, (title, primary_ticker, session_id, user_id))
        updated = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return updated

    @staticmethod
    def delete_session(session_id: str, user_id: int) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_sessions WHERE id = %s AND user_id = %s", (session_id, user_id))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    @staticmethod
    def add_message(session_id: str, user_id: int, role: str, content: str, report_data: Optional[Dict[str, Any]] = None, image_url: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        msg_obj = {
            "id": int(time.time() * 1000),
            "session_id": session_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "report_data": report_data,
            "image_url": image_url,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Append message to JSONB array and update session updated_at
        cursor.execute("""
            UPDATE chat_sessions
            SET messages = COALESCE(messages, '[]'::jsonb) || %s::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND user_id = %s
            RETURNING *;
        """, (json.dumps([msg_obj], ensure_ascii=False), session_id, user_id))
        
        conn.commit()
        conn.close()
        return msg_obj

    @staticmethod
    def get_session_messages(session_id: str, user_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT messages FROM chat_sessions WHERE id = %s AND user_id = %s", (session_id, user_id))
        row = cursor.fetchone()
        conn.close()
        if not row or not row.get("messages"):
            return []
        return row["messages"]


class ResearchReportRepository:
    """Neon PostgreSQL repository for User-Owned Research Reports & Dossiers."""
    
    @staticmethod
    def create(
        user_id: int, 
        query: str, 
        intent: str, 
        primary_ticker: Optional[str],
        comparison_tickers: List[str],
        report_data: Dict[str, Any],
        total_execution_time_ms: int = 0,
        credits_consumed: int = 0
    ) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            INSERT INTO research_reports (
                user_id, query, intent, primary_ticker, comparison_tickers,
                report_data, total_execution_time_ms, credits_consumed
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            user_id,
            query,
            intent,
            primary_ticker,
            json.dumps(comparison_tickers),
            json.dumps(report_data, ensure_ascii=False),
            total_execution_time_ms,
            credits_consumed
        ))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return dict(row)

    @staticmethod
    def get_user_history(user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT id, user_id, query, intent, primary_ticker, comparison_tickers,
                   total_execution_time_ms, credits_consumed, created_at
            FROM research_reports 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        history = []
        for r in rows:
            h = dict(r)
            if h.get("created_at"):
                h["created_at"] = h["created_at"].isoformat()
            history.append(h)
        return history

    @staticmethod
    def get_by_id(report_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT * FROM research_reports WHERE id = %s AND user_id = %s
        """, (report_id, user_id))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        res = dict(row)
        if res.get("created_at"):
            res["created_at"] = res["created_at"].isoformat()
        return res


class WatchlistRepository:
    """Neon PostgreSQL repository for User-Owned Watchlists."""
    
    @staticmethod
    def add(user_id: int, ticker: str, notes: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        clean_ticker = ticker.upper().strip().replace(".JK", "")
        cursor.execute("""
            INSERT INTO user_watchlists (user_id, ticker, notes)
            VALUES (%s, %s, %s)
            ON CONFLICT(user_id, ticker) DO UPDATE SET notes = EXCLUDED.notes
            RETURNING *
        """, (user_id, clean_ticker, notes))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return dict(row)

    @staticmethod
    def get_user_watchlist(user_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT * FROM user_watchlists WHERE user_id = %s ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        conn.close()
        watchlist = []
        for r in rows:
            w = dict(r)
            if w.get("created_at"):
                w["created_at"] = w["created_at"].isoformat()
            watchlist.append(w)
        return watchlist

    @staticmethod
    def remove(user_id: int, ticker: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        clean_ticker = ticker.upper().strip().replace(".JK", "")
        cursor.execute("DELETE FROM user_watchlists WHERE user_id = %s AND ticker = %s", (user_id, clean_ticker))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted


class SectorsCacheRepository:
    """Neon PostgreSQL repository for 24-Hour Persistent Sectors API Caching across all users."""

    @staticmethod
    def get(cache_key: str) -> Optional[Any]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            cursor.execute("""
                SELECT response_data, status_code
                FROM sectors_api_cache
                WHERE cache_key = %s AND expires_at > CURRENT_TIMESTAMP
            """, (cache_key,))
            row = cursor.fetchone()
            if row:
                return row["response_data"]
            return None
        except Exception as e:
            return None
        finally:
            conn.close()

    @staticmethod
    def set(
        cache_key: str, 
        data: Any, 
        endpoint: str = "", 
        params: Optional[Dict[str, Any]] = None, 
        ttl_seconds: int = 86400, 
        status_code: int = 200
    ) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO sectors_api_cache (
                    cache_key, endpoint, params, response_data, status_code, created_at, expires_at
                ) VALUES (
                    %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, 
                    CURRENT_TIMESTAMP + (%s || ' seconds')::INTERVAL
                )
                ON CONFLICT (cache_key) DO UPDATE SET
                    response_data = EXCLUDED.response_data,
                    endpoint = EXCLUDED.endpoint,
                    params = EXCLUDED.params,
                    status_code = EXCLUDED.status_code,
                    created_at = CURRENT_TIMESTAMP,
                    expires_at = CURRENT_TIMESTAMP + (%s || ' seconds')::INTERVAL;
            """, (
                cache_key,
                endpoint,
                json.dumps(params or {}),
                json.dumps(data, ensure_ascii=False),
                status_code,
                str(ttl_seconds),
                str(ttl_seconds)
            ))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            return False
        finally:
            conn.close()

    @staticmethod
    def clear_expired() -> int:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM sectors_api_cache WHERE expires_at <= CURRENT_TIMESTAMP")
            deleted = cursor.rowcount
            conn.commit()
            return deleted
        except Exception:
            return 0
        finally:
            conn.close()

    @staticmethod
    def count_active() -> int:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM sectors_api_cache WHERE expires_at > CURRENT_TIMESTAMP")
            return cursor.fetchone()[0]
        except Exception:
            return 0
        finally:
            conn.close()

class AILogRepository:
    """Repository for auditing, behavioral investigation, and observability of all AI calls."""
    
    @staticmethod
    def log_interaction(
        query: str,
        model_name: str,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        vision_model: Optional[str] = None,
        image_url: Optional[str] = None,
        intent: Optional[str] = None,
        primary_ticker: Optional[str] = None,
        comparison_tickers: Optional[List[str]] = None,
        context_data: Optional[Dict[str, Any]] = None,
        sectors_tool_calls: Optional[List[Dict[str, Any]]] = None,
        credits_consumed: int = 0,
        execution_time_ms: int = 0,
        estimated_cost: Optional[Dict[str, Any]] = None,
        output_summary: Optional[str] = None,
        output_data: Optional[Dict[str, Any]] = None,
        reasoning_trace: Optional[List[Dict[str, Any]]] = None,
        error_message: Optional[str] = None
    ) -> Optional[int]:
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO ai_interaction_logs (
                    user_id, session_id, query, model_name, vision_model, image_url,
                    intent, primary_ticker, comparison_tickers, context_data,
                    sectors_tool_calls, credits_consumed, execution_time_ms, estimated_cost,
                    output_summary, output_data, reasoning_trace, error_message, created_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s, CURRENT_TIMESTAMP
                ) RETURNING id;
            """, (
                user_id,
                session_id,
                query,
                model_name,
                vision_model,
                image_url,
                intent,
                primary_ticker,
                json.dumps(comparison_tickers or []),
                json.dumps(context_data or {}, ensure_ascii=False),
                json.dumps(sectors_tool_calls or [], ensure_ascii=False),
                credits_consumed,
                execution_time_ms,
                json.dumps(estimated_cost or {}),
                output_summary,
                json.dumps(output_data or {}, ensure_ascii=False) if output_data else None,
                json.dumps(reasoning_trace or [], ensure_ascii=False) if reasoning_trace else None,
                error_message
            ))
            new_id = cursor.fetchone()[0]
            conn.commit()
            return new_id
        except Exception as e:
            print(f"[Warning] Failed to log AI interaction to DB: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()

    @staticmethod
    def get_logs(limit: int = 50, session_id: Optional[str] = None, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            query = "SELECT * FROM ai_interaction_logs"
            params = []
            conditions = []
            if session_id:
                conditions.append("session_id = %s")
                params.append(session_id)
            if user_id:
                conditions.append("user_id = %s")
                params.append(user_id)
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            query += " ORDER BY created_at DESC LIMIT %s"
            params.append(limit)
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            logs = []
            for r in rows:
                d = dict(r)
                if d.get("created_at") and hasattr(d["created_at"], "isoformat"):
                    d["created_at"] = d["created_at"].isoformat()
                logs.append(d)
            return logs
        except Exception as e:
            print(f"[Warning] Failed to fetch AI interaction logs: {e}")
            return []
        finally:
            conn.close()



