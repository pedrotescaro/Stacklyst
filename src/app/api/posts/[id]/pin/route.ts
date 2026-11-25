import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';

const pinSchema = z.object({
  pinned: z.boolean().optional(),
});

export const POST = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: postId } = await params;

  const rawBody = await req.text();
  let desired: boolean | undefined;
  if (rawBody.trim()) {
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      throw new ValidationError('INVALID_JSON', 'Corpo da requisição inválido.');
    }
    desired = pinSchema.parse(parsedJson).pinned;
  }

  const result = await prisma.$transaction(async (tx) => {
    // Serialize pin updates per author so at most one post remains pinned.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('stacklyst:pin:' || ${user.id}))`;

    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { id: true, author_id: true, is_pinned: true },
    });

    if (!post) {
      throw new NotFoundError('POST_NOT_FOUND', 'Post não encontrado.');
    }
    if (post.author_id !== user.id) {
      throw new ForbiddenError('FORBIDDEN', 'Apenas o autor pode fixar este post no perfil.');
    }

    const nextPinned = desired ?? !post.is_pinned;
    if (nextPinned) {
      await tx.post.updateMany({
        where: { author_id: user.id, is_pinned: true, id: { not: postId } },
        data: { is_pinned: false },
      });
    }
    if (post.is_pinned !== nextPinned) {
      await tx.post.update({
        where: { id: postId },
        data: { is_pinned: nextPinned },
      });
    }

    return { postId, pinned: nextPinned };
  });

  return NextResponse.json(
    { success: true, ...result },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
});
