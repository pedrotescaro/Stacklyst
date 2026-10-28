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
 SELECT u.username,u.avatar_url,u.avatar_config,GREATEST(SUM((s.value->>'xp')::integer),0)::integer AS xp
 FROM "MobileState" s JOIN "User" u ON u.id=s.user_id
 WHERE split_part(s.key,':',1)='server-xp' AND split_part(s.key,':',2)>=${start} AND split_part(s.key,':',2)<=${end} AND split_part(s.key,':',3)=${scope}
 GROUP BY u.id HAVING SUM((s.value->>'xp')::integer)>0 ORDER BY xp DESC,u.username ASC,u.id ASC LIMIT 50`;
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    level: calculateLevel(row.xp).level,
    avatar_config: getLeaderboardAvatarConfig(row.avatar_config),
  }));
}
