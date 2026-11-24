import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/ratelimit';
import { loadLibrary } from '@/lib/enade/library/load';
import { QUESTION_BY_ID } from '@/lib/enade/simulator';
import { readEnadeJson } from '../read-json';

const schema = z.object({
  kind: z.enum(['ARTICLE', 'QUESTION']),
  ref: z.string().max(100),
  favorite: z.boolean(),
});

export const PUT = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const userId: string = session.id;
  await rateLimit(`enade-favorite:${userId}`, {
    limit: 60,
    window: '1 m',
    endpoint: 'enade-favorites',
  });
  const input = schema.parse(await readEnadeJson(request, 1_000));
  const exists =
    input.kind === 'ARTICLE' ? loadLibrary().bySlug.has(input.ref) : QUESTION_BY_ID.has(input.ref);
  if (!exists) throw new NotFoundError('NOT_FOUND', 'Item não encontrado.');
  const key = { user_id_kind_ref: { user_id: userId, kind: input.kind, ref: input.ref } };
  if (input.favorite)
    await prisma.enadeFavorite.upsert({
      where: key,
      create: { user_id: userId, kind: input.kind, ref: input.ref },
      update: {},
    });
  else
    await prisma.enadeFavorite.deleteMany({
      where: { user_id: userId, kind: input.kind, ref: input.ref },
    });
  return NextResponse.json({ favorite: input.favorite });
});
