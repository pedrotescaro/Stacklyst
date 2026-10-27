import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { createAnswerSchema } from '@/lib/validators';
import { XpService } from '@/services/xp.service';
import { NotificationService } from '@/services/notification.service';
import { NotFoundError } from '@/lib/errors';
import { syncProfileAchievementsSafely } from '@/services/profile-customization.service';

export const POST = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: postId } = await params;

  // Verify post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('POST_NOT_FOUND', 'Post não encontrado');
  }

  const body = await req.json();
  const parsed = createAnswerSchema.parse(body);

  // If replying to another answer, validate the parent exists and belongs to the same post.
  // This prevents orphan/cross-post replies and keeps the thread consistent.
  let parentId: string | null = null;
  if (parsed.parent_answer_id) {
    const parentAnswer = await prisma.answer.findUnique({
      where: { id: parsed.parent_answer_id },
      select: { id: true, post_id: true, author_id: true },
    });

    if (!parentAnswer) {
      throw new NotFoundError('PARENT_ANSWER_NOT_FOUND', 'Comentário pai não encontrado');
    }

    if (parentAnswer.post_id !== postId) {
      throw new NotFoundError(
        'PARENT_ANSWER_MISMATCH',
        'O comentário pai não pertence a este post'
      );
    }

    parentId = parentAnswer.id;
  }

  // Create answer
  const answer = await prisma.answer.create({
    data: {
      post_id: postId,
      author_id: user.id,
      parent_id: parentId,
      body: parsed.body,
      code_snippet: parsed.code_snippet || null,
    },
    include: {
      author: {
        select: {
          username: true,
          avatar_url: true,
        },
      },
    },
  });

  // Notify post author using NotificationService
  if (post.author_id !== user.id) {
    try {
      await NotificationService.create({
        userId: post.author_id,
        type: 'COMMENT', // COMMENT maps to ANSWER icon
        actorId: user.id,
        resourceId: answer.id,
        resourceType: 'ANSWER',
        title: 'Nova Resposta no seu Post 💬',
        content: `@${user.username} respondeu à sua dúvida: "${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}"`,
        link: `/post/${postId}`,
      });
    } catch (err) {
      console.error('Error creating notification for answer:', err);
    }
  }

  // Award XP (+15 XP for answering)
  const xpResult = await XpService.awardXP(user.id, post.language, 15);
  await syncProfileAchievementsSafely(user.id);

  return NextResponse.json({ answer, xpResult });
});
