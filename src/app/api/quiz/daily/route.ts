import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withCache } from '@/lib/cache';
import { CACHE_TTL_DAILY_QUIZ } from '@/lib/config';

export const GET = apiHandler(async (_req) => {
  const user = await requireAuth();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split('T')[0];

  // Cache the daily quiz lookup (same quiz for all users on a given day)
  const quiz = await withCache(`daily-quiz:${dateKey}`, CACHE_TTL_DAILY_QUIZ, async () => {
    let found = await prisma.quiz.findUnique({
      where: { scheduled_for: today },
    });

    if (!found) {
      found = await prisma.quiz.findFirst({
        where: { is_daily: true },
        orderBy: { created_at: 'desc' },
      });
    }

    return found;
  });

  if (!quiz) {
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
