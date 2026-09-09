import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Language } from '@prisma/client';
import { getRandomDuelProblem } from '@/lib/duel-problems';
import { NotificationService } from './notification.service';
import { getXpBand } from '@/lib/learning/rewards';
import { serializePublicDuelProblem } from '@/lib/duels/problems';
import { DUEL_REQUEST_TIMEOUT_SECONDS, DUEL_TIME_LIMIT_SECONDS } from '@/lib/duels/constants';
import { expireDuelInvitations } from '@/lib/duels/invitations';
import { getDuelCooldownMessage } from '@/lib/duels/participation-policy';
import { ValidationError } from '@/lib/errors';

export { DUEL_REQUEST_TIMEOUT_SECONDS } from '@/lib/duels/constants';

export function getUserRankTier(totalXp: number): {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  level: number;
  label: string;
} {
  const { tier, level, label } = getXpBand(totalXp);
  return { tier, level, label };
}

export const DuelService = {
  /**
   * Find compatible opponent for matchmaking with progressive tier expansion.
   */
  async findMatchmakingOpponent(userId: string, _language: Language = 'TS') {
    const challenger = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!challenger) {
      throw new ValidationError('DUEL_USER_NOT_FOUND', 'Usuário não encontrado.');
    }

    const cooldownMessage = getDuelCooldownMessage(challenger.duel_cooldown_until);
    if (cooldownMessage) throw new ValidationError('DUEL_COOLDOWN', cooldownMessage);

    const challengerRank = getUserRankTier(challenger.total_xp);

    // 1. Try finding an opponent in the EXACT same tier
    const exactMinXp =
      challengerRank.tier === 'BRONZE'
        ? 0
        : challengerRank.tier === 'SILVER'
          ? 500
          : challengerRank.tier === 'GOLD'
            ? 1200
            : challengerRank.tier === 'PLATINUM'
              ? 2500
              : 5000;
    const exactMaxXp =
      challengerRank.tier === 'BRONZE'
        ? 499
        : challengerRank.tier === 'SILVER'
          ? 1199
          : challengerRank.tier === 'GOLD'
            ? 2499
            : challengerRank.tier === 'PLATINUM'
              ? 4999
              : 999999;

    let candidate = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        total_xp: { gte: exactMinXp, lte: exactMaxXp },
        last_active_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { last_active_at: 'desc' },
    });

    // 2. If no exact opponent, expand search to +/- 1 tier (within 1000 XP distance)
    if (!candidate) {
      candidate = await prisma.user.findFirst({
        where: {
          id: { not: userId },
          total_xp: {
            gte: Math.max(0, challenger.total_xp - 1000),
            lte: challenger.total_xp + 1000,
          },
        },
        orderBy: { last_active_at: 'desc' },
      });
    }

    // 3. Fallback to any active user
    if (!candidate) {
      candidate = await prisma.user.findFirst({
        where: { id: { not: userId } },
        orderBy: { total_xp: 'desc' },
      });
    }

    return candidate;
  },

  /**
   * Create a 72-hour direct duel request to a specific player.
   */
  async createDuelRequest(
    senderId: string,
    receiverId: string,
    language: Language = 'TS',
    publishOnExpiry = false
  ) {
    if (senderId === receiverId) {
      throw new ValidationError('SELF_DUEL', 'Você não pode desafiar a si mesmo.');
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } }),
    ]);
    if (!sender || !receiver) {
      throw new ValidationError('DUEL_USER_NOT_FOUND', 'Perfil desafiado não encontrado.');
    }
    const cooldownMessage = getDuelCooldownMessage(sender.duel_cooldown_until);
    if (cooldownMessage) throw new ValidationError('DUEL_COOLDOWN', cooldownMessage);

    await expireDuelInvitations(new Date(), { receiverId });
    const expiresAt = new Date(Date.now() + DUEL_REQUEST_TIMEOUT_SECONDS * 1000);
    const problem = getRandomDuelProblem();
    const duelRequest = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`duel-request:${senderId}:${receiverId}`}))`;
      const duplicate = await tx.duelRequest.findFirst({
        where: { sender_id: senderId, receiver_id: receiverId, status: 'PENDING' },
        select: { id: true },
      });
      if (duplicate) {
        throw new ValidationError(
          'DUPLICATE_DUEL_REQUEST',
          'Já existe um convite pendente para este perfil.'
        );
      }

      return tx.duelRequest.create({
        data: {
          sender_id: senderId,
          receiver_id: receiverId,
          language,
          status: 'PENDING',
          publish_on_expiry: publishOnExpiry,
          problem_id: problem.id,
          problem_title: problem.title,
          problem_body: serializePublicDuelProblem(problem),
          expires_at: expiresAt,
        },
        include: {
          sender: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
          receiver: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
        },
      });
    });

    try {
      await NotificationService.create({
        userId: receiverId,
        type: 'DUEL_REQUEST',
        actorId: senderId,
        resourceId: duelRequest.id,
        resourceType: 'DUEL_REQUEST',
      });
    } catch (err) {
      logger.error('Failed to notify duel request', { error: String(err) });
    }

    return duelRequest;
  },

  /**
   * Respond to a duel request (ACCEPT or REJECT).
   */
  async respondDuelRequest(requestId: string, receiverId: string, action: 'ACCEPT' | 'REJECT') {
    const request = await prisma.duelRequest.findUnique({
      where: { id: requestId },
      include: { sender: true, receiver: true },
    });

    if (!request || request.receiver_id !== receiverId) {
      throw new ValidationError('DUEL_REQUEST_NOT_FOUND', 'Convite de duelo não encontrado.');
    }

    if (request.status !== 'PENDING') {
      throw new ValidationError(
        'DUEL_REQUEST_ALREADY_HANDLED',
        'Este convite já foi processado ou expirou.'
      );
    }

    if (request.expires_at <= new Date()) {
      await expireDuelInvitations(new Date(), { requestId });
      throw new ValidationError(
        'DUEL_REQUEST_EXPIRED',
        'O prazo de 72 horas para aceitar este duelo expirou.'
      );
    }

    if (action === 'REJECT') {
      const claim = await prisma.duelRequest.updateMany({
        where: { id: requestId, receiver_id: receiverId, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });
      if (claim.count !== 1) {
        throw new ValidationError(
          'DUEL_REQUEST_ALREADY_HANDLED',
          'Este convite já foi processado.'
        );
      }

      try {
        await NotificationService.create({
          userId: request.sender_id,
          type: 'DUEL_REJECTED',
          actorId: receiverId,
          resourceId: requestId,
          resourceType: 'DUEL_REQUEST',
        });
      } catch (err) {
        logger.error('Failed to notify duel rejection', { error: String(err) });
      }

      return {
        status: 'REJECTED',
        xpPenalty: 0,
        cooldownApplied: false,
      };
    }

    const fallbackProblem = getRandomDuelProblem();
    const duel = await prisma.$transaction(async (tx) => {
      const claim = await tx.duelRequest.updateMany({
        where: { id: requestId, receiver_id: receiverId, status: 'PENDING' },
        data: { status: 'ACCEPTED' },
      });
      if (claim.count !== 1) {
        throw new ValidationError(
          'DUEL_REQUEST_ALREADY_HANDLED',
          'Este convite já foi processado.'
        );
      }

      return tx.duel.create({
        data: {
          challenger_id: request.sender_id,
          opponent_id: receiverId,
          problem_title: request.problem_title ?? fallbackProblem.title,
          problem_body: request.problem_body ?? serializePublicDuelProblem(fallbackProblem),
          problem_id: request.problem_id ?? fallbackProblem.id,
          language: request.language,
          status: 'ACTIVE',
          time_limit_seconds: DUEL_TIME_LIMIT_SECONDS,
          started_at: new Date(),
        },
        include: {
          challenger: { select: { id: true, username: true, avatar_url: true } },
          opponent: { select: { id: true, username: true, avatar_url: true } },
        },
      });
    });

    try {
      await NotificationService.create({
        userId: request.sender_id,
        type: 'DUEL_ACCEPTED',
        actorId: receiverId,
        resourceId: duel.id,
        resourceType: 'DUEL',
      });
    } catch (err) {
      logger.error('Failed to notify duel acceptance', { error: String(err) });
    }

    return {
      status: 'ACCEPTED',
      duel,
    };
  },
};
