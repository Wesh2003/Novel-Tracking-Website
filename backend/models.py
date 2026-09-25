from __future__ import annotations

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    novels = db.relationship("Novel", backref="user", lazy=True, cascade="all, delete-orphan")
    sessions = db.relationship("ReadingSession", backref="user", lazy=True, cascade="all, delete-orphan")
    goals = db.relationship("ReadingGoal", backref="user", lazy=True, cascade="all, delete-orphan")
    notes = db.relationship("Note", backref="user", lazy=True, cascade="all, delete-orphan")


class Novel(db.Model):
    __tablename__ = "novels"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=False)
    cover_image = db.Column(db.String(500), nullable=True)
    genre = db.Column(db.String(80), nullable=True)
    description = db.Column(db.Text, nullable=True)
    isbn = db.Column(db.String(40), nullable=True)
    page_count = db.Column(db.Integer, nullable=False, default=0)
    current_page = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(50), nullable=False, default="Want to Read")
    rating = db.Column(db.Integer, nullable=True)
    date_started = db.Column(db.String(50), nullable=True)
    date_finished = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def progress_percentage(self):
        if not self.page_count:
            return 0
        return min(100, round((self.current_page / self.page_count) * 100))

    def pages_remaining(self):
        return max(0, self.page_count - self.current_page)


class ReadingSession(db.Model):
    __tablename__ = "reading_sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    novel_id = db.Column(db.Integer, db.ForeignKey("novels.id"), nullable=False)
    session_date = db.Column(db.String(50), nullable=False)
    start_page = db.Column(db.Integer, nullable=True)
    end_page = db.Column(db.Integer, nullable=True)
    pages_read = db.Column(db.Integer, nullable=False, default=0)
    duration_minutes = db.Column(db.Integer, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ReadingGoal(db.Model):
    __tablename__ = "reading_goals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    goal_type = db.Column(db.String(80), nullable=False)
    target_value = db.Column(db.Integer, nullable=False)
    current_value = db.Column(db.Integer, nullable=False, default=0)
    unit = db.Column(db.String(50), nullable=True)
    start_date = db.Column(db.String(50), nullable=True)
    end_date = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    novel_id = db.Column(db.Integer, db.ForeignKey("novels.id"), nullable=True)
    title = db.Column(db.String(200), nullable=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Quote(db.Model):
    __tablename__ = "quotes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    novel_id = db.Column(db.Integer, db.ForeignKey("novels.id"), nullable=True)
    text = db.Column(db.Text, nullable=False)
    page_number = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
