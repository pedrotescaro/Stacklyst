// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getProfileActivity, getProfilePublicationCounts } from '../profile-activity.service';

vi.mock('@/lib/prisma', async () => {
  const connectionString = process.env.STACKLYST_TEST_DATABASE_URL;
  if (!connectionString) return { prisma: null };
  const target = new URL(connectionString);
  if (
    target.hostname !== '127.0.0.1' ||
    target.port !== '55437' ||
    target.pathname !== '/stacklyst_quality_services'
  )
    throw new Error('Only the dedicated local quality database is permitted.');
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  return {
    prisma: new PrismaClient({ adapter: new PrismaPg({ connectionString, ssl: false, max: 4 }) }),
  };
});

const users = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
const [owner, rootAuthor, viewer, parentAuthor] = users;
const suffix = `activity-${Date.now()}`;
const postIds = [randomUUID(), randomUUID(), randomUUID()];
const answerIds = [postIds[0], randomUUID(), randomUUID(), randomUUID()];
const date = new Date('2026-10-29T12:00:00Z');
const name = `${suffix}-0`;

describe.skipIf(!process.env.STACKLYST_TEST_DATABASE_URL)(
  'mixed profile activity on PostgreSQL',
  () => {
    beforeAll(async () => {
      await prisma.user.createMany({
        data: users.map((id, index) => ({
          id,
          username: `${suffix}-${index}`,
          email: `${suffix}-${index}@example.invalid`,
        })),
      });
      await prisma.post.createMany({
        data: postIds.map((id, index) => ({
          id,
          author_id: index === 2 ? rootAuthor : owner,
          title: `${suffix}-${index}`,
          body:
            index === 2 ? 'Original context for all responses' : 'Original authored publication',
          created_at: date,
        })),
      });
      await prisma.answer.create({
        data: {
          id: answerIds[3],
          post_id: postIds[2],
          author_id: parentAuthor,
          body: 'Immediate parent context',
          created_at: date,
        },
      });
      await prisma.answer.createMany({
        data: answerIds.slice(0, 3).map((id, index) => ({
          id,
          post_id: postIds[2],
          author_id: owner,
          parent_id: index === 2 ? answerIds[3] : null,
          body: `Featured reply ${index}`,
          code_snippet: index === 1 ? 'needle_reply' : null,
          created_at: index === 0 ? new Date(date.getTime() + 1000) : date,
        })),
      });
      await prisma.postVote.create({ data: { user_id: viewer, post_id: postIds[0], value: 1 } });
      await prisma.answerVote.create({
        data: { user_id: viewer, answer_id: answerIds[1], value: 1 },
      });
    });
    afterAll(async () => {
      if (prisma) {
        await prisma.user.deleteMany({ where: { id: { in: users } } });
        await prisma.$disconnect();
      }
    });

    it('counts original posts and all replies as five publications', async () => {
      expect(await getProfilePublicationCounts(viewer, owner)).toEqual({
        posts: 2,
        replies: 3,
        total: 5,
      });
    });

    it('paginates equal dates and colliding post/reply ids without duplicates or missing entries', async () => {
      const keys: string[] = [];
      let cursor: string | undefined;
      for (let index = 0; index < 10; index++) {
        const result = await getProfileActivity(viewer, name, { limit: 1, cursor });
        keys.push(...result.items.map((item) => `${item.kind}:${item.id}`));
        if (!result.nextCursor) break;
        cursor = result.nextCursor;
      }
      expect(keys).toHaveLength(5);
      expect(new Set(keys).size).toBe(5);
      expect(keys[0]).toBe(`reply:${answerIds[0]}`);
      expect(keys).toContain(`post:${postIds[0]}`);
      expect(keys).toContain(`reply:${postIds[0]}`);
    });

    it('returns liked replies with context instead of pretending the root was liked', async () => {
      const result = await getProfileActivity(viewer, `${suffix}-2`, { tab: 'likes' });
      expect(result.items.map((item) => `${item.kind}:${item.id}`)).toEqual(
        [`reply:${answerIds[1]}`, `post:${postIds[0]}`].sort((a, b) => (a < b ? 1 : -1))
      );
      const likedReply = result.items.find((item) => item.kind === 'reply');
      expect(likedReply).toHaveProperty('post.id', postIds[2]);
      expect(likedReply).toHaveProperty('votes.0.value', 1);
    });

    it('searches old reply code and preserves full root and immediate-parent context', async () => {
      const search = await getProfileActivity(viewer, name, { search: 'needle_reply' });
      expect(search.items.map((item) => item.id)).toEqual([answerIds[1]]);
      const result = await getProfileActivity(viewer, name);
      expect(result.items.find((item) => item.id === answerIds[2])).toMatchObject({
        post: { id: postIds[2] },
        parent: { id: answerIds[3], author: { id: parentAuthor } },
      });
    });

    it('filters blocked immediate parents and roots before pagination and counting', async () => {
      await prisma.userBlock.create({ data: { blockerId: viewer, blockedId: parentAuthor } });
      expect((await getProfilePublicationCounts(viewer, owner)).total).toBe(4);
      await prisma.userBlock.deleteMany({ where: { blockerId: viewer } });
      await prisma.userBlock.create({ data: { blockerId: rootAuthor, blockedId: viewer } });
      const result = await getProfileActivity(viewer, name, { limit: 1 });
      expect(result.items[0].kind).toBe('post');
      expect((await getProfilePublicationCounts(viewer, owner)).total).toBe(2);
      await prisma.userBlock.deleteMany({ where: { blockerId: rootAuthor } });
    });
  }
);
