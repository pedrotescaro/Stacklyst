import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { EventService } from '@/services/event.service';
import { z } from 'zod';
import { EventStatus, EventType } from '@prisma/client';
import { requireCompanyAccess } from '@/lib/mobile/company-access';

const createEventSchema = z
  .object({
    title: z.string().min(3, 'Título é obrigatório').max(200),
    description: z.string().min(10, 'Descrição detalhada é obrigatória').max(10000),
    type: z.nativeEnum(EventType).default('CHALLENGE'),
    company_id: z.string().optional(),
    banner_url: z.string().optional(),
    min_level: z.number().int().min(1).max(1000).default(1),
    max_participants: z.number().int().positive().max(1000000).optional(),
    xp_reward: z.number().int().min(0).max(1000000).default(250),
    start_date: z.string().refine((value) => Number.isFinite(Date.parse(value)), 'Data inválida'),
    end_date: z.string().refine((value) => Number.isFinite(Date.parse(value)), 'Data inválida'),
  })
  .refine((data) => Date.parse(data.end_date) > Date.parse(data.start_date), {
    message: 'O encerramento deve ser posterior ao início.',
    path: ['end_date'],
  });

export const GET = apiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') as EventStatus) || undefined;
  const user = await getAuthUser();

  const events = await EventService.listEvents(status, user?.id);
  return NextResponse.json(events);
});

export const POST = apiHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  const parsed = createEventSchema.parse(body);
  if (parsed.company_id) await requireCompanyAccess(parsed.company_id, user);

  const event = await EventService.createEvent({
    creatorId: user.id,
    companyId: parsed.company_id,
    title: parsed.title,
    description: parsed.description,
    type: parsed.type,
    bannerUrl: parsed.banner_url,
    minLevel: parsed.min_level,
    maxParticipants: parsed.max_participants,
    xpReward: parsed.xp_reward,
    startDate: new Date(parsed.start_date),
    endDate: new Date(parsed.end_date),
  });

  return NextResponse.json({
    success: true,
    message: 'Evento criado com sucesso!',
    event,
  });
});
