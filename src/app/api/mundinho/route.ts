import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { actionSchema, adventure } from '@/lib/mundinho/repository';
import { arena, arenaActionSchema } from '@/lib/mundinho/arena';
export const maxDuration = 60;

export const GET = apiHandler(async (_request, { session }) => {
  if (!session) throw new UnauthorizedError();
  return Response.json(await adventure(session.id), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
export const POST = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    throw new ForbiddenError('ORIGIN', 'Origem da requisição não permitida.');
  const payload = await request.json();
  const result =
    payload?.type === 'arena'
      ? await arena(session.id, arenaActionSchema.parse(payload.action))
      : await adventure(session.id, actionSchema.parse(payload));
  return Response.json(result, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
