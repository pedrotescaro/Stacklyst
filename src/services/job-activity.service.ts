import 'server-only';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { requireCompanyAccess } from '@/lib/mobile/company-access';
import { isJobAcceptingApplications } from '@/lib/job-availability';
import {
  getTrustedDuelProblem,
  getTrustedDuelProblemIds,
  serializePublicDuelProblem,
} from '@/lib/duels/problems';
import { DUEL_TIME_LIMIT_SECONDS, PUBLIC_DUEL_MATCH_WINDOW_SECONDS } from '@/lib/duels/constants';
import { getDuelCooldownMessage } from '@/lib/duels/participation-policy';
import { recordSecurityAudit } from '@/lib/security-audit';
import { logger } from '@/lib/logger';

// Reserved server state: the mobile state API only accepts preferences and draft:* keys.
const activitySchema = z.object({
  kind: z.enum(['exercise', 'duel']),
  assignment: z.string(),
  startedAt: z.string().datetime(),
  exerciseId: z.string().optional(),
  duelId: z.string().optional(),
  completed: z.boolean().default(false),
  score: z.number().min(0).max(100).nullable().default(null),
});
const keyFor = (applicationId: string, stageId: string) =>
  `recruitment:${applicationId}:${stageId}`;
const technicalTypes = ['DESAFIO_TECNICO', 'DUELO_TECNICO'];
export const isTechnicalStage = (type: string) => technicalTypes.includes(type);

function duelAssignment(value: string) {
  const [language, ...parts] = value.split(':');
  const problemId = parts.join(':');
  const problem = getTrustedDuelProblemIds().includes(problemId)
    ? getTrustedDuelProblem(problemId)
    : null;
  if (!['TS', 'JS', 'PYTHON'].includes(language) || !problem)
    throw new AppError('INVALID_ACTIVITY', 'Escolha um duelo do catálogo.', 400);
  return { language: language as 'TS' | 'JS' | 'PYTHON', problem };
}

export async function getRecruitmentActivities() {
  const exercises = await prisma.exercise.findMany({
    where: { is_published: true, test_cases: { some: {} } },
    select: { id: true, title: true, language: true },
    orderBy: { title: 'asc' },
  });
  return {
    exercises: exercises.map((e) => ({ id: e.id, title: `${e.title} · ${e.language}` })),
    duels: getTrustedDuelProblemIds().flatMap((id) =>
      ['TS', 'JS', 'PYTHON'].map((language) => ({
        id: `${language}:${id}`,
        title: `${getTrustedDuelProblem(id)!.title} · ${language}`,
      }))
    ),
  };
}

export async function assignRecruitmentActivity(
  jobId: string,
  stageId: string,
  assignment: string,
  user: { id: string; role: string }
) {
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { company_id: true } });
  if (!job) throw new AppError('JOB_NOT_FOUND', 'Vaga não encontrada.', 404);
  await requireCompanyAccess(job.company_id, user);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`recruitment-stage:${stageId}`}))`;
    const stage = await tx.jobRecruitmentStage.findFirst({ where: { id: stageId, job_id: jobId } });
    if (!stage || !isTechnicalStage(stage.type))
      throw new AppError('INVALID_STAGE', 'Etapa técnica não encontrada.', 404);
    if (stage.challenge_id === assignment) return stage;
    if (
      await tx.mobileState.count({
        where: { key: { startsWith: 'recruitment:', endsWith: `:${stageId}` } },
      })
    )
      throw new AppError(
        'ACTIVITY_STARTED',
        'A atividade já foi iniciada por candidatos e não pode ser trocada.',
        409
      );
    if (stage.type === 'DUELO_TECNICO') duelAssignment(assignment);
    else if (
      !(await tx.exercise.findFirst({
        where: { id: assignment, is_published: true, test_cases: { some: {} } },
        select: { id: true },
      }))
    )
      throw new AppError('INVALID_ACTIVITY', 'Escolha um exercício publicado com testes.', 400);
    const updated = await tx.jobRecruitmentStage.update({
      where: { id: stageId },
      data: { challenge_id: assignment },
    });
    await recordSecurityAudit(tx, {
      actorId: user.id,
      action: 'JOB_ACTIVITY_ASSIGNED',
      resourceId: jobId,
      metadata: { stage_id: stageId, assignment },
    });
    return updated;
  });
}

export async function recruitmentActivity(
  userId: string,
  jobId: string,
  action: 'read' | 'start' | 'refresh' = 'read'
) {
  return prisma.$transaction(async (tx) => {
    // Same lock as configuration changes; reload after taking it to avoid stale assignments.
    const initial = await tx.jobApplication.findUnique({
      where: { job_id_user_id: { job_id: jobId, user_id: userId } },
      select: { id: true, stage_id: true },
    });
    if (!initial?.stage_id)
      throw new AppError('NO_ACTIVITY', 'Nenhuma etapa técnica atribuída.', 404);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`recruitment-stage:${initial.stage_id}`}))`;
    await tx.$queryRaw`SELECT id FROM "JobApplication" WHERE id = ${initial.id} FOR UPDATE`;
    const application = await tx.jobApplication.findUnique({
      where: { job_id_user_id: { job_id: jobId, user_id: userId } },
      include: { stage: true, job: true },
    });
    const stage = application?.stage;
    if (!application || !stage || stage.id !== initial.stage_id || !isTechnicalStage(stage.type))
      throw new AppError('NO_ACTIVITY', 'Nenhuma etapa técnica atribuída.', 409);
    const assignment = stage.challenge_id;
    if (!assignment)
      return {
        configured: false,
        completed: false,
        score: null,
        href: null,
        message: 'A empresa ainda não definiu a atividade desta etapa.',
      };
    const key = keyFor(application.id, stage.id);
    const where = { user_id_key: { user_id: userId, key } };
    const saved = await tx.mobileState.findUnique({ where });
    let activity = saved ? activitySchema.parse(saved.value) : null;
    let restartable = false;
    if (activity?.duelId && !activity.completed) {
      const duel = await tx.duel.findUnique({
        where: { id: activity.duelId },
        select: { status: true, match_deadline: true, closed_reason: true },
      });
      restartable =
        !duel ||
        duel.status === 'EXPIRED' ||
        (duel.status === 'PENDING' && !!duel.match_deadline && duel.match_deadline <= new Date());
    }
    if (action === 'start' && (!activity || restartable)) {
      if (
        ['REJECTED', 'OFFER'].includes(application.status) ||
        !isJobAcceptingApplications(application.job)
      )
        throw new AppError('ACTIVITY_CLOSED', 'Esta candidatura não aceita novas atividades.', 409);
      const startedAt = new Date().toISOString();
      if (stage.type === 'DESAFIO_TECNICO') {
        const exercise = await tx.exercise.findFirst({
          where: { id: assignment, is_published: true, test_cases: { some: {} } },
          select: { id: true },
        });
        if (!exercise)
          throw new AppError(
            'ACTIVITY_UNAVAILABLE',
            'O exercício não está disponível. Contate a empresa.',
            409
          );
        activity = {
          kind: 'exercise',
          assignment,
          exerciseId: exercise.id,
          startedAt,
          completed: false,
          score: null,
        };
      } else {
        const { language, problem } = duelAssignment(assignment);
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { duel_cooldown_until: true },
        });
        const cooldown = getDuelCooldownMessage(user.duel_cooldown_until);
        if (cooldown) throw new AppError('DUEL_COOLDOWN', cooldown, 429);
        const active = await tx.duel.findFirst({
          where: { status: 'ACTIVE', OR: [{ challenger_id: userId }, { opponent_id: userId }] },
          select: { id: true },
        });
        if (active)
          throw new AppError('DUEL_ACTIVE', 'Conclua seu duelo atual antes de iniciar outro.', 409);
        if (activity?.duelId)
          await tx.duel.updateMany({
            where: { id: activity.duelId, status: 'PENDING', opponent_id: null },
            data: { status: 'EXPIRED' },
          });
        const duel = await tx.duel.create({
          data: {
            challenger_id: userId,
            language,
            problem_id: problem.id,
            problem_title: problem.title,
            problem_body: serializePublicDuelProblem(problem),
            time_limit_seconds: DUEL_TIME_LIMIT_SECONDS,
            match_deadline: new Date(Date.now() + PUBLIC_DUEL_MATCH_WINDOW_SECONDS * 1000),
          },
        });
        activity = {
          kind: 'duel',
          assignment,
          duelId: duel.id,
          startedAt,
          completed: false,
          score: null,
        };
      }
      await tx.mobileState.upsert({
        where,
        create: { user_id: userId, key, value: activity },
        update: { value: activity, version: { increment: 1 } },
      });
      await recordSecurityAudit(tx, {
        actorId: userId,
        action: 'JOB_ACTIVITY_STARTED',
        resourceId: application.id,
        metadata: { stage_id: stage.id, assignment },
      });
      restartable = false;
    }
    if (activity && action !== 'read' && !activity.completed) {
      let score: number | null = null;
      if (activity.kind === 'exercise' && activity.exerciseId) {
        const submission = await tx.exerciseSubmission.findFirst({
          where: {
            user_id: userId,
            exercise_id: activity.exerciseId,
            created_at: { gte: new Date(activity.startedAt) },
            status: 'PASSED',
          },
          orderBy: { created_at: 'desc' },
          select: { id: true },
        });
        if (submission) score = 100;
      } else if (activity.duelId) {
        const duel = await tx.duel.findFirst({
          where: {
            id: activity.duelId,
            status: 'CLOSED',
            closed_reason: { not: 'judge_unavailable' },
            OR: [{ challenger_id: userId }, { opponent_id: userId }],
          },
          select: { solutions: { where: { user_id: userId }, select: { score: true } } },
        });
        if (duel?.solutions[0])
          score = Math.min(100, Math.max(0, Math.round(duel.solutions[0].score / 10)));
      }
      if (score !== null) {
        activity = { ...activity, completed: true, score };
        await tx.mobileState.update({
          where,
          data: { value: activity, version: { increment: 1 } },
        });
        await tx.jobApplication.updateMany({
          where: { id: application.id, stage_id: stage.id },
          data: { technical_score: score },
        });
        await recordSecurityAudit(tx, {
          actorId: userId,
          action: 'JOB_ACTIVITY_COMPLETED',
          resourceId: application.id,
          metadata: { stage_id: stage.id, score },
        });
      }
    }
    return {
      configured: true,
      kind: stage.type === 'DUELO_TECNICO' ? 'duel' : 'exercise',
      started: !!activity,
      completed: activity?.completed ?? false,
      score: activity?.score ?? null,
      restartable,
      href: activity
        ? activity.duelId
          ? `/duels/${activity.duelId}`
          : `/lesson/${activity.exerciseId}?mode=workspace&recruitmentJob=${encodeURIComponent(jobId)}`
        : null,
      message: restartable ? 'O duelo expirou sem oponente. Você pode buscar outro.' : null,
    };
  });
}

export async function syncRecruitmentResultsSafely(userId: string) {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { user_id: userId, stage: { type: { in: ['DESAFIO_TECNICO', 'DUELO_TECNICO'] } } },
      select: { job_id: true },
    });
    for (const application of applications)
      await recruitmentActivity(userId, application.job_id, 'refresh');
  } catch (error) {
    logger.error('Failed to sync recruitment activity results', { error, userId });
  }
}
