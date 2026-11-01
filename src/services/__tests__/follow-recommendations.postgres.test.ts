// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
const context = vi.hoisted(() => ({ db: null as any }));
vi.mock('@/lib/prisma', () => ({
  prisma: new Proxy({}, { get: (_target, key) => context.db?.[key] }),
}));
vi.mock('@/services/profile-customization.service', () => ({
  syncProfileAchievementsSafely: vi.fn().mockResolvedValue(undefined),
}));
import { getFollowRecommendations } from '../follow-recommendation.service';
import { FollowService } from '../follow.service';
let client: PrismaClient | undefined;
afterAll(async () => {
  await client?.$disconnect();
});

describe.skipIf(process.env.STACKLYST_SOCIAL_POSTGRES !== '1')(
  'Profile recommendations on PostgreSQL, always rolled back',
  () => {
    it('uses real connections/interests/interactions while excluding follows and blocks, without leaking private content', async () => {
      const dotenv = await import('dotenv');
      dotenv.config({ path: '.env.local', quiet: true });
      const connectionString =
        process.env.STACKLYST_TEST_DATABASE_URL ||
        process.env.DATABASE_URL ||
        process.env.DIRECT_URL;
      if (!connectionString)
        throw new Error('Configure PostgreSQL for rollback-only social checks.');
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
      const ids = Object.fromEntries(
        [
          'me',
          'friend',
          'mutual',
          'language',
          'interacted',
          'blocked',
          'blockedBy',
          'already',
          'privateOnly',
        ].map((key) => [key, randomUUID()])
      );
      const userIds = Object.values(ids);
      const rollback = new Error('ROLLBACK_SOCIAL_RECOMMENDATION_FIXTURES');
      let completed = false;
      await expect(
        client.$transaction(
          async (tx) => {
            await tx.user.createMany({
              data: userIds.map((id) => ({
                id,
                username: `follow-qa-${id}`,
                email: `follow-qa-${id}@example.invalid`,
                last_active_at: new Date(),
                avatar_config: {
                  displayName: 'Nome público de teste',
                  privateSecret: 'never-return-this',
                  profileStyle: {
                    frame: { id: 'frame-neon', decoration: 'neon', color: '#0083fe' },
                    flags: ['BR', 'pride-trans'],
                    title: { name: 'private-title-hidden' },
                  },
                },
              })),
            });
            await tx.languageTrail.createMany({
              data: [
                { user_id: ids.me, language: 'TS', xp: 100 },
                { user_id: ids.language, language: 'TS', xp: 200 },
              ],
            });
            await tx.follow.createMany({
              data: [
                { followerId: ids.me, followingId: ids.friend },
                { followerId: ids.me, followingId: ids.already },
                { followerId: ids.friend, followingId: ids.mutual },
              ],
            });
            await tx.userBlock.createMany({
              data: [
                { blockerId: ids.me, blockedId: ids.blocked },
                { blockerId: ids.blockedBy, blockedId: ids.me },
              ],
            });
            const publicPost = await tx.post.create({
              data: {
                author_id: ids.interacted,
                title: 'Teste público de recomendação',
                body: 'Conteúdo sintético para verificar interesse em programação.',
                language: 'JAVA',
              },
            });
            await tx.reaction.create({
              data: { post_id: publicPost.id, user_id: ids.me, type: 'HEART' },
            });
            await tx.post.create({
              data: {
                author_id: ids.privateOnly,
                title: 'Texto restrito',
                body: 'Este conteúdo privado não deve orientar uma sugestão visível.',
                language: 'TS',
                audience: 'followers',
              },
            });
            const recommendations = await getFollowRecommendations(ids.me, 10, tx);
            const recommendedIds = recommendations.map((profile) => profile.id);
            for (const id of [ids.me, ids.friend, ids.already, ids.blocked, ids.blockedBy])
              expect(recommendedIds).not.toContain(id);
            expect(recommendations.find((profile) => profile.id === ids.mutual)?.reason).toEqual({
              type: 'mutual',
              count: 1,
            });
            expect(recommendations.find((profile) => profile.id === ids.language)?.reason).toEqual({
              type: 'language',
              language: 'TS',
            });
            expect(
              recommendations.find((profile) => profile.id === ids.interacted)?.reason
            ).toEqual({ type: 'interaction' });
            expect(
              recommendations.find((profile) => profile.id === ids.privateOnly)?.reason.type
            ).not.toBe('language');
            const serialized = JSON.stringify(recommendations);
            expect(serialized).not.toContain('never-return-this');
            expect(serialized).not.toContain('avatar_config');
            expect(serialized).not.toContain('@example.invalid');
            expect(serialized).not.toContain('private-title-hidden');
            expect(
              recommendations.find((profile) => profile.id === ids.language)?.identity
            ).toEqual({
              frame: { id: 'frame-neon', decoration: 'neon', color: '#0083fe' },
              flags: ['BR', 'pride-trans'],
            });
            context.db = {
              $transaction: (callback: (transaction: typeof tx) => unknown) => callback(tx),
            };
            // Idempotent follow must not undo a previous relationship or duplicate activity.
            await expect(FollowService.toggleFollow(ids.me, ids.already, true)).resolves.toEqual({
              following: true,
            });
            await expect(FollowService.toggleFollow(ids.me, ids.interacted, true)).resolves.toEqual(
              { following: true }
            );
            await expect(FollowService.toggleFollow(ids.me, ids.interacted, true)).resolves.toEqual(
              { following: true }
            );
            expect(
              await tx.notification.count({
                where: { actorId: ids.me, userId: ids.interacted, type: 'FOLLOW' },
              })
            ).toBe(1);
            expect(
              (await getFollowRecommendations(ids.me, 10, tx)).map((profile) => profile.id)
            ).not.toContain(ids.interacted);
            await expect(
              FollowService.toggleFollow(ids.me, ids.blockedBy, true)
            ).rejects.toMatchObject({ code: 'USER_BLOCKED' });
            completed = true;
            throw rollback;
          },
          { timeout: 45000, maxWait: 15000 }
        )
      ).rejects.toThrow(rollback.message);
      expect(completed).toBe(true);
      expect(await client.user.count({ where: { id: { in: userIds } } })).toBe(0);
      expect(
        await client.notification.count({
          where: { OR: [{ userId: { in: userIds } }, { actorId: { in: userIds } }] },
        })
      ).toBe(0);
    }, 60000);
  }
);
