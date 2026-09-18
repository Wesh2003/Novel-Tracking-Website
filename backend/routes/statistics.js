const express = require('express');
const { all, get } = require('../src/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const novels = await all('SELECT * FROM novels WHERE user_id = ?', [req.user.id]);
    const sessions = await all('SELECT * FROM reading_sessions WHERE user_id = ? ORDER BY session_date DESC', [req.user.id]);

    const totalBooksRead = novels.filter((novel) => novel.status === 'Completed').length;
    const totalPagesRead = sessions.reduce((sum, session) => sum + Number(session.pages_read || 0), 0);
    const averagePagesPerDay = totalPagesRead > 0 ? Math.round(totalPagesRead / Math.max(1, sessions.length || 1)) : 0;
    const completedNovels = novels.filter((novel) => novel.status === 'Completed');
    const avgCompletionTime = completedNovels.length
      ? Math.round(completedNovels.reduce((sum, novel) => {
          if (!novel.date_started || !novel.date_finished) return sum;
          const started = new Date(novel.date_started);
          const finished = new Date(novel.date_finished);
          const diffDays = Math.max(1, (finished - started) / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0) / completedNovels.length)
      : 0;

    const genreCounts = novels.reduce((acc, novel) => {
      const name = novel.genre || 'General';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const authorCounts = novels.reduce((acc, novel) => {
      const name = novel.author || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const monthlyActivity = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const total = sessions.filter((session) => {
        const sessionDate = new Date(session.session_date);
        return `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}` === key;
      }).reduce((sum, session) => sum + Number(session.pages_read || 0), 0);

      return { month: date.toLocaleString('en-US', { month: 'short' }), pages: total };
    }).reverse();

    return res.json({
      totalBooksRead,
      totalPagesRead,
      averagePagesPerDay,
      avgCompletionTime,
      mostReadGenres: Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      mostReadAuthors: Object.entries(authorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      monthlyActivity,
      totalBooks: novels.length,
      sessions: sessions.length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to calculate reading statistics.', error: error.message });
  }
});

module.exports = router;
