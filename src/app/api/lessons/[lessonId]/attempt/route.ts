import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { AppError, UnauthorizedError, ValidationError } from '@/lib/errors';
import { rateLimit } from '@/lib/ratelimit';
import { getLessonById } from '@/lib/lessons/registry';
import { assessLessonStep, lessonAnswerSchema } from '@/lib/learning/assessment';
import { requireLessonAccess, saveLessonAssessment } from '@/lib/learning/lesson-progress';

export const POST = apiHandler(async (request, { params, session: user }) => {
  if (!user) throw new UnauthorizedError();
  const { lessonId } = await params;
  await rateLimit(`lesson:${user.id}`, {
    limit: 30,
    window: '1 m',
    endpoint: '/api/lessons/attempt',
  });
  const parsed = lessonAnswerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    throw new ValidationError('INVALID_ANSWER', 'Confira os dados da resposta e tente novamente.');
  const answer = parsed.data;
  const lesson = getLessonById(lessonId);
  const step = lesson?.steps.find((s) => s.id === answer.stepId);
  if (!lesson || !step) throw new AppError('LESSON_NOT_FOUND', 'Atividade não encontrada.', 404);
  await requireLessonAccess(user.id, lesson);
  const outcome = await assessLessonStep(lesson, step, answer);
  if ('unavailable' in outcome && outcome.unavailable)
    throw new AppError(
      'RUNNER_UNAVAILABLE',
      'Serviço de execução indisponível. Seu progresso não foi alterado; tente novamente.',
      503
    );
  if (answer.action === 'run') return NextResponse.json({ ...outcome, xpEarned: 0 });
  const progress = await saveLessonAssessment(
    user.id,
    lesson,
    step,
    outcome.isCorrect,
    answer.selectedOption ?? 0
  );
  return NextResponse.json({ ...outcome, ...progress });
});
