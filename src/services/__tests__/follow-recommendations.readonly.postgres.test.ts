// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getFollowRecommendations } from '../follow-recommendation.service';

describe.skipIf(process.env.STACKLYST_SOCIAL_READONLY !== '1')(
  'follow refresh on PostgreSQL, strictly read-only',
  () => {
    afterAll(async () => {
      await prisma.$disconnect();
    });
    it('returns another eligible batch while preserving self, follow and bidirectional block exclusions', async () => {
      await prisma.$transaction(
        async (tx) => {
          await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
          const viewer = await tx.user.findFirst({
            select: { id: true },
            orderBy: { created_at: 'asc' },
          });
          expect(Boolean(viewer)).toBe(true);
          if (!viewer) return;
          const first = await getFollowRecommendations(viewer.id, 3, tx);
          const next = await getFollowRecommendations(viewer.id, 3, tx, {
            exclude: first.map((profile) => profile.id),
          });
          const [following, blocks] = await Promise.all([
            tx.follow.findMany({ where: { followerId: viewer.id }, select: { followingId: true } }),
            tx.userBlock.findMany({
              where: { OR: [{ blockerId: viewer.id }, { blockedId: viewer.id }] },
              select: { blockerId: true, blockedId: true },
            }),
          ]);
          const unavailable = new Set([
            viewer.id,
            ...following.map((row) => row.followingId),
            ...blocks.flatMap((row) => [row.blockerId, row.blockedId]),
          ]);
          expect([...first, ...next].some((profile) => unavailable.has(profile.id))).toBe(false);
          const firstIds = new Set(first.map((profile) => profile.id));
          expect(next.some((profile) => firstIds.has(profile.id))).toBe(false);
          expect(JSON.stringify([...first, ...next])).not.toMatch(
            /"email"|"avatar_config"|"blockerId"|"blockedId"|"followingId"/
          );
          process.stdout.write(
            JSON.stringify({
              readonlyRecommendationCheck: 'passed',
              initialCount: first.length,
              alternativeCount: next.length,
              privateProfileFieldsExposed: false,
            }) + '\n'
          );
        },
        { timeout: 45000, maxWait: 10000 }
      );
    }, 55000);
  }
);
