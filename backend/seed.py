from app import app
from models import User, Novel, ReadingGoal, ReadingSession, Note, Quote, db
from werkzeug.security import generate_password_hash


with app.app_context():
    db.drop_all()
    db.create_all()

    demo_user = User(
        name="Demo Reader",
        email="demo@reader.app",
        password_hash=generate_password_hash("password123"),
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    )
    db.session.add(demo_user)
    db.session.commit()

    novel_one = Novel(
        user_id=demo_user.id,
        title="The Midnight Library",
        author="Matt Haig",
        cover_image="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
        genre="Fantasy",
        description="A moving story about regret, choice, and second chances in a mystical library between life and death.",
        isbn="9780525559474",
        page_count=304,
        current_page=184,
        status="Currently Reading",
        rating=4,
        date_started="2026-09-01",
        notes="The pacing is thoughtful, and the philosophical premise keeps me invested.",
    )
    novel_two = Novel(
        user_id=demo_user.id,
        title="Pride and Prejudice",
        author="Jane Austen",
        cover_image="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
        genre="Classics",
        description="A witty and elegant exploration of manners, marriage, and personal growth in Regency England.",
        isbn="9780141439518",
        page_count=432,
        current_page=432,
        status="Completed",
        rating=5,
        date_started="2026-08-10",
        date_finished="2026-08-25",
        notes="Beautifully crafted and unexpectedly funny. One of my favorite classics.",
    )
    novel_three = Novel(
        user_id=demo_user.id,
        title="Project Hail Mary",
        author="Andy Weir",
        cover_image="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
        genre="Science Fiction",
        description="A brilliant science-fiction survival story combining humor, engineering, and existential wonder.",
        isbn="9780593135204",
        page_count=496,
        current_page=120,
        status="Want to Read",
        notes="This is next on my list for a space-themed weekend.",
    )

    db.session.add_all([novel_one, novel_two, novel_three])
    db.session.commit()

    reading_session_one = ReadingSession(
        user_id=demo_user.id,
        novel_id=novel_one.id,
        session_date="2026-09-17",
        start_page=150,
        end_page=184,
        pages_read=34,
        duration_minutes=48,
        notes="Deeply engaging chapter set around the library and decisions.",
    )
    reading_session_two = ReadingSession(
        user_id=demo_user.id,
        novel_id=novel_two.id,
        session_date="2026-08-20",
        start_page=380,
        end_page=432,
        pages_read=52,
        duration_minutes=65,
        notes="Finished the novel and loved the character arcs.",
    )
    db.session.add_all([reading_session_one, reading_session_two])

    goal_one = ReadingGoal(
        user_id=demo_user.id,
        title="Read 20 books this year",
        goal_type="books",
        target_value=20,
        current_value=7,
        unit="books",
        start_date="2026-01-01",
        end_date="2026-12-31",
    )
    goal_two = ReadingGoal(
        user_id=demo_user.id,
        title="Read 500 pages this month",
        goal_type="pages",
        target_value=500,
        current_value=386,
        unit="pages",
        start_date="2026-09-01",
        end_date="2026-09-30",
    )
    db.session.add_all([goal_one, goal_two])

    note = Note(
        user_id=demo_user.id,
        novel_id=novel_one.id,
        title="Favorite concept",
        content="The idea of infinite lives and consequences is what makes this story so memorable.",
    )
    quote = Quote(
        user_id=demo_user.id,
        novel_id=novel_one.id,
        text="You never know what could happen next in this life, or the next.",
        page_number=180,
    )
    db.session.add_all([note, quote])
    db.session.commit()

    print("Seed data created for demo@reader.app")
