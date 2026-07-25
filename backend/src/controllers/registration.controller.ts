import { Request, Response } from 'express';
import {
  countTeams,
  teamNameExists,
  enrollmentsExistInOtherTeams,
  insertTeam,
  insertParticipants,
  findTeamByRegistrationId,
} from '../db/team.repo';
import { getSettings } from '../db/settings.repo';
import { generateRegistrationId } from '../utils/jwt';
import { createError } from '../middlewares/error.middleware';
import {
  sendRegistrationSuccessEmail,
  sendAdminNotificationEmail,
} from '../services/email.service';

const FORBIDDEN_WORDS = ['vsitr', 'vidush somany', 'vidushsomany', 'ksv', 'kadi sarva'];

export const checkTeamName = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.query as { name: string };
  if (!name || name.trim().length < 2) {
    res.status(400).json({ success: false, message: 'Team name is required.' });
    return;
  }

  const lower = name.toLowerCase().trim();
  const hasForbidden = FORBIDDEN_WORDS.some((w) => lower.includes(w));
  if (hasForbidden) {
    res.json({
      success: true,
      available: false,
      reason: 'forbidden',
      message: 'Team name must not include the institute name (VSITR, KSV, etc.).',
    });
    return;
  }

  const taken = await teamNameExists(name);
  res.json({
    success: true,
    available: !taken,
    reason: taken ? 'taken' : null,
    message: taken ? 'This team name is already taken.' : 'Team name is available.',
  });
};

export const registerTeam = async (req: Request, res: Response): Promise<void> => {
  // Check registration deadline
  const settings = await getSettings();
  const deadline = settings.registration_deadline
    ? new Date(settings.registration_deadline)
    : new Date('2026-08-02T18:29:00.000Z');

  if (new Date() > deadline) {
    throw createError('Registrations are closed. The deadline has passed.', 400);
  }

  if (settings.registration_open === false) {
    throw createError('Registrations are currently closed.', 400);
  }

  const { teamName, leader, members } = req.body;

  // Validate team name
  const lower = teamName.toLowerCase().trim();
  const hasForbidden = FORBIDDEN_WORDS.some((w) => lower.includes(w));
  if (hasForbidden) {
    throw createError('Team name must not include the institute name.', 400);
  }

  if (await teamNameExists(teamName)) {
    throw createError('This team name has already been registered. Please choose another.', 409);
  }

  // Collect all participants
  const allParticipants = [
    { ...leader, isLeader: true },
    ...members.map((m: object) => ({ ...m, isLeader: false })),
  ];

  // Validate exactly 6 members
  if (allParticipants.length !== 6) {
    throw createError('Each team must consist of exactly 6 members, including the Team Leader.', 400);
  }

  // At least 1 female
  const hasFemaleMember = allParticipants.some((p: { gender: string }) => p.gender === 'Female');
  if (!hasFemaleMember) {
    throw createError(
      'Every team must include at least one female participant. Please add the details of a female member before submitting the registration.',
      400
    );
  }

  // Duplicate enrollment within team
  const enrollments = allParticipants.map((p: { enrollmentNumber: string }) =>
    p.enrollmentNumber.toUpperCase()
  );
  if (new Set(enrollments).size !== enrollments.length) {
    throw createError('An enrollment number has been entered more than once in your team.', 400);
  }

  // Duplicate email within team
  const emails = allParticipants.map((p: { email: string }) => p.email.toLowerCase());
  if (new Set(emails).size !== emails.length) {
    throw createError('An email address has been entered more than once in your team.', 400);
  }

  // Duplicate mobile within team
  const mobiles = allParticipants.map((p: { mobile: string }) => p.mobile);
  if (new Set(mobiles).size !== mobiles.length) {
    throw createError('A mobile number has been entered more than once in your team.', 400);
  }

  // Cross-team duplicate enrollment check
  if (await enrollmentsExistInOtherTeams(enrollments)) {
    throw createError(
      'One or more enrollment numbers in your team have already been registered with another team.',
      409
    );
  }

  // Generate registration ID
  const count = await countTeams();
  const registrationId = generateRegistrationId(count + 1);

  // Insert team row
  const team = await insertTeam({ registrationId, teamName });

  // Insert all participants
  await insertParticipants(
    team.id,
    allParticipants.map((p: {
      fullName: string;
      gender: string;
      enrollmentNumber: string;
      semester: number;
      department: string;
      mobile: string;
      email: string;
      isLeader: boolean;
    }) => ({
      fullName: p.fullName,
      gender: p.gender,
      enrollmentNumber: p.enrollmentNumber,
      semester: p.semester,
      department: p.department,
      mobile: p.mobile,
      email: p.email,
      isLeader: p.isLeader,
    }))
  );

  // Non-blocking emails
  sendRegistrationSuccessEmail({
    to: leader.email,
    teamName: team.team_name,
    leaderName: leader.fullName,
    registrationId: team.registration_id,
  });
  sendAdminNotificationEmail({
    teamName: team.team_name,
    registrationId: team.registration_id,
    leaderName: leader.fullName,
    department: leader.department,
  });

  res.status(201).json({
    success: true,
    message: 'Team registered successfully.',
    data: {
      registrationId: team.registration_id,
      teamName: team.team_name,
      status: team.status,
    },
  });
};

export const getTeamStatus = async (req: Request, res: Response): Promise<void> => {
  const { registrationId } = req.params;
  const team = await findTeamByRegistrationId(registrationId);

  if (!team) {
    throw createError('Registration ID not found.', 404);
  }

  res.json({
    success: true,
    data: {
      registrationId: team.registration_id,
      teamName: team.team_name,
      status: team.status,
      hasMentor: !!team.mentor,
      createdAt: team.created_at,
    },
  });
};

export const getRegistrationStatus = async (_req: Request, res: Response): Promise<void> => {
  const settings = await getSettings();
  const deadline = new Date(settings.registration_deadline);
  const isOpen = settings.registration_open !== false && new Date() <= deadline;

  res.json({
    success: true,
    data: {
      isOpen,
      deadline: settings.registration_deadline,
      maintenanceMode: settings.maintenance_mode || false,
    },
  });
};
