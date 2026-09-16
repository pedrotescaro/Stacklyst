import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { getExerciseWorkspaceForUser, requireExerciseAccess } from '@/lib/exercises/repository';
import { NotFoundError } from '@/lib/errors';

export const GET = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const exercise = await getExerciseWorkspaceForUser(id, user.id);
  if (!exercise) throw new NotFoundError('EXERCISE_NOT_FOUND', 'Exercício não encontrado.');
  await requireExerciseAccess(user.id, exercise.knowledge.id);
  return Response.json(exercise);
});
