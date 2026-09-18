const express = require('express');
const { all, get, run } = require('../src/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const sessions = await all('SELECT * FROM reading_sessions WHERE user_id = ? ORDER BY session_date DESC', [req.user.id]);
    return res.json({ sessions });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load sessions.', error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { novel_id, session_date, start_page, end_page, duration_minutes, notes } = req.body;

  if (!novel_id || !session_date) {
    return res.status(400).json({ message: 'Novel and session date are required.' });
  }

  const start = Number(start_page || 0);
  const end = Number(end_page || 0);
  const pagesRead = Math.max(0, end - start);

  try {
    const result = await run(
      `INSERT INTO reading_sessions (user_id, novel_id, session_date, start_page, end_page, pages_read, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, novel_id, session_date, start, end, pagesRead, duration_minutes || 0, notes || ''],
    );

    const session = await get('SELECT * FROM reading_sessions WHERE id = ?', [result.id]);
    return res.status(201).json({ session });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save session.', error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM reading_sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (!existing) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const payload = { ...existing, ...req.body };
    const start = Number(payload.start_page ?? existing.start_page ?? 0);
    const end = Number(payload.end_page ?? existing.end_page ?? 0);
    const pagesRead = Math.max(0, end - start);

    await run(
      `UPDATE reading_sessions SET novel_id = ?, session_date = ?, start_page = ?, end_page = ?, pages_read = ?, duration_minutes = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [payload.novel_id ?? existing.novel_id, payload.session_date ?? existing.session_date, start, end, pagesRead, payload.duration_minutes ?? existing.duration_minutes ?? 0, payload.notes ?? existing.notes ?? '', req.params.id, req.user.id],
    );

    const session = await get('SELECT * FROM reading_sessions WHERE id = ?', [req.params.id]);
    return res.json({ session });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update session.', error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await run('DELETE FROM reading_sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    return res.json({ message: 'Reading session deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete session.', error: error.message });
  }
});

module.exports = router;
