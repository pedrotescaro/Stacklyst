import 'server-only';
import { prisma } from '@/lib/prisma';
import { getLeaderboardAvatarConfig } from '@/lib/leaderboard-identity';
import { getEffectiveStreak } from '@/lib/streak';
import { calculateLevel, XP_RANK_ORDER } from '@/lib/learning/rewards';

export async function getGlobalLeaderboard(limit = 50) {
  const leaders = await prisma.user.findMany({
    orderBy: XP_RANK_ORDER,
    take: limit,
    select: {
      username: true,
      avatar_url: true,
      avatar_config: true,
      total_xp: true,
      streak_days: true,
      last_active_at: true,
      created_at: true,
    },
  });
  return leaders.map((leader, index) => ({
    rank: index + 1,
    username: leader.username,
    avatar_url: leader.avatar_url,
    avatar_config: getLeaderboardAvatarConfig(leader.avatar_config),
    xp: leader.total_xp,
    level: calculateLevel(leader.total_xp).level,
    streak: getEffectiveStreak(leader.streak_days ?? 0, leader.last_active_at),
    created_at: leader.created_at ? leader.created_at.toISOString() : null,
  }));
}
