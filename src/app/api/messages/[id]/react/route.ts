import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlockService } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { randomUUID } from 'crypto';

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

// POST /api/messages/[id]/react - Toggle reaction on a message
export const POST = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: messageId } = await params;

  const body = await req.json();
  const { emoji } = body;

  if (!emoji || typeof emoji !== 'string' || emoji.trim() === '') {
    return NextResponse.json({ error: 'Emoji é obrigatório' }, { status: 400 });
  }

  const trimmedEmoji = emoji.trim();

  // Find the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
  }

  // Verify user is sender or receiver of the message
  if (message.sender_id !== user.id && message.receiver_id !== user.id) {
    return NextResponse.json(
      { error: 'Você não tem permissão para reagir a esta mensagem' },
      { status: 403 }
    );
  }

  await BlockService.assertCanInteract(
    user.id,
    message.sender_id === user.id ? message.receiver_id : message.sender_id
  );
  await ensureMessageReactionTable();

  // Check if user already reacted with this emoji on this message
  let existing: { id: string } | null = null;
  try {
    existing = await prisma.messageReaction.findUnique({
      where: {
        message_id_user_id_emoji: {
          message_id: messageId,
          user_id: user.id,
          emoji: trimmedEmoji,
        },
      },
    });
  } catch (dbErr) {
    console.warn('Prisma findUnique failed, trying raw SQL query:', dbErr);
    await ensureMessageReactionTable();
    const rows =
      ((await prisma
        .$queryRawUnsafe(
          `SELECT id FROM "MessageReaction" WHERE message_id = $1 AND user_id = $2 AND emoji = $3 LIMIT 1`,
          messageId,
          user.id,
          trimmedEmoji
        )
        .catch(() => [])) as any[]) || [];
    existing = rows && rows.length > 0 ? rows[0] : null;
  }

  if (existing) {
    // Remove reaction (toggle off)
    try {
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      });
    } catch {
      await prisma
        .$executeRawUnsafe(`DELETE FROM "MessageReaction" WHERE id = $1`, existing.id)
        .catch(() => null);
    }

    return NextResponse.json({
      action: 'removed',
      messageId,
      emoji: trimmedEmoji,
      userId: user.id,
    });
  } else {
    // Add reaction
    const newId = randomUUID();
    let reactionData: any = null;

    try {
      reactionData = await prisma.messageReaction.create({
        data: {
          id: newId,
          message_id: messageId,
          user_id: user.id,
          emoji: trimmedEmoji,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (createErr) {
      console.warn('Prisma create failed, inserting with raw SQL:', createErr);
      await prisma
        .$executeRawUnsafe(
          `INSERT INTO "MessageReaction" ("id", "message_id", "user_id", "emoji", "created_at") VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT DO NOTHING`,
          newId,
          messageId,
          user.id,
          trimmedEmoji
        )
        .catch(() => null);

      reactionData = {
        id: newId,
        message_id: messageId,
        user_id: user.id,
        emoji: trimmedEmoji,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    }

    return NextResponse.json({
      action: 'added',
      messageId,
      reaction: reactionData,
      userId: user.id,
    });
  }
});
