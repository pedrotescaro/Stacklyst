import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlockService } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { syncProfileAchievementsSafely } from '@/services/profile-customization.service';

export const POST = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: postId } = await params;

  const body = await req.json();
  const { value } = body; // 1 (upvote), -1 (downvote), or 0 (remove vote)

  if (value !== 1 && value !== -1 && value !== 0) {
    throw new ValidationError('INVALID_VOTE_VALUE', 'Valor de voto inválido');
  }

  // 1. Verify post exists
  const postExists = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!postExists) {
    throw new NotFoundError('POST_NOT_FOUND', 'Postagem não encontrada');
  }

  await BlockService.assertCanInteract(user.id, postExists.author_id);

  // 2. Update or delete PostVote atomically
  if (value === 0) {
    await prisma.postVote
      .deleteMany({
        where: {
          post_id: postId,
          user_id: user.id,
        },
      })
      .catch(() => {});
  } else {
    await prisma.postVote.upsert({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: user.id,
        },
      },
      update: {
        value,
      },
      create: {
        post_id: postId,
        user_id: user.id,
        value,
      },
    });
  }

  // 3. Aggregate total upvote count
  const aggregate = await prisma.postVote.aggregate({
    where: { post_id: postId },
    _sum: { value: true },
  });

  const newUpvotes = aggregate._sum.value ?? 0;

  // 4. Update upvotes count on Post
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: { upvotes: newUpvotes },
    select: { author_id: true, title: true },
  });

  // 5. If upvote and not by author, create LIKE notification
  if (value === 1 && updatedPost.author_id !== user.id) {
    try {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: updatedPost.author_id,
          type: 'LIKE',
          resourceId: postId,
          resourceType: 'POST',
        },
      });

      if (!existing) {
        await NotificationService.create({
          userId: updatedPost.author_id,
          type: 'LIKE',
          actorId: user.id,
          resourceId: postId,
          resourceType: 'POST',
          title: 'Seu post recebeu um Up! 🔺',
          content: `@${user.username} deu um up no seu post: "${updatedPost.title.substring(0, 30)}${updatedPost.title.length > 30 ? '...' : ''}"`,
          link: `/post/${postId}`,
        });
      }
    } catch (err) {
      console.error('Failed to create upvote notification:', err);
    }
  }

  await syncProfileAchievementsSafely(updatedPost.author_id);
  return NextResponse.json({ success: true, upvotes: newUpvotes });
});
