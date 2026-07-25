import { Request, Response } from 'express';
import { findTeamByRegistrationId, updateTeamStatus } from '../db/team.repo';
import { insertMentor, findMentorByTeamId } from '../db/mentor.repo';
import { createError } from '../middlewares/error.middleware';
import { sendMentorSubmittedEmail } from '../services/email.service';

export const submitMentor = async (req: Request, res: Response): Promise<void> => {
  const { registrationId, mentor } = req.body;

  const team = await findTeamByRegistrationId(registrationId);
  if (!team) {
    throw createError('Registration ID not found. Please check and try again.', 404);
  }

  if (team.status === 'completed' && team.mentor) {
    throw createError('Mentor details have already been submitted for this team.', 409);
  }

  await insertMentor({
    teamId: team.id,
    fullName: mentor.fullName,
    contactNumber: mentor.contactNumber,
    email: mentor.email,
    department: mentor.department,
    institute: mentor.institute,
    officeAddress: mentor.officeAddress,
  });

  await updateTeamStatus(team.id, 'completed');

  // Non-blocking email
  if (team.leader) {
    sendMentorSubmittedEmail({
      to: team.leader.email,
      teamName: team.team_name,
      leaderName: team.leader.full_name,
      registrationId: team.registration_id,
      mentorName: mentor.fullName,
    });
  }

  res.json({
    success: true,
    message: 'Mentor details submitted successfully. Your registration is now complete.',
    data: {
      registrationId: team.registration_id,
      teamName: team.team_name,
      status: 'completed',
    },
  });
};

export const verifyRegistrationId = async (req: Request, res: Response): Promise<void> => {
  const { registrationId } = req.body;
  const team = await findTeamByRegistrationId(registrationId);

  if (!team) {
    throw createError('Registration ID not found. Please check and try again.', 404);
  }

  const mentorRecord = await findMentorByTeamId(team.id);

  res.json({
    success: true,
    data: {
      registrationId: team.registration_id,
      teamName: team.team_name,
      status: team.status,
      hasMentor: !!mentorRecord,
    },
  });
};
