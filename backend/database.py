"""
Database Module
Handles quiz history storage using JSON file (simple prototype)
Can be easily upgraded to SQLite or PostgreSQL later
"""

import json
import os
from datetime import datetime
import uuid


class QuizHistory:
    """Simple JSON-based storage for quiz history"""
    
    def __init__(self, storage_file='quiz_history.json'):
        self.storage_file = storage_file
        self._ensure_storage_exists()
    
    def _ensure_storage_exists(self):
        """Create storage file if it doesn't exist"""
        if not os.path.exists(self.storage_file):
            with open(self.storage_file, 'w') as f:
                json.dump({'quizzes': []}, f)
    
    def _load_data(self):
        """Load data from storage file"""
        try:
            with open(self.storage_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading data: {e}")
            return {'quizzes': []}
    
    def _save_data(self, data):
        """Save data to storage file"""
        try:
            with open(self.storage_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def save_quiz(self, quiz_data, preferences):
        """
        Save a quiz to history
        
        Args:
            quiz_data: Dictionary with quiz questions and metadata
            preferences: User's quiz preferences
            
        Returns:
            Quiz ID (string)
        """
        data = self._load_data()
        
        # Generate unique ID
        quiz_id = str(uuid.uuid4())
        
        # Create quiz record
        quiz_record = {
            'id': quiz_id,
            'timestamp': datetime.now().isoformat(),
            'quiz_data': quiz_data,
            'preferences': preferences,
            'results': None  # Will be updated when quiz is completed
        }
        
        data['quizzes'].append(quiz_record)
        self._save_data(data)
        
        return quiz_id
    
    def get_by_id(self, quiz_id):
        """Get a specific quiz by ID"""
        data = self._load_data()
        
        for quiz in data['quizzes']:
            if quiz['id'] == quiz_id:
                return quiz
        
        return None
    
    def get_all(self):
        """Get all quizzes"""
        data = self._load_data()
        return data['quizzes']
    
    def update_results(self, quiz_id, results):
        """
        Update quiz results after completion
        
        Args:
            quiz_id: Quiz ID
            results: Dictionary with quiz results
                {
                    'score': 8,
                    'total': 10,
                    'percentage': 80,
                    'answers': [...],
                    'weak_topics': [...],
                    'completed_at': timestamp
                }
        """
        data = self._load_data()
        
        for quiz in data['quizzes']:
            if quiz['id'] == quiz_id:
                quiz['results'] = results
                quiz['completed_at'] = datetime.now().isoformat()
                break
        
        self._save_data(data)
    
    def delete_quiz(self, quiz_id):
        """Delete a quiz from history"""
        data = self._load_data()
        data['quizzes'] = [q for q in data['quizzes'] if q['id'] != quiz_id]
        self._save_data(data)
    
    def get_statistics(self):
        """
        Get overall statistics
        
        Returns:
            Dictionary with statistics
        """
        data = self._load_data()
        quizzes = data['quizzes']
        
        if not quizzes:
            return {
                'total_quizzes': 0,
                'completed_quizzes': 0,
                'average_score': 0,
                'topics_studied': []
            }
        
        completed = [q for q in quizzes if q.get('results')]
        
        # Calculate average score
        total_score = 0
        total_possible = 0
        
        for quiz in completed:
            results = quiz.get('results', {})
            total_score += results.get('score', 0)
            total_possible += results.get('total', 0)
        
        avg_score = (total_score / total_possible * 100) if total_possible > 0 else 0
        
        # Extract topics
        topics = set()
        for quiz in quizzes:
            segments = quiz.get('quiz_data', {}).get('segments', [])
            for segment in segments:
                if segment.get('heading'):
                    topics.add(segment['heading'])
        
        return {
            'total_quizzes': len(quizzes),
            'completed_quizzes': len(completed),
            'average_score': round(avg_score, 1),
            'topics_studied': list(topics)
        }


# Optional: SQLite version for future upgrade
class SQLiteQuizHistory:
    """SQLite-based storage (for future use)"""
    
    def __init__(self, db_path='quiz_history.db'):
        import sqlite3
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._create_tables()
    
    def _create_tables(self):
        """Create database tables"""
        cursor = self.conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quizzes (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                quiz_data TEXT NOT NULL,
                preferences TEXT NOT NULL,
                results TEXT,
                completed_at TEXT
            )
        ''')
        
        self.conn.commit()
    
    def save_quiz(self, quiz_data, preferences):
        """Save quiz to database"""
        cursor = self.conn.cursor()
        quiz_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO quizzes (id, timestamp, quiz_data, preferences)
            VALUES (?, ?, ?, ?)
        ''', (
            quiz_id,
            timestamp,
            json.dumps(quiz_data),
            json.dumps(preferences)
        ))
        
        self.conn.commit()
        return quiz_id
    
    def get_by_id(self, quiz_id):
        """Get quiz by ID"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM quizzes WHERE id = ?', (quiz_id,))
        row = cursor.fetchone()
        
        if row:
            return {
                'id': row[0],
                'timestamp': row[1],
                'quiz_data': json.loads(row[2]),
                'preferences': json.loads(row[3]),
                'results': json.loads(row[4]) if row[4] else None,
                'completed_at': row[5]
            }
        
        return None
    
    def get_all(self):
        """Get all quizzes"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM quizzes ORDER BY timestamp DESC')
        rows = cursor.fetchall()
        
        quizzes = []
        for row in rows:
            quizzes.append({
                'id': row[0],
                'timestamp': row[1],
                'quiz_data': json.loads(row[2]),
                'preferences': json.loads(row[3]),
                'results': json.loads(row[4]) if row[4] else None,
                'completed_at': row[5]
            })
        
        return quizzes
    
    def update_results(self, quiz_id, results):
        """Update quiz results"""
        cursor = self.conn.cursor()
        completed_at = datetime.now().isoformat()
        
        cursor.execute('''
            UPDATE quizzes
            SET results = ?, completed_at = ?
            WHERE id = ?
        ''', (json.dumps(results), completed_at, quiz_id))
        
        self.conn.commit()


if __name__ == "__main__":
    print("Database Module - Ready")
    print("Using JSON file storage by default")
    print("To use SQLite, uncomment SQLiteQuizHistory class")
