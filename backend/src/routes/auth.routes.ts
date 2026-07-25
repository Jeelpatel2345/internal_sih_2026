import { Router } from 'express';
import {
  login,
  refresh,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getMe,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

const verifyResetOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', validate(forgotSchema), forgotPassword);
router.post('/verify-reset-otp', validate(verifyResetOTPSchema), verifyResetOTP);
router.post('/reset-password', validate(resetSchema), resetPassword);
router.get('/me', authenticate, getMe);

export default router;
