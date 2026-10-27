import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { syncProfileAchievementsSafely } from './profile-customization.service';

export const FollowService = {
  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ValidationError('SELF_FOLLOW', 'Você não pode seguir a si mesmo');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify target user exists
      const targetUser = await tx.user.findUnique({
        where: { id: followingId },
      });

      if (!targetUser) {
        throw new NotFoundError('USER_NOT_FOUND', 'Usuário não encontrado');
      }

      // 2. Check if already following
      const existingFollow = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      if (existingFollow) {
        // Unfollow
        await tx.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId,
            },
          },
        });
        logger.info('User unfollowed', { followerId, followingId });
        return { following: false };
      } else {
        // Follow
        await tx.follow.create({
          data: {
            followerId,
            followingId,
          },
        });

        // Create a FOLLOW notification
        await tx.notification.create({
          data: {
            userId: followingId,
            type: 'FOLLOW',
            actorId: followerId,
            read: false,
          },
        });

        logger.info('User followed', { followerId, followingId });
        return { following: true };
      }
    });
    await syncProfileAchievementsSafely(followingId);
    return result;
  },
};
