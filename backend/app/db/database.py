import sqlite3
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
    
    # Create users table
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
    
    # Pre-seed demo user if not exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ("demo@alphasector.id",))
    if not cursor.fetchone():
        demo_pwd_hash = hash_password("alphasector123")
        cursor.execute("""
            INSERT INTO users (email, full_name, hashed_password, role)
            VALUES (?, ?, ?, ?)
        """, ("demo@alphasector.id", "Demo Institutional Analyst", demo_pwd_hash, "pro_analyst"))
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
