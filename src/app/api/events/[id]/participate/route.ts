import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { EventService } from '@/services/event.service';

export const POST = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id: eventId } = await params;

  const participant = await EventService.participate(user.id, eventId);

  return NextResponse.json({
    success: true,
    message: 'Inscrição no evento confirmada!',
    participant,
  });
});

export const DELETE = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id: eventId } = await params;

  await EventService.cancelParticipation(user.id, eventId);

  return NextResponse.json({
    success: true,
    message: 'Inscrição cancelada com sucesso.',
  });
});
