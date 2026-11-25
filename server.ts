import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = process.cwd();
const UPLOADS_DIR = path.resolve(ROOT_DIR, 'uploads');
const CURRENT_APK_PATH = path.join(UPLOADS_DIR, 'current.apk');
const TEMP_APK_PATH = path.join(UPLOADS_DIR, 'temp-upload.apk');
const META_PATH = path.join(UPLOADS_DIR, 'apk-meta.json');

interface ApkMeta {
  fileName: string;
  fileSize: number;
  version: string;
  uploadedAt: string;
  downloadUrl: string;
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function sanitizeApkFileName(rawName: string | undefined): string {
  const fallback = 'LG_LEADER_BD.apk';
  if (!rawName || typeof rawName !== 'string') return fallback;
  const cleaned = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!cleaned) return fallback;
  return cleaned.toLowerCase().endsWith('.apk') ? cleaned : `${cleaned}.apk`;
}

function readApkMeta(): ApkMeta | null {
  try {
    if (!fs.existsSync(CURRENT_APK_PATH) || !fs.existsSync(META_PATH)) {
      return null;
    }
    const raw = fs.readFileSync(META_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as ApkMeta;
    const stats = fs.statSync(CURRENT_APK_PATH);
    return {
      ...parsed,
      fileSize: stats.size,
      downloadUrl: '/api/download-apk',
    };
  } catch {
    return null;
  }
}

async function startServer() {
  ensureUploadsDir();
  const app = express();

  // 1. Get current APK info
  app.get('/api/apk-info', (_req, res) => {
    const meta = readApkMeta();
    if (!meta) {
      res.json({ exists: false });
      return;
    }
    res.json({ exists: true, ...meta });
  });

  // 2. Upload APK via raw binary stream (supports large files without memory bloat)
  app.post('/api/upload-apk', (req, res) => {
    ensureUploadsDir();
    const rawHeaderName = req.headers['x-file-name'];
    const rawVersion = req.headers['x-app-version'];
    const decodedName =
      typeof rawHeaderName === 'string'
        ? decodeURIComponent(rawHeaderName)
        : 'LG_LEADER_BD.apk';
    const fileName = sanitizeApkFileName(decodedName);
    const version =
      typeof rawVersion === 'string' && rawVersion.trim()
        ? decodeURIComponent(rawVersion).trim()
        : 'v1.0.0';

    const maxBytes = 250 * 1024 * 1024; // 250MB limit
    let receivedBytes = 0;
    let aborted = false;

    const writeStream = fs.createWriteStream(TEMP_APK_PATH);

    req.on('data', (chunk: Buffer) => {
      if (aborted) return;
      receivedBytes += chunk.length;
      if (receivedBytes > maxBytes) {
        aborted = true;
        writeStream.destroy();
        fs.unlink(TEMP_APK_PATH, () => {});
        res.status(413).json({
          success: false,
          error: 'ফাইলের সাইজ সর্বোচ্চ 250MB এর বেশি হতে পারবে না।',
        });
        req.destroy();
      }
    });

    req.on('error', (err) => {
      if (aborted) return;
      aborted = true;
      writeStream.destroy();
      fs.unlink(TEMP_APK_PATH, () => {});
      console.error('APK upload request error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'আপলোড করতে সমস্যা হয়েছে।' });
      }
    });

    writeStream.on('error', (err) => {
      if (aborted) return;
      aborted = true;
      fs.unlink(TEMP_APK_PATH, () => {});
      console.error('APK write stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'ফাইল সেভ করতে সমস্যা হয়েছে।' });
      }
    });

    writeStream.on('finish', () => {
      if (aborted) return;
      if (receivedBytes === 0) {
        fs.unlink(TEMP_APK_PATH, () => {});
        res.status(400).json({ success: false, error: 'খালি ফাইল আপলোড করা যাবে না।' });
        return;
      }

      try {
        if (fs.existsSync(CURRENT_APK_PATH)) {
          fs.unlinkSync(CURRENT_APK_PATH);
        }
        fs.renameSync(TEMP_APK_PATH, CURRENT_APK_PATH);

        const meta: ApkMeta = {
          fileName,
          fileSize: receivedBytes,
          version,
          uploadedAt: new Date().toLocaleString(),
          downloadUrl: '/api/download-apk',
        };
        fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), 'utf-8');

        res.json({ success: true, ...meta });
      } catch (err) {
        console.error('Error finalizing APK:', err);
        res.status(500).json({ success: false, error: 'APK ফাইল ফাইনাল সেভ করতে ব্যর্থ।' });
      }
    });

    req.pipe(writeStream);
  });

  // 3. Download APK directly as attachment
  app.get('/api/download-apk', (_req, res) => {
    const meta = readApkMeta();
    if (!meta || !fs.existsSync(CURRENT_APK_PATH)) {
      res.status(404).json({
        success: false,
        error: 'এখনো কোনো APK ফাইল আপলোড করা হয়নি।',
      });
      return;
    }

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${meta.fileName}"`
    );
    res.setHeader('Content-Length', String(meta.fileSize));
    const readStream = fs.createReadStream(CURRENT_APK_PATH);
    readStream.pipe(res);
  });

  // 4. Delete uploaded APK
  app.delete('/api/delete-apk', (_req, res) => {
    try {
      if (fs.existsSync(CURRENT_APK_PATH)) fs.unlinkSync(CURRENT_APK_PATH);
      if (fs.existsSync(META_PATH)) fs.unlinkSync(META_PATH);
      res.json({ success: true });
    } catch (err) {
      console.error('Error deleting APK:', err);
      res.status(500).json({ success: false, error: 'APK ডিলিট করতে ব্যর্থ।' });
    }
  });

  // Mount Vite middleware in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
