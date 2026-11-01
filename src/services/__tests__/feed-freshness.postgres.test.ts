// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
const context = vi.hoisted(() => ({ db: null as any }));
vi.mock('@/lib/prisma', () => ({
  prisma: new Proxy({}, { get: (_target, key) => context.db?.[key] }),
}));
vi.mock('@/lib/mobile/push', () => ({ sendMobilePush: vi.fn() }));
import { PostService } from '../post.service';
let client: PrismaClient | undefined;
afterAll(async () => {
  await client?.$disconnect();
});

describe.skipIf(process.env.STACKLYST_FEED_POSTGRES !== '1')(
  'feed freshness and privacy on PostgreSQL with unconditional rollback',
  () => {
    it('surfaces new general posts, traverses ranked pages without losses, and preserves audience/block boundaries', async () => {
      const dotenv = await import('dotenv');
      dotenv.config({ path: '.env.local', quiet: true });
      const connectionString =
        process.env.STACKLYST_TEST_DATABASE_URL ||
        process.env.DATABASE_URL ||
        process.env.DIRECT_URL;
      if (!connectionString)
        throw new Error('Configure PostgreSQL for rollback-only feed verification.');
      const dns = await import('node:dns');
      dns.setDefaultResultOrder('ipv4first');
      const { PrismaClient } = await import('@prisma/client');
      const { PrismaPg } = await import('@prisma/adapter-pg');
      client = new PrismaClient({
        adapter: new PrismaPg({
          connectionString,
          max: 1,
          connectionTimeoutMillis: 10000,
          ssl: { rejectUnauthorized: false },
        }),
      });
      const ids = {
        viewer: randomUUID(),
        friend: randomUUID(),
        other: randomUUID(),
        blocked: randomUUID(),
        reverse: randomUUID(),
        private: randomUUID(),
      };
      const userIds = Object.values(ids);
      const future = new Date('2099-01-01T12:00:00Z');
      const visibleIds: string[] = Array.from({ length: 6 }, () => randomUUID());
      const hiddenIds: string[] = Array.from({ length: 3 }, () => randomUUID());
      const newId = randomUUID();
      const rollback = new Error('ROLLBACK_FEED_FIXTURES');
      await client
        .$transaction(
          async (tx) => {
            context.db = tx;
            await tx.user.createMany({
              data: userIds.map((id) => ({
                id,
                username: `feed-qa-${id}`,
                email: `feed-qa-${id}@example.invalid`,
              })),
            });
            await tx.follow.create({ data: { followerId: ids.viewer, followingId: ids.friend } });
            await tx.userBlock.createMany({
              data: [
                { blockerId: ids.viewer, blockedId: ids.blocked },
                { blockerId: ids.reverse, blockedId: ids.viewer },
              ],
            });
            await tx.post.createMany({
              data: visibleIds.map((id, index) => ({
                id,
                author_id: index % 2 ? ids.friend : ids.other,
                title: `Synthetic feed ${index}`,
                body: 'Synthetic rollback-only feed content.',
                language: index === 2 ? ('TS' as const) : index === 3 ? ('PYTHON' as const) : null,
                audience: index === 1 ? 'followers' : 'everyone',
                created_at: new Date(future.getTime() - index * 1000),
              })),
            });
            await tx.post.createMany({
              data: hiddenIds.map((id, index) => ({
                id,
                author_id: [ids.blocked, ids.reverse, ids.private][index],
                title: 'Hidden fixture',
                body: 'Should never appear.',
                audience: index === 2 ? 'followers' : 'everyone',
                created_at: new Date(future.getTime() + 1000),
              })),
            });
            const first = await PostService.getFeed(ids.viewer, { languages: ['TS'], limit: 3 });
            const second = await PostService.getFeed(ids.viewer, {
              languages: ['TS'],
              limit: 3,
              cursor: first.nextCursor!,
            });
            const traversed = [...first.items, ...second.items].map((post) => post.id);
            expect(new Set(traversed)).toEqual(new Set(visibleIds));
            expect(traversed).toHaveLength(6);
            expect(first.items[0].id).toBe(visibleIds[0]);
            await tx.post.create({
              data: {
                id: newId,
                author_id: ids.other,
                title: 'New general post',
                body: 'No language set, published after the previous snapshot.',
                created_at: new Date(future.getTime() + 2000),
              },
            });
            expect(
              await PostService.countNewer(ids.viewer, { after: future, languages: ['TS'] })
            ).toBe(1);
            const refreshed = await PostService.getFeed(ids.viewer, {
              languages: ['TS'],
              limit: 3,
            });
            expect(refreshed.items[0].id).toBe(newId);
            expect(
              refreshed.items.map((post) => post.id).some((id) => hiddenIds.includes(id))
            ).toBe(false);
            const following = await PostService.getFeed(ids.viewer, {
              filter: 'following',
              languages: ['TS'],
              limit: 3,
            });
            expect(following.items.every((post) => post.author_id === ids.friend)).toBe(true);
            expect(following.items.map((post) => post.id)).toContain(visibleIds[1]);
            throw rollback;
          },
          { maxWait: 20000, timeout: 60000 }
        )
        .catch((error) => {
          if (error !== rollback) throw error;
        });
      context.db = null;
      expect(await client.user.count({ where: { id: { in: userIds } } })).toBe(0);
      expect(
        await client.post.count({ where: { id: { in: [...visibleIds, ...hiddenIds, newId] } } })
      ).toBe(0);
    }, 75000);
  }
);
