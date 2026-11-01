import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { TRAILS_DATA } from '@/lib/trailsData';
import { LEARNING_COURSES } from '@/lib/learning/catalog';
import { awardXPInTransaction } from '@/lib/xp';
import {
  EVALUATOR_MIN_MOTIVATION_LENGTH,
  EVALUATOR_MIN_XP,
  EVALUATOR_REVIEW_XP_REWARD,
  evaluatorCanReviewLanguage,
  getApplicationRubric,
  getEvaluatorStanding,
  hasReviewableTechnology,
} from '@/lib/evaluators/policy';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { recordSecurityAudit } from '@/lib/security-audit';
import {
  findDuelReviewers,
  notifyDuelReviewers,
  notifyEvaluatorApplication,
  pushEvaluatorNotifications,
  type EvaluatorPushTarget,
} from '@/lib/evaluators/notifications';

export const EvaluatorService = {
  /**
   * Check if a user meets the minimum requirements to become an evaluator.
   * Requirement: User must have completed at least 1 full trail (all levels and unit checkpoints) OR has >= 1000 total XP.
   */
  async checkEligibility(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quiz_attempts: {
          where: { is_correct: true },
          select: { quiz_id: true },
        },
        evaluator_profile: true,
        evaluator_applications: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return { eligible: false, reason: 'Usuário não encontrado', completedTrails: [] };
    }

    const completedQuizIds = new Set(user.quiz_attempts.map((a) => a.quiz_id));
    const completedTrails: string[] = [];

    // Check each language trail
    for (const [lang, levels] of Object.entries(TRAILS_DATA)) {
      const allQuestionsCompleted = levels.every((lvl) =>
        lvl.questions.every((q) => completedQuizIds.has(q.id))
      );
      if (allQuestionsCompleted && levels.length > 0) {
        completedTrails.push(lang);
      }
    }
    // Current learning paths also award eligibility; legacy assessment IDs remain valid.
    for (const course of LEARNING_COURSES) {
      const steps = course.lessons.flatMap((lesson) =>
        lesson.steps.filter((step) => step.type !== 'concept_explanation')
      );
      if (steps.length && steps.every((step) => completedQuizIds.has(step.id))) {
        if (!completedTrails.includes(course.language)) completedTrails.push(course.language);
      }
    }

    const hasTrail = completedTrails.length >= 1;
    const hasSufficientXp = user.total_xp >= EVALUATOR_MIN_XP;
    const eligible = hasTrail || hasSufficientXp;

    const latestApplication = user.evaluator_applications[0] || null;

    return {
      eligible,
      totalXp: user.total_xp,
      completedTrails,
      isAlreadyEvaluator: user.role === 'EVALUATOR' || user.role === 'ADMIN',
      hasPendingApplication: latestApplication?.status === 'PENDING',
      latestApplication,
      evaluatorProfile: user.evaluator_profile,
      requirements: {
        hasCompletedTrail: hasTrail,
        hasSufficientXp,
      },
    };
  },

  /**
   * Submit an application to become a code evaluator.
   */
  async applyForEvaluator(userId: string, motivation: string, techStack: string[]) {
    const eligibility = await this.checkEligibility(userId);
    if (!eligibility.eligible) {
      throw new ValidationError(
        'EVALUATOR_NOT_ELIGIBLE',
        'Você ainda não cumpre os requisitos mínimos (concluir 1 trilha completa ou possuir 1.000+ XP).'
      );
    }

    if (eligibility.isAlreadyEvaluator) {
      throw new ValidationError(
        'ALREADY_EVALUATOR',
        'Você já possui a função de Avaliador de Código.'
      );
    }

    if (eligibility.hasPendingApplication) {
      throw new ValidationError(
        'EVALUATOR_APPLICATION_PENDING',
        'Você já possui uma candidatura em análise.'
      );
    }

    const normalizedMotivation = motivation.trim();
    const normalizedTechStack = [...new Set(techStack.map((tech) => tech.trim()).filter(Boolean))];
    if (normalizedMotivation.length < EVALUATOR_MIN_MOTIVATION_LENGTH) {
      throw new ValidationError(
        'EVALUATOR_MOTIVATION_TOO_SHORT',
        `Explique sua motivação em pelo menos ${EVALUATOR_MIN_MOTIVATION_LENGTH} caracteres.`
      );
    }
    if (!hasReviewableTechnology(normalizedTechStack)) {
      throw new ValidationError(
        'EVALUATOR_TECH_NOT_SUPPORTED',
        'Selecione ao menos uma tecnologia disponível nos duelos.'
      );
    }

    const pushTargets: EvaluatorPushTarget[] = [];
    const application = await prisma.$transaction(async (tx) => {
      // Serialize submissions for this account without a schema migration. A double tap or
      // concurrent request must not create two pending applications and two admin alerts.
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
      const current = await tx.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (!current || ['ADMIN', 'EVALUATOR'].includes(current.role)) {
        throw new ValidationError(
          'ALREADY_EVALUATOR',
          'Você já possui a função de Avaliador de Código.'
        );
      }
      const pending = await tx.evaluatorApplication.findFirst({
        where: { user_id: userId, status: 'PENDING' },
        select: { id: true },
      });
      if (pending) {
        throw new ValidationError(
          'EVALUATOR_APPLICATION_PENDING',
          'Você já possui uma candidatura em análise.'
        );
      }
      const created = await tx.evaluatorApplication.create({
        data: {
          user_id: userId,
          motivation: normalizedMotivation,
          tech_stack: normalizedTechStack,
          status: 'PENDING',
        },
      });
      await notifyEvaluatorApplication(tx, created, undefined, pushTargets);
      return created;
    });
    await pushEvaluatorNotifications(pushTargets);

    logger.info('Evaluator application submitted', { userId, applicationId: application.id });
    return application;
  },

  /**
   * List all pending evaluator applications for admin review.
   */
  async listApplications(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return prisma.evaluatorApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            total_xp: true,
            streak_days: true,
            role: true,
            evaluator_profile: true,
          },
        },
      },
    });
  },

  /**
   * Admin approve or reject an evaluator application.
   */
  async reviewApplication(
    applicationId: string,
    adminId: string,
    decision: 'APPROVED' | 'REJECTED',
    notes: string
  ) {
    const application = await prisma.evaluatorApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new ValidationError('APPLICATION_NOT_FOUND', 'Candidatura não encontrada.');
    }
    if (application.status !== 'PENDING') {
      throw new ValidationError(
        'APPLICATION_ALREADY_REVIEWED',
        'Esta candidatura já foi analisada.'
      );
    }
    if (notes.trim().length < 20) {
      throw new ValidationError(
        'REVIEW_NOTES_REQUIRED',
        'Registre uma justificativa objetiva com pelo menos 20 caracteres.'
      );
    }

    if (decision === 'APPROVED') {
      const eligibility = await this.checkEligibility(application.user_id);
      const rubric = getApplicationRubric({
        eligible: eligibility.eligible,
        motivation: application.motivation,
        techStack: application.tech_stack,
      });
      if (!rubric.approved) {
        throw new ValidationError(
          'EVALUATOR_RUBRIC_NOT_MET',
          'A candidatura não atende a todos os critérios objetivos para aprovação.',
          rubric.checks
        );
      }
    }

    const pushTargets: EvaluatorPushTarget[] = [];
    const updated = await prisma.$transaction(async (tx) => {
      const claim = await tx.evaluatorApplication.updateMany({
        where: { id: applicationId, status: 'PENDING' },
        data: {
          status: decision,
          reviewed_by_id: adminId,
          reviewer_notes: notes.trim(),
          reviewed_at: new Date(),
        },
      });
      if (claim.count !== 1) {
        throw new ValidationError(
          'APPLICATION_ALREADY_REVIEWED',
          'Esta candidatura já foi analisada.'
        );
      }
      await recordSecurityAudit(tx, {
        actorId: adminId,
        action: 'EVALUATOR_APPLICATION_REVIEWED',
        resourceId: applicationId,
        metadata: { decision },
      });

      if (decision === 'APPROVED') {
        await tx.user.updateMany({
          // Evaluator governance must never silently remove an administrator role.
          where: { id: application.user_id, role: { not: 'ADMIN' } },
          data: { role: 'EVALUATOR' },
        });
        await tx.evaluatorProfile.upsert({
          where: { user_id: application.user_id },
          update: {
            tech_stack: application.tech_stack,
            status: 'ACTIVE',
            sanction_reason: null,
          },
          create: {
            user_id: application.user_id,
            reputation: 100,
            evaluations_count: 0,
            tech_stack: application.tech_stack,
            status: 'ACTIVE',
          },
        });
        const pendingDuels = await tx.duel.findMany({
          where: { status: 'REVIEW_PENDING', solutions: { some: {} } },
          select: { id: true, language: true, challenger_id: true, opponent_id: true },
        });
        for (const duel of pendingDuels) {
          await notifyDuelReviewers(
            tx,
            duel,
            [
              {
                id: application.user_id,
                role: application.user.role === 'ADMIN' ? 'ADMIN' : 'EVALUATOR',
                evaluator_profile: { tech_stack: application.tech_stack },
              },
            ],
            pushTargets
          );
        }
      }
      const decisionNotice = await tx.notification.create({
        data: {
          id: `evaluator-decision:${applicationId}`,
          userId: application.user_id,
          type: decision === 'APPROVED' ? 'EVALUATOR_APPROVED' : 'EVALUATOR_REJECTED',
          actorId: null,
          resourceId: applicationId,
          resourceType: 'EVALUATOR',
        },
        select: { id: true, userId: true },
      });
      pushTargets.push(decisionNotice);
      return tx.evaluatorApplication.findUniqueOrThrow({ where: { id: applicationId } });
    });
    await pushEvaluatorNotifications(pushTargets);

    logger.info('Evaluator application reviewed', { applicationId, decision, adminId });
    return updated;
  },

  async moderateEvaluator(
    evaluatorId: string,
    action: 'WARN' | 'SUSPEND' | 'REINSTATE' | 'REVOKE',
    notes: string,
    actorId?: string
  ) {
    if (notes.trim().length < 20) {
      throw new ValidationError(
        'MODERATION_NOTES_REQUIRED',
        'Registre o motivo da medida com pelo menos 20 caracteres.'
      );
    }
    const profile = await prisma.evaluatorProfile.findUnique({
      where: { user_id: evaluatorId },
    });
    if (!profile) {
      throw new ValidationError('EVALUATOR_NOT_FOUND', 'Perfil de avaliador não encontrado.');
    }
    if (profile.status === 'REVOKED' && action !== 'REINSTATE') {
      throw new ValidationError(
        'EVALUATOR_ALREADY_REVOKED',
        'Este perfil foi revogado; somente a reintegração pode alterar seu estado.'
      );
    }
    if (profile.status === 'SUSPENDED' && action === 'WARN') {
      throw new ValidationError(
        'EVALUATOR_SUSPENDED',
        'Reintegre o perfil antes de aplicar uma nova advertência.'
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      await recordSecurityAudit(tx, {
        actorId,
        action: 'EVALUATOR_MODERATED',
        resourceId: evaluatorId,
        metadata: { action, previous_status: profile.status },
      });
      if (action === 'REVOKE') {
        await tx.user.updateMany({
          where: { id: evaluatorId, role: { not: 'ADMIN' } },
          data: { role: 'USER' },
        });
        return tx.evaluatorProfile.update({
          where: { user_id: evaluatorId },
          data: { status: 'REVOKED', sanction_reason: notes.trim() },
        });
      }
      if (action === 'SUSPEND') {
        return tx.evaluatorProfile.update({
          where: { user_id: evaluatorId },
          data: { status: 'SUSPENDED', sanction_reason: notes.trim() },
        });
      }
      if (action === 'REINSTATE') {
        await tx.user.updateMany({
          where: { id: evaluatorId, role: { not: 'ADMIN' } },
          data: { role: 'EVALUATOR' },
        });
        return tx.evaluatorProfile.update({
          where: { user_id: evaluatorId },
          data: {
            reputation: Math.max(profile.reputation, 80),
            status: 'ACTIVE',
            sanction_reason: null,
          },
        });
      }

      const reputation = Math.max(0, profile.reputation - 10);
      return tx.evaluatorProfile.update({
        where: { user_id: evaluatorId },
        data: {
          reputation,
          status: getEvaluatorStanding(reputation),
          sanction_reason: notes.trim(),
        },
      });
    });
    logger.info('Evaluator profile moderated', { evaluatorId, action });
    return updated;
  },

  /**
   * Submit a code evaluation for a duel solution.
   */
  async submitDuelEvaluation(params: {
    duelId: string;
    evaluatorId: string;
    scorePlayer1: number;
    scorePlayer2: number;
    winnerId: string;
    humanFeedback: string;
    strengths: string[];
    improvements: string[];
  }) {
    const {
      duelId,
      evaluatorId,
      scorePlayer1,
      scorePlayer2,
      winnerId,
      humanFeedback,
      strengths,
      improvements,
    } = params;

    const duel = await prisma.duel.findUnique({
      where: { id: duelId },
      include: { challenger: true, opponent: true },
    });

    if (!duel) throw new NotFoundError('DUEL_NOT_FOUND', 'Duelo não encontrado.');
    if (duel.status !== 'REVIEW_PENDING') {
      throw new ValidationError(
        'DUEL_NOT_PENDING',
        'Este duelo não está aguardando desempate humano.'
      );
    }
    if (duel.challenger_id === evaluatorId || duel.opponent_id === evaluatorId) {
      throw new ForbiddenError(
        'DUEL_SELF_REVIEW',
        'Participantes não podem avaliar o próprio duelo.'
      );
    }
    if (winnerId !== duel.challenger_id && winnerId !== duel.opponent_id) {
      throw new ValidationError(
        'DUEL_INVALID_WINNER',
        'O vencedor deve ser um dos participantes do duelo.'
      );
    }
    if (
      [scorePlayer1, scorePlayer2].some(
        (score) => !Number.isInteger(score) || score < 0 || score > 1000
      )
    ) {
      throw new ValidationError(
        'EVALUATION_INVALID_SCORE',
        'As notas devem estar entre 0 e 1.000.'
      );
    }
    if (humanFeedback.trim().length < 5) {
      throw new ValidationError(
        'EVALUATION_FEEDBACK_REQUIRED',
        'Adicione um feedback explicativo.'
      );
    }

    const evaluator = await prisma.user.findUnique({
      where: { id: evaluatorId },
      include: { evaluator_profile: true },
    });
    if (!evaluator || (evaluator.role !== 'ADMIN' && evaluator.role !== 'EVALUATOR')) {
      throw new ForbiddenError('EVALUATOR_REQUIRED', 'Função de avaliador necessária.');
    }
    if (evaluator.role !== 'ADMIN') {
      const profile = evaluator.evaluator_profile;
      if (!profile || !['ACTIVE', 'PROBATION'].includes(profile.status)) {
        throw new ForbiddenError(
          'EVALUATOR_INACTIVE',
          'Seu perfil de avaliador está suspenso ou revogado.'
        );
      }
      if (!evaluatorCanReviewLanguage(profile.tech_stack, duel.language)) {
        throw new ForbiddenError(
          'EVALUATOR_SPECIALTY_MISMATCH',
          'Este duelo não pertence às tecnologias aprovadas no seu perfil.'
        );
      }
    }

    const pushTargets: EvaluatorPushTarget[] = [];
    const evaluation = await prisma.$transaction(async (tx) => {
      const claim = await tx.duel.updateMany({
        where: { id: duelId, status: 'REVIEW_PENDING' },
        data: {
          status: 'CLOSED',
          winner_id: winnerId,
          finished_at: new Date(),
          closed_reason: 'human_tiebreak',
          xp_awarded_at: new Date(),
        },
      });
      if (claim.count !== 1) {
        throw new ValidationError(
          'DUEL_ALREADY_EVALUATED',
          'Este duelo já foi avaliado por outra pessoa.'
        );
      }

      const rewards = [{ userId: winnerId, amount: 50 }];
      if (evaluator.evaluator_profile) {
        rewards.push({ userId: evaluatorId, amount: EVALUATOR_REVIEW_XP_REWARD });
      }
      rewards.sort((left, right) => left.userId.localeCompare(right.userId));
      for (const reward of rewards) {
        await awardXPInTransaction(tx, reward.userId, duel.language, reward.amount);
      }
      if (evaluator.evaluator_profile) {
        await tx.evaluatorProfile.update({
          where: { user_id: evaluatorId },
          data: { evaluations_count: { increment: 1 } },
        });
      }

      const created = await tx.duelEvaluation.create({
        data: {
          duel_id: duelId,
          evaluator_id: evaluatorId,
          type: 'HUMAN_EVALUATED',
          score_player1: scorePlayer1,
          score_player2: scorePlayer2,
          system_analysis: { reason: 'human_tiebreak' },
          human_feedback: humanFeedback.trim(),
          strengths,
          improvements,
        },
        include: {
          evaluator: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
      });
      const notices = await tx.notification.createManyAndReturn({
        data: [duel.challenger_id, duel.opponent_id]
          .filter((id): id is string => Boolean(id))
          .map((id) => ({
            id: `duel-evaluated:${duelId}:${id}`,
            userId: id,
            type: 'EVALUATION_COMPLETED' as const,
            actorId: null,
            resourceId: duelId,
            resourceType: 'DUEL',
          })),
        skipDuplicates: true,
        select: { id: true, userId: true },
      });
      pushTargets.push(...notices);
      return created;
    });
    await pushEvaluatorNotifications(pushTargets);

    return evaluation;
  },

  /** Repair earlier undelivered pending work. Deterministic notification IDs make retries safe. */
  async recoverPendingNotifications() {
    const pushTargets: EvaluatorPushTarget[] = [];
    const result = await prisma.$transaction(
      async (tx) => {
        const applications = await tx.evaluatorApplication.findMany({
          where: { status: 'PENDING' },
          select: { id: true },
        });
        const duels = await tx.duel.findMany({
          where: { status: 'REVIEW_PENDING', solutions: { some: {} } },
          select: { id: true, language: true, challenger_id: true, opponent_id: true },
        });
        const reviewers = await findDuelReviewers(tx);
        const admins = reviewers.filter((reviewer) => reviewer.role === 'ADMIN');
        let applicationNotifications = 0;
        let reviewNotifications = 0;
        for (const application of applications) {
          applicationNotifications += await notifyEvaluatorApplication(
            tx,
            application,
            admins,
            pushTargets
          );
        }
        for (const duel of duels) {
          reviewNotifications += await notifyDuelReviewers(tx, duel, reviewers, pushTargets);
        }
        return { applicationNotifications, reviewNotifications };
      },
      { timeout: 30000 }
    );
    await pushEvaluatorNotifications(pushTargets);
    return result;
  },
};
