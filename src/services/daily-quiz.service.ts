import 'server-only';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { ValidationError } from '@/lib/errors';
import { selectPostQuiz } from '@/lib/post-quiz';

const DAY_MS = 86_400_000;

/** Publish at most one reviewed, post-related question per UTC day, without AI. */
export async function generateDailyQuiz(scheduledFor: Date) {
  if (!Number.isFinite(scheduledFor.getTime())) {
    throw new ValidationError('INVALID_QUIZ_DATE', 'Informe uma data válida para o quiz.');
  }

  const day = new Date(scheduledFor.getTime());
  day.setUTCHours(0, 0, 0, 0);
  const where = { scheduled_for: day };
  const existing = await prisma.quiz.findUnique({ where });
  if (existing) return existing;

  // Posts are public. Bound the scan to recent posts on or before the scheduled day.
  const posts = await prisma.post.findMany({
    where: {
      created_at: {
        gte: new Date(day.getTime() - 30 * DAY_MS),
        lt: new Date(day.getTime() + DAY_MS),
      },
    },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    take: 100,
    select: { id: true, title: true, body: true, language: true, created_at: true },
  });
  const content = selectPostQuiz(posts, day);
  if (!content) return null;

  try {
    const quiz = await prisma.quiz.upsert({
      where,
      update: {},
      create: { ...content, is_daily: true, scheduled_for: day },
    });
    logger.info('Daily quiz selected from programming posts', {
      quizId: quiz.id,
      postId: quiz.post_id,
      scheduledFor: day.toISOString(),
    });
    return quiz;
  } catch (error) {
    // Some Prisma adapters emulate upsert. Keep concurrent first visits idempotent.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const winner = await prisma.quiz.findUnique({ where });
      if (winner) return winner;
    }
    throw error;
  }
}
