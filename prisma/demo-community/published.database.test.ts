// @vitest-environment node
import dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { COMMUNITY_PROFILES, COMMUNITY_NAMESPACE } from './content';
import { planCommunity } from './publish';

describe.runIf(process.env.VERIFY_COMMUNITY_PUBLISHED === '1')(
  'Published editorial collection',
  () => {
    it('is visible through the feed service with the expected identities and reply counts', async () => {
      dotenv.config({ path: '.env.local', quiet: true });
      const { prisma } = await import('../../src/lib/prisma');
      const { PostService } = await import('../../src/services/post.service');
      const { readProfileIdentity } = await import('../../src/lib/profile-style');
      try {
        const plan = await planCommunity(prisma);
        expect(plan.newProfiles).toBe(0);
        expect(plan.existingManagedPosts).toBe(20);
        let totalAnswers = 0;
        for (const profile of COMMUNITY_PROFILES) {
          const feed = await PostService.getFeed(null, { author: profile.username, limit: 100 });
          const posts = feed.items.filter((p) => p.client_id?.startsWith(COMMUNITY_NAMESPACE));
          expect(posts.length).toBeGreaterThan(0);
          for (const post of posts) {
            const identity = readProfileIdentity(post.author.avatar_config);
            expect(identity.frame?.id).toBe(profile.frameId);
            expect(identity.nameStyle?.color).toBe(profile.color);
            expect(identity.title?.id).toBe(profile.titleId);
            expect(post.created_at.getTime()).toBeLessThan(Date.now());
            totalAnswers += post._count.answers;
          }
        }
        expect(totalAnswers).toBe(61);
      } finally {
        await prisma.$disconnect();
      }
    }, 60_000);
  }
);
