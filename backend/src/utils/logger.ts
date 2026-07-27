import fs from 'fs'
import os from 'os'
import path from 'path'
import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Prefer writing logs to the project `logs/` directory. If that fails,
// fall back to the system temp directory. On serverless (Vercel) we prefer
// console-only logging unless `FORCE_FILE_LOGS=true` is set in env.
const isServerless = Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.VERCEL_URL);
let logsDir = path.resolve(process.cwd(), 'logs');
const fallbackDir = path.join(os.tmpdir(), 'internal-sih-logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  // Try fallback location in tmp dir
  try {
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    logsDir = fallbackDir;
  } catch (err2) {
    // If both fail, continue — console transport will still work.
    // eslint-disable-next-line no-console
    console.warn('Could not create logs directory or fallback:', err2);
  }
}

const useFileTransports = !isServerless || process.env.FORCE_FILE_LOGS === 'true';

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), json());

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: config.nodeEnv === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
  ],
});
