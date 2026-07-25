import { Router } from 'express';
import {
  checkTeamName,
  registerTeam,
  getTeamStatus,
  getRegistrationStatus,
} from '../controllers/registration.controller';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const participantSchema = z.object({
  fullName: z.string().min(2).max(100),
  gender: z.enum(['Male', 'Female', 'Other']),
  enrollmentNumber: z.string().min(5).max(20),
  semester: z.number().int().min(1).max(8),
  department: z.string().min(2).max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email(),
});

const registerTeamSchema = z.object({
  teamName: z.string().min(2).max(50).trim(),
  leader: participantSchema,
  members: z.array(participantSchema).min(5).max(5),
});

router.get('/check-name', checkTeamName);
router.post('/register', validate(registerTeamSchema), registerTeam);
router.get('/status', getRegistrationStatus);
router.get('/:registrationId', getTeamStatus);

export default router;
