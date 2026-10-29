import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { actionSchema, adventure } from '@/lib/mundinho/repository';
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
  const action = actionSchema.parse(await request.json());
  return Response.json(await adventure(session.id, action), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
