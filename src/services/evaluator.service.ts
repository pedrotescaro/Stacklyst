import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NotificationService } from './notification.service';
import { TRAILS_DATA } from '@/lib/trailsData';
import { awardXPInTransaction } from '@/lib/xp';

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
    const hasSufficientXp = user.total_xp >= 1000;
    const eligible = hasTrail || hasSufficientXp;

    const latestApplication = user.evaluator_applications[0] || null;

    return {
      eligible,
      totalXp: user.total_xp,
      completedTrails,
      isAlreadyEvaluator: user.role === 'EVALUATOR' || user.role === 'ADMIN',
      hasPendingApplication: latestApplication?.status === 'PENDING',
      latestApplication,
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
      throw new Error(
        'Você ainda não cumpre os requisitos mínimos (concluir 1 trilha completa ou possuir 1.000+ XP).'
      );
    }

    if (eligibility.isAlreadyEvaluator) {
      throw new Error('Você já possui a função de Avaliador de Código.');
    }

    if (eligibility.hasPendingApplication) {
      throw new Error('Você já possui uma candidatura em análise.');
    }

    const application = await prisma.evaluatorApplication.create({
      data: {
        user_id: userId,
        motivation,
        tech_stack: techStack,
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
    notes?: string
  ) {
    const application = await prisma.evaluatorApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new Error('Candidatura não encontrada.');
    }

    const updated = await prisma.evaluatorApplication.update({
      where: { id: applicationId },
      data: {
        status: decision,
        reviewed_by_id: adminId,
        reviewer_notes: notes,
        reviewed_at: new Date(),
      },
    });

    if (decision === 'APPROVED') {
      // Update user role to EVALUATOR and create evaluator profile
      await prisma.user.update({
        where: { id: application.user_id },
        data: { role: 'EVALUATOR' },
      });

      await prisma.evaluatorProfile.upsert({
        where: { user_id: application.user_id },
        update: {},
        create: {
          user_id: application.user_id,
          reputation: 100,
          evaluations_count: 0,
        },
      });

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

      await awardXPInTransaction(tx, winnerId, duel.language, 50);

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

    // Increment evaluations count for the evaluator
    await prisma.evaluatorProfile.updateMany({
      where: { user_id: evaluatorId },
      data: { evaluations_count: { increment: 1 } },
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
