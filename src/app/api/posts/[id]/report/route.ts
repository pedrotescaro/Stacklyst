import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { visiblePostWhere } from '@/services/post-access.service';

const reportSchema = z.object({
  reason: z.string().trim().min(1, 'Motivo é obrigatório').max(1000, 'Use até 1.000 caracteres.'),
});

export const POST = apiHandler(async (request, { params, session: user }) => {
  if (!user) throw new UnauthorizedError();
  const { id: postId } = await params;
  const { reason } = reportSchema.parse(await request.json().catch(() => null));
  const post = await prisma.post.findFirst({
    where: { AND: [{ id: postId }, visiblePostWhere(user.id)] },
    select: { id: true },
  });
  if (!post) throw new NotFoundError('POST_NOT_FOUND', 'Post não encontrado');
  const where = { user_id_post_id: { user_id: user.id, post_id: postId } };
  let report;
  try {
    report = await prisma.report.upsert({
      where,
      create: { user_id: user.id, post_id: postId, reason },
      update: { reason },
    });
  } catch (error) {
    if ((error as { code?: string }).code !== 'P2002') throw error;
    // Covers providers that emulate upsert with a read/create sequence.
    report = await prisma.report.update({ where, data: { reason } });
  }
  return NextResponse.json({ success: true, report });
});
