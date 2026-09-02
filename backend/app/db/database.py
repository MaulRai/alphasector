import json
import uuid
import os
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
    
    # 1. Users Table (Owner Entity)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT DEFAULT 'analyst',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 2. Chat Sessions Table (Rooms owned by user_id)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            primary_ticker TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 3. Chat Messages Table (Messages in a room owned by user_id)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            report_data JSONB,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 4. Research Reports Table (Dossier archives owned by user_id)
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
    
    # 5. User Watchlist Table (Owned by user_id)
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
            INSERT INTO users (email, full_name, hashed_password, role)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (email.lower().strip(), full_name.strip(), pwd_hash, role))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return dict(row)


class ChatRepository:
    """Neon PostgreSQL repository for User-Owned Chat Rooms & Message History."""

    @staticmethod
    def create_session(user_id: int, title: str, primary_ticker: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        s_id = session_id or str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO chat_sessions (id, user_id, title, primary_ticker)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, updated_at = CURRENT_TIMESTAMP
            RETURNING *
        """, (s_id, user_id, title[:80], primary_ticker))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        return dict(row)

    @staticmethod
    def get_user_sessions(user_id: int, limit: int = 30) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT s.*, 
                   (SELECT COUNT(*) FROM chat_messages m WHERE m.session_id = s.id) as message_count
            FROM chat_sessions s
            WHERE s.user_id = %s
            ORDER BY s.updated_at DESC
            LIMIT %s
        """, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_session(session_id: str, user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM chat_sessions WHERE id = %s AND user_id = %s", (session_id, user_id))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

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
    def add_message(session_id: str, user_id: int, role: str, content: str, report_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Ensure session exists / touch updated_at
        cursor.execute("""
            UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = %s AND user_id = %s
        """, (session_id, user_id))
        
        report_json = json.dumps(report_data, ensure_ascii=False) if report_data else None
        cursor.execute("""
            INSERT INTO chat_messages (session_id, user_id, role, content, report_data)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
        """, (session_id, user_id, role, content, report_json))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        
        res = dict(row)
        if res.get("created_at"):
            res["created_at"] = res["created_at"].isoformat()
        return res

    @staticmethod
    def get_session_messages(session_id: str, user_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("""
            SELECT * FROM chat_messages 
            WHERE session_id = %s AND user_id = %s
            ORDER BY created_at ASC
        """, (session_id, user_id))
        rows = cursor.fetchall()
        conn.close()
        
        messages = []
        for r in rows:
            m = dict(r)
            if m.get("created_at"):
                m["created_at"] = m["created_at"].isoformat()
            messages.append(m)
        return messages


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
