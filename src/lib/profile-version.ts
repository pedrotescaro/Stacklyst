import type { Prisma } from '@prisma/client';

/** Called while the shared profile advisory lock is held by the writer. */
export async function bumpProfileVersion(tx: Prisma.TransactionClient, userId: string) {
  await tx.profileCustomization.upsert({
    where: { userId },
    create: { userId, preferences: {}, chat: {} },
    update: { version: { increment: 1 } },
  });
}
