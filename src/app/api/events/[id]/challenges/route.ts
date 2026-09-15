import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { eventChallengeSetSchema } from '@/lib/event-challenges';
import { EventChallengeService } from '@/services/event-challenge.service';

export const GET = apiHandler(async (_req, { params }) => {
  const { id: eventId } = await params;
  const user = await getAuthUser();

  const result = await EventChallengeService.list(
    eventId,
    user ? { id: user.id, isAdmin: user.role === 'ADMIN' } : null
  );

  return NextResponse.json(result);
});

export const PUT = apiHandler(async (req, { params }) => {
  const { id: eventId } = await params;
  const user = await requireAuth();
  const body = eventChallengeSetSchema.parse(await req.json());

  const result = await EventChallengeService.replaceSet(eventId, body.challenges, {
    id: user.id,
    isAdmin: user.role === 'ADMIN',
  });

  return NextResponse.json({
    success: true,
    message: 'Conjunto de desafios salvo com sucesso.',
    ...result,
  });
});
