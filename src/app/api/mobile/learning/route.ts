import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getKnowledgeMapForUser } from '@/lib/learning/repository';
import { buildLearningMap, mergeLearningMaps } from '@/lib/learning/catalog';

export const GET = apiHandler(async () => {
  const user = await requireAuth();
  const [map, attempts] = await Promise.all([
    getKnowledgeMapForUser(user.id),
    prisma.quizAttempt.findMany({
      where: { user_id: user.id },
      select: { quiz_id: true, is_correct: true },
    }),
  ]);
  return Response.json(
    mergeLearningMaps(
      buildLearningMap(
        attempts.filter((a) => a.is_correct).map((a) => a.quiz_id),
        attempts.map((a) => a.quiz_id)
      ),
      map
    ),
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
});
