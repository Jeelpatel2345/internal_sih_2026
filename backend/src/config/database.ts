/**
 * database.ts — Legacy stub
 * MongoDB/Mongoose has been fully replaced by Neon PostgreSQL.
 * This file is kept to avoid any lingering import errors during transition.
 * All actual DB connectivity is in config/neon.ts.
 */

import { logger } from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/require-await
export const connectDB = async (): Promise<void> => {
  logger.warn('connectDB() is deprecated — using Neon PostgreSQL (see config/neon.ts).');
};
