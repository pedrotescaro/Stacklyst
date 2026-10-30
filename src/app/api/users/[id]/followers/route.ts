import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';

export const GET = apiHandler(async (req, { session, params }) => {
  const { id } = await params;
  const currentUser = session;

  const follows = await prisma.follow.findMany({
    where: {
      followingId: id,
      following: visibleUserWhere(session?.id ?? null),
      follower: visibleUserWhere(session?.id ?? null),
    },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          avatar_url: true,
          total_xp: true,
        },
      },
    },
  });

  const users = await Promise.all(
    follows.map(async (f) => {
      const isFollowing = currentUser
        ? (await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUser.id,
                followingId: f.follower.id,
              },
            },
          })) !== null
        : false;

      return {
        id: f.follower.id,
        username: f.follower.username,
        avatar_url: f.follower.avatar_url,
        total_xp: f.follower.total_xp,
        isFollowing,
      };
    })
  );

  return NextResponse.json(users);
});
