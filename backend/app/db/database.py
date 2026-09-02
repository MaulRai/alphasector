import sqlite3
import json
import uuid
import os
from pathlib import Path
from typing import Optional, Dict, Any, List
from app.core.security import hash_password

DB_PATH = Path(__file__).resolve().parent.parent.parent / "alphasector.db"

def get_db_connection():
    """Get SQLite connection with dictionary row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables and seed default demo user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Users Table (Owner Entity)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT DEFAULT 'analyst',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 2. Chat Sessions Table (Rooms owned by user_id)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            primary_ticker TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    """)
    
    # 3. Chat Messages Table (Messages in a room owned by user_id)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            report_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    """)
    
    # 4. Research Reports Table (Dossier archives owned by user_id)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            query TEXT NOT NULL,
            intent TEXT NOT NULL,
            primary_ticker TEXT,
            comparison_tickers TEXT,
            report_data TEXT NOT NULL,
            total_execution_time_ms INTEGER DEFAULT 0,
            credits_consumed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    """)
    
    # 5. User Watchlist Table (Owned by user_id)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_watchlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            ticker TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, ticker),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    """)
    
    # Pre-seed demo user if not exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ("demo@alphasector.id",))
    if not cursor.fetchone():
        demo_pwd_hash = hash_password("alphasector123")
        cursor.execute("""
            INSERT INTO users (email, full_name, hashed_password, role)
            VALUES (?, ?, ?, ?)
        """, ("demo@alphasector.id", "Demo Institutional Analyst", demo_pwd_hash, "pro_analyst"))
        conn.commit()
        
    conn.commit()
    conn.close()

class UserRepository:
    """Database repository for User management."""
    
    @staticmethod
    def get_by_email(email: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create(email: str, full_name: str, password: str, role: str = "analyst") -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        pwd_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO users (email, full_name, hashed_password, role)
            VALUES (?, ?, ?, ?)
        """, (email.lower().strip(), full_name.strip(), pwd_hash, role))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return UserRepository.get_by_id(user_id)


class ChatRepository:
    """Database repository for User-Owned Chat Rooms & Message History."""

    @staticmethod
    def create_session(user_id: int, title: str, primary_ticker: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        s_id = session_id or str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO chat_sessions (id, user_id, title, primary_ticker)
            VALUES (?, ?, ?, ?)
        """, (s_id, user_id, title[:80], primary_ticker))
        conn.commit()
        cursor.execute("SELECT * FROM chat_sessions WHERE id = ?", (s_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_user_sessions(user_id: int, limit: int = 30) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.*, 
                   (SELECT COUNT(*) FROM chat_messages m WHERE m.session_id = s.id) as message_count
            FROM chat_sessions s
            WHERE s.user_id = ?
            ORDER BY s.updated_at DESC
            LIMIT ?
        """, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_session(session_id: str, user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def update_session(session_id: str, user_id: int, title: Optional[str] = None, primary_ticker: Optional[str] = None) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
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
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    @staticmethod
    def add_message(session_id: str, user_id: int, role: str, content: str, report_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ensure session exists or touch updated_at
        cursor.execute("""
            UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?
        """, (session_id, user_id))
        
        cursor.execute("""
            INSERT INTO chat_messages (session_id, user_id, role, content, report_data)
            VALUES (?, ?, ?, ?, ?)
        """, (
            session_id,
            user_id,
            role,
            content,
            json.dumps(report_data, ensure_ascii=False) if report_data else None
        ))
        conn.commit()
        msg_id = cursor.lastrowid
        cursor.execute("SELECT * FROM chat_messages WHERE id = ?", (msg_id,))
        row = cursor.fetchone()
        conn.close()
        
        res = dict(row)
        if res.get("report_data"):
            try:
                res["report_data"] = json.loads(res["report_data"])
            except Exception:
                pass
        return res

    @staticmethod
    def get_session_messages(session_id: str, user_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM chat_messages 
            WHERE session_id = ? AND user_id = ?
            ORDER BY created_at ASC
        """, (session_id, user_id))
        rows = cursor.fetchall()
        conn.close()
        
        messages = []
        for r in rows:
            m = dict(r)
            if m.get("report_data"):
                try:
                    m["report_data"] = json.loads(m["report_data"])
                except Exception:
                    pass
            messages.append(m)
        return messages


class ResearchReportRepository:
    """Database repository for User-Owned Research Reports & Dossiers."""
    
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
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO research_reports (
                user_id, query, intent, primary_ticker, comparison_tickers,
                report_data, total_execution_time_ms, credits_consumed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
        conn.commit()
        report_id = cursor.lastrowid
        cursor.execute("SELECT * FROM research_reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_user_history(user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        conn = get_db_connection()
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
        return [dict(r) for r in rows]

    @staticmethod
    def get_by_id(report_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM research_reports WHERE id = ? AND user_id = ?
        """, (report_id, user_id))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        res = dict(row)
        res["comparison_tickers"] = json.loads(res.get("comparison_tickers") or "[]")
        res["report_data"] = json.loads(res.get("report_data") or "{}")
        return res


class WatchlistRepository:
    """Database repository for User-Owned Watchlists."""
    
    @staticmethod
    def add(user_id: int, ticker: str, notes: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        clean_ticker = ticker.upper().strip().replace(".JK", "")
        cursor.execute("""
            INSERT INTO user_watchlists (user_id, ticker, notes)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, ticker) DO UPDATE SET notes = excluded.notes
        """, (user_id, clean_ticker, notes))
        conn.commit()
        cursor.execute("SELECT * FROM user_watchlists WHERE user_id = ? AND ticker = ?", (user_id, clean_ticker))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    @staticmethod
    def get_user_watchlist(user_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM user_watchlists WHERE user_id = ? ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def remove(user_id: int, ticker: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        clean_ticker = ticker.upper().strip().replace(".JK", "")
        cursor.execute("DELETE FROM user_watchlists WHERE user_id = ? AND ticker = ?", (user_id, clean_ticker))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted
