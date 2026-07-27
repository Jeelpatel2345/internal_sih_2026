import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  neonDatabaseUrl:
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Internal SIH 2026 <noreply@sih2026.ac.in>',
  },
  adminEmail: process.env.ADMIN_EMAIL || '',
  frontendUrl: process.env.FRONTEND_URL || 'https://internal-sih-2026-sd3z.vercel.app',
  adminUrl: process.env.ADMIN_URL || 'https://internal-sih-2026-ao22-three.vercel.app',
  seed: {
    adminName: process.env.SEED_ADMIN_NAME || 'Super Admin',
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@sih2026.ac.in',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@SIH2026!',
  },
  registrationDeadline: new Date(process.env.REGISTRATION_DEADLINE || '2026-08-02T18:29:00.000Z'),
};
