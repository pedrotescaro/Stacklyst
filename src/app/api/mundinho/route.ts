import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError, ForbiddenError, ConnectionError } from '@/lib/errors';
import { getErrorSummary, isTransientConnectionError } from '@/lib/connection-errors';
import { logger } from '@/lib/logger';
import { actionSchema, adventure } from '@/lib/mundinho/repository';
import { arena, arenaActionSchema } from '@/lib/mundinho/arena';
import {
  localizeMundinhoPayload,
  translateMundinhoError,
  wantsEnglish,
} from '@/lib/mundinho/i18n.server';
export const maxDuration = 60;

function mundinhoError(error: unknown, english: boolean) {
  if (
    isTransientConnectionError(error) ||
    (error && typeof error === 'object' && 'code' in error && error.code === 'P2028')
  ) {
    logger.warn('Mundinho database temporarily unavailable', getErrorSummary(error));
    return new ConnectionError(
      'MUNDINHO_UNAVAILABLE',
      english
        ? 'Mundinho is taking too long to respond. Please try again shortly.'
        : 'O Mundinho está demorando para responder. Tente novamente em instantes.'
    );
  }
  return english ? translateMundinhoError(error) : error;
}

export const GET = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const english = wantsEnglish(request);
  const result = await adventure(session.id).catch((error) => {
    throw mundinhoError(error, english);
  });
  return Response.json(english ? localizeMundinhoPayload(result) : result, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
export const POST = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    throw new ForbiddenError('ORIGIN', 'Origem da requisição não permitida.');
  const payload = await request.json();
  const english = wantsEnglish(request);
  const result = await (
    payload?.type === 'arena'
      ? arena(session.id, arenaActionSchema.parse(payload.action))
      : adventure(session.id, actionSchema.parse(payload))
  ).catch((error) => {
    throw mundinhoError(error, english);
  });
  return Response.json(english ? localizeMundinhoPayload(result) : result, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
