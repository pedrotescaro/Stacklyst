import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { EventService } from '@/services/event.service';

export const GET = apiHandler(async (_req, { params }) => {
  const { id } = await params;
  const user = await getAuthUser();

  const event = await EventService.getEventById(id, user?.id);
  if (!event) {
    return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
  }

  return NextResponse.json(event);
});

export const DELETE = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  await EventService.deleteEvent(id, user.id, user.role === 'ADMIN');

  return NextResponse.json({
    success: true,
    message: 'Evento excluído com sucesso.',
  });
});
