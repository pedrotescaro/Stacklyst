// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { BlockService, visibleUserWhere } from '../block.service';
import { PostService } from '../post.service';
import { SearchService } from '../search.service';

vi.mock('@/lib/prisma', async () => {
  const connectionString = process.env.STACKLYST_TEST_DATABASE_URL;
  if (!connectionString) return { prisma: null };
  const destination = new URL(connectionString);
  if (
    destination.hostname !== '127.0.0.1' ||
    destination.port !== '55437' ||
    destination.pathname !== '/stacklyst_quality_services'
  )
    throw new Error('Blocking tests require the dedicated local quality database.');
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  return {
    prisma: new PrismaClient({ adapter: new PrismaPg({ connectionString, ssl: false, max: 4 }) }),
  };
});
vi.mock('@/lib/mobile/push', () => ({ sendMobilePush: vi.fn() }));

const ids = [randomUUID(), randomUUID(), randomUUID()];
const [me, other, third] = ids;
const suffix = `block-${Date.now()}`;
let postId: string;

describe.skipIf(!process.env.STACKLYST_TEST_DATABASE_URL)('blocking with PostgreSQL', () => {
  beforeAll(async () => {
    await prisma.user.createMany({
      data: ids.map((id, i) => ({
        id,
        username: `${suffix}-${i}`,
        email: `${suffix}-${i}@example.invalid`,
      })),
    });
    const post = await prisma.post.create({
      data: { author_id: other, title: suffix, body: 'programming database blocksearch' },
    });
    postId = post.id;
    await prisma.follow.createMany({
      data: [
        { followerId: me, followingId: other },
        { followerId: other, followingId: me },
      ],
    });
    await prisma.notification.create({ data: { userId: me, actorId: other, type: 'FOLLOW' } });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
      await prisma.$disconnect();
    }
  });

  it('persists an idempotent block, removes social links and enforces both directions', async () => {
    await BlockService.block(me, other);
    await BlockService.block(me, other);
    expect(await prisma.userBlock.count({ where: { blockerId: me, blockedId: other } })).toBe(1);
    expect(
      await prisma.follow.count({
        where: { followerId: { in: [me, other] }, followingId: { in: [me, other] } },
      })
    ).toBe(0);
    expect(await prisma.notification.count({ where: { userId: me, actorId: other } })).toBe(0);
    await expect(BlockService.assertCanInteract(me, other)).rejects.toMatchObject({
      code: 'USER_BLOCKED',
    });
    await expect(BlockService.assertCanInteract(other, me)).rejects.toMatchObject({
      code: 'USER_BLOCKED',
    });
    await expect(BlockService.assertCanInteract(me, third)).resolves.toBeUndefined();
  });

  it('filters before pagination in feed and full-text search without hiding content from unrelated users', async () => {
    expect((await PostService.getFeed(me, { author: `${suffix}-1`, limit: 1 })).items).toEqual([]);
    expect(
      (await PostService.getFeed(third, { author: `${suffix}-1`, limit: 1 })).items[0].id
    ).toBe(postId);
    expect(
      (await SearchService.searchPosts('blocksearch', undefined, 1, me)).items.some(
        (post) => post.id === postId
      )
    ).toBe(false);
    expect(
      (await SearchService.searchPosts('blocksearch', undefined, 10, third)).items.some(
        (post) => post.id === postId
      )
    ).toBe(true);
    expect(await prisma.user.count({ where: { id: other, ...visibleUserWhere(me) } })).toBe(0);
    expect(await prisma.user.count({ where: { id: me, ...visibleUserWhere(other) } })).toBe(0);
  });

  it('keeps the other account’s block when one account unblocks and never restores follows', async () => {
    await BlockService.block(other, me);
    await BlockService.unblock(me, other);
    expect(await BlockService.list(me)).toEqual([]);
    expect(await BlockService.hasBlock(me, other)).toBe(true);
    await BlockService.unblock(other, me);
    expect(await BlockService.hasBlock(me, other)).toBe(false);
    expect((await PostService.getFeed(me, { author: `${suffix}-1` })).items[0].id).toBe(postId);
    expect(await prisma.follow.count({ where: { followerId: me, followingId: other } })).toBe(0);
  });
});
