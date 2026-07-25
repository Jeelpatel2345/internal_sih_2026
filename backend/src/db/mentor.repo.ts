import { queryNeon } from '../config/neon';
import { MentorRow } from './team.repo';

export const insertMentor = async (params: {
  teamId: string;
  fullName: string;
  contactNumber: string;
  email: string;
  department: string;
  institute: string;
  officeAddress: string;
}): Promise<MentorRow> => {
  const res = await queryNeon(
    `INSERT INTO mentors
       (team_id, full_name, contact_number, email, department, institute, office_address, submitted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [
      params.teamId,
      params.fullName,
      params.contactNumber,
      params.email.toLowerCase(),
      params.department,
      params.institute,
      params.officeAddress,
    ]
  );
  return res.rows[0];
};

export const findMentorByTeamId = async (teamId: string): Promise<MentorRow | null> => {
  const res = await queryNeon(
    `SELECT * FROM mentors WHERE team_id = $1 LIMIT 1`,
    [teamId]
  );
  return res.rows[0] ?? null;
};
