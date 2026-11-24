import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { importBrowserProgress, isLegacyEnadeKey } from '@/lib/enade/attempts.server';
import { rateLimit } from '@/lib/ratelimit';
import { readEnadeJson } from '../../read-json';

const legacyDraft = z.object({
  userId: z.string().min(1).max(100),
  key: z.string().refine(isLegacyEnadeKey),
  value: z.unknown(),
});

export const POST = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const userId: string = session.id;
  await rateLimit(`enade-import:${userId}`, { limit: 12, window: '1 m', endpoint: 'enade-import' });
  const { userId: owner, key, value } = legacyDraft.parse(await readEnadeJson(request, 400_000));
  if (owner !== userId)
    throw new ForbiddenError('FORBIDDEN', 'A conta mudou durante a importação.');
  return NextResponse.json({ imported: await importBrowserProgress(userId, key, value) });
});
