import os
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from models import Quote, ReadingGoal, ReadingSession, User, Novel, Note, db


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///novel_tracker.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
app.config["JSON_SORT_KEYS"] = False

CORS(app, resources={r"/api/*": {"origins": "*"}})
db.init_app(app)
JWTManager(app)


def to_serializable(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if hasattr(value, "__dict__") and not isinstance(value, (str, int, float, bool, type(None))):
        data = {}
        for key, item in value.__dict__.items():
            if key.startswith("_"):
                continue
            data[key] = to_serializable(item)
        return data
    if isinstance(value, dict):
        return {str(key): to_serializable(item) for key, item in value.items()}
    if isinstance(value, list):
        return [to_serializable(item) for item in value]
    if isinstance(value, tuple):
        return [to_serializable(item) for item in value]
    return value


def build_novel_payload(novel):
    payload = to_serializable(novel)
    payload["percentage"] = novel.progress_percentage()
    payload["pagesRemaining"] = novel.pages_remaining()
    payload["isComplete"] = novel.status == "Completed" or novel.current_page >= novel.page_count
    return payload


with app.app_context():
    db.create_all()


@app.get("/api/health")
def health_check():
    return jsonify({"ok": True, "message": "Novel tracker backend is running."})


@app.post("/api/auth/register")
def register():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists."}), 409

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        avatar_url=payload.get("avatar_url"),
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "avatar_url": user.avatar_url}}), 201


@app.post("/api/auth/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password."}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "avatar_url": user.avatar_url}})


@app.get("/api/auth/me")
@jwt_required()
def get_current_user():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify({"user": {"id": user.id, "name": user.name, "email": user.email, "avatar_url": user.avatar_url}})


@app.get("/api/novels")
@jwt_required()
def get_novels():
    user_id = get_jwt_identity()
    query = Novel.query.filter_by(user_id=user_id)

    status = request.args.get("status")
    genre = request.args.get("genre")
    author = request.args.get("author")
    search = request.args.get("search")
    sort = request.args.get("sort")

    if status:
        query = query.filter_by(status=status)
    if genre:
        query = query.filter(db.func.lower(Novel.genre) == genre.lower())
    if author:
        query = query.filter(db.func.lower(Novel.author).like(f"%{author.lower()}%"))
    if search:
        search_lower = search.lower()
        query = query.filter((db.func.lower(Novel.title).like(f"%{search_lower}%")) | (db.func.lower(Novel.author).like(f"%{search_lower}%")))

    if sort == "title":
        query = query.order_by(Novel.title.asc())
    elif sort == "author":
        query = query.order_by(Novel.author.asc())
    elif sort == "progress":
        query = query.order_by(Novel.current_page.desc())
    else:
        query = query.order_by(Novel.created_at.desc())

    result = [build_novel_payload(novel) for novel in query.all()]
    return jsonify({"novels": result})


@app.post("/api/novels")
@jwt_required()
def create_novel():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()

    title = (payload.get("title") or "").strip()
    author = (payload.get("author") or "").strip()
    page_count = payload.get("page_count")

    if not title or not author or page_count is None:
        return jsonify({"message": "Title, author, and total pages are required."}), 400

    novel = Novel(
        user_id=user_id,
        title=title,
        author=author,
        cover_image=payload.get("cover_image") or "",
        genre=payload.get("genre") or "General",
        description=payload.get("description") or "",
        isbn=payload.get("isbn") or "",
        page_count=int(page_count),
        current_page=int(payload.get("current_page") or 0),
        status=payload.get("status") or "Want to Read",
        rating=payload.get("rating"),
        date_started=payload.get("date_started"),
        date_finished=payload.get("date_finished"),
        notes=payload.get("notes") or "",
    )
    db.session.add(novel)
    db.session.commit()

    return jsonify({"novel": build_novel_payload(novel)}), 201


@app.get("/api/novels/<int:novel_id>")
@jwt_required()
def get_novel_detail(novel_id):
    user_id = get_jwt_identity()
    novel = Novel.query.filter_by(id=novel_id, user_id=user_id).first()
    if not novel:
        return jsonify({"message": "Novel not found."}), 404

    sessions = ReadingSession.query.filter_by(user_id=user_id, novel_id=novel_id).order_by(ReadingSession.session_date.desc()).all()
    notes = Note.query.filter_by(user_id=user_id, novel_id=novel_id).order_by(Note.created_at.desc()).all()
    quotes = Quote.query.filter_by(user_id=user_id, novel_id=novel_id).order_by(Quote.created_at.desc()).all()

    return jsonify({
        "novel": build_novel_payload(novel),
        "sessions": [to_serializable(session) for session in sessions],
        "notes": [to_serializable(note) for note in notes],
        "quotes": [to_serializable(quote) for quote in quotes],
    })


@app.put("/api/novels/<int:novel_id>")
@jwt_required()
def update_novel(novel_id):
    user_id = get_jwt_identity()
    novel = Novel.query.filter_by(id=novel_id, user_id=user_id).first()
    if not novel:
        return jsonify({"message": "Novel not found."}), 404

    payload = request.get_json(silent=True) or {}
    for field in ["title", "author", "cover_image", "genre", "description", "isbn", "page_count", "current_page", "status", "rating", "date_started", "date_finished", "notes"]:
        if field in payload:
            value = payload[field]
            if field in ["page_count", "current_page", "rating"] and value is not None:
                value = int(value)
            setattr(novel, field, value)

    db.session.commit()
    return jsonify({"novel": build_novel_payload(novel), "changes": 1})


@app.delete("/api/novels/<int:novel_id>")
@jwt_required()
def delete_novel(novel_id):
    user_id = get_jwt_identity()
    novel = Novel.query.filter_by(id=novel_id, user_id=user_id).first()
    if not novel:
        return jsonify({"message": "Novel not found."}), 404

    db.session.delete(novel)
    db.session.commit()
    return jsonify({"message": "Novel deleted successfully."})


@app.get("/api/sessions")
@jwt_required()
def get_sessions():
    user_id = get_jwt_identity()
    sessions = ReadingSession.query.filter_by(user_id=user_id).order_by(ReadingSession.session_date.desc()).all()
    return jsonify({"sessions": [to_serializable(session) for session in sessions]})


@app.post("/api/sessions")
@jwt_required()
def create_session():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()

    novel_id = payload.get("novel_id")
    if novel_id is None:
        return jsonify({"message": "Novel ID is required."}), 400

    session = ReadingSession(
        user_id=user_id,
        novel_id=int(novel_id),
        session_date=payload.get("session_date") or datetime.utcnow().date().isoformat(),
        start_page=payload.get("start_page"),
        end_page=payload.get("end_page"),
        pages_read=int(payload.get("pages_read") or 0),
        duration_minutes=payload.get("duration_minutes"),
        notes=payload.get("notes"),
    )
    db.session.add(session)
    db.session.commit()
    return jsonify({"session": to_serializable(session)}), 201


@app.get("/api/goals")
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()
    goals = ReadingGoal.query.filter_by(user_id=user_id).order_by(ReadingGoal.created_at.desc()).all()
    return jsonify({"goals": [to_serializable(goal) for goal in goals]})


@app.post("/api/goals")
@jwt_required()
def create_goal():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()

    goal = ReadingGoal(
        user_id=user_id,
        title=(payload.get("title") or "").strip(),
        goal_type=payload.get("goal_type") or "books",
        target_value=int(payload.get("target_value") or 0),
        current_value=int(payload.get("current_value") or 0),
        unit=payload.get("unit") or "books",
        start_date=payload.get("start_date"),
        end_date=payload.get("end_date"),
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({"goal": to_serializable(goal)}), 201


@app.get("/api/notes")
@jwt_required()
def get_notes():
    user_id = get_jwt_identity()
    notes = Note.query.filter_by(user_id=user_id).order_by(Note.created_at.desc()).all()
    return jsonify({"notes": [to_serializable(note) for note in notes]})


@app.post("/api/notes")
@jwt_required()
def create_note():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()

    note = Note(
        user_id=user_id,
        novel_id=payload.get("novel_id"),
        title=(payload.get("title") or "").strip(),
        content=(payload.get("content") or "").strip(),
    )
    if not note.content:
        return jsonify({"message": "Note content is required."}), 400

    db.session.add(note)
    db.session.commit()
    return jsonify({"note": to_serializable(note)}), 201


@app.get("/api/statistics")
@jwt_required()
def get_statistics():
    user_id = get_jwt_identity()
    novels = Novel.query.filter_by(user_id=user_id).all()
    sessions = ReadingSession.query.filter_by(user_id=user_id).all()

    total_pages = sum(novel.page_count for novel in novels)
    completed = sum(1 for novel in novels if novel.status == "Completed")
    pages_read = sum(session.pages_read for session in sessions)
    active_books = len(novels)

    return jsonify({
        "statistics": {
            "totalPages": total_pages,
            "completedBooks": completed,
            "pagesRead": pages_read,
            "activeBooks": active_books,
            "readingStreak": max(1, min(30, len(sessions))),
        }
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
