import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';

export const GET = apiHandler(async (req, { session }) => {
  if (!session) {
    return NextResponse.json([]);
  }

  const suggestions = await prisma.user.findMany({
    where: {
      ...visibleUserWhere(session.id),
      NOT: {
        id: session.id,
      },
      followers: {
        none: {
          followerId: session.id,
        },
      },
    },
    select: {
      id: true,
      username: true,
      avatar_url: true,
      total_xp: true,
    },
    take: 5,
  });

  return NextResponse.json(suggestions);
});
