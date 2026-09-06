import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { LeaderboardClient } from '@/app/leaderboard/LeaderboardClient';
import { calculateLevel, XP_RANK_ORDER } from '@/lib/learning/rewards';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Ranking de XP — Stacklyst',
  description: 'Classificação dos desenvolvedores por XP no Stacklyst.',
};

export default async function RankedPage() {
  const user = await getAuthUser();

  if (!user) redirect('/login');

  const [leaders, trails] = await Promise.all([
    prisma.user.findMany({
      orderBy: XP_RANK_ORDER,
      take: 10,
      select: {
        username: true,
        avatar_url: true,
        total_xp: true,
      },
    }),
    prisma.languageTrail.findMany({
      where: { user_id: user.id },
      select: { streak: true },
    }),
  ]);

  const initialLeaderboard = leaders.map((leader, index) => ({
    rank: index + 1,
    username: leader.username,
    avatar_url: leader.avatar_url,
    xp: leader.total_xp,
    level: calculateLevel(leader.total_xp).level,
  }));

  return (
    <LeaderboardClient
      initialLeaderboard={initialLeaderboard}
      initialUser={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        total_xp: user.total_xp,
        streak: Math.max(
          user.streak_days,
          trails.reduce((maximum, trail) => Math.max(maximum, trail.streak), 0)
        ),
      }}
    />
  );
}
