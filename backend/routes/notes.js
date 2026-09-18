const express = require('express');
const { all, get, run } = require('../src/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const notes = await all('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ notes });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load notes.', error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { novel_id, title, content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Note content is required.' });
  }

  try {
    const result = await run(
      'INSERT INTO notes (user_id, novel_id, title, content) VALUES (?, ?, ?, ?)',
      [req.user.id, novel_id || null, title || '', content],
    );
    const note = await get('SELECT * FROM notes WHERE id = ?', [result.id]);
    return res.status(201).json({ note });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create note.', error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    await run(
      'UPDATE notes SET title = ?, content = ?, novel_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [req.body.title ?? existing.title, req.body.content ?? existing.content, req.body.novel_id ?? existing.novel_id, req.params.id, req.user.id],
    );

    const note = await get('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    return res.json({ note });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update note.', error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await run('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    return res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete note.', error: error.message });
  }
});

module.exports = router;
