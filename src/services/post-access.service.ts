import type { Prisma } from '@prisma/client';
import { visibleUserWhere } from '@/services/block.service';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

/** Apply in SQL before selecting post content, including nested replies and media. */
export function visiblePostWhere(viewerId: string | null): Prisma.PostWhereInput {
  return {
    author: visibleUserWhere(viewerId),
    OR: [
      { audience: 'everyone' },
      ...(viewerId
        ? [
            { author_id: viewerId },
            { audience: 'followers', author: { followers: { some: { followerId: viewerId } } } },
          ]
        : []),
    ],
  };
}

export async function assertPostAccess(
  postId: string,
  viewerId: string | null,
  db: Pick<Prisma.TransactionClient, 'post'> = prisma
) {
  const post = await db.post.findFirst({
    where: { AND: [{ id: postId }, visiblePostWhere(viewerId)] },
    select: { id: true, author_id: true, audience: true },
  });
  if (!post) throw new NotFoundError('POST_NOT_FOUND', 'Post não encontrado.');
  return post;
}

export async function assertPostAudience(
  post: { author_id: string; audience?: string },
  viewerId: string | null,
  db: Pick<Prisma.TransactionClient, 'follow'> = prisma
) {
  if (post.audience !== 'followers' || post.author_id === viewerId) return;
  if (
    viewerId &&
    (await db.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: post.author_id } },
      select: { followerId: true },
    }))
  )
    return;
  throw new NotFoundError('POST_NOT_FOUND', 'Post não encontrado.');
}
