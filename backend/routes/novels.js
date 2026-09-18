const express = require('express');
const { all, get, run } = require('../src/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const getNovelProgress = (novel) => {
  const totalPages = Number(novel.page_count || 0);
  const currentPage = Number(novel.current_page || 0);
  const percentage = totalPages ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;
  const pagesRemaining = Math.max(0, totalPages - currentPage);

  return {
    ...novel,
    percentage,
    pagesRemaining,
    isComplete: novel.status === 'Completed' || currentPage >= totalPages,
  };
};

const buildNovelQuery = (userId, filters = {}) => {
  const params = [userId];
  const clauses = ['user_id = ?'];

  if (filters.status) {
    clauses.push('status = ?');
    params.push(filters.status);
  }

  if (filters.genre) {
    clauses.push('LOWER(genre) = LOWER(?)');
    params.push(filters.genre);
  }

  if (filters.author) {
    clauses.push('LOWER(author) LIKE LOWER(?)');
    params.push(`%${filters.author}%`);
  }

  if (filters.search) {
    clauses.push('(LOWER(title) LIKE LOWER(?) OR LOWER(author) LIKE LOWER(?))');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  let orderBy = 'created_at DESC';
  if (filters.sort === 'title') orderBy = 'title ASC';
  if (filters.sort === 'author') orderBy = 'author ASC';
  if (filters.sort === 'progress') orderBy = 'current_page DESC';

  return {
    baseQuery: `SELECT * FROM novels WHERE ${clauses.join(' AND ')} ORDER BY ${orderBy}`,
    params,
  };
};

router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, genre, author, search, sort } = req.query;
    const query = buildNovelQuery(req.user.id, { status, genre, author, search, sort });
    const novels = await all(query.baseQuery, query.params);
    return res.json({ novels: novels.map(getNovelProgress) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load novels.', error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const {
    title,
    author,
    cover_image,
    genre,
    description,
    isbn,
    page_count,
    current_page,
    status,
    rating,
    date_started,
    date_finished,
    notes,
  } = req.body;

  if (!title || !author || !page_count) {
    return res.status(400).json({ message: 'Title, author, and total pages are required.' });
  }

  try {
    const result = await run(
      `INSERT INTO novels (user_id, title, author, cover_image, genre, description, isbn, page_count, current_page, status, rating, date_started, date_finished, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        author.trim(),
        cover_image || '',
        genre || 'General',
        description || '',
        isbn || '',
        Number(page_count),
        Number(current_page || 0),
        status || 'Want to Read',
        rating || null,
        date_started || null,
        date_finished || null,
        notes || '',
      ],
    );

    const novel = await get('SELECT * FROM novels WHERE id = ?', [result.id]);
    return res.status(201).json({ novel: getNovelProgress(novel) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create novel.', error: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const novel = await get('SELECT * FROM novels WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (!novel) {
      return res.status(404).json({ message: 'Novel not found.' });
    }

    const sessions = await all('SELECT * FROM reading_sessions WHERE novel_id = ? AND user_id = ? ORDER BY session_date DESC', [req.params.id, req.user.id]);
    const notes = await all('SELECT * FROM notes WHERE novel_id = ? AND user_id = ? ORDER BY created_at DESC', [req.params.id, req.user.id]);
    const quotes = await all('SELECT * FROM quotes WHERE novel_id = ? AND user_id = ? ORDER BY created_at DESC', [req.params.id, req.user.id]);

    return res.json({ novel: getNovelProgress(novel), sessions, notes, quotes });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load novel details.', error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const existing = await get('SELECT * FROM novels WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

  if (!existing) {
    return res.status(404).json({ message: 'Novel not found.' });
  }

  const payload = { ...existing, ...req.body };
  const updated = await run(
    `UPDATE novels SET title = ?, author = ?, cover_image = ?, genre = ?, description = ?, isbn = ?, page_count = ?, current_page = ?, status = ?, rating = ?, date_started = ?, date_finished = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
    [
      payload.title || existing.title,
      payload.author || existing.author,
      payload.cover_image ?? existing.cover_image,
      payload.genre || existing.genre,
      payload.description ?? existing.description,
      payload.isbn ?? existing.isbn,
      Number(payload.page_count ?? existing.page_count),
      Number(payload.current_page ?? existing.current_page),
      payload.status || existing.status,
      payload.rating ?? existing.rating,
      payload.date_started ?? existing.date_started,
      payload.date_finished ?? existing.date_finished,
      payload.notes ?? existing.notes,
      req.params.id,
      req.user.id,
    ],
  );

  const novel = await get('SELECT * FROM novels WHERE id = ?', [req.params.id]);
  return res.json({ novel: getNovelProgress(novel), changes: updated.changes });
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await run('DELETE FROM novels WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Novel not found.' });
    }
    return res.json({ message: 'Novel deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete novel.', error: error.message });
  }
});

module.exports = router;
