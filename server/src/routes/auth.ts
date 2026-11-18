import { Router, type Request } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models.js';
import { publicUser } from '../auth.js';
import { registerSchema } from '../validation.js';

const router = Router();
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

function regenerateSession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    res.json({ user: null });
    return;
  }
  const user = await User.findById(req.session.userId);
  if (!user) {
    req.session.destroy(() => undefined);
    res.json({ user: null });
    return;
  }
  res.json({ user: publicUser(user, true) });
});

router.post('/register', authLimit, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Check the email, password, and display name.', details: parsed.error.flatten() });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const exists = await User.exists({ email });
  if (exists) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const user = await User.create({
    email,
    passwordHash: await bcrypt.hash(parsed.data.password, 12),
    displayName: parsed.data.displayName,
  });
  await regenerateSession(req);
  req.session.userId = user.id;
  await new Promise<void>((resolve, reject) => req.session.save((error) => (error ? reject(error) : resolve())));
  res.status(201).json({ user: publicUser(user, true) });
});

router.post('/login', authLimit, async (req, res) => {
  const parsed = registerSchema.pick({ email: true, password: true }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Enter a valid email address and password.' });
    return;
  }

  const user = await User.findOne({ email: parsed.data.email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  await regenerateSession(req);
  req.session.userId = user.id;
  await new Promise<void>((resolve, reject) => req.session.save((error) => (error ? reject(error) : resolve())));
  res.json({ user: publicUser(user, true) });
});

router.post('/logout', async (req, res) => {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });
  res.clearCookie('aikya.sid', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.status(204).end();
});

export default router;
