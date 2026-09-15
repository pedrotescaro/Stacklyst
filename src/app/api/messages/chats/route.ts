import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Fetch all messages involving the user (limited to last 200 for performance)
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender_id: user.id }, { receiver_id: user.id }],
      },
      orderBy: { created_at: 'desc' },
      take: 200,
    });

    // Group by conversation partner
    const chatsMap = new Map<string, any>();

    for (const msg of messages) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!chatsMap.has(partnerId)) {
        chatsMap.set(partnerId, {
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          lastSenderId: msg.sender_id,
          partnerId: partnerId,
        });
      }
    }

    const chatsList = Array.from(chatsMap.values());

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
