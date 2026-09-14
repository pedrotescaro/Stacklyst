import 'server-only';
import type { Language } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from './rewards';

// Historical exercise rewards live in ExerciseSubmission, not LanguageTrail.
// Read both ledgers instead of migrating or double-counting legitimate XP.
export async function getUserLanguageXp(userId: string) {
  const rows = await prisma.$queryRaw<{ language: Language; xp: number }[]>`
    SELECT language, SUM(xp)::integer AS xp FROM (
      SELECT language, xp FROM "LanguageTrail" WHERE user_id=${userId}
      UNION ALL
      SELECT e.language, s.xp_earned AS xp FROM exercise_submissions s
      JOIN exercises e ON e.id=s.exercise_id
      WHERE s.user_id=${userId} AND s.first_completion=true
    ) rewards GROUP BY language ORDER BY xp DESC, language ASC`;
  return rows.map((row) => ({ ...row, level: calculateLevel(row.xp).level }));
}

export async function getLanguageLeaderboard(language: Language, limit = 50) {
  return prisma.$queryRaw<
    {
      username: string;
      avatar_url: string | null;
      xp: number;
      streak_days?: number;
      last_active_at?: Date | null;
      created_at?: Date;
    }[]
  >`
    WITH rewards AS (
      SELECT user_id, xp FROM "LanguageTrail" WHERE language=${language}::"Language"
      UNION ALL
      SELECT s.user_id, s.xp_earned AS xp FROM exercise_submissions s
      JOIN exercises e ON e.id=s.exercise_id
      WHERE e.language=${language}::"Language" AND s.first_completion=true
    ), totals AS (SELECT user_id, SUM(xp)::integer AS xp FROM rewards GROUP BY user_id)
    SELECT u.username, u.avatar_url, t.xp, u.streak_days, u.last_active_at, u.created_at FROM totals t JOIN "User" u ON u.id=t.user_id
    ORDER BY t.xp DESC, u.username ASC, u.id ASC LIMIT ${limit}`;
}
