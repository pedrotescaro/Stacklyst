import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { NotificationService } from '@/services/notification.service';
import { rateLimit } from '@/lib/ratelimit';
import { buildCursorWhere, encodeCursor } from '@/lib/pagination';

let ensuredTable = false;
async function ensureMessageReactionTable() {
  if (ensuredTable) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MessageReaction" (
        "id" TEXT NOT NULL,
        "message_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "emoji" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma
      .$executeRawUnsafe(
        `
      CREATE UNIQUE INDEX IF NOT EXISTS "MessageReaction_message_id_user_id_emoji_key" ON "MessageReaction"("message_id", "user_id", "emoji")
    `
      )
      .catch(() => null);
    await prisma
      .$executeRawUnsafe(
        `
      CREATE INDEX IF NOT EXISTS "MessageReaction_message_id_idx" ON "MessageReaction"("message_id")
    `
      )
      .catch(() => null);
    await prisma
      .$executeRawUnsafe(
        `
      CREATE INDEX IF NOT EXISTS "MessageReaction_user_id_idx" ON "MessageReaction"("user_id")
    `
      )
      .catch(() => null);
    ensuredTable = true;
  } catch (err) {
    console.warn('Could not auto-create MessageReaction table:', err);
  }
}

export const POST = apiHandler(async (req) => {
  const user = await requireAuth();

  // Execute Upstash rate limit
  await rateLimit(`messages:${user.id}`, {
    limit: 30,
    window: '1 m',
    endpoint: '/api/messages',
  });

  const body = await req.json();
  const { receiver_id, content, image_url } = body;

  if (!receiver_id) {
    return NextResponse.json({ error: 'Destinatário não informado' }, { status: 400 });
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      sender_id: user.id,
      receiver_id,
      content: content ? content.trim() : '',
      image_url: image_url || null,
    },
  });

  // Notify receiver using NotificationService
  try {
    await NotificationService.create({
      userId: receiver_id,
      type: 'COMMENT', // COMMENT maps to ANSWER icon (MessageSquare)
      actorId: user.id,
      resourceId: message.id,
      resourceType: 'MESSAGE',
      title: 'Mensagem Recebida 💬',
      content: `@${user.username} enviou uma mensagem para você no Bate-papo.`,
      link: '/messages',
    });
  } catch (err) {
    console.error('Error creating chat notification:', err);
  }

  return NextResponse.json(message);
});

export const GET = apiHandler(async (req) => {
  const user = await requireAuth();

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get('receiver_id');

  if (!receiverId) {
    return NextResponse.json({ error: 'receiver_id é obrigatório' }, { status: 400 });
  }

  await ensureMessageReactionTable();

  const where = {
    AND: [
      {
        OR: [
          { sender_id: user.id, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: user.id },
        ],
      },
      buildCursorWhere(searchParams.get('cursor') || undefined),
    ],
  };
  const pageResponse = <T extends { id: string; created_at: Date }>(rows: T[]) => {
    const page = rows.slice(0, 100);
    const oldest = page.at(-1);
    return NextResponse.json(page.reverse(), {
      headers: {
        'X-Next-Cursor':
          rows.length > 100 && oldest ? encodeCursor(oldest.created_at, oldest.id) : '',
        'Cache-Control': 'private, no-store',
      },
    });
  };

  try {
    const messages = await prisma.message.findMany({
      where,
      include: {
        reactions: {
          select: {
            id: true,
            emoji: true,
            user_id: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: 101,
    });

    return pageResponse(messages);
  } catch (err) {
    console.warn('Failed to load messages with reactions, falling back:', err);
    const messages = await prisma.message.findMany({
      where,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: 101,
    });

    return pageResponse(messages.map((m) => ({ ...m, reactions: [] })));
  }
});
