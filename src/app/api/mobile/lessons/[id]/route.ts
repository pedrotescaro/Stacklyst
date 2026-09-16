import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { getLearningLesson } from '@/lib/learning/catalog';
import { publicLesson } from '@/lib/mobile/lesson';
import { requireLessonAccess } from '@/lib/learning/lesson-progress';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const GET = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const lesson = getLearningLesson(id);
  if (!lesson) throw new NotFoundError('LESSON_NOT_FOUND', 'Lição não encontrada.');
  await requireLessonAccess(user.id, lesson);
  const attempts = await prisma.quizAttempt.findMany({
    where: { user_id: user.id, quiz_id: { in: lesson.steps.map((s) => s.id) }, is_correct: true },
    select: { quiz_id: true },
  });
  return Response.json({
    ...publicLesson(lesson),
    completedStepIds: attempts.map((a) => a.quiz_id),
  });
});
