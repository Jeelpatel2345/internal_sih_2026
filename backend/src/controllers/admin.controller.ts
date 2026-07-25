import { Response } from 'express';
import { findAllTeams, findTeamById, deleteTeamById } from '../db/team.repo';
import { getSettings as fetchSettings, upsertSettings } from '../db/settings.repo';
import { createLog, findLogs } from '../db/activity_log.repo';
import { queryNeon } from '../config/neon';
import { createError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

// ─── Teams ─────────────────────────────────────────────────────────────

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
      teams,
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
  res.json({ success: true, data: team });
};

export const updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  const team = await findTeamById(req.params.id);
  if (!team) throw createError('Team not found.', 404);

  const allowed = ['team_name', 'status'] as const;
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      sets.push(`${key} = $${idx++}`);
      vals.push(req.body[key]);
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

  res.json({ success: true, message: 'Team updated.', data: updated });
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
  res.json({ success: true, data: result.rows });
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
      logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    },
  });
};

// ─── Settings ──────────────────────────────────────────────────────────

export const getSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = await fetchSettings();
  res.json({ success: true, data: settings });
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const updated = await upsertSettings({
    ...req.body,
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

  res.json({ success: true, message: 'Settings updated.', data: updated });
};
