import { calculateGemBalance } from '@/lib/gamification/gems';
import { LEARNING_LESSONS } from '@/lib/learning/catalog';
import { usersAheadWhere } from '@/lib/learning/rewards';
import { prisma } from '@/lib/prisma';
import { calculateTrailDailyProgress } from './trailDailyProgress';
import type { TrailDailyProgress } from './TrailsProgressSidebar';

const AUTHORED_EXERCISE_IDS = new Set(
  [...LEARNING_LESSONS.values()].flatMap((lesson) =>
    lesson.steps.filter((step) => step.type !== 'concept_explanation').map((step) => step.id)
  )
);

/** Gems shown in the trails rail: the RPG wallet when it exists, otherwise earned completions. */
export function calculateTrailGems(
  rpgCoins: number | null | undefined,
  firstCompletionCount: number,
  correctQuizIds: readonly string[]
) {
  if (rpgCoins != null) return rpgCoins;
  const lessonCompletions = correctQuizIds.filter((id) => AUTHORED_EXERCISE_IDS.has(id)).length;
  return calculateGemBalance(firstCompletionCount + lessonCompletions);
}

export interface TrailRailStats {
  gems: number;
  globalRank: number;
  totalParticipants: number;
  dailyProgress: TrailDailyProgress;
}

/** Numbers for `TrailsProgressSidebar` on pages that don't already load the full trail data. */
export async function getTrailRailStats(user: {
  id: string;
  username: string;
  total_xp: number;
}): Promise<TrailRailStats> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const [
    usersAhead,
    totalParticipants,
    todaySubmissions,
    todayQuizAttempts,
    firstCompletionCount,
    correctQuizAttempts,
    rpgPlayer,
  ] = await Promise.all([
    prisma.user.count({ where: usersAheadWhere(user) }),
    prisma.user.count(),
    prisma.exerciseSubmission.findMany({
      where: { user_id: user.id, created_at: { gte: todayStart } },
      select: { status: true, xp_earned: true },
    }),
    prisma.quizAttempt.findMany({
      where: { user_id: user.id, created_at: { gte: todayStart } },
      select: { quiz_id: true, is_correct: true, xp_earned: true },
    }),
    prisma.exerciseSubmission.count({ where: { user_id: user.id, first_completion: true } }),
    prisma.quizAttempt.findMany({
      where: { user_id: user.id, is_correct: true },
      select: { quiz_id: true },
    }),
    prisma.rpgPlayer.findUnique({ where: { userId: user.id }, select: { coins: true } }),
  ]);
  return {
    gems: calculateTrailGems(
      rpgPlayer?.coins,
      firstCompletionCount,
      correctQuizAttempts.map((attempt) => attempt.quiz_id)
    ),
    globalRank: usersAhead + 1,
    totalParticipants,
    dailyProgress: calculateTrailDailyProgress(todaySubmissions, todayQuizAttempts),
  };
}
