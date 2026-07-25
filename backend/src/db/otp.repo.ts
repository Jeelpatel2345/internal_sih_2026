import { queryNeon } from '../config/neon';

export interface OTPRow {
  id: string;
  email: string;
  otp: string;
  purpose: 'password_reset';
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export const createOTP = async (params: {
  email: string;
  otp: string;
  purpose: 'password_reset';
  expiresAt: Date;
}): Promise<OTPRow> => {
  const res = await queryNeon(
    `INSERT INTO otps (email, otp, purpose, expires_at, used)
     VALUES ($1, $2, $3, $4, false)
     RETURNING *`,
    [params.email.toLowerCase(), params.otp, params.purpose, params.expiresAt]
  );
  return res.rows[0];
};

export const deleteOTPsForEmail = async (
  email: string,
  purpose: 'password_reset'
): Promise<void> => {
  await queryNeon(
    `DELETE FROM otps WHERE email = $1 AND purpose = $2`,
    [email.toLowerCase(), purpose]
  );
};

export const findValidOTP = async (params: {
  email: string;
  otp: string;
  purpose: 'password_reset';
}): Promise<OTPRow | null> => {
  const res = await queryNeon(
    `SELECT * FROM otps
     WHERE email = $1 AND otp = $2 AND purpose = $3
       AND used = false AND expires_at > NOW()
     LIMIT 1`,
    [params.email.toLowerCase(), params.otp, params.purpose]
  );
  return res.rows[0] ?? null;
};

export const markOTPUsed = async (id: string): Promise<void> => {
  await queryNeon(`UPDATE otps SET used = true WHERE id = $1`, [id]);
};
