import os
import json
import uuid
import time
import logging
import sqlite3
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from pathlib import Path

from app.core.config import settings
from app.core.security import hash_password

logger = logging.getLogger("alphasector.db")

# Path for local SQLite fallback database
SQLITE_DB_PATH = Path(__file__).resolve().parent.parent.parent / "alphasector.db"

# Optional psycopg2 import (graceful fallback if not installed)
try:
    import psycopg2
    import psycopg2.extras
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
    psycopg2 = None

_db_mode: Optional[str] = None  # "postgres" or "sqlite"

def detect_db_mode() -> str:
    """Detect whether to use Neon PostgreSQL or local SQLite fallback."""
    global _db_mode
    if _db_mode is not None:
        return _db_mode

    raw_url = getattr(settings, "DATABASE_URL", "").strip()
    if raw_url and HAS_PSYCOPG2:
        try:
            clean_url = raw_url.split("&channel_binding=")[0] if "&channel_binding=" in raw_url else raw_url
            test_conn = psycopg2.connect(clean_url, connect_timeout=4)
            test_conn.close()
            _db_mode = "postgres"
            logger.info("Connected to PostgreSQL database (Neon Cloud).")
            return _db_mode
        except Exception as e:
            logger.warning(f"⚠️ PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
    
    _db_mode = "sqlite"
    logger.info(f"Using local SQLite database at: {SQLITE_DB_PATH}")
    return _db_mode

def get_db_connection():
    """Get active database connection (PostgreSQL or SQLite with dict row factory)."""
    mode = detect_db_mode()
    if mode == "postgres":
        raw_url = settings.DATABASE_URL
        clean_url = raw_url.split("&channel_binding=")[0] if "&channel_binding=" in raw_url else raw_url
        return psycopg2.connect(clean_url, connect_timeout=10)
    else:
        conn = sqlite3.connect(str(SQLITE_DB_PATH))
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

def init_db():
    """Initialize database tables and seed default demo user (Dual-Mode: Postgres or SQLite)."""
    mode = detect_db_mode()
    conn = get_db_connection()
    
    if mode == "postgres":
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
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
    else:
        # SQLite Initialization
        cursor = conn.cursor()
        cursor.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                hashed_password TEXT NOT NULL,
                role TEXT DEFAULT 'analyst',
                demo_credits INTEGER DEFAULT 50,
                custom_sectors_key TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                primary_ticker TEXT,
                messages TEXT DEFAULT '[]',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS research_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                query TEXT NOT NULL,
                intent TEXT NOT NULL,
                primary_ticker TEXT,
                comparison_tickers TEXT,
                report_data TEXT NOT NULL,
                total_execution_time_ms INTEGER DEFAULT 0,
                credits_consumed INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS user_watchlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                ticker TEXT NOT NULL,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, ticker)
            );
            CREATE TABLE IF NOT EXISTS sectors_api_cache (
                cache_key TEXT PRIMARY KEY,
                endpoint TEXT,
                params TEXT,
                response_data TEXT NOT NULL,
                status_code INTEGER DEFAULT 200,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                expires_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_sectors_cache_expires ON sectors_api_cache (expires_at);
            CREATE INDEX IF NOT EXISTS idx_sectors_cache_endpoint ON sectors_api_cache (endpoint);
            CREATE TABLE IF NOT EXISTS ai_interaction_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                session_id TEXT,
                query TEXT NOT NULL,
                model_name TEXT,
                vision_model TEXT,
                image_url TEXT,
                intent TEXT,
                primary_ticker TEXT,
                comparison_tickers TEXT,
                context_data TEXT,
                sectors_tool_calls TEXT,
                credits_consumed INTEGER DEFAULT 0,
                execution_time_ms INTEGER DEFAULT 0,
                estimated_cost TEXT,
                output_summary TEXT,
                output_data TEXT,
                reasoning_trace TEXT,
                error_message TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("SELECT id FROM users WHERE email = ?", ("demo@alphasector.id",))
        if not cursor.fetchone():
            demo_pwd_hash = hash_password("alphasector123")
            cursor.execute("""
                INSERT OR IGNORE INTO users (email, full_name, hashed_password, role, demo_credits)
                VALUES (?, ?, ?, ?, 50)
            """, ("demo@alphasector.id", "Demo Institutional Analyst", demo_pwd_hash, "pro_analyst"))
            conn.commit()
        conn.commit()
        conn.close()


class UserRepository:
    """Repository for User management (Postgres / SQLite)."""
    
    @staticmethod
    def get_by_email(email: str) -> Optional[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        clean_email = email.lower().strip()
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM users WHERE email = %s", (clean_email,))
            row = cursor.fetchone()
            conn.close()
            return dict(row) if row else None
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
            row = cursor.fetchone()
            conn.close()
            return dict(row) if row else None

    @staticmethod
    def get_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            row = cursor.fetchone()
            conn.close()
            return dict(row) if row else None
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            conn.close()
            return dict(row) if row else None

    @staticmethod
    def create(email: str, full_name: str, password: str, role: str = "analyst") -> Dict[str, Any]:
        mode = detect_db_mode()
        conn = get_db_connection()
        pwd_hash = hash_password(password)
        clean_email = email.lower().strip()
        clean_name = full_name.strip()
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                INSERT INTO users (email, full_name, hashed_password, role, demo_credits)
                VALUES (%s, %s, %s, %s, 50)
                RETURNING *
            """, (clean_email, clean_name, pwd_hash, role))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            return dict(row)
        else:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (email, full_name, hashed_password, role, demo_credits)
                VALUES (?, ?, ?, ?, 50)
                RETURNING *
            """, (clean_email, clean_name, pwd_hash, role))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            return dict(row)

    @staticmethod
    def update_custom_api_key(user_id: int, custom_key: Optional[str]) -> bool:
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        clean_key = custom_key.strip() if custom_key else None
        if mode == "postgres":
            cursor.execute("UPDATE users SET custom_sectors_key = %s WHERE id = %s", (clean_key, user_id))
        else:
            cursor.execute("UPDATE users SET custom_sectors_key = ? WHERE id = ?", (clean_key, user_id))
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def update_password(user_id: int, new_password: str) -> bool:
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        pwd_hash = hash_password(new_password)
        if mode == "postgres":
            cursor.execute("UPDATE users SET hashed_password = %s WHERE id = %s", (pwd_hash, user_id))
        else:
            cursor.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (pwd_hash, user_id))
        conn.commit()
        conn.close()
        return True

    @staticmethod
    def deduct_demo_credits(user_id: int, amount: int = 1) -> int:
        mode = detect_db_mode()
        conn = get_db_connection()
        if mode == "postgres":
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
        else:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE users 
                SET demo_credits = MAX(0, demo_credits - ?)
                WHERE id = ?
                RETURNING demo_credits
            """, (amount, user_id))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            return row["demo_credits"] if row else 0


class ChatRepository:
    """Repository for User-Owned Chat Rooms with multi-turn messages."""

    @staticmethod
    def create_session(user_id: int, title: str, primary_ticker: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        mode = detect_db_mode()
        conn = get_db_connection()
        s_id = session_id or str(uuid.uuid4())
        clean_title = title[:80]
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                INSERT INTO chat_sessions (id, user_id, title, primary_ticker, messages)
                VALUES (%s, %s, %s, %s, '[]'::jsonb)
                ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, updated_at = CURRENT_TIMESTAMP
                RETURNING *
            """, (s_id, user_id, clean_title, primary_ticker))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            res = dict(row)
        else:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO chat_sessions (id, user_id, title, primary_ticker, messages)
                VALUES (?, ?, ?, ?, '[]')
                ON CONFLICT(id) DO UPDATE SET title = excluded.title, updated_at = CURRENT_TIMESTAMP
                RETURNING *
            """, (s_id, user_id, clean_title, primary_ticker))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            res = dict(row)
            if isinstance(res.get("messages"), str):
                try: res["messages"] = json.loads(res["messages"])
                except Exception: res["messages"] = []

        if res.get("created_at") and hasattr(res["created_at"], "isoformat"):
            res["created_at"] = res["created_at"].isoformat()
        if res.get("updated_at") and hasattr(res["updated_at"], "isoformat"):
            res["updated_at"] = res["updated_at"].isoformat()
        return res

    @staticmethod
    def get_user_sessions(user_id: int, limit: int = 30) -> List[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        if mode == "postgres":
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
                if s.get("created_at") and hasattr(s["created_at"], "isoformat"):
                    s["created_at"] = s["created_at"].isoformat()
                if s.get("updated_at") and hasattr(s["updated_at"], "isoformat"):
                    s["updated_at"] = s["updated_at"].isoformat()
                sessions.append(s)
            return sessions
        else:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, user_id, title, primary_ticker, messages, created_at, updated_at
                FROM chat_sessions
                WHERE user_id = ?
                ORDER BY updated_at DESC
                LIMIT ?
            """, (user_id, limit))
            rows = cursor.fetchall()
            conn.close()
            sessions = []
            for r in rows:
                s = dict(r)
                raw_msgs = s.pop("messages", "[]")
                try:
                    msgs_list = json.loads(raw_msgs) if isinstance(raw_msgs, str) else (raw_msgs or [])
                except Exception:
                    msgs_list = []
                s["message_count"] = len(msgs_list)
                sessions.append(s)
            return sessions

    @staticmethod
    def get_session(session_id: str, user_id: int) -> Optional[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM chat_sessions WHERE id = %s AND user_id = %s", (session_id, user_id))
            row = cursor.fetchone()
            conn.close()
            if not row: return None
            res = dict(row)
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
            row = cursor.fetchone()
            conn.close()
            if not row: return None
            res = dict(row)
            if isinstance(res.get("messages"), str):
                try: res["messages"] = json.loads(res["messages"])
                except Exception: res["messages"] = []

        if res.get("created_at") and hasattr(res["created_at"], "isoformat"):
            res["created_at"] = res["created_at"].isoformat()
        if res.get("updated_at") and hasattr(res["updated_at"], "isoformat"):
            res["updated_at"] = res["updated_at"].isoformat()
        return res

    @staticmethod
    def update_session(session_id: str, user_id: int, title: Optional[str] = None, primary_ticker: Optional[str] = None) -> bool:
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        if mode == "postgres":
            cursor.execute("""
                UPDATE chat_sessions
                SET title = COALESCE(%s, title),
                    primary_ticker = COALESCE(%s, primary_ticker),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            """, (title, primary_ticker, session_id, user_id))
        else:
            cursor.execute("""
                UPDATE chat_sessions
                SET title = COALESCE(?, title),
                    primary_ticker = COALESCE(?, primary_ticker),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            """, (title, primary_ticker, session_id, user_id))
        updated = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return updated

    @staticmethod
    def delete_session(session_id: str, user_id: int) -> bool:
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        if mode == "postgres":
            cursor.execute("DELETE FROM chat_sessions WHERE id = %s AND user_id = %s", (session_id, user_id))
        else:
            cursor.execute("DELETE FROM chat_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    @staticmethod
    def add_message(session_id: str, user_id: int, role: str, content: str, report_data: Optional[Dict[str, Any]] = None, image_url: Optional[str] = None) -> Dict[str, Any]:
        mode = detect_db_mode()
        conn = get_db_connection()
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
        
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                UPDATE chat_sessions
                SET messages = COALESCE(messages, '[]'::jsonb) || %s::jsonb,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
                RETURNING *;
            """, (json.dumps([msg_obj], ensure_ascii=False), session_id, user_id))
            conn.commit()
            conn.close()
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT messages FROM chat_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
            row = cursor.fetchone()
            existing_msgs = []
            if row and row["messages"]:
                try: existing_msgs = json.loads(row["messages"])
                except Exception: existing_msgs = []
            existing_msgs.append(msg_obj)
            cursor.execute("""
                UPDATE chat_sessions
                SET messages = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            """, (json.dumps(existing_msgs, ensure_ascii=False), session_id, user_id))
            conn.commit()
            conn.close()

        return msg_obj

    @staticmethod
    def get_session_messages(session_id: str, user_id: int) -> List[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT messages FROM chat_sessions WHERE id = %s AND user_id = %s", (session_id, user_id))
            row = cursor.fetchone()
            conn.close()
            if not row or not row.get("messages"): return []
            return row["messages"]
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT messages FROM chat_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
            row = cursor.fetchone()
            conn.close()
            if not row or not row["messages"]: return []
            try: return json.loads(row["messages"])
            except Exception: return []


class ResearchReportRepository:
    """Repository for User-Owned Research Reports & Dossiers."""
    
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
        mode = detect_db_mode()
        conn = get_db_connection()
        comp_json = json.dumps(comparison_tickers or [])
        report_json = json.dumps(report_data, ensure_ascii=False)
        
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                INSERT INTO research_reports (
                    user_id, query, intent, primary_ticker, comparison_tickers,
                    report_data, total_execution_time_ms, credits_consumed
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (user_id, query, intent, primary_ticker, comp_json, report_json, total_execution_time_ms, credits_consumed))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            return dict(row)
        else:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO research_reports (
                    user_id, query, intent, primary_ticker, comparison_tickers,
                    report_data, total_execution_time_ms, credits_consumed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING *
            """, (user_id, query, intent, primary_ticker, comp_json, report_json, total_execution_time_ms, credits_consumed))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            res = dict(row)
            try: res["comparison_tickers"] = json.loads(res["comparison_tickers"])
            except Exception: pass
            try: res["report_data"] = json.loads(res["report_data"])
            except Exception: pass
            return res

    @staticmethod
    def get_user_history(user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        if mode == "postgres":
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
                if h.get("created_at") and hasattr(h["created_at"], "isoformat"):
                    h["created_at"] = h["created_at"].isoformat()
                history.append(h)
            return history
        else:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, user_id, query, intent, primary_ticker, comparison_tickers,
                       total_execution_time_ms, credits_consumed, created_at
                FROM research_reports 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            """, (user_id, limit))
            rows = cursor.fetchall()
            conn.close()
            history = []
            for r in rows:
                h = dict(r)
                if isinstance(h.get("comparison_tickers"), str):
                    try: h["comparison_tickers"] = json.loads(h["comparison_tickers"])
                    except Exception: pass
                history.append(h)
            return history

    @staticmethod
    def get_by_id(report_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM research_reports WHERE id = %s AND user_id = %s", (report_id, user_id))
            row = cursor.fetchone()
            conn.close()
            if not row: return None
            res = dict(row)
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM research_reports WHERE id = ? AND user_id = ?", (report_id, user_id))
            row = cursor.fetchone()
            conn.close()
            if not row: return None
            res = dict(row)
            if isinstance(res.get("comparison_tickers"), str):
                try: res["comparison_tickers"] = json.loads(res["comparison_tickers"])
                except Exception: pass
            if isinstance(res.get("report_data"), str):
                try: res["report_data"] = json.loads(res["report_data"])
                except Exception: pass

        if res.get("created_at") and hasattr(res["created_at"], "isoformat"):
            res["created_at"] = res["created_at"].isoformat()
        return res


class WatchlistRepository:
    """Repository for User-Owned Watchlists."""
    
    @staticmethod
    def add(user_id: int, ticker: str, notes: Optional[str] = None) -> Dict[str, Any]:
        mode = detect_db_mode()
        conn = get_db_connection()
        clean_ticker = ticker.upper().strip().replace(".JK", "")
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
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
        else:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_watchlists (user_id, ticker, notes)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id, ticker) DO UPDATE SET notes = excluded.notes
                RETURNING *
            """, (user_id, clean_ticker, notes))
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            return dict(row)

    @staticmethod
    def get_user_watchlist(user_id: int) -> List[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        if mode == "postgres":
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM user_watchlists WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
            rows = cursor.fetchall()
            conn.close()
            watchlist = []
            for r in rows:
                w = dict(r)
                if w.get("created_at") and hasattr(w["created_at"], "isoformat"):
                    w["created_at"] = w["created_at"].isoformat()
                watchlist.append(w)
            return watchlist
        else:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_watchlists WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            rows = cursor.fetchall()
            conn.close()
            return [dict(r) for r in rows]

    @staticmethod
    def remove(user_id: int, ticker: str) -> bool:
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        clean_ticker = ticker.upper().strip().replace(".JK", "")
        if mode == "postgres":
            cursor.execute("DELETE FROM user_watchlists WHERE user_id = %s AND ticker = %s", (user_id, clean_ticker))
        else:
            cursor.execute("DELETE FROM user_watchlists WHERE user_id = ? AND ticker = ?", (user_id, clean_ticker))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted


class SectorsCacheRepository:
    """Repository for Persistent Sectors API Caching."""

    @staticmethod
    def get(cache_key: str) -> Optional[Any]:
        mode = detect_db_mode()
        conn = get_db_connection()
        try:
            if mode == "postgres":
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                cursor.execute("""
                    SELECT response_data, status_code
                    FROM sectors_api_cache
                    WHERE cache_key = %s AND expires_at > CURRENT_TIMESTAMP
                """, (cache_key,))
                row = cursor.fetchone()
                return row["response_data"] if row else None
            else:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT response_data, status_code
                    FROM sectors_api_cache
                    WHERE cache_key = ? AND expires_at > datetime('now')
                """, (cache_key,))
                row = cursor.fetchone()
                if row and row["response_data"]:
                    try: return json.loads(row["response_data"])
                    except Exception: return row["response_data"]
                return None
        except Exception:
            return None
        finally:
            conn.close()

    @staticmethod
    def get_with_metadata(cache_key: str) -> Optional[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        try:
            if mode == "postgres":
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                cursor.execute("""
                    SELECT response_data, status_code, created_at, expires_at,
                           (expires_at <= CURRENT_TIMESTAMP) AS is_expired
                    FROM sectors_api_cache
                    WHERE cache_key = %s
                """, (cache_key,))
                row = cursor.fetchone()
                if not row:
                    return None
                return {
                    "data": row["response_data"],
                    "status_code": row["status_code"],
                    "created_at": row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"]),
                    "expires_at": row["expires_at"].isoformat() if hasattr(row["expires_at"], "isoformat") else str(row["expires_at"]),
                    "is_expired": bool(row["is_expired"])
                }
            else:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT response_data, status_code, created_at, expires_at,
                           (expires_at <= datetime('now')) AS is_expired
                    FROM sectors_api_cache
                    WHERE cache_key = ?
                """, (cache_key,))
                row = cursor.fetchone()
                if not row:
                    return None
                resp_data = row[0]
                if resp_data and isinstance(resp_data, str):
                    try:
                        resp_data = json.loads(resp_data)
                    except Exception:
                        pass
                return {
                    "data": resp_data,
                    "status_code": row[1],
                    "created_at": str(row[2]),
                    "expires_at": str(row[3]),
                    "is_expired": bool(row[4])
                }
        except Exception:
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
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            if mode == "postgres":
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
            else:
                exp_dt = (datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)).strftime("%Y-%m-%d %H:%M:%S")
                cursor.execute("""
                    INSERT INTO sectors_api_cache (
                        cache_key, endpoint, params, response_data, status_code, created_at, expires_at
                    ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
                    ON CONFLICT(cache_key) DO UPDATE SET
                        response_data = excluded.response_data,
                        endpoint = excluded.endpoint,
                        params = excluded.params,
                        status_code = excluded.status_code,
                        created_at = datetime('now'),
                        expires_at = excluded.expires_at;
                """, (
                    cache_key,
                    endpoint,
                    json.dumps(params or {}),
                    json.dumps(data, ensure_ascii=False),
                    status_code,
                    exp_dt
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
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            if mode == "postgres":
                cursor.execute("DELETE FROM sectors_api_cache WHERE expires_at <= CURRENT_TIMESTAMP")
            else:
                cursor.execute("DELETE FROM sectors_api_cache WHERE expires_at <= datetime('now')")
            deleted = cursor.rowcount
            conn.commit()
            return deleted
        except Exception:
            return 0
        finally:
            conn.close()

    @staticmethod
    def count_active() -> int:
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            if mode == "postgres":
                cursor.execute("SELECT COUNT(*) FROM sectors_api_cache WHERE expires_at > CURRENT_TIMESTAMP")
            else:
                cursor.execute("SELECT COUNT(*) FROM sectors_api_cache WHERE expires_at > datetime('now')")
            row = cursor.fetchone()
            return row[0] if row else 0
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
        mode = detect_db_mode()
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            if mode == "postgres":
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
                    user_id, session_id, query, model_name, vision_model, image_url,
                    intent, primary_ticker,
                    json.dumps(comparison_tickers or []),
                    json.dumps(context_data or {}, ensure_ascii=False),
                    json.dumps(sectors_tool_calls or [], ensure_ascii=False),
                    credits_consumed, execution_time_ms,
                    json.dumps(estimated_cost or {}),
                    output_summary,
                    json.dumps(output_data or {}, ensure_ascii=False) if output_data else None,
                    json.dumps(reasoning_trace or [], ensure_ascii=False) if reasoning_trace else None,
                    error_message
                ))
            else:
                cursor.execute("""
                    INSERT INTO ai_interaction_logs (
                        user_id, session_id, query, model_name, vision_model, image_url,
                        intent, primary_ticker, comparison_tickers, context_data,
                        sectors_tool_calls, credits_consumed, execution_time_ms, estimated_cost,
                        output_summary, output_data, reasoning_trace, error_message, created_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, ?, datetime('now')
                    ) RETURNING id;
                """, (
                    user_id, session_id, query, model_name, vision_model, image_url,
                    intent, primary_ticker,
                    json.dumps(comparison_tickers or []),
                    json.dumps(context_data or {}, ensure_ascii=False),
                    json.dumps(sectors_tool_calls or [], ensure_ascii=False),
                    credits_consumed, execution_time_ms,
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
            logger.warning(f"Failed to log AI interaction to DB: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()

    @staticmethod
    def get_logs(limit: int = 50, session_id: Optional[str] = None, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        mode = detect_db_mode()
        conn = get_db_connection()
        try:
            if mode == "postgres":
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
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
            else:
                cursor = conn.cursor()
                query = "SELECT * FROM ai_interaction_logs"
                params = []
                conditions = []
                if session_id:
                    conditions.append("session_id = ?")
                    params.append(session_id)
                if user_id:
                    conditions.append("user_id = ?")
                    params.append(user_id)
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
                query += " ORDER BY created_at DESC LIMIT ?"
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
            logger.warning(f"Failed to fetch AI interaction logs: {e}")
            return []
        finally:
            conn.close()
