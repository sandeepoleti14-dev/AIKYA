import dotenv from 'dotenv';
import { resolve } from 'node:path';
import cors from 'cors';
import MongoStore from 'connect-mongo';
import express, { type ErrorRequestHandler } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { CommunityPost, CommunityReport, CommunitySubmission, ModerationLog, User, WebsiteReview } from './models.js';
import authRoutes from './routes/auth.js';
import communityRoutes from './routes/community.js';
import moderationRoutes from './routes/moderation.js';
import reviewRoutes from './routes/reviews.js';
import uploadRoutes from './routes/uploads.js';

dotenv.config({ path: 'server/.env' });
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const appOrigin = process.env.APP_ORIGIN || 'http://127.0.0.1:5173';
const port = Number(process.env.PORT || 3001);
const uploadRoot = resolve(process.env.UPLOAD_DIR || './server/uploads');

if (!mongoUri) throw new Error('MONGODB_URI is required. Copy server/.env.example and configure a MongoDB URI.');
if (!sessionSecret || sessionSecret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.');

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(helmet({ hsts: process.env.NODE_ENV === 'production' ? undefined : false }));
app.use(cors({ origin: appOrigin, credentials: true }));
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.get('origin') !== appOrigin) {
    res.status(403).json({ error: 'Request origin is not allowed.' });
    return;
  }
  next();
});
app.use(express.json({ limit: '64kb' }));
app.use(session({
  name: 'aikya.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri, collectionName: 'aikya_sessions', ttl: 60 * 60 * 24 * 14 }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 14,
  },
}));
app.use('/uploads', express.static(uploadRoot, {
  index: false,
  dotfiles: 'deny',
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', moderationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  void next;
  const err = error as Error & { code?: number | string; status?: number; name?: string };
  if (err.code === 11000) {
    res.status(409).json({ error: 'A matching record already exists.' });
    return;
  }
  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'Image files must be 5 MB or smaller.' });
    return;
  }
  if (err.name === 'MulterError') {
    res.status(400).json({ error: 'The image upload could not be processed.' });
    return;
  }
  console.error('Aikya API error:', error);
  res.status(err.status && err.status >= 400 && err.status < 500 ? err.status : 500).json({
    error: err.status && err.status < 500 ? err.message : 'The request could not be completed.',
  });
};
app.use(errorHandler);

async function start() {
  await mongoose.connect(mongoUri!);
  await Promise.all([
    User.init(),
    CommunitySubmission.init(),
    CommunityPost.init(),
    WebsiteReview.init(),
    ModerationLog.init(),
    CommunityReport.init(),
  ]);
  const server = app.listen(port, () => {
    console.info(`Aikya API listening on http://127.0.0.1:${port}`);
  });

  const close = () => {
    server.close(() => {
      void mongoose.disconnect().finally(() => process.exit(0));
    });
  };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

start().catch((error: unknown) => {
  console.error('Unable to start the Aikya API. Check MongoDB and server environment configuration.', error);
  process.exitCode = 1;
});

export { app };
