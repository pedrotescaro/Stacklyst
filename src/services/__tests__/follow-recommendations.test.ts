// @vitest-environment node
import type { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/prisma', () => ({ prisma: {} }));
import { getFollowRecommendations } from '../follow-recommendation.service';

const now = new Date('2026-11-01T12:00:00Z');
function profile(id: string, extras = {}) {
  return {
    id,
    username: id,
    avatar_url: null,
    avatar_config: {
      displayName: `Name ${id}`,
      privateSecret: 'not-public',
      profileStyle: { title: { name: 'private-title' } },
    },
    total_xp: 100,
    last_active_at: now,
    created_at: now,
    posts: [],
    trails: [],
    _count: { followers: 0 },
    ...extras,
  };
}

function fixture(profiles: ReturnType<typeof profile>[]) {
  const users = vi.fn(async (query: any) =>
    query.select.username ? profiles : profiles.map((candidate) => ({ id: candidate.id }))
  );
  const network = vi.fn(async (_query: any) => [
    { followingId: 'mutual', _count: { followingId: 1 } },
  ]);
  const db = {
    user: { findUnique: vi.fn(async () => ({ trails: [{ language: 'TS' }] })), findMany: users },
    follow: { findMany: vi.fn(async () => [{ followingId: 'friend' }]), groupBy: network },
    post: { findMany: vi.fn(async () => [{ author_id: 'interacted', language: 'TS' }]) },
  };
  return {
    db: db as unknown as Pick<Prisma.TransactionClient, 'user' | 'follow' | 'post'>,
    users,
    network,
  };
}

describe('bounded follow recommendation refresh', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  it('keeps deterministic ranking and excludes the current batch without changing privacy constraints', async () => {
    const { db, users, network } = fixture([
      profile('active'),
      profile('mutual'),
      profile('interacted'),
      profile('related', { trails: [{ language: 'TS' }] }),
      profile('viewer'),
    ]);
    const initial = await getFollowRecommendations('viewer', 3, db);
    expect(initial.map((item) => item.id)).toEqual(['mutual', 'related', 'interacted']);
    const repeat = await getFollowRecommendations('viewer', 3, db);
    expect(repeat).toEqual(initial);
    const excluded = initial.map((item) => item.id);
    const refresh = await getFollowRecommendations('viewer', 3, db, { exclude: excluded });
    expect(refresh.map((item) => item.id)).toEqual(['active']);
    expect(refresh).not.toEqual(initial);
    const finalQuery = users.mock.calls.at(-1)![0];
    const eligible = finalQuery.where.AND[0];
    expect(eligible).toMatchObject({
      AND: [
        {
          blocks_made: { none: { blockedId: 'viewer' } },
          blocks_received: { none: { blockerId: 'viewer' } },
        },
        { id: { not: 'viewer', notIn: excluded }, followers: { none: { followerId: 'viewer' } } },
      ],
    });
    expect(network.mock.calls.at(-1)![0].where.following).toEqual(eligible);
    for (const [query] of users.mock.calls.slice(-3))
      expect(JSON.stringify(query.where)).toContain('notIn');
    const serialized = JSON.stringify(refresh);
    expect(serialized).not.toMatch(
      /not-public|privateSecret|avatar_config|private-title|followingId|blockerId|blockedId/
    );
  });
  it('returns an honest empty batch when all eligible candidates are excluded, with no retry or fallback', async () => {
    const { db, users } = fixture([profile('only')]);
    expect(await getFollowRecommendations('viewer', 5, db, { exclude: ['only'] })).toEqual([]);
    // Two bounded pools plus one final lookup. No request resets exclusions.
    expect(users).toHaveBeenCalledTimes(3);
  });
  it('fails before database reads when an internal caller exceeds the bounded exclusion list', async () => {
    const { db, users } = fixture([]);
    await expect(
      getFollowRecommendations('viewer', 5, db, {
        exclude: Array.from({ length: 51 }, (_, index) => `user-${index}`),
      })
    ).rejects.toThrow();
    expect(users).not.toHaveBeenCalled();
  });
});
