import { Request, Response } from 'express';
import {
  findAdminByEmail,
  findAdminById,
  comparePassword,
  updateAdminLogin,
  rotateRefreshToken,
  removeRefreshToken,
  updateAdminPassword,
  adminHasRefreshToken,
} from '../db/admin.repo';
import { createLog } from '../db/activity_log.repo';
import { createOTP, deleteOTPsForEmail, findValidOTP, markOTPUsed } from '../db/otp.repo';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOTP,
} from '../utils/jwt';
import { sendOTPEmail } from '../services/email.service';
import { createError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const admin = await findAdminByEmail(email);
  if (!admin) {
    res.status(401).json({ success: false, message: 'Invalid credentials.' });
    return;
  }

  const isValid = await comparePassword(password, admin.password_hash);
  if (!isValid) {
    res.status(401).json({ success: false, message: 'Invalid credentials.' });
    return;
  }

  const payload = { id: admin.id, email: admin.email, role: admin.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await updateAdminLogin(admin.id, refreshToken);

  await createLog({
    adminId: admin.id,
    adminName: admin.name,
    action: 'LOGIN',
    target: 'Admin Panel',
    details: `Admin "${admin.name}" logged in.`,
    ip: req.ip || '',
  });

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      accessToken,
      refreshToken,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    },
  });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ success: false, message: 'Refresh token required.' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const admin = await findAdminById(payload.id);
    const tokenValid = admin && (await adminHasRefreshToken(admin.id, refreshToken));

    if (!admin || !tokenValid) {
      res.status(401).json({ success: false, message: 'Invalid refresh token.' });
      return;
    }

    const newPayload = { id: admin.id, email: admin.email, role: admin.role };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    await rotateRefreshToken(admin.id, refreshToken, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  const adminId = req.admin?.id;

  if (adminId && refreshToken) {
    await removeRefreshToken(adminId, refreshToken);
  }

  const admin = adminId ? await findAdminById(adminId) : null;

  await createLog({
    adminId: adminId ?? null,
    adminName: admin?.name ?? 'Unknown',
    action: 'LOGOUT',
    target: 'Admin Panel',
    details: `Admin logged out.`,
    ip: req.ip || '',
  });

  res.json({ success: true, message: 'Logged out successfully.' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const admin = await findAdminByEmail(email);
  if (!admin) {
    throw createError('No active admin account is registered with this email address.', 404);
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await deleteOTPsForEmail(admin.email, 'password_reset');
  await createOTP({ email: admin.email, otp, purpose: 'password_reset', expiresAt });
  await sendOTPEmail({ to: admin.email, otp, name: admin.name });

  res.json({ success: true, message: 'OTP sent. Check your email inbox.' });
};

export const verifyResetOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  const otpDoc = await findValidOTP({ email, otp, purpose: 'password_reset' });

  if (!otpDoc) {
    throw createError('Invalid or expired OTP.', 400);
  }

  res.json({ success: true, message: 'OTP verified.' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;

  const otpDoc = await findValidOTP({ email, otp, purpose: 'password_reset' });
  if (!otpDoc) {
    throw createError('Invalid or expired OTP.', 400);
  }

  const admin = await findAdminByEmail(email);
  if (!admin) {
    throw createError('Admin not found.', 404);
  }

  await updateAdminPassword(admin.id, newPassword);
  await markOTPUsed(otpDoc.id);

  res.json({ success: true, message: 'Password reset successfully. Please login again.' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const admin = await findAdminById(req.admin?.id ?? '');
  if (!admin) {
    throw createError('Admin not found.', 404);
  }

  const { password_hash: _ph, refresh_tokens: _rt, ...safeAdmin } = admin;
  res.json({ success: true, data: safeAdmin });
};
