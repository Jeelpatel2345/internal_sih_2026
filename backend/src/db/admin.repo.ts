import bcrypt from 'bcryptjs';
import { queryNeon } from '../config/neon';

export interface AdminRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'admin';
  refresh_tokens: string[];
  last_login: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export const findAdminByEmail = async (email: string): Promise<AdminRow | null> => {
  const res = await queryNeon(
    `SELECT * FROM admins WHERE email = $1 AND is_active = true LIMIT 1`,
    [email.toLowerCase()]
  );
  return res.rows[0] ?? null;
};

export const findAdminById = async (id: string): Promise<AdminRow | null> => {
  const res = await queryNeon(
    `SELECT * FROM admins WHERE id = $1 LIMIT 1`,
    [id]
  );
  return res.rows[0] ?? null;
};

export const createAdmin = async (params: {
  name: string;
  email: string;
  password: string;
  role?: 'super_admin' | 'admin';
}): Promise<AdminRow> => {
  const hash = await bcrypt.hash(params.password, 12);
  const res = await queryNeon(
    `INSERT INTO admins (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING
     RETURNING *`,
    [params.name, params.email.toLowerCase(), hash, params.role ?? 'admin']
  );
  return res.rows[0];
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

export const updateAdminLogin = async (id: string, refreshToken: string): Promise<void> => {
  await queryNeon(
    `UPDATE admins
     SET last_login = NOW(),
         refresh_tokens = array_append(refresh_tokens, $2),
         updated_at = NOW()
     WHERE id = $1`,
    [id, refreshToken]
  );
};

export const rotateRefreshToken = async (
  id: string,
  oldToken: string,
  newToken: string
): Promise<void> => {
  await queryNeon(
    `UPDATE admins
     SET refresh_tokens = array_append(array_remove(refresh_tokens, $2), $3),
         updated_at = NOW()
     WHERE id = $1`,
    [id, oldToken, newToken]
  );
};

export const removeRefreshToken = async (id: string, token: string): Promise<void> => {
  await queryNeon(
    `UPDATE admins
     SET refresh_tokens = array_remove(refresh_tokens, $2),
         updated_at = NOW()
     WHERE id = $1`,
    [id, token]
  );
};

export const clearRefreshTokens = async (id: string): Promise<void> => {
  await queryNeon(
    `UPDATE admins SET refresh_tokens = '{}', updated_at = NOW() WHERE id = $1`,
    [id]
  );
};

export const updateAdminPassword = async (id: string, newPassword: string): Promise<void> => {
  const hash = await bcrypt.hash(newPassword, 12);
  await queryNeon(
    `UPDATE admins
     SET password_hash = $2, refresh_tokens = '{}', updated_at = NOW()
     WHERE id = $1`,
    [id, hash]
  );
};

export const adminHasRefreshToken = async (id: string, token: string): Promise<boolean> => {
  const res = await queryNeon(
    `SELECT 1 FROM admins WHERE id = $1 AND $2 = ANY(refresh_tokens) LIMIT 1`,
    [id, token]
  );
  return (res.rowCount ?? 0) > 0;
};
