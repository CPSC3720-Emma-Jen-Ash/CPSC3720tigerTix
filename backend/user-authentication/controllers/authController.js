import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRES_MS = 30 * 60 * 1000; // 30 minutes

export async function register(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
  const user = await createUser(email, hash);
  return res.status(201).json({ message: 'registered', user });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });

  const payload = { sub: user.id, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: TOKEN_EXPIRES_MS,
  });

  return res.json({ message: 'logged in', user: { id: user.id, email: user.email } });
}

export async function me(req, res) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'not authenticated' });
  const fresh = await findUserById(user.sub);
  if (!fresh) return res.status(404).json({ message: 'user not found' });
  res.json({ id: fresh.id, email: fresh.email });
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'logged out' });
}
