"""
ClassroomAI Database Module
- Manages chat history (last 7 chats)
- Manages daily usage limits (50 per tool)
"""

import sqlite3
import json
from datetime import datetime, timedelta
from pathlib import Path

DB_PATH = Path(__file__).parent / "classroomai.db"

class ChatDatabase:
    """Manage chat history and usage limits"""

    def __init__(self):
        self.db_path = DB_PATH
        self.init_db()

    def init_db(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Chat history table
        c.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teacher_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                topic TEXT,
                grade_level TEXT,
                subject TEXT,
                request_data TEXT,
                response_preview TEXT,
                response_content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Usage tracking table
        c.execute('''
            CREATE TABLE IF NOT EXISTS usage_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teacher_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                usage_count INTEGER DEFAULT 0,
                reset_date DATE DEFAULT CURRENT_DATE,
                UNIQUE(teacher_id, tool_name, reset_date)
            )
        ''')

        conn.commit()
        conn.close()

    def save_chat(self, teacher_id: str, tool_name: str, topic: str,
                  grade_level: str, subject: str, request_data: dict,
                  response_preview: str, response_content: str = None) -> int:
        """Save chat to history"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Use response_content if provided, otherwise use response_preview
        full_content = response_content or response_preview

        c.execute('''
            INSERT INTO chat_history
            (teacher_id, tool_name, topic, grade_level, subject, request_data, response_preview, response_content)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (teacher_id, tool_name, topic, grade_level, subject,
              json.dumps(request_data), response_preview[:200], full_content))

        conn.commit()
        chat_id = c.lastrowid
        conn.close()

        return chat_id

    def get_last_7_chats(self, teacher_id: str) -> list:
        """Get last 7 chats for a teacher"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        c.execute('''
            SELECT id, tool_name, topic, grade_level, subject, response_preview, response_content, created_at
            FROM chat_history
            WHERE teacher_id = ?
            ORDER BY created_at DESC
            LIMIT 7
        ''', (teacher_id,))

        rows = c.fetchall()
        conn.close()

        chats = []
        for row in rows:
            chats.append({
                'id': row[0],
                'tool_name': row[1],
                'topic': row[2],
                'grade_level': row[3],
                'subject': row[4],
                'preview': row[5],
                'content': row[6],  # Full content
                'created_at': row[7]
            })

        return chats

    def increment_usage(self, teacher_id: str, tool_name: str) -> dict:
        """Increment usage count for today"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        today = datetime.now().date().isoformat()

        # Get or create usage record for today
        c.execute('''
            SELECT usage_count FROM usage_tracking
            WHERE teacher_id = ? AND tool_name = ? AND reset_date = ?
        ''', (teacher_id, tool_name, today))

        result = c.fetchone()

        if result:
            usage_count = result[0] + 1
            c.execute('''
                UPDATE usage_tracking
                SET usage_count = ?
                WHERE teacher_id = ? AND tool_name = ? AND reset_date = ?
            ''', (usage_count, teacher_id, tool_name, today))
        else:
            usage_count = 1
            c.execute('''
                INSERT INTO usage_tracking
                (teacher_id, tool_name, usage_count, reset_date)
                VALUES (?, ?, ?, ?)
            ''', (teacher_id, tool_name, usage_count, today))

        conn.commit()
        conn.close()

        return {
            'usage_count': usage_count,
            'limit': 50,
            'remaining': max(0, 50 - usage_count),
            'exceeded': usage_count > 50
        }

    def get_usage(self, teacher_id: str, tool_name: str) -> dict:
        """Get current usage for a tool today"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        today = datetime.now().date().isoformat()

        c.execute('''
            SELECT usage_count FROM usage_tracking
            WHERE teacher_id = ? AND tool_name = ? AND reset_date = ?
        ''', (teacher_id, tool_name, today))

        result = c.fetchone()
        conn.close()

        usage_count = result[0] if result else 0

        return {
            'usage_count': usage_count,
            'limit': 50,
            'remaining': max(0, 50 - usage_count),
            'exceeded': usage_count > 50
        }

    def reset_old_usage(self):
        """Reset usage counts older than today (called on startup)"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        today = datetime.now().date().isoformat()

        c.execute('''
            DELETE FROM usage_tracking
            WHERE reset_date < ?
        ''', (today,))

        conn.commit()
        conn.close()

# Initialize database
db = ChatDatabase()
db.reset_old_usage()
