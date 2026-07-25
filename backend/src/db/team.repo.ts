import { queryNeon } from '../config/neon';

export interface ParticipantRow {
  id: string;
  team_id: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  enrollment_number: string;
  semester: number;
  department: string;
  mobile: string;
  email: string;
  is_leader: boolean;
}

export interface MentorRow {
  id: string;
  team_id: string;
  full_name: string;
  contact_number: string;
  email: string;
  department: string;
  institute: string;
  office_address: string;
  submitted_at: Date;
}

export interface TeamRow {
  id: string;
  registration_id: string;
  team_name: string;
  status: 'pending_mentor' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface TeamFull extends TeamRow {
  participants: ParticipantRow[];
  mentor: MentorRow | null;
  leader: ParticipantRow | null;
  members: ParticipantRow[];
}

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

export const countTeams = async (): Promise<number> => {
  const res = await queryNeon(`SELECT COUNT(*) FROM teams`);
  return parseInt(res.rows[0].count, 10);
};

export const teamNameExists = async (name: string): Promise<boolean> => {
  const res = await queryNeon(
    `SELECT 1 FROM teams WHERE LOWER(team_name) = LOWER($1) LIMIT 1`,
    [name.trim()]
  );
  return (res.rowCount ?? 0) > 0;
};

export const enrollmentsExistInOtherTeams = async (enrollments: string[]): Promise<boolean> => {
  const res = await queryNeon(
    `SELECT 1 FROM participants WHERE enrollment_number = ANY($1::text[]) LIMIT 1`,
    [enrollments]
  );
  return (res.rowCount ?? 0) > 0;
};

export const insertTeam = async (params: {
  registrationId: string;
  teamName: string;
}): Promise<TeamRow> => {
  const res = await queryNeon(
    `INSERT INTO teams (registration_id, team_name, status)
     VALUES ($1, $2, 'pending_mentor')
     RETURNING *`,
    [params.registrationId, params.teamName.trim()]
  );
  return res.rows[0];
};

export const insertParticipants = async (
  teamId: string,
  participants: Array<{
    fullName: string;
    gender: string;
    enrollmentNumber: string;
    semester: number;
    department: string;
    mobile: string;
    email: string;
    isLeader: boolean;
  }>
): Promise<void> => {
  for (const p of participants) {
    await queryNeon(
      `INSERT INTO participants
         (team_id, full_name, gender, enrollment_number, semester, department, mobile, email, is_leader)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        teamId,
        p.fullName,
        p.gender,
        p.enrollmentNumber.toUpperCase(),
        p.semester,
        p.department,
        p.mobile,
        p.email.toLowerCase(),
        p.isLeader,
      ]
    );
  }
};

/** Fetch team + participants + mentor assembled in one round-trip */
export const findTeamByRegistrationId = async (
  registrationId: string
): Promise<TeamFull | null> => {
  const teamRes = await queryNeon(
    `SELECT * FROM teams WHERE UPPER(registration_id) = UPPER($1) LIMIT 1`,
    [registrationId]
  );
  if (!teamRes.rows[0]) return null;
  return _assembleTeamFull(teamRes.rows[0]);
};

export const findTeamById = async (id: string): Promise<TeamFull | null> => {
  const teamRes = await queryNeon(`SELECT * FROM teams WHERE id = $1 LIMIT 1`, [id]);
  if (!teamRes.rows[0]) return null;
  return _assembleTeamFull(teamRes.rows[0]);
};

/** Paginated teams with optional search/status/department filter */
export const findAllTeams = async (opts: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  department?: string;
  sort?: string; // e.g. 'created_at_desc'
}): Promise<{ teams: TeamFull[]; total: number }> => {
  const { page, limit, search, status, department } = opts;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (status) {
    conditions.push(`t.status = $${idx++}`);
    params.push(status);
  }

  // search across team_name, registration_id, and leader fields
  if (search) {
    conditions.push(`(
      t.team_name ILIKE $${idx} OR
      t.registration_id ILIKE $${idx} OR
      EXISTS (
        SELECT 1 FROM participants p2
        WHERE p2.team_id = t.id AND p2.is_leader = true AND (
          p2.full_name ILIKE $${idx} OR
          p2.email ILIKE $${idx} OR
          p2.enrollment_number ILIKE $${idx} OR
          p2.department ILIKE $${idx}
        )
      )
    )`);
    params.push(`%${search}%`);
    idx++;
  }

  if (department) {
    conditions.push(`EXISTS (
      SELECT 1 FROM participants p3
      WHERE p3.team_id = t.id AND p3.is_leader = true AND p3.department = $${idx++}
    )`);
    params.push(department);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await queryNeon(
    `SELECT COUNT(*) FROM teams t ${where}`,
    params
  );
  const total = parseInt(countRes.rows[0].count, 10);

  const teamsRes = await queryNeon(
    `SELECT t.* FROM teams t ${where}
     ORDER BY t.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );

  const teams: TeamFull[] = [];
  for (const row of teamsRes.rows) {
    teams.push(await _assembleTeamFull(row));
  }

  return { teams, total };
};

export const updateTeamStatus = async (
  id: string,
  status: 'pending_mentor' | 'completed'
): Promise<void> => {
  await queryNeon(`UPDATE teams SET status = $2, updated_at = NOW() WHERE id = $1`, [id, status]);
};

export const deleteTeamById = async (id: string): Promise<TeamRow | null> => {
  const res = await queryNeon(`DELETE FROM teams WHERE id = $1 RETURNING *`, [id]);
  return res.rows[0] ?? null;
};

// ──────────────────────────────────────────────
// Internal helper
// ──────────────────────────────────────────────

async function _assembleTeamFull(teamRow: TeamRow): Promise<TeamFull> {
  const [partRes, mentorRes] = await Promise.all([
    queryNeon(
      `SELECT * FROM participants WHERE team_id = $1 ORDER BY is_leader DESC`,
      [teamRow.id]
    ),
    queryNeon(`SELECT * FROM mentors WHERE team_id = $1 LIMIT 1`, [teamRow.id]),
  ]);

  const participants: ParticipantRow[] = partRes.rows;
  const mentor: MentorRow | null = mentorRes.rows[0] ?? null;
  const leader = participants.find((p) => p.is_leader) ?? null;
  const members = participants.filter((p) => !p.is_leader);

  return { ...teamRow, participants, mentor, leader, members };
}
