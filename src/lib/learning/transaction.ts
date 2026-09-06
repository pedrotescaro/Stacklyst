import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

// Remote PostgreSQL round trips exceeded Prisma's 5 s default during lesson saves.
// Execution providers stay outside this bounded, database-only transaction.
export const LEARNING_TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 20_000 } as const;

export async function learningTransaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) {
  try {
    return await prisma.$transaction(work, LEARNING_TRANSACTION_OPTIONS);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2028' || code === 'P2034' || code === 'P2024') {
      logger.warn('Learning transaction could not complete', { code });
      throw new AppError(
        'PROGRESS_SAVE_UNAVAILABLE',
        'Não foi possível confirmar a gravação. Tente novamente; uma resposta já salva não recebe XP em duplicidade.',
        503
      );
    }
    throw error;
  }
}
