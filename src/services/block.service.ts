import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';

/** Compose inside AND so username, search and following filters stay intact. */
export function visibleUserWhere(viewerId: string | null): Prisma.UserWhereInput {
  if (!viewerId) return {};
  return {
    blocks_made: { none: { blockedId: viewerId } },
    blocks_received: { none: { blockerId: viewerId } },
  };
}

type BlockReader = Pick<Prisma.TransactionClient, 'userBlock'>;

export const BlockService = {
  async hasBlock(userId: string, otherId: string, db: BlockReader = prisma) {
    if (userId === otherId) return false;
    return Boolean(
      await db.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: otherId },
            { blockerId: otherId, blockedId: userId },
          ],
        },
        select: { blockerId: true },
      })
    );
  },

  async assertCanInteract(userId: string, otherId: string, db: BlockReader = prisma) {
    if (await BlockService.hasBlock(userId, otherId, db)) {
      throw new ForbiddenError(
        'USER_BLOCKED',
        'Esta interação não está disponível entre estas contas.'
      );
    }
  },

  async block(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new ValidationError('SELF_BLOCK', 'Você não pode bloquear a si mesmo.');
    }
    return prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: blockedId }, select: { id: true } });
      if (!target) throw new NotFoundError('USER_NOT_FOUND', 'Usuário não encontrado.');
      await tx.userBlock.upsert({
        where: { blockerId_blockedId: { blockerId, blockedId } },
        create: { blockerId, blockedId },
        update: {},
      });
      await tx.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
          ],
        },
      });
      await tx.duelRequest.updateMany({
        where: {
          status: 'PENDING',
          OR: [
            { sender_id: blockerId, receiver_id: blockedId },
            { sender_id: blockedId, receiver_id: blockerId },
          ],
        },
        data: { status: 'REJECTED' },
      });
      await tx.notification.deleteMany({
        where: {
          OR: [
            { userId: blockerId, actorId: blockedId },
            { userId: blockedId, actorId: blockerId },
          ],
        },
      });
      return { blocked: true };
    });
  },

  async unblock(blockerId: string, blockedId: string) {
    await prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
    // Never remove the other account's block or recreate former follows.
    return { blocked: false };
  },

  async list(blockerId: string) {
    return prisma.userBlock.findMany({
      where: { blockerId },
      orderBy: [{ createdAt: 'desc' }, { blockedId: 'asc' }],
      select: {
        createdAt: true,
        blocked: { select: { id: true, username: true, avatar_url: true } },
      },
    });
  },
};
