const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../src/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'novel-tracker-secret', {
    expiresIn: '7d',
  });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);

    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [
      name.trim(),
      email.toLowerCase(),
      passwordHash,
    ]);

    const createdUser = await get('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?', [user.id]);
    const token = createToken(createdUser);

    return res.status(201).json({ token, user: createdUser });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register user.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const { password_hash, ...safeUser } = user;
    const token = createToken(safeUser);

    return res.json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in.', error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await get('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch user profile.', error: error.message });
  }
});

module.exports = router;
