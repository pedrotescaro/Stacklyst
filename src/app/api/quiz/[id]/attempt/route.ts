import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { quizAttemptSchema } from '@/lib/validators';
import { QuizService } from '@/services/quiz.service';
import { prisma } from '@/lib/prisma';
import { syncProfileAchievementsSafely } from '@/services/profile-customization.service';

export const POST = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: quizId } = await params;

  const body = await req.json();
  const parsed = quizAttemptSchema.parse(body);

  const { attempt, correctIndex, isCorrect, xpResult } = await QuizService.validateQuizAnswer(
    user.id,
    quizId,
    parsed.selected_index
  );

  let formattedXpResult = null;
  if (xpResult) {
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { total_xp: true },
    });
    formattedXpResult = {
      newTotalXp: updatedUser?.total_xp ?? user.total_xp,
      newLanguageXp: xpResult.newXp,
      newLanguageLevel: xpResult.newLevel,
    };
  }

  if (isCorrect) {
    await syncProfileAchievementsSafely(user.id);
  }

  return NextResponse.json({
    attempt,
    correct_index: correctIndex,
    is_correct: isCorrect,
    xpResult: formattedXpResult,
  });
});
