import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { requireAuth } from '../auth.js';

const router = Router();
const uploadLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(null, false);
      return;
    }
    callback(null, true);
  },
});
const uploadRoot = resolve(process.env.UPLOAD_DIR || './server/uploads');

function imageExtension(buffer: Buffer): string | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

router.post('/image', requireAuth, uploadLimit, upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'Choose a JPEG, PNG, or WebP image.' });
    return;
  }
  const extension = imageExtension(file.buffer);
  if (!extension) {
    res.status(400).json({ error: 'The uploaded file is not a supported image.' });
    return;
  }

  await mkdir(uploadRoot, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(resolve(uploadRoot, filename), file.buffer, { flag: 'wx' });
  res.status(201).json({ path: `/uploads/${filename}` });
});

export default router;
