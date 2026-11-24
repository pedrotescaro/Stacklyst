import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError } from '@/lib/errors';
import {
  abandonAttempt,
  attemptDto,
  getOwnedAttempt,
  saveAttempt,
} from '@/lib/enade/attempts.server';
import { rateLimit } from '@/lib/ratelimit';
import { readEnadeJson } from '../../read-json';

async function attemptId(params: Promise<{ id?: string }>) {
  return z.uuid().parse((await params).id);
}

export const GET = apiHandler(async (_request, { session, params }) => {
  if (!session) throw new UnauthorizedError();
  return NextResponse.json(
    { attempt: attemptDto(await getOwnedAttempt(session.id, await attemptId(params))) },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
});

/** Autosave: accepts the newest snapshot and returns the stored one when it is newer. */
export const PUT = apiHandler(async (request, { session, params }) => {
  if (!session) throw new UnauthorizedError();
  const id = await attemptId(params);
  await rateLimit(`enade-autosave:${session.id}`, {
    limit: 150,
    window: '1 m',
    endpoint: 'enade-autosave',
  });
  const { row, stale } = await saveAttempt(session.id, id, await readEnadeJson(request, 400_000));
  return NextResponse.json({ attempt: attemptDto(row), stale });
});

/** Discards an attempt that is still in progress. Finished attempts stay in the history. */
export const DELETE = apiHandler(async (_request, { session, params }) => {
  if (!session) throw new UnauthorizedError();
  await abandonAttempt(session.id, await attemptId(params));
  return NextResponse.json({ ok: true });
});
