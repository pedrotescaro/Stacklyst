import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';

export const GET = apiHandler(async (req, { session, params }) => {
  const { id } = await params;
  const currentUser = session;

  const follows = await prisma.follow.findMany({
    where: {
      followerId: id,
      follower: visibleUserWhere(session?.id ?? null),
      following: visibleUserWhere(session?.id ?? null),
    },
    include: {
      following: {
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
                followingId: f.following.id,
              },
            },
          })) !== null
        : false;

      return {
        id: f.following.id,
        username: f.following.username,
        avatar_url: f.following.avatar_url,
        total_xp: f.following.total_xp,
        isFollowing,
      };
    })
  );

  return NextResponse.json(users);
});
