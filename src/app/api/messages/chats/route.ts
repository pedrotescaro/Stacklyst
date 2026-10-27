import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Select the latest row per partner before limiting. A busy conversation
    // must not push every older conversation out of the sidebar.
    const chatsList = await prisma.$queryRaw<
      Array<{
        partnerId: string;
        lastMessage: string;
        lastMessageTime: Date;
        lastSenderId: string;
      }>
    >`
      SELECT "partnerId", content AS "lastMessage", created_at AS "lastMessageTime", sender_id AS "lastSenderId"
      FROM (
        SELECT DISTINCT ON (CASE WHEN sender_id = ${user.id} THEN receiver_id ELSE sender_id END)
          CASE WHEN sender_id = ${user.id} THEN receiver_id ELSE sender_id END AS "partnerId",
          content, created_at, sender_id, id
        FROM "Message"
        WHERE sender_id = ${user.id} OR receiver_id = ${user.id}
        ORDER BY CASE WHEN sender_id = ${user.id} THEN receiver_id ELSE sender_id END, created_at DESC, id DESC
      ) conversations
      ORDER BY created_at DESC, id DESC
      LIMIT 100
    `;

    // Fetch partner details
    const partners = await prisma.user.findMany({
      where: {
        id: { in: chatsList.map((c) => c.partnerId) },
      },
      select: {
        id: true,
        username: true,
        avatar_url: true,
      },
    });

    const result = chatsList
      .map((c) => {
        const partner = partners.find((p) => p.id === c.partnerId);
        return {
          ...c,
          partner,
        };
      })
      .filter((c) => c.partner !== undefined)
      .sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 });
  }
}
