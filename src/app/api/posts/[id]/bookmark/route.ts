import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlockService } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { assertPostAudience } from '@/services/post-access.service';
import { z } from 'zod';

const bookmarkSchema = z.object({ bookmarked: z.boolean().optional() });

export const GET = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id: postId } = await params;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: 'Postagem não encontrada' }, { status: 404 });
  await BlockService.assertCanInteract(user.id, post.author_id);
  await assertPostAudience(post, user.id);
  const bookmark = await prisma.bookmark.findUnique({
    where: { user_id_post_id: { user_id: user.id, post_id: postId } },
    select: { id: true },
  });
  return NextResponse.json(
    { bookmarked: Boolean(bookmark) },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
});

export const POST = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return NextResponse.json({ error: 'Postagem não encontrada' }, { status: 404 });
  }

  await BlockService.assertCanInteract(user.id, post.author_id);
  await assertPostAudience(post, user.id);

  // Older web/mobile clients send an empty POST to toggle. New clients send
  // their desired state so retries and concurrent surfaces cannot undo a save.
  const rawBody = await req.text();
  const desired = bookmarkSchema.parse(rawBody.trim() ? JSON.parse(rawBody) : {}).bookmarked;
  const where = { user_id_post_id: { user_id: user.id, post_id: postId } };
  if (desired !== undefined) {
    if (desired) {
      await prisma.bookmark.upsert({
        where,
        create: { user_id: user.id, post_id: postId },
        update: {},
      });
    } else {
      await prisma.bookmark.deleteMany({ where: { user_id: user.id, post_id: postId } });
    }
    return NextResponse.json(
      { success: true, bookmarked: desired },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  }

  const existingBookmark = await prisma.bookmark.findFirst({
    where: {
      user_id: user.id,
      post_id: postId,
    },
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({
      where: { id: existingBookmark.id },
    });
    return NextResponse.json({ success: true, bookmarked: false });
  } else {
    await prisma.bookmark.create({
      data: {
        user_id: user.id,
        post_id: postId,
      },
    });
    return NextResponse.json({ success: true, bookmarked: true });
  }
});
