import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { expireDuelInvitations } from '@/lib/duels/invitations';

export const GET = apiHandler(async () => {
  const user = await requireAuth();

  // Find non-expired pending duel requests received by this user
  const now = new Date();
  await expireDuelInvitations(now, { receiverId: user.id });
  const pendingRequests = await prisma.duelRequest.findMany({
    where: {
      receiver_id: user.id,
      status: 'PENDING',
      expires_at: { gt: now },
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar_url: true,
          total_xp: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(pendingRequests);
});
