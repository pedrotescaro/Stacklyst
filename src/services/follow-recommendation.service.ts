import type { Language, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthorDisplayName } from '@/lib/profile-style';
import {
  getFollowProfileIdentity,
  scoreFollowCandidate,
  type FollowRecommendation,
} from '@/lib/follow-recommendations';
import { visibleUserWhere } from './block.service';
import { visiblePostWhere } from './post-access.service';

export async function getFollowRecommendations(
  viewerId: string,
  limit = 5,
  db: Pick<Prisma.TransactionClient, 'user' | 'follow' | 'post'> = prisma
): Promise<FollowRecommendation[]> {
  const now = Date.now();
  const visiblePosts = visiblePostWhere(viewerId);
  const eligible: Prisma.UserWhereInput = {
    AND: [
      visibleUserWhere(viewerId),
      { id: { not: viewerId }, followers: { none: { followerId: viewerId } } },
    ],
  };
  // Bounded reads: no loading the social graph or all posts into application memory.
  const [viewer, connections, interactions] = await Promise.all([
    db.user.findUnique({
      where: { id: viewerId },
      select: {
        trails: {
          where: { OR: [{ xp: { gt: 0 } }, { last_activity_at: { not: null } }] },
          select: { language: true },
          take: 9,
        },
      },
    }),
    db.follow.findMany({
      where: { followerId: viewerId, following: visibleUserWhere(viewerId) },
      select: { followingId: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
    db.post.findMany({
      where: {
        AND: [
          visiblePosts,
          {
            OR: [
              { reactions: { some: { user_id: viewerId } } },
              { votes: { some: { user_id: viewerId, value: 1 } } },
              { answers: { some: { author_id: viewerId } } },
            ],
          },
        ],
      },
      select: { author_id: true, language: true },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: 80,
    }),
  ]);
  if (!viewer) return [];
  const interestCounts = new Map<Language, number>();
  for (const trail of viewer.trails) interestCounts.set(trail.language, 3);
  const authorInteractions = new Map<string, number>();
  for (const post of interactions) {
    authorInteractions.set(post.author_id, (authorInteractions.get(post.author_id) ?? 0) + 1);
    if (post.language)
      interestCounts.set(post.language, (interestCounts.get(post.language) ?? 0) + 1);
  }
  const interests = [...interestCounts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([language]) => language);
  const orderBy: Prisma.UserOrderByWithRelationInput[] = [
    { last_active_at: { sort: 'desc', nulls: 'last' } },
    { created_at: 'desc' },
    { id: 'asc' },
  ];
  const [network, related, discovery] = await Promise.all([
    connections.length
      ? db.follow.groupBy({
          by: ['followingId'],
          where: {
            followerId: { in: connections.map((connection) => connection.followingId) },
            following: eligible,
          },
          _count: { followingId: true },
          orderBy: [{ _count: { followingId: 'desc' } }, { followingId: 'asc' }],
          take: 80,
        })
      : Promise.resolve([]),
    interests.length
      ? db.user.findMany({
          where: {
            AND: [
              eligible,
              {
                OR: [
                  {
                    trails: {
                      some: {
                        language: { in: interests },
                        OR: [{ xp: { gt: 0 } }, { last_activity_at: { not: null } }],
                      },
                    },
                  },
                  {
                    posts: {
                      some: {
                        AND: [
                          visiblePosts,
                          {
                            language: { in: interests },
                            created_at: { gte: new Date(now - 90 * 86400000) },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            ],
          },
          select: { id: true },
          orderBy,
          take: 80,
        })
      : Promise.resolve([]),
    db.user.findMany({ where: eligible, select: { id: true }, orderBy, take: 40 }),
  ]);
  const mutuals = new Map(network.map((row) => [row.followingId, row._count.followingId]));
  const candidateIds = [
    ...new Set([
      ...network.map((row) => row.followingId),
      ...related.map((row) => row.id),
      ...authorInteractions.keys(),
      ...discovery.map((row) => row.id),
    ]),
  ];
  if (!candidateIds.length) return [];
  // Reapply visibility/follow exclusions after building the candidate pool, including races.
  const candidates = await db.user.findMany({
    where: { AND: [eligible, { id: { in: candidateIds } }] },
    select: {
      id: true,
      username: true,
      avatar_url: true,
      avatar_config: true,
      total_xp: true,
      last_active_at: true,
      created_at: true,
      trails: {
        where: {
          language: { in: interests },
          OR: [{ xp: { gt: 0 } }, { last_activity_at: { not: null } }],
        },
        select: { language: true },
        take: 9,
      },
      posts: {
        where: visiblePosts,
        select: { language: true, created_at: true },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        take: 5,
      },
      _count: { select: { followers: true } },
    },
    take: 280,
  });
  return candidates
    .map((candidate) => {
      const activityAt = Math.max(
        candidate.last_active_at?.getTime() ?? 0,
        candidate.created_at.getTime(),
        candidate.posts[0]?.created_at.getTime() ?? 0
      );
      const { score, reason } = scoreFollowCandidate(
        {
          id: candidate.id,
          activityAt,
          followers: candidate._count.followers,
          mutualCount: mutuals.get(candidate.id) ?? 0,
          interactionCount: authorInteractions.get(candidate.id) ?? 0,
          languages: [
            ...new Set([
              ...candidate.trails.map((trail) => trail.language),
              ...candidate.posts.flatMap((post) => (post.language ? [post.language] : [])),
            ]),
          ],
        },
        interests,
        now
      );
      return {
        score,
        activityAt,
        profile: {
          id: candidate.id,
          username: candidate.username,
          display_name: getAuthorDisplayName(candidate).slice(0, 80),
          avatar_url: candidate.avatar_url,
          identity: getFollowProfileIdentity(candidate.avatar_config),
          total_xp: candidate.total_xp,
          reason,
        },
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score || b.activityAt - a.activityAt || a.profile.id.localeCompare(b.profile.id)
    )
    .slice(0, Math.max(1, Math.min(10, limit)))
    .map((item) => item.profile);
}
