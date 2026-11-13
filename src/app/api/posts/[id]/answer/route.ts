import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlockService } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { createAnswerSchema } from '@/lib/validators';
import { XpService } from '@/services/xp.service';
import { NotificationService } from '@/services/notification.service';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { encodeReplyMedia, stripReplyMedia } from '@/lib/reply-media';
import { syncProfileAchievementsSafely } from '@/services/profile-customization.service';
import { assertPostAudience } from '@/services/post-access.service';

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

  await BlockService.assertCanInteract(user.id, post.author_id);
  await assertPostAudience(post, user.id);

  const parsed = createAnswerSchema.parse(await req.json());

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

    await BlockService.assertCanInteract(user.id, parentAnswer.author_id);
    parentId = parentAnswer.id;
  }

  const attachments = parsed.attachments;
  const mediaIds = attachments.map((item) => item.url.split('/').at(-1)!);
  if (new Set(mediaIds).size !== mediaIds.length)
    throw new ValidationError(
      'INVALID_MEDIA',
      'Um mesmo anexo não pode ser adicionado duas vezes.'
    );
  const body = encodeReplyMedia(stripReplyMedia(parsed.body), {
    attachments,
    music: parsed.music ?? null,
  });

  // Create answer, attaching uploads to the post so everyone who can see it sees them.
  const answer = await prisma.$transaction(async (tx) => {
    if (mediaIds.length) {
      const media = await tx.postMedia.findMany({
        where: { id: { in: mediaIds }, owner_id: user.id, post_id: null },
      });
      const invalid = attachments.some((item) => {
        const file = media.find((entry) => entry.id === item.url.split('/').at(-1));
        return (
          !file ||
          (item.type === 'audio'
            ? !file.content_type.startsWith('audio/')
            : item.type === 'gif'
              ? file.content_type !== 'image/gif'
              : !file.content_type.startsWith('image/'))
        );
      });
      if (invalid)
        throw new ValidationError(
          'INVALID_MEDIA',
          'Um anexo está indisponível. Envie o arquivo novamente.'
        );
      await tx.postMedia.updateMany({
        where: { id: { in: mediaIds }, owner_id: user.id, post_id: null },
        data: { post_id: postId },
      });
    }
    return tx.answer.create({
      data: {
        post_id: postId,
        author_id: user.id,
        parent_id: parentId,
        body,
        code_snippet: parsed.code_snippet || null,
      },
      include: {
        author: {
          select: {
            username: true,
            avatar_url: true,
            avatar_config: true,
            total_xp: true,
          },
        },
      },
    });
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
