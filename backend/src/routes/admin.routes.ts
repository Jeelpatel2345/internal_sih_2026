import { Router } from 'express';
import {
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getAllMentors,
  getActivityLogs,
  getSettings,
  updateSettings,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
} from '../controllers/admin.controller';
import { authenticate, requireSuperAdmin } from '../middlewares/auth.middleware';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Teams
router.get('/teams', getAllTeams);
router.get('/teams/:id', getTeamById);
router.put('/teams/:id', updateTeam);
router.delete('/teams/:id', requireSuperAdmin, deleteTeam);

// Mentors
router.get('/mentors', getAllMentors);

// Activity Logs
router.get('/logs', getActivityLogs);

// Settings
router.get('/settings', getSettings);
router.put('/settings', requireSuperAdmin, validate(z.object({
  registrationOpen: z.boolean().optional(),
  registrationDeadline: z.string().datetime().optional(),
  maintenanceMode: z.boolean().optional(),
  siteTitle: z.string().optional(),
  announcementBanner: z.string().optional(),
})), updateSettings);

// Admin users
router.get('/users', requireSuperAdmin, getAdminUsers);
router.post('/users', requireSuperAdmin, validate(z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['super_admin', 'admin']),
})), createAdminUser);
router.delete('/users/:id', requireSuperAdmin, deleteAdminUser);

export default router;
