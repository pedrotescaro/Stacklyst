// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
const context = vi.hoisted(() => ({ db: null as any, userId: '' }));
vi.mock('@/lib/prisma', () => ({
  prisma: new Proxy({}, { get: (_target, key) => context.db?.[key] }),
}));
vi.mock('@/lib/auth', () => ({
  getAuthUser: async () => ({ id: context.userId }),
  requireAuth: async () => ({ id: context.userId }),
}));
import { GET, POST } from './route';
let client: PrismaClient | undefined;
afterAll(async () => {
  await client?.$disconnect();
});

describe.skipIf(process.env.STACKLYST_BOOKMARK_POSTGRES !== '1')(
  'bookmark API on real PostgreSQL with unconditional rollback',
  () => {
    it('reproduces the double-toggle loss and persists explicit saves across fresh reads', async () => {
      const dotenv = await import('dotenv');
      dotenv.config({ path: '.env.local', quiet: true });
      const dns = await import('node:dns');
      dns.setDefaultResultOrder('ipv4first');
      const { PrismaClient } = await import('@prisma/client');
      const { PrismaPg } = await import('@prisma/adapter-pg');
      client = new PrismaClient({
        adapter: new PrismaPg({
          connectionString:
            process.env.STACKLYST_TEST_DATABASE_URL ||
            process.env.DATABASE_URL ||
            process.env.DIRECT_URL,
          max: 1,
          connectionTimeoutMillis: 10000,
          ssl: { rejectUnauthorized: false },
        }),
      });
      const viewer = randomUUID(),
        author = randomUUID(),
        postId = randomUUID();
      const rollback = new Error('ROLLBACK_BOOKMARK_FIXTURE');
      await client
        .$transaction(
          async (tx) => {
            context.db = tx;
            context.userId = viewer;
            await tx.user.createMany({
              data: [viewer, author].map((id) => ({
                id,
                username: `bookmark-qa-${id}`,
                email: `bookmark-qa-${id}@example.invalid`,
              })),
            });
            await tx.post.create({
              data: {
                id: postId,
                author_id: author,
                title: 'Rollback-only bookmark check',
                body: 'Synthetic content.',
              },
            });
            const params = { params: Promise.resolve({ id: postId }) };
            const write = (body?: unknown) =>
              POST(
                new Request(`https://stacklyst.test/api/posts/${postId}/bookmark`, {
                  method: 'POST',
                  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
                }),
                params
              );
            // The old feed issued two empty POSTs for one click: the save was undone.
            expect((await write()).status).toBe(200);
            expect((await write()).status).toBe(200);
            expect(await tx.bookmark.count({ where: { user_id: viewer, post_id: postId } })).toBe(
              0
            );
            // Retries now express the desired state and cannot silently remove it.
            expect((await write({ bookmarked: true })).status).toBe(200);
            expect((await write({ bookmarked: true })).status).toBe(200);
            expect(await tx.bookmark.count({ where: { user_id: viewer, post_id: postId } })).toBe(
              1
            );
            const fresh = await GET(
              new Request(`https://stacklyst.test/api/posts/${postId}/bookmark`),
              params
            );
            expect(await fresh.json()).toEqual({ bookmarked: true });
            const collection = await tx.bookmark.findMany({
              where: { user_id: viewer },
              include: { post: true },
            });
            expect(collection.map((bookmark) => bookmark.post.id)).toEqual([postId]);
            context.userId = author;
            expect(
              await (
                await GET(
                  new Request(`https://stacklyst.test/api/posts/${postId}/bookmark`),
                  params
                )
              ).json()
            ).toEqual({ bookmarked: false });
            context.userId = viewer;
            expect((await write({ bookmarked: false })).status).toBe(200);
            expect((await write({ bookmarked: false })).status).toBe(200);
            expect(await tx.bookmark.count({ where: { post_id: postId } })).toBe(0);
            throw rollback;
          },
          { timeout: 30000 }
        )
        .catch((error) => {
          if (error !== rollback) throw error;
        });
      expect(await client.user.count({ where: { id: { in: [viewer, author] } } })).toBe(0);
      expect(await client.post.count({ where: { id: postId } })).toBe(0);
    }, 60000);
  }
);
