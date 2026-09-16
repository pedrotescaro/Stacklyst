import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { rateLimit } from '@/lib/ratelimit';
import { NotificationService } from '@/services/notification.service';
import { buildCursorWhere, encodeCursor } from '@/lib/pagination';
const input = z.object({
  receiver_id: z.string().uuid(),
  client_id: z.string().uuid(),
  content: z.string().trim().min(1).max(5000),
});
export const POST = apiHandler(async (req) => {
  const user = await requireAuth();
  const data = input.parse(await req.json());
  await rateLimit(`messages:${user.id}`, {
    limit: 30,
    window: '1 m',
    endpoint: '/api/mobile/messages',
  });
  const existing = await prisma.message.findUnique({
    where: { sender_id_client_id: { sender_id: user.id, client_id: data.client_id } },
  });
  if (existing) {
    if (existing.receiver_id !== data.receiver_id || existing.content !== data.content)
      throw new AppError('IDEMPOTENCY_CONFLICT', 'Esta tentativa pertence a outra mensagem.', 409);
    return Response.json(existing);
  }
  const receiver = await prisma.user.findUnique({
    where: { id: data.receiver_id },
    select: { id: true },
  });
  if (!receiver) throw new AppError('USER_NOT_FOUND', 'Destinatário não encontrado.', 404);
  let message;
  try {
    message = await prisma.message.create({ data: { ...data, sender_id: user.id } });
  } catch (error) {
    if ((error as { code?: string }).code !== 'P2002') throw error;
    const previous = await prisma.message.findUniqueOrThrow({
      where: { sender_id_client_id: { sender_id: user.id, client_id: data.client_id } },
    });
    if (previous.receiver_id !== data.receiver_id || previous.content !== data.content)
      throw new AppError('IDEMPOTENCY_CONFLICT', 'Tentativa conflitante.', 409);
    return Response.json(previous);
  }
  await NotificationService.create({
    userId: data.receiver_id,
    actorId: user.id,
    type: 'COMMENT',
    resourceType: 'MESSAGE',
    resourceId: message.id,
  }).catch(() => undefined);
  return Response.json(message, { status: 201 });
});
export const GET = apiHandler(async (req) => {
  const user = await requireAuth();
  const query = new URL(req.url).searchParams;
  const partner = z.string().uuid().parse(query.get('receiver_id'));
  const rows = await prisma.message.findMany({
    where: {
      AND: [
        {
          OR: [
            { sender_id: user.id, receiver_id: partner },
            { sender_id: partner, receiver_id: user.id },
          ],
        },
        buildCursorWhere(query.get('cursor') || undefined, 'created_at'),
      ],
    },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    take: 31,
  });
  const items = rows.slice(0, 30);
  const last = items.at(-1);
  return Response.json({
    items,
    nextCursor: rows.length > 30 && last ? encodeCursor(last.created_at, last.id) : null,
  });
});
