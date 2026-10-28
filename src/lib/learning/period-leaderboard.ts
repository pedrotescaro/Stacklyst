import 'server-only';
import { calculateLevel } from './rewards';
import { prisma } from '@/lib/prisma';
import type { Language } from '@prisma/client';
import { periodStart, type RankingPeriod } from './xp-periods';
import { getLeaderboardAvatarConfig } from '@/lib/leaderboard-identity';
export async function getPeriodLeaderboard(period: RankingPeriod, language?: Language) {
  const start = periodStart(period),
    end = periodStart('daily'),
    scope = language || 'GLOBAL';
  const rows = await prisma.$queryRaw<
    { username: string; avatar_url: string | null; avatar_config: unknown; xp: number }[]
  >`
 WITH rewards AS (
   SELECT s.user_id, (s.value->>'xp')::integer AS xp FROM "MobileState" s
   WHERE split_part(s.key,':',1)='server-xp' AND split_part(s.key,':',2)>=${start}
     AND split_part(s.key,':',2)<=${end} AND split_part(s.key,':',3)=${scope}
   UNION ALL
   SELECT s.user_id, s.xp_earned AS xp FROM exercise_submissions s
   JOIN exercises e ON e.id=s.exercise_id
   WHERE s.first_completion=true AND s.xp_earned>0
     AND s.created_at >= (${start}::date::timestamp AT TIME ZONE 'America/Sao_Paulo')
     AND s.created_at < '2026-10-28T15:42:00Z'::timestamptz
     AND (${scope}='GLOBAL' OR e.language::text=${scope})
 )
 SELECT u.username,u.avatar_url,u.avatar_config,GREATEST(SUM(r.xp),0)::integer AS xp
 FROM rewards r JOIN "User" u ON u.id=r.user_id
 GROUP BY u.id HAVING SUM(r.xp)>0 ORDER BY xp DESC,u.username ASC,u.id ASC LIMIT 50`;
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    level: calculateLevel(row.xp).level,
    avatar_config: getLeaderboardAvatarConfig(row.avatar_config),
  }));
}
