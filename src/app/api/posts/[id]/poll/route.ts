import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { assertPostAccess } from '@/services/post-access.service';
import { postPollInclude, publicPostPoll } from '@/lib/post-poll';
import { ValidationError, NotFoundError } from '@/lib/errors';

export const POST = apiHandler(async (request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const { optionIndex } = z
    .object({ optionIndex: z.number().int().min(0).max(3) })
    .parse(await request.json());
  try {
    const poll = await prisma.$transaction(async (tx) => {
      await assertPostAccess(id, user.id, tx);
      const poll = await tx.postPoll.findUnique({
        where: { post_id: id },
        include: { options: { orderBy: { position: 'asc' } } },
      });
      if (!poll) throw new NotFoundError('POLL_NOT_FOUND', 'Enquete não encontrada.');
      if (poll.expires_at.getTime() <= Date.now())
        throw new ValidationError('POLL_CLOSED', 'Esta enquete já terminou.');
      const option = poll.options[optionIndex];
      if (!option) throw new ValidationError('INVALID_OPTION', 'Escolha uma opção válida.');
      await tx.postPollVote.create({
        data: { poll_id: poll.id, option_id: option.id, user_id: user.id },
      });
      return tx.postPoll.findUniqueOrThrow({
        where: { id: poll.id },
        include: postPollInclude(user.id),
      });
    });
    return NextResponse.json(publicPostPoll(poll));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return NextResponse.json({ error: 'Você já votou nesta enquete.' }, { status: 409 });
    throw error;
  }
});
