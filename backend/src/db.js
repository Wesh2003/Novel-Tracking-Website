const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'novel-tracker.db');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

const initializeDatabase = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS novels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      cover_image TEXT,
      genre TEXT,
      description TEXT,
      isbn TEXT,
      page_count INTEGER NOT NULL DEFAULT 0,
      current_page INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Want to Read',
      rating INTEGER,
      date_started TEXT,
      date_finished TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reading_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      novel_id INTEGER NOT NULL,
      session_date TEXT NOT NULL,
      start_page INTEGER,
      end_page INTEGER,
      pages_read INTEGER NOT NULL,
      duration_minutes INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(novel_id) REFERENCES novels(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reading_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      goal_type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      current_value INTEGER NOT NULL DEFAULT 0,
      unit TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      novel_id INTEGER,
      title TEXT,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(novel_id) REFERENCES novels(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      novel_id INTEGER,
      text TEXT NOT NULL,
      page_number INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(novel_id) REFERENCES novels(id) ON DELETE CASCADE
    )
  `);

  await ensureDemoData();
};

const ensureDemoData = async () => {
  const existingUser = await get('SELECT id FROM users WHERE email = ?', ['demo@reader.app']);

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const createdUser = await run(
      `INSERT INTO users (name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)`,
      ['Demo Reader', 'demo@reader.app', hashedPassword, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
    );

    const userId = createdUser.id;

    await run(
      `INSERT INTO novels (user_id, title, author, cover_image, genre, description, isbn, page_count, current_page, status, rating, date_started, date_finished, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'The Midnight Library',
        'Matt Haig',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        'Fantasy',
        'A moving story about regret, choice, and second chances in a mystical library between life and death.',
        '9780525559474',
        304,
        184,
        'Currently Reading',
        4,
        '2026-09-01',
        null,
        'The pacing is thoughtful, and the philosophical premise keeps me invested.',
      ],
    );

    await run(
      `INSERT INTO novels (user_id, title, author, cover_image, genre, description, isbn, page_count, current_page, status, rating, date_started, date_finished, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'Pride and Prejudice',
        'Jane Austen',
        'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
        'Classics',
        'A witty and elegant exploration of manners, marriage, and personal growth in Regency England.',
        '9780141439518',
        432,
        432,
        'Completed',
        5,
        '2026-08-10',
        '2026-08-25',
        'Beautifully crafted and unexpectedly funny. One of my favorite classics.',
      ],
    );

    await run(
      `INSERT INTO novels (user_id, title, author, cover_image, genre, description, isbn, page_count, current_page, status, rating, date_started, date_finished, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'Project Hail Mary',
        'Andy Weir',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
        'Science Fiction',
        'A brilliant science-fiction survival story combining humor, engineering, and existential wonder.',
        '9780593135204',
        496,
        120,
        'Want to Read',
        null,
        null,
        null,
        'This is next on my list for a space-themed weekend.',
      ],
    );

    await run(`INSERT INTO reading_sessions (user_id, novel_id, session_date, start_page, end_page, pages_read, duration_minutes, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      userId,
      1,
      '2026-09-17',
      150,
      184,
      34,
      48,
      'Deeply engaging chapter set around the library and decisions.',
    ]);

    await run(`INSERT INTO reading_sessions (user_id, novel_id, session_date, start_page, end_page, pages_read, duration_minutes, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      userId,
      2,
      '2026-08-20',
      380,
      432,
      52,
      65,
      'Finished the novel and loved the character arcs.',
    ]);

    await run(`INSERT INTO reading_goals (user_id, title, goal_type, target_value, current_value, unit, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      userId,
      'Read 20 books this year',
      'books',
      20,
      7,
      'books',
      '2026-01-01',
      '2026-12-31',
    ]);

    await run(`INSERT INTO reading_goals (user_id, title, goal_type, target_value, current_value, unit, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      userId,
      'Read 500 pages this month',
      'pages',
      500,
      386,
      'pages',
      '2026-09-01',
      '2026-09-30',
    ]);

    await run(`INSERT INTO notes (user_id, novel_id, title, content) VALUES (?, ?, ?, ?)`, [
      userId,
      1,
      'Thoughts on chapter 10',
      'This chapter reframes the main character’s decisions and the emotional stakes feel more intimate.'
    ]);

    await run(`INSERT INTO notes (user_id, novel_id, title, content) VALUES (?, ?, ?, ?)`, [
      userId,
      2,
      'Favorite passage',
      'I loved how the narrative made social expectation feel as weighty as personal desire.'
    ]);

    await run(`INSERT INTO quotes (user_id, novel_id, text, page_number) VALUES (?, ?, ?, ?)`, [
      userId,
      1,
      'The library was not a place of endings, but of possibility.',
      118,
    ]);

    await run(`INSERT INTO quotes (user_id, novel_id, text, page_number) VALUES (?, ?, ?, ?)`, [
      userId,
      2,
      'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.',
      1,
    ]);
  }
};

module.exports = {
  db,
  run,
  get,
  all,
  initializeDatabase,
};
