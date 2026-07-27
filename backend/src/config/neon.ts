import { Pool } from 'pg';
import { logger } from '../utils/logger';

const NEON_DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  'postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const neonPool = new Pool({
  connectionString: NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

neonPool.on('connect', () => {
  logger.info('⚡ Connected to Neon PostgreSQL database pool.');
});

neonPool.on('error', (err) => {
  logger.error('❌ Unexpected Neon PostgreSQL error on idle client:', err);
});

export const connectNeonDB = async (): Promise<boolean> => {
  try {
    const client = await neonPool.connect();
    const result = await client.query('SELECT NOW(), current_database(), current_user;');
    client.release();
    logger.info(`✅ Neon Database Connected! Host: ep-noisy-art-az88msje | DB: ${result.rows[0].current_database}`);
    return true;
  } catch (error) {
    logger.error('❌ Neon Database connection error:', error);
    return false;
  }
};

const TRANSIENT_ERROR_CODES = new Set(['ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET']);
const isTransientError = (error: any): boolean =>
  TRANSIENT_ERROR_CODES.has(error?.code) ||
  /connection terminated|timeout exceeded/i.test(error?.message || '');

export const queryNeon = async (
  text: string,
  params?: any[],
  retries = 2
): Promise<import('pg').QueryResult<any>> => {
  const start = Date.now();
  try {
    const res = await neonPool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query: ${text} [${duration}ms] - Rows: ${res.rowCount}`);
    return res;
  } catch (error) {
    if (retries > 0 && isTransientError(error)) {
      logger.error(`Transient DB error, retrying (${retries} left): ${(error as Error).message}`);
      await new Promise((r) => setTimeout(r, 500));
      return queryNeon(text, params, retries - 1);
    }
    throw error;
  }
};
