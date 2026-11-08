import 'server-only';
import { prisma } from '@/lib/prisma';

export async function hasRecruitmentExerciseAccess(userId: string, exerciseId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: {
      user_id: userId,
      status: { notIn: ['REJECTED', 'OFFER'] },
      stage: { type: 'DESAFIO_TECNICO', challenge_id: exerciseId },
      job: { status: 'OPEN', OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }] },
    },
    select: { id: true, stage_id: true },
  });
  if (!applications.length) return false;
  const states = await prisma.mobileState.findMany({
    where: {
      user_id: userId,
      key: { in: applications.map((a) => `recruitment:${a.id}:${a.stage_id}`) },
    },
    select: { value: true },
  });
  return states.some(
    ({ value }) =>
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value.kind === 'exercise' &&
      value.exerciseId === exerciseId &&
      typeof value.startedAt === 'string'
  );
}
