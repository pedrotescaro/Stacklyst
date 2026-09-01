import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Language } from '@prisma/client';
import { getRandomDuelProblem } from '@/lib/duel-problems';
import { NotificationService } from './notification.service';

export const MAX_DUEL_REJECTIONS = 3;
export const DUEL_COOLDOWN_MINUTES = 5;
export const DUEL_REQUEST_TIMEOUT_SECONDS = 30;

export function getUserRankTier(totalXp: number): {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  level: number;
  label: string;
} {
  if (totalXp >= 5000) return { tier: 'DIAMOND', level: 5, label: 'Diamante' };
  if (totalXp >= 2500) return { tier: 'PLATINUM', level: 4, label: 'Platina' };
  if (totalXp >= 1200) return { tier: 'GOLD', level: 3, label: 'Ouro' };
  if (totalXp >= 500) return { tier: 'SILVER', level: 2, label: 'Prata' };
  return { tier: 'BRONZE', level: 1, label: 'Bronze' };
}

export const DuelService = {
  /**
   * Find compatible opponent for matchmaking with progressive tier expansion.
   */
  async findMatchmakingOpponent(userId: string, _language: Language = 'TS') {
    const challenger = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!challenger) throw new Error('Usuário não encontrado.');

    // Check if challenger is on cooldown
    if (challenger.duel_cooldown_until && challenger.duel_cooldown_until > new Date()) {
      const remainingMinutes = Math.ceil(
        (challenger.duel_cooldown_until.getTime() - Date.now()) / 60000
      );
      throw new Error(
        `Você está em cooldown temporário por rejeições consecutivas. Aguarde ${remainingMinutes} minuto(s).`
      );
    }

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
   * Create a 30-second direct duel request to a specific player.
   */
  async createDuelRequest(senderId: string, receiverId: string, language: Language = 'TS') {
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    if (sender?.duel_cooldown_until && sender.duel_cooldown_until > new Date()) {
      throw new Error('Você está em cooldown temporário.');
    }

    const expiresAt = new Date(Date.now() + DUEL_REQUEST_TIMEOUT_SECONDS * 1000);

    const duelRequest = await prisma.duelRequest.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        language,
        status: 'PENDING',
        expires_at: expiresAt,
      },
      include: {
        sender: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
        receiver: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
      },
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
      throw new Error('Convite de duelo não encontrado.');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Este convite já foi processado ou expirou.');
    }

    if (request.expires_at < new Date()) {
      await prisma.duelRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' },
      });
      throw new Error('O tempo limite de 30 segundos para aceitar este duelo expirou.');
    }

    if (action === 'REJECT') {
      // Increment consecutive rejections
      const updatedUser = await prisma.user.update({
        where: { id: receiverId },
        data: { consecutive_rejections: { increment: 1 } },
      });

      let cooldownApplied = false;
      if (updatedUser.consecutive_rejections >= MAX_DUEL_REJECTIONS) {
        // Apply cooldown
        await prisma.user.update({
          where: { id: receiverId },
          data: {
            consecutive_rejections: 0,
            duel_cooldown_until: new Date(Date.now() + DUEL_COOLDOWN_MINUTES * 60 * 1000),
          },
        });
        cooldownApplied = true;
      }

      await prisma.duelRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });

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
        consecutiveRejections: updatedUser.consecutive_rejections,
        cooldownApplied,
      };
    }

    // ACCEPT: Reset consecutive rejections and create active Duel
    await prisma.user.update({
      where: { id: receiverId },
      data: { consecutive_rejections: 0 },
    });

    await prisma.duelRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    const problem = getRandomDuelProblem();
    const duel = await prisma.duel.create({
      data: {
        challenger_id: request.sender_id,
        opponent_id: receiverId,
        problem_title: problem.title,
        problem_body: problem.description,
        problem_id: problem.id,
        language: request.language,
        status: 'ACTIVE',
        time_limit_seconds: 900, // 15 minutos
        started_at: new Date(),
      },
      include: {
        challenger: { select: { id: true, username: true, avatar_url: true } },
        opponent: { select: { id: true, username: true, avatar_url: true } },
      },
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
