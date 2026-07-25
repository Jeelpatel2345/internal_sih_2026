import { Router } from 'express';
import { submitMentor } from '../controllers/mentor.controller';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const mentorSchema = z.object({
  registrationId: z.string().min(1),
  mentor: z.object({
    fullName: z.string().min(2).max(100),
    contactNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    email: z.string().email(),
    department: z.string().min(2).max(100),
    institute: z.string().min(2).max(150),
    officeAddress: z.string().min(5).max(300),
  }),
});

router.post('/submit', validate(mentorSchema), submitMentor);

export default router;
