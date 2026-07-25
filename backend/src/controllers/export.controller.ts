import { Response } from 'express';
import ExcelJS from 'exceljs';
import { queryNeon } from '../config/neon';
import { AuthRequest } from '../middlewares/auth.middleware';

interface FlatTeam {
  'Registration ID': string;
  'Team Name': string;
  Status: string;
  'Registered At': string;
  'Leader Name': string;
  'Leader Enrollment': string;
  'Leader Semester': number | string;
  'Leader Department': string;
  'Leader Mobile': string;
  'Leader Email': string;
  'Leader Gender': string;
  'Member Count': number;
  'Mentor Name': string;
  'Mentor Contact': string;
  'Mentor Email': string;
  'Mentor Dept': string;
  'Mentor Institute': string;
}

const fetchFlatTeams = async (): Promise<FlatTeam[]> => {
  const res = await queryNeon(`
    SELECT
      t.registration_id,
      t.team_name,
      t.status,
      t.created_at,
      -- Leader info
      p_leader.full_name       AS leader_name,
      p_leader.enrollment_number AS leader_enrollment,
      p_leader.semester        AS leader_semester,
      p_leader.department      AS leader_department,
      p_leader.mobile          AS leader_mobile,
      p_leader.email           AS leader_email,
      p_leader.gender          AS leader_gender,
      -- Member count (excluding leader)
      (SELECT COUNT(*) FROM participants pm WHERE pm.team_id = t.id AND pm.is_leader = false) AS member_count,
      -- Mentor
      m.full_name     AS mentor_name,
      m.contact_number AS mentor_contact,
      m.email         AS mentor_email,
      m.department    AS mentor_dept,
      m.institute     AS mentor_institute
    FROM teams t
    LEFT JOIN participants p_leader ON p_leader.team_id = t.id AND p_leader.is_leader = true
    LEFT JOIN mentors m ON m.team_id = t.id
    ORDER BY t.created_at DESC
  `);

  return res.rows.map((r) => ({
    'Registration ID': r.registration_id,
    'Team Name': r.team_name,
    Status: r.status,
    'Registered At': new Date(r.created_at).toLocaleString('en-IN'),
    'Leader Name': r.leader_name ?? '',
    'Leader Enrollment': r.leader_enrollment ?? '',
    'Leader Semester': r.leader_semester ?? '',
    'Leader Department': r.leader_department ?? '',
    'Leader Mobile': r.leader_mobile ?? '',
    'Leader Email': r.leader_email ?? '',
    'Leader Gender': r.leader_gender ?? '',
    'Member Count': parseInt(r.member_count, 10),
    'Mentor Name': r.mentor_name ?? 'Pending',
    'Mentor Contact': r.mentor_contact ?? '',
    'Mentor Email': r.mentor_email ?? '',
    'Mentor Dept': r.mentor_dept ?? '',
    'Mentor Institute': r.mentor_institute ?? '',
  }));
};

export const exportExcel = async (_req: AuthRequest, res: Response): Promise<void> => {
  const rows = await fetchFlatTeams();
  if (rows.length === 0) {
    res.status(204).end();
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Teams');
  const headers = Object.keys(rows[0]);

  sheet.addRow(headers).font = { bold: true };
  rows.forEach((row) => sheet.addRow(Object.values(row)));

  sheet.columns.forEach((col, i) => {
    const maxLen = Math.max(
      headers[i]?.length || 10,
      ...rows.map((r) => String(Object.values(r)[i] ?? '').length)
    );
    col.width = Math.min(maxLen + 4, 40);
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="SIH2026_Teams_${Date.now()}.xlsx"`
  );
  await workbook.xlsx.write(res);
  res.end();
};

export const exportCSV = async (_req: AuthRequest, res: Response): Promise<void> => {
  const rows = await fetchFlatTeams();
  if (rows.length === 0) {
    res.status(204).end();
    return;
  }

  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };

  const csv = [
    headers.map(escape).join(','),
    ...rows.map((r) => Object.values(r).map(escape).join(',')),
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="SIH2026_Teams_${Date.now()}.csv"`
  );
  res.send(csv);
};

export const exportPDF = async (_req: AuthRequest, res: Response): Promise<void> => {
  const rows = await fetchFlatTeams();
  res.json({ success: true, data: rows });
};
