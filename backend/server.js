require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./src/db');

const authRoutes = require('./routes/auth');
const novelRoutes = require('./routes/novels');
const sessionRoutes = require('./routes/sessions');
const goalRoutes = require('./routes/goals');
const notesRoutes = require('./routes/notes');
const statisticsRoutes = require('./routes/statistics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Novel tracker backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/novels', novelRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/statistics', statisticsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.', error: err.message });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Novel tracker server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
