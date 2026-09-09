import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NotificationService } from './notification.service';
import { TRAILS_DATA } from '@/lib/trailsData';
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
import { ForbiddenError, ValidationError } from '@/lib/errors';

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

    const application = await prisma.evaluatorApplication.create({
      data: {
        user_id: userId,
        motivation: normalizedMotivation,
        tech_stack: normalizedTechStack,
        status: 'PENDING',
      },
    });

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

      if (decision === 'APPROVED') {
        await tx.user.update({
          where: { id: application.user_id },
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
      }
      return tx.evaluatorApplication.findUniqueOrThrow({ where: { id: applicationId } });
    });

    if (decision === 'APPROVED') {
      try {
        await NotificationService.create({
          userId: application.user_id,
          type: 'EVALUATOR_APPROVED',
          actorId: adminId,
          resourceId: applicationId,
          resourceType: 'EVALUATOR',
        });
      } catch (err) {
        logger.error('Failed to notify evaluator approval', { error: String(err) });
      }
    } else {
      try {
        await NotificationService.create({
          userId: application.user_id,
          type: 'EVALUATOR_REJECTED',
          actorId: adminId,
          resourceId: applicationId,
          resourceType: 'EVALUATOR',
        });
      } catch (err) {
        logger.error('Failed to notify evaluator rejection', { error: String(err) });
      }
    }

    logger.info('Evaluator application reviewed', { applicationId, decision, adminId });
    return updated;
  },

  async moderateEvaluator(
    evaluatorId: string,
    action: 'WARN' | 'SUSPEND' | 'REINSTATE' | 'REVOKE',
    notes: string
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
      if (action === 'REVOKE') {
        await tx.user.update({ where: { id: evaluatorId }, data: { role: 'USER' } });
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
        await tx.user.update({ where: { id: evaluatorId }, data: { role: 'EVALUATOR' } });
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

    if (!duel) throw new Error('Duelo não encontrado.');
    if (duel.status !== 'REVIEW_PENDING') {
      throw new Error('Este duelo não está aguardando desempate humano.');
    }
    if (duel.challenger_id === evaluatorId || duel.opponent_id === evaluatorId) {
      throw new Error('Participantes não podem avaliar o próprio duelo.');
    }
    if (winnerId !== duel.challenger_id && winnerId !== duel.opponent_id) {
      throw new Error('O vencedor deve ser um dos participantes do duelo.');
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
      if (claim.count !== 1) throw new Error('Este duelo já foi avaliado por outra pessoa.');

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

      return tx.duelEvaluation.create({
        data: {
          duel_id: duelId,
          evaluator_id: evaluatorId,
          type: 'HUMAN_EVALUATED',
          score_player1: scorePlayer1,
          score_player2: scorePlayer2,
          system_analysis: { reason: 'human_tiebreak' },
          human_feedback: humanFeedback,
          strengths,
          improvements,
        },
        include: {
          evaluator: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
      });
    });

    // Notify duel participants
    try {
      await NotificationService.create({
        userId: duel.challenger_id,
        type: 'EVALUATION_COMPLETED',
        actorId: evaluatorId,
        resourceId: duelId,
        resourceType: 'DUEL',
      });

      if (duel.opponent_id) {
        await NotificationService.create({
          userId: duel.opponent_id,
          type: 'EVALUATION_COMPLETED',
          actorId: evaluatorId,
          resourceId: duelId,
          resourceType: 'DUEL',
        });
      }
    } catch (err) {
      logger.error('Failed to notify evaluation completion', { error: String(err) });
    }

    return evaluation;
  },
};
