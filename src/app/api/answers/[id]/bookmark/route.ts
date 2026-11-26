import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { BlockService } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { assertPostAudience } from '@/services/post-access.service';

const bookmarkSchema = z.object({ bookmarked: z.boolean() });
const noStore = { 'Cache-Control': 'private, no-store' };

/** Loads a reply the viewer may see, with the conversation it belongs to. */
async function findVisibleAnswer(answerId: string, viewerId: string) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: {
      id: true,
      author_id: true,
      post: { select: { author_id: true, audience: true } },
    },
  });
  if (!answer) return null;
  await BlockService.assertCanInteract(viewerId, answer.author_id);
  await BlockService.assertCanInteract(viewerId, answer.post.author_id);
  await assertPostAudience(answer.post, viewerId);
  return answer;
}

const notFound = () => NextResponse.json({ error: 'Resposta não encontrada' }, { status: 404 });

export const GET = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  if (!(await findVisibleAnswer(id, user.id))) return notFound();
  const bookmark = await prisma.answerBookmark.findUnique({
    where: { user_id_answer_id: { user_id: user.id, answer_id: id } },
    select: { id: true },
  });
  return NextResponse.json({ bookmarked: Boolean(bookmark) }, { headers: noStore });
});

/** Saves exactly this reply: other replies in the thread and the original post are untouched. */
export const POST = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  if (!(await findVisibleAnswer(id, user.id))) return notFound();
  const { bookmarked } = bookmarkSchema.parse(await req.json());
  if (bookmarked) {
    await prisma.answerBookmark.upsert({
      where: { user_id_answer_id: { user_id: user.id, answer_id: id } },
      create: { user_id: user.id, answer_id: id },
      update: {},
    });
  } else {
    await prisma.answerBookmark.deleteMany({ where: { user_id: user.id, answer_id: id } });
  }
  return NextResponse.json({ success: true, bookmarked }, { headers: noStore });
});
