import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { LeaderboardClient } from '@/app/leaderboard/LeaderboardClient';
import { calculateLevel } from '@/lib/learning/rewards';
import { getEffectiveStreak } from '@/lib/streak';
import { getUserLanguageXp, getLanguageLeaderboard } from '@/lib/learning/language-xp';
import { TRAIL_LANGUAGE_CODES, type TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import type { TrailCourseOption } from '@/app/trails/TrailCourseSelector';
import type { Language } from '@prisma/client';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Ranking de XP — Stacklyst',
  description: 'Classificação dos desenvolvedores por XP no Stacklyst.',
};

export default async function RankedPage() {
  const user = await getAuthUser();

  if (!user) redirect('/login');

  const [userLanguageXp, trails] = await Promise.all([
    getUserLanguageXp(user.id),
    prisma.languageTrail.findMany({
      where: { user_id: user.id },
      select: { streak: true, language: true, xp: true },
    }),
  ]);

  // Cursos iniciados ou com XP pelo usuário
  const enrolledTrailCodes = trails.map((t) => t.language as unknown as TrailLanguageCode);
  const enrolledWithXp = userLanguageXp
    .filter((item) => item.xp > 0)
    .map((item) => item.language as unknown as TrailLanguageCode);
  const allEnrolledSet = new Set([...enrolledTrailCodes, ...enrolledWithXp]);

  // Linguagem ativa: a de maior XP inscrita, ou a primeira inscrita, ou JS como fallback
  const activeLanguage = (userLanguageXp.find((item) =>
    allEnrolledSet.has(item.language as unknown as TrailLanguageCode)
  )?.language ??
    (allEnrolledSet.size > 0 ? Array.from(allEnrolledSet)[0] : 'JS')) as TrailLanguageCode;

  // Montar lista de cursos para o TrailCourseSelector
  const userCourses: TrailCourseOption[] = TRAIL_LANGUAGE_CODES.map((code) => {
    const xpFound = userLanguageXp.find((item) => (item.language as string) === code);
    const xp = xpFound?.xp ?? 0;
    const isStarted = allEnrolledSet.has(code) || code === activeLanguage;
    return {
      language: code,
      xp,
      started: isStarted,
    };
  });

  // Buscar o ranking específico da linguagem ativa
  const leaders = await getLanguageLeaderboard(activeLanguage as unknown as Language, 50);

  const initialLeaderboard = leaders.map((leader, index) => ({
    rank: index + 1,
    username: leader.username,
    avatar_url: leader.avatar_url,
    xp: leader.xp,
    level: calculateLevel(leader.xp).level,
    streak: getEffectiveStreak(leader.streak_days ?? 0, leader.last_active_at),
    created_at: leader.created_at ? leader.created_at.toISOString() : null,
  }));

  return (
    <LeaderboardClient
      initialLeaderboard={initialLeaderboard}
      initialLanguage={activeLanguage}
      courses={userCourses}
      initialUser={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        total_xp: user.total_xp,
        streak: user.streak_days,
        last_active_at: user.last_active_at ? user.last_active_at.toISOString() : null,
      }}
    />
  );
}
