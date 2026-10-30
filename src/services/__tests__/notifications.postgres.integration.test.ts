// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '../notification.service';

vi.mock('@/lib/prisma', async () => {
  const connectionString = process.env.STACKLYST_TEST_DATABASE_URL;
  if (!connectionString) return { prisma: null };
  const target = new URL(connectionString);
  if (
    target.hostname !== '127.0.0.1' ||
    target.port !== '55437' ||
    target.pathname !== '/stacklyst_quality_services'
  ) {
    throw new Error('Only the dedicated local quality database is permitted.');
  }
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  return {
    prisma: new PrismaClient({ adapter: new PrismaPg({ connectionString, ssl: false, max: 4 }) }),
  };
});

const users = [randomUUID(), randomUUID()];
const [owner, other] = users;
const ids = [randomUUID(), randomUUID(), randomUUID()];
const suffix = `notifications-${Date.now()}`;
const avatarConfig = {
  displayName: 'Pessoa de teste',
  profileStyle: {
    flags: ['BR'],
    title: { id: 'posts-1', name: 'Iniciante', color: '#64748b', rarity: 'common', icon: 'sprout' },
  },
};

describe.skipIf(!process.env.STACKLYST_TEST_DATABASE_URL)(
  'notification ownership on PostgreSQL',
  () => {
    beforeAll(async () => {
      await prisma.user.createMany({
        data: users.map((id, index) => ({
          id,
          username: `${suffix}-${index}`,
          email: `${suffix}-${index}@example.invalid`,
          avatar_config: avatarConfig,
        })),
      });
    });
    beforeEach(async () => {
      await prisma.notification.deleteMany({ where: { userId: { in: users } } });
      await prisma.notification.createMany({
        data: [
          { id: ids[0], userId: owner, actorId: other, type: 'FOLLOW' },
          { id: ids[1], userId: owner, actorId: other, type: 'MENTION', read: true },
          { id: ids[2], userId: other, actorId: owner, type: 'FOLLOW' },
        ],
      });
    });
    afterAll(async () => {
      if (prisma) {
        await prisma.user.deleteMany({ where: { id: { in: users } } });
        await prisma.$disconnect();
      }
    });

    it('returns the public actor identity and original category without changing the legacy API type', async () => {
      const result = await NotificationService.getUserNotifications(owner, undefined, 10, false);
      expect(result.items.find((item) => item.id === ids[0])).toMatchObject({
        type: 'SYSTEM',
        source_type: 'FOLLOW',
        actor: { id: other, avatar_config: avatarConfig },
      });
    });

    it('cannot delete a foreign notification and removes only the selected owned notification', async () => {
      expect(await NotificationService.deleteNotification(owner, ids[2])).toEqual({ count: 0 });
      expect(await NotificationService.deleteNotification(owner, ids[0])).toEqual({ count: 1 });
      expect(await prisma.notification.count({ where: { id: { in: ids } } })).toBe(2);
      expect(await NotificationService.deleteNotification(owner, ids[0])).toEqual({ count: 0 });
      expect(
        (await NotificationService.getUserNotifications(owner, undefined, 10, false)).items.map(
          (item) => item.id
        )
      ).toEqual([ids[1]]);
    });

    it('deletes read and unread notifications only for the owner and keeps them deleted after refresh', async () => {
      expect(await NotificationService.deleteAll(owner)).toEqual({ count: 2 });
      expect(await NotificationService.getUnreadCount(owner)).toBe(0);
      expect(
        (await NotificationService.getUserNotifications(owner, undefined, 10, false)).items
      ).toEqual([]);
      expect(await prisma.notification.count({ where: { userId: other } })).toBe(1);
    });
  }
);
