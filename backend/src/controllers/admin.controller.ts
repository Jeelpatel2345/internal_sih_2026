import { Response } from 'express';
import { findAllTeams, findTeamById, deleteTeamById } from '../db/team.repo';
import { findAllAdmins, createAdmin, deleteAdminById } from '../db/admin.repo';
import { getSettings as fetchSettings, upsertSettings } from '../db/settings.repo';
import { createLog, findLogs } from '../db/activity_log.repo';
import { queryNeon } from '../config/neon';
import { createError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

const toParticipantDto = (participant: any) => participant && ({
  id: participant.id,
  fullName: participant.full_name,
  gender: participant.gender,
  enrollmentNumber: participant.enrollment_number,
  semester: participant.semester,
  department: participant.department,
  mobile: participant.mobile,
  email: participant.email,
  isLeader: participant.is_leader,
});

const toTeamDto = (team: any) => ({
  id: team.id,
  _id: team.id,
  registrationId: team.registration_id,
  teamName: team.team_name,
  status: team.status,
  createdAt: team.created_at,
  updatedAt: team.updated_at,
  leader: toParticipantDto(team.leader),
  members: (team.members ?? []).map(toParticipantDto),
  mentor: team.mentor && {
    id: team.mentor.id,
    fullName: team.mentor.full_name,
    contactNumber: team.mentor.contact_number,
    email: team.mentor.email,
    department: team.mentor.department,
    institute: team.mentor.institute,
    officeAddress: team.mentor.office_address,
    submittedAt: team.mentor.submitted_at,
  },
});

// ─── Teams ─────────────────────────────────────────────────────────────

export const getAdminUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const admins = await findAllAdmins();
  res.json({
    success: true,
    data: admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
      last_login: admin.last_login,
      created_at: admin.created_at,
    })),
  });
};

export const createAdminUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    throw createError('Name, email, password, and role are required.', 400);
  }

  const normalizedRole = role === 'super_admin' ? 'super_admin' : 'admin';
  const newAdmin = await createAdmin({ name, email, password, role: normalizedRole });
  if (!newAdmin) {
    throw createError('Admin with this email already exists.', 409);
  }

  await createLog({
    adminId: req.admin?.id,
    adminName: req.admin?.email,
    action: 'CREATE_ADMIN',
    target: email,
    details: `Admin account created for ${email} with role ${normalizedRole}.`,
    ip: req.ip || '',
  });

  res.status(201).json({
    success: true,
    message: 'Admin account created successfully.',
    data: {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      is_active: newAdmin.is_active,
      last_login: newAdmin.last_login,
      created_at: newAdmin.created_at,
    },
  });
};

export const deleteAdminUser = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.admin?.id === req.params.id) {
    throw createError('You cannot delete your own account.', 400);
  }

  const removed = await deleteAdminById(req.params.id);
  if (!removed) {
    throw createError('Admin not found.', 404);
  }

  await createLog({
    adminId: req.admin?.id,
    adminName: req.admin?.email,
    action: 'DELETE_ADMIN',
    target: removed.email,
    details: `Admin account deleted for ${removed.email}.`,
    ip: req.ip || '',
  });

  res.json({ success: true, message: 'Admin account deleted successfully.' });
};

export const getAllTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    page = '1',
    limit = '20',
    search = '',
    status = '',
    department = '',
  } = req.query as Record<string, string>;

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(parseInt(limit, 10), 100);

  const { teams, total } = await findAllTeams({
    page: pageNum,
    limit: limitNum,
    search: search || undefined,
    status: status || undefined,
    department: department || undefined,
  });

  res.json({
    success: true,
    data: {
      teams: teams.map(toTeamDto),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

export const getTeamById = async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await findTeamById(req.params.id);
  if (!team) throw createError('Team not found.', 404);
  res.json({ success: true, data: toTeamDto(team) });
};

export const updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await findTeamById(req.params.id);
  if (!team) throw createError('Team not found.', 404);

  const normalizedBody = {
    team_name: req.body.teamName ?? req.body.team_name,
    status: req.body.status,
  };
  const allowed = ['team_name', 'status'] as const;
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (normalizedBody[key] !== undefined) {
      sets.push(`${key} = $${idx++}`);
      vals.push(normalizedBody[key]);
    }
  }

  if (sets.length > 0) {
    sets.push(`updated_at = NOW()`);
    vals.push(team.id);
    await queryNeon(`UPDATE teams SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
  }

  const updated = await findTeamById(req.params.id);

  await createLog({
    adminId: req.admin?.id,
    adminName: req.admin?.email,
    action: 'UPDATE_TEAM',
    target: team.registration_id,
    details: `Team "${team.team_name}" updated.`,
    ip: req.ip || '',
  });

  res.json({ success: true, message: 'Team updated.', data: updated ? toTeamDto(updated) : null });
};

export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await deleteTeamById(req.params.id);
  if (!team) throw createError('Team not found.', 404);

  await createLog({
    adminId: req.admin?.id,
    adminName: req.admin?.email,
    action: 'DELETE_TEAM',
    target: team.registration_id,
    details: `Team "${team.team_name}" deleted.`,
    ip: req.ip || '',
  });

  res.json({ success: true, message: 'Team deleted.' });
};

// ─── Mentors ───────────────────────────────────────────────────────────

export const getAllMentors = async (_req: AuthRequest, res: Response): Promise<void> => {
  const result = await queryNeon(`
    SELECT t.registration_id, t.team_name, t.created_at,
           m.full_name, m.contact_number, m.email, m.department, m.institute, m.submitted_at
    FROM teams t
    JOIN mentors m ON t.id = m.team_id
    WHERE t.status = 'completed'
    ORDER BY m.submitted_at DESC
  `);
  res.json({
    success: true,
    data: result.rows.map((row) => ({
      id: row.registration_id,
      _id: row.registration_id,
      registrationId: row.registration_id,
      teamName: row.team_name,
      createdAt: row.created_at,
      mentor: {
        fullName: row.full_name,
        contactNumber: row.contact_number,
        email: row.email,
        department: row.department,
        institute: row.institute,
        submittedAt: row.submitted_at,
      },
    })),
  });
};

// ─── Logs ──────────────────────────────────────────────────────────────

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '50', action = '' } = req.query as Record<string, string>;
  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(parseInt(limit, 10), 200);

  const { logs, total } = await findLogs({
    page: pageNum,
    limit: limitNum,
    action: action || undefined,
  });

  res.json({
    success: true,
    data: {
      logs: logs.map((log) => ({
        id: log.id,
        _id: log.id,
        adminId: log.admin_id,
        adminName: log.admin_name,
        action: log.action,
        target: log.target,
        details: log.details,
        ip: log.ip,
        createdAt: log.timestamp,
      })),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    },
  });
};

// ─── Settings ──────────────────────────────────────────────────────────

export const getSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = await fetchSettings();
  res.json({
    success: true,
    data: {
      id: settings.id,
      registrationOpen: settings.registration_open,
      registrationDeadline: settings.registration_deadline,
      siteTitle: settings.site_title,
      maintenanceMode: settings.maintenance_mode,
      updatedAt: settings.updated_at,
    },
  });
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const updated = await upsertSettings({
    registration_open: req.body.registrationOpen,
    registration_deadline: req.body.registrationDeadline,
    site_title: req.body.siteTitle,
    maintenance_mode: req.body.maintenanceMode,
    updated_by: req.admin?.id ?? null,
  });

  await createLog({
    adminId: req.admin?.id,
    adminName: req.admin?.email,
    action: 'UPDATE_SETTINGS',
    target: 'Settings',
    details: `Settings updated: ${JSON.stringify(req.body)}`,
    ip: req.ip || '',
  });

  res.json({
    success: true,
    message: 'Settings updated.',
    data: {
      id: updated.id,
      registrationOpen: updated.registration_open,
      registrationDeadline: updated.registration_deadline,
      siteTitle: updated.site_title,
      maintenanceMode: updated.maintenance_mode,
      updatedAt: updated.updated_at,
    },
  });
};
