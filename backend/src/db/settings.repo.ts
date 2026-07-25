import { queryNeon } from '../config/neon';

export interface SettingsRow {
  id: string;
  registration_open: boolean;
  registration_deadline: Date;
  site_title: string;
  maintenance_mode: boolean;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
}

const DEFAULT_DEADLINE = '2026-08-02T18:29:00.000Z';

export const getSettings = async (): Promise<SettingsRow> => {
  const res = await queryNeon(`SELECT * FROM settings ORDER BY created_at ASC LIMIT 1`);
  if (res.rows[0]) return res.rows[0];

  // auto-create default row if none exists
  const insert = await queryNeon(
    `INSERT INTO settings (registration_open, registration_deadline, site_title, maintenance_mode)
     VALUES (true, $1, 'Internal SIH 2026', false)
     RETURNING *`,
    [DEFAULT_DEADLINE]
  );
  return insert.rows[0];
};

export const upsertSettings = async (
  updates: Partial<{
    registration_open: boolean;
    registration_deadline: Date | string;
    site_title: string;
    maintenance_mode: boolean;
    updated_by: string | null;
  }>
): Promise<SettingsRow> => {
  const current = await getSettings();

  const merged = {
    registration_open:
      updates.registration_open !== undefined ? updates.registration_open : current.registration_open,
    registration_deadline:
      updates.registration_deadline ?? current.registration_deadline,
    site_title: updates.site_title ?? current.site_title,
    maintenance_mode:
      updates.maintenance_mode !== undefined ? updates.maintenance_mode : current.maintenance_mode,
    updated_by: updates.updated_by ?? current.updated_by,
  };

  const res = await queryNeon(
    `UPDATE settings
     SET registration_open = $1,
         registration_deadline = $2,
         site_title = $3,
         maintenance_mode = $4,
         updated_by = $5,
         updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [
      merged.registration_open,
      merged.registration_deadline,
      merged.site_title,
      merged.maintenance_mode,
      merged.updated_by,
      current.id,
    ]
  );
  return res.rows[0];
};
