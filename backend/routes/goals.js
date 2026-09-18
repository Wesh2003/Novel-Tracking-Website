const express = require('express');
const { all, get, run } = require('../src/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const goals = await all('SELECT * FROM reading_goals WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ goals });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load reading goals.', error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { title, goal_type, target_value, current_value, unit, start_date, end_date } = req.body;

  if (!title || !goal_type || !target_value) {
    return res.status(400).json({ message: 'Title, goal type, and target are required.' });
  }

  try {
    const result = await run(
      `INSERT INTO reading_goals (user_id, title, goal_type, target_value, current_value, unit, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, goal_type, Number(target_value), Number(current_value || 0), unit || '', start_date || null, end_date || null],
    );

    const goal = await get('SELECT * FROM reading_goals WHERE id = ?', [result.id]);
    return res.status(201).json({ goal });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create goal.', error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await get('SELECT * FROM reading_goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    const payload = { ...existing, ...req.body };
    await run(
      `UPDATE reading_goals SET title = ?, goal_type = ?, target_value = ?, current_value = ?, unit = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [payload.title || existing.title, payload.goal_type || existing.goal_type, Number(payload.target_value ?? existing.target_value), Number(payload.current_value ?? existing.current_value), payload.unit ?? existing.unit, payload.start_date ?? existing.start_date, payload.end_date ?? existing.end_date, req.params.id, req.user.id],
    );

    const goal = await get('SELECT * FROM reading_goals WHERE id = ?', [req.params.id]);
    return res.json({ goal });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update goal.', error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await run('DELETE FROM reading_goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Goal not found.' });
    }
    return res.json({ message: 'Goal deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete goal.', error: error.message });
  }
});

module.exports = router;
