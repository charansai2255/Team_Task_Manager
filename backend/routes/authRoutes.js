import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const buildAuthPayload = (user, token) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  token,
});

const setAuthCookie = (res, token) => {
  res.cookie('token', token, cookieOptions);
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'Member' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    setAuthCookie(res, token);
    res.json(buildAuthPayload(user, token));
  } catch (err) { res.status(400).json({ message: 'Email already exists' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      setAuthCookie(res, token);
      res.json(buildAuthPayload(user, token));
    } else res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', protect, async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out' });
});

export default router;
