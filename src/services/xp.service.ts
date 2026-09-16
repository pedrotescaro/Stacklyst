import { prisma } from '@/lib/prisma';
import { Language, type Prisma } from '@prisma/client';
import { awardXP, awardXPInTransaction } from '@/lib/xp';
import { calculateLevel } from '@/lib/learning/rewards';
import { NotificationService } from './notification.service';
import { logger } from '@/lib/logger';
export { calculateLevel } from '@/lib/learning/rewards';

// All consumers share one atomic XP calculation and persistence path.
export const XpService = {
  async awardXP(userId: string, language: Language | null | undefined, amount: number) {
    const before = await prisma.user.findUnique({
      where: { id: userId },
      select: { total_xp: true },
    });
    const result = await awardXP(userId, language, amount);
    const after = await prisma.user.findUnique({
      where: { id: userId },
      select: { total_xp: true },
    });
    if (calculateLevel(after?.total_xp ?? 0).level > calculateLevel(before?.total_xp ?? 0).level) {
      try {
        await NotificationService.create({
          userId,
          type: 'LEVEL_UP',
          title: 'Subiu de nível!',
          content: 'Sua prática avançou mais um nível.',
          link: '/profile',
        });
      } catch (error) {
        logger.error('Failed to notify level up', { error: String(error) });
      }
    }
    return result;
  },

  async awardXPInTransaction(
    tx: Prisma.TransactionClient,
    userId: string,
    language: Language | null | undefined,
    amount: number
  ) {
    return awardXPInTransaction(tx, userId, language, amount);
  },
};
