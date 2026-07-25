import { queryNeon } from '../config/neon';

export interface ActivityLogRow {
  id: string;
  admin_id: string | null;
  admin_name: string;
  action: string;
  target: string;
  details: string;
  ip: string;
  timestamp: Date;
}

export const createLog = async (params: {
  adminId?: string | null;
  adminName?: string;
  action: string;
  target?: string;
  details?: string;
  ip?: string;
}): Promise<void> => {
  await queryNeon(
    `INSERT INTO activity_logs (admin_id, admin_name, action, target, details, ip, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [
      params.adminId ?? null,
      params.adminName ?? 'System',
      params.action,
      params.target ?? '',
      params.details ?? '',
      params.ip ?? '',
    ]
  );
};

export const findLogs = async (opts: {
  page: number;
  limit: number;
  action?: string;
}): Promise<{ logs: ActivityLogRow[]; total: number }> => {
  const { page, limit, action } = opts;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (action) {
    conditions.push(`action = $${idx++}`);
    params.push(action);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRes, logsRes] = await Promise.all([
    queryNeon(`SELECT COUNT(*) FROM activity_logs ${where}`, params),
    queryNeon(
      `SELECT * FROM activity_logs ${where}
       ORDER BY timestamp DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    ),
  ]);

  return {
    logs: logsRes.rows,
    total: parseInt(countRes.rows[0].count, 10),
  };
};
