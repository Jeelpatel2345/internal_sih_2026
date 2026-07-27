import 'express-async-errors';
import type { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { connectNeonDB, neonPool } from './config/neon';
import { errorHandler } from './middlewares/error.middleware';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import registrationRoutes from './routes/registration.routes';
import mentorRoutes from './routes/mentor.routes';
import adminRoutes from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import exportRoutes from './routes/export.routes';

const app = express();
const isVercelRuntime = Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.VERCEL_URL);

// ─── CORS ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://internal-sih-2026-sd3z.vercel.app',
  'https://internal-sih-2026-ao22-three.vercel.app',
  config.frontendUrl,
  config.adminUrl,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  process.env.VERCEL_FRONTEND_URL || '',
  process.env.VERCEL_ADMIN_URL || '',
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Security Middleware ───────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ─── Rate Limiting ─────────────────────────────────────────────────────
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth requests. Please wait 15 minutes.' },
});

// ─── Body Parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

// ─── Routes ───────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/teams', publicLimiter, registrationRoutes);
app.use('/api/v1/mentor', publicLimiter, mentorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/admin/export', exportRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  let neonStatus = 'unknown';
  try {
    const r = await neonPool.query('SELECT 1 AS ok');
    neonStatus = r.rows[0]?.ok === 1 ? 'connected' : 'error';
  } catch {
    neonStatus = 'error';
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: { neonPostgresStatus: neonStatus },
  });
});

// ─── DB Status (detailed) ──────────────────────────────────────────────────
app.get('/api/v1/db-status', async (_req, res) => {
  let neonTables: { name: string; count: number }[] = [];
  let neonConnected = false;

  try {
    const tableRes = await neonPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    neonConnected = true;
    for (const row of tableRes.rows) {
      const cntRes = await neonPool.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      neonTables.push({ name: row.table_name, count: parseInt(cntRes.rows[0].count, 10) });
    }
  } catch {
    neonConnected = false;
  }

  res.json({
    success: true,
    database: {
      neonPostgreSQL: {
        isConnected: neonConnected,
        host: 'ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech',
        database: 'neondb',
        tables: neonTables,
      },
    },
    server: {
      port: config.port,
      env: config.nodeEnv,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    adminCredentials: {
      email: config.seed.adminEmail,
      password: config.seed.adminPassword,
    },
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Auto Seed (Neon) ─────────────────────────────────────────────────
const autoSeed = async (): Promise<void> => {
  try {
    const { createAdmin } = await import('./db/admin.repo');
    const { getSettings } = await import('./db/settings.repo');

    // Create super admin if none exists
    const existing = await neonPool.query(
      `SELECT id FROM admins WHERE email = $1 LIMIT 1`,
      [config.seed.adminEmail]
    );
    if ((existing.rowCount ?? 0) === 0) {
      await createAdmin({
        name: config.seed.adminName,
        email: config.seed.adminEmail,
        password: config.seed.adminPassword,
        role: 'super_admin',
      });
      logger.info(`✅ Admin seeded — Email: ${config.seed.adminEmail} | Password: ${config.seed.adminPassword}`);
    } else {
      logger.info(`ℹ️  Admin already exists in Neon DB.`);
    }

    // Ensure default settings row exists
    await getSettings();
    logger.info('✅ Settings row ensured.');
  } catch (err) {
    logger.warn('Auto-seed skipped (non-fatal):', err);
  }
};

// ─── Start ────────────────────────────────────────────────────────────
let initialized = false;

const ensureReady = async (): Promise<void> => {
  if (initialized) return;
  await connectNeonDB();
  await autoSeed();
  initialized = true;
};

const start = async () => {
  await ensureReady();

  if (isVercelRuntime) {
    logger.info('ℹ️ Vercel runtime detected — skipping app.listen()');
    return;
  }

  app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
    logger.info(`🔑 Admin login: ${config.seed.adminEmail} / ${config.seed.adminPassword}`);
    logger.info(`🌐 Frontend: ${config.frontendUrl} | Admin: ${config.adminUrl}`);
  });
};

if (!isVercelRuntime) {
  start().catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureReady();

  return new Promise<void>((resolve) => {
    const server = app as unknown as {
      handle: (req: IncomingMessage, res: ServerResponse, callback?: (err?: unknown) => void) => void;
    };

    server.handle(req, res, (err?: unknown) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
      }
      resolve();
    });
  });
}
