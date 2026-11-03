// @vitest-environment node
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { COMMUNITY_PROFILES, COMMUNITY_THREADS, COMMUNITY_NAMESPACE } from './content';
import { planCommunity, publishCommunity, communityId } from './publish';

describe.runIf(process.env.RUN_COMMUNITY_DB_TEST === '1')(
  'Editorial publisher on PostgreSQL',
  () => {
    it('repeats without duplicating posts or replies and rolls the rehearsal back', async () => {
      dotenv.config({ path: '.env.local', quiet: true });
      const { prisma } = await import('../../src/lib/prisma');
      const rollback = new Error('EDITORIAL_REHEARSAL_ROLLBACK');
      try {
        await expect(
          prisma.$transaction(
            async (tx) => {
              const scoped = new Proxy({} as PrismaClient, {
                get: (_, key) =>
                  key === '$transaction'
                    ? (work: (db: typeof tx) => unknown) => work(tx)
                    : Reflect.get(tx, key),
              });
              const initial = await planCommunity(scoped);
              const ids = Object.fromEntries(
                COMMUNITY_PROFILES.map((p) => [
                  p.username,
                  initial.users.find((u) => u.username === p.username)?.id ?? randomUUID(),
                ])
              );
              const before = await tx.post.count({
                where: { author_id: { notIn: Object.values(ids) } },
              });
              const first = await publishCommunity(scoped, ids);
              const created = await tx.post.findMany({
                where: { client_id: { startsWith: COMMUNITY_NAMESPACE } },
                select: { id: true, created_at: true },
              });
              const second = await publishCommunity(scoped, ids);
              expect(second).toEqual(first);
              expect(
                await tx.post.count({ where: { author_id: { notIn: Object.values(ids) } } })
              ).toBe(before);
              expect(
                await tx.post.findMany({
                  where: { client_id: { startsWith: COMMUNITY_NAMESPACE } },
                  select: { id: true, created_at: true },
                  orderBy: { id: 'asc' },
                })
              ).toEqual(created.sort((a, b) => a.id.localeCompare(b.id)));
              expect(
                await tx.answer.count({ where: { post_id: { in: created.map((p) => p.id) } } })
              ).toBe(first.answers);
              for (const thread of COMMUNITY_THREADS) {
                const postId = communityId('post', `${ids[thread.author]}:${thread.key}`);
                const answers = await tx.answer.findMany({
                  where: {
                    post_id: postId,
                    author_id: ids[thread.author],
                    body: { startsWith: '(' },
                  },
                  orderBy: { created_at: 'asc' },
                });
                expect(answers).toHaveLength(thread.parts.length - 1);
                answers.forEach((answer, i) =>
                  expect(answer.parent_id).toBe(i ? answers[i - 1].id : null)
                );
              }
              throw rollback;
            },
            { timeout: 180_000, maxWait: 15_000 }
          )
        ).rejects.toBe(rollback);
      } finally {
        await prisma.$disconnect();
      }
    }, 200_000);
  }
);
