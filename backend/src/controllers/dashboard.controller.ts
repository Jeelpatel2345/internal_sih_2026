import { Response } from 'express';
import { queryNeon } from '../config/neon';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalRes, completedRes, pendingRes, deptRes, genderRes, dailyRes] = await Promise.all([
    // Total teams
    queryNeon(`SELECT COUNT(*) FROM teams`),

    // Completed teams
    queryNeon(`SELECT COUNT(*) FROM teams WHERE status = 'completed'`),

    // Pending teams
    queryNeon(`SELECT COUNT(*) FROM teams WHERE status = 'pending_mentor'`),

    // Department distribution (by leader department)
    queryNeon(`
      SELECT p.department AS name, COUNT(*) AS value
      FROM participants p
      WHERE p.is_leader = true
      GROUP BY p.department
      ORDER BY value DESC
    `),

    // Gender ratio across all participants
    queryNeon(`
      SELECT gender AS name, COUNT(*) AS value
      FROM participants
      GROUP BY gender
    `),

    // Daily registrations over last 14 days
    queryNeon(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS registrations
      FROM teams
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY date
      ORDER BY date ASC
    `),
  ]);

  const totalTeams = parseInt(totalRes.rows[0].count, 10);
  const completedTeams = parseInt(completedRes.rows[0].count, 10);
  const pendingTeams = parseInt(pendingRes.rows[0].count, 10);

  res.json({
    success: true,
    data: {
      stats: {
        totalTeams,
        completedTeams,
        pendingTeams,
        totalParticipants: totalTeams * 6,
      },
      charts: {
        departmentDistribution: deptRes.rows.map((r) => ({
          name: r.name,
          value: parseInt(r.value, 10),
        })),
        genderRatio: genderRes.rows.map((r) => ({
          name: r.name,
          value: parseInt(r.value, 10),
        })),
        dailyRegistrations: dailyRes.rows.map((r) => ({
          date: r.date,
          registrations: parseInt(r.registrations, 10),
        })),
      },
    },
  });
};
