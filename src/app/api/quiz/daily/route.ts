import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BlockService } from '@/services/block.service';
import { withCache } from '@/lib/cache';
import { CACHE_TTL_DAILY_QUIZ } from '@/lib/config';
import { generateDailyQuiz } from '@/services/daily-quiz.service';

export const GET = apiHandler(async (_req) => {
  const user = await requireAuth();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split('T')[0];

  // Cache absence briefly too, so unrelated posts do not cause a scan on every visit.
  // The database keeps a published quiz stable across instances for the whole day.
  const { quiz } = await withCache(
    `daily-quiz:${dateKey}`,
    Math.min(CACHE_TTL_DAILY_QUIZ, 300),
    async () => ({ quiz: await generateDailyQuiz(today) })
  );

  if (!quiz) {
    return NextResponse.json({ quiz: null, attempt: null });
  }

  if (quiz.post_id) {
    const post = await prisma.post.findUnique({
      where: { id: quiz.post_id },
      select: { author_id: true },
    });
    if (post && (await BlockService.hasBlock(user.id, post.author_id)))
      return NextResponse.json({ quiz: null, attempt: null });
  }

  // Get user attempt (not cached — per-user)
  const attempt = await prisma.quizAttempt.findUnique({
    where: {
      user_id_quiz_id: {
        user_id: user.id,
        quiz_id: quiz.id,
      },
    },
  });

  const sanitizedQuiz = attempt
    ? quiz
    : {
        id: quiz.id,
        post_id: quiz.post_id,
        question: quiz.question,
        options: quiz.options,
        is_daily: quiz.is_daily,
        scheduled_for: quiz.scheduled_for,
      };

  return NextResponse.json({ quiz: sanitizedQuiz, attempt });
});
