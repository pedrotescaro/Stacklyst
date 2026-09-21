import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { awardXPInTransaction } from '@/lib/xp';
import { calculateLevel } from '@/lib/learning/rewards';
import { logger } from '@/lib/logger';

const VALID_REACTIONS = ['FIRE', 'HEART', 'LAUGH', 'CLAP', 'BULB'];

export const ReactionService = {
  async toggleReaction(userId: string, postId: string, type: string | null) {
    if (type !== null && !VALID_REACTIONS.includes(type)) {
      throw new Error('INVALID_REACTION_TYPE');
    }

    return await prisma.$transaction(async (tx) => {
      // Serialize reaction transitions with all XP writes for this user.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`learning:${userId}`}))`;
      // 1. Verify post exists
      const post = await tx.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundError('POST_NOT_FOUND', 'Postagem não encontrada');
      }

      // 2. Fetch existing reaction
      const existingReaction = await tx.reaction.findUnique({
        where: {
          post_id_user_id: {
            post_id: postId,
            user_id: userId,
          },
        },
      });

      if (type === null) {
        if (existingReaction) {
          // Remove reaction
          await tx.reaction.delete({
            where: {
              post_id_user_id: {
                post_id: postId,
                user_id: userId,
              },
            },
          });

          // Reverse the reaction reward in this transaction. The general award
          // helper intentionally rejects negative amounts.
          const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
          await tx.user.update({
            where: { id: userId },
            data: { total_xp: { decrement: Math.min(2, Math.max(0, user.total_xp)) } },
          });
          if (post.language) {
            const trail = await tx.languageTrail.findUnique({
              where: { user_id_language: { user_id: userId, language: post.language } },
            });
            if (trail) {
              const xp = Math.max(0, trail.xp - 2);
              await tx.languageTrail.update({
                where: { id: trail.id },
                data: { xp, level: calculateLevel(xp).level },
              });
            }
          }
          logger.info('Reaction removed', { userId, postId, oldType: existingReaction.type });
          return null;
        }
        return null;
      }

      if (existingReaction) {
        if (existingReaction.type === type) {
          // No change
          return type;
        }

        // Update reaction type (no XP changes)
        const updated = await tx.reaction.update({
          where: {
            post_id_user_id: {
              post_id: postId,
              user_id: userId,
            },
          },
          data: { type },
        });

        logger.info('Reaction updated', {
          userId,
          postId,
          oldType: existingReaction.type,
          newType: type,
        });
        return updated.type;
      } else {
        // Create new reaction
        const created = await tx.reaction.create({
          data: {
            post_id: postId,
            user_id: userId,
            type,
          },
        });

        // Award 2 XP
        await awardXPInTransaction(tx, userId, post.language, 2);

        // Notify post author if reaction is by another user
        if (post.author_id !== userId) {
          await tx.notification.create({
            data: {
              userId: post.author_id,
              type: 'REACTION',
              actorId: userId,
              resourceId: post.id,
              resourceType: 'POST',
              read: false,
            },
          });
        }

        logger.info('Reaction added', { userId, postId, newType: type });
        return created.type;
      }
    });
  },
};
