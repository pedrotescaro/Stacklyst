// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DEFAULT_PROFILE_CATALOG, DEFAULT_PROFILE_PREFERENCES } from '@/lib/profile-customization';
import { LEARNING_COURSES } from '@/lib/learning/catalog';
import { bumpProfileVersion } from '@/lib/profile-version';
import {
  getProfileCustomization,
  getPublicProfileCustomization,
  profileActivityMetrics,
  reconcileProfileAchievements,
  saveProfileCatalog,
  saveProfileCustomization,
} from '../profile-customization.service';

vi.mock('@/lib/prisma', async () => {
  const connectionString = process.env.STACKLYST_TEST_DATABASE_URL;
  if (!connectionString) return { prisma: null };
  const destination = new URL(connectionString);
  if (
    destination.hostname !== '127.0.0.1' ||
    destination.port !== '55437' ||
    destination.pathname !== '/stacklyst_quality_services'
  )
    throw new Error('Profile tests require the dedicated local quality database.');
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  return {
    prisma: new PrismaClient({ adapter: new PrismaPg({ connectionString, ssl: false, max: 8 }) }),
  };
});

const suffix = `profile-quality-${Date.now()}`;
const owner = `${suffix}-owner`,
  visitor = `${suffix}-visitor`,
  young = `${suffix}-young`;
const helpers = Array.from({ length: 5 }, (_, index) => `${suffix}-helper-${index}`);
const userIds = [owner, visitor, young, ...helpers];
const now = new Date();
let previousCatalog: Awaited<ReturnType<typeof prisma.profileAchievementCatalog.findUnique>>;
const preferences = () => structuredClone(DEFAULT_PROFILE_PREFERENCES);
const ownedPhoto = `https://quality.supabase.co/storage/v1/object/public/uploads/${owner}/12345678-1234-1234-1234-123456789abc.png`;
let validPostId: string;
let exerciseId: string;
const addedQuizIds: string[] = [];

describe.skipIf(!process.env.STACKLYST_TEST_DATABASE_URL)(
  'profile customization with PostgreSQL',
  () => {
    beforeAll(async () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://quality.supabase.co');
      previousCatalog = await prisma.profileAchievementCatalog.findUnique({
        where: { id: 'profile-catalog' },
      });
      const catalog = structuredClone(DEFAULT_PROFILE_CATALOG);
      catalog.events = catalog.events.map((event) => ({
        ...event,
        enabled: event.id === 'halloween-2026',
        startsAt: new Date(now.getTime() - 3600000).toISOString(),
        endsAt: new Date(now.getTime() + 3600000).toISOString(),
      }));
      await saveProfileCatalog(catalog, previousCatalog?.version || 0);
      await prisma.user.createMany({
        data: userIds.map((id) => ({
          id,
          username: id,
          email: `${id}@example.invalid`,
          created_at: id === young ? now : new Date(now.getTime() - 7 * 86400000),
        })),
      });
      for (let i = 0; i < 22; i++) {
        const post = await prisma.post.create({
          data: {
            author_id: owner,
            title: `Useful content ${i}`,
            body: `Useful and unique technical explanation number ${i}. ${i === 0 ? '#Halloween' : '#HalloweenExtra'}`,
            created_at: now,
          },
        });
        if (i === 0) validPostId = post.id;
        await prisma.postVote.create({
          data: { post_id: post.id, user_id: visitor, value: 1, created_at: now },
        });
      }
      const firstPost = await prisma.post.findUniqueOrThrow({ where: { id: validPostId } });
      await prisma.post.create({
        data: {
          author_id: owner,
          title: firstPost.title.toUpperCase(),
          body: firstPost.body.toUpperCase(),
          created_at: now,
        },
      });
      await prisma.post.create({
        data: { author_id: owner, title: 'Short', body: 'invalid', created_at: now },
      });
      await prisma.postVote.create({
        data: { post_id: validPostId, user_id: young, value: 1, created_at: now },
      });
      await prisma.postVote.create({
        data: { post_id: validPostId, user_id: owner, value: 1, created_at: now },
      });
      await prisma.follow.createMany({
        data: [
          { followerId: visitor, followingId: owner, createdAt: now },
          { followerId: young, followingId: owner, createdAt: now },
        ],
      });
      for (const [index, author_id] of helpers.entries()) {
        const post = await prisma.post.create({
          data: {
            author_id,
            title: `Event discussion ${index}`,
            body: `A detailed example for the Halloween community number ${index}. #Halloween`,
            created_at: now,
          },
        });
        await prisma.answer.create({
          data: {
            author_id: owner,
            post_id: post.id,
            body: `A unique helpful explanation for participant number ${index}.`,
            created_at: now,
          },
        });
        await prisma.answer.create({
          data: {
            author_id: owner,
            post_id: post.id,
            body: 'Repeated promotional comment everywhere.',
            created_at: now,
          },
        });
      }
      await prisma.answer.create({
        data: {
          author_id: owner,
          post_id: validPostId,
          body: 'My own reply must not count as helping other users.',
          created_at: now,
        },
      });
      const node = await prisma.knowledgeNode.create({
        data: {
          slug: suffix,
          title: 'Quality node',
          description: 'Quality node',
          type: 'CONCEPT',
          category: 'test',
          difficulty: 1,
          xp_reward: 1,
          position_x: 0,
          position_y: 0,
        },
      });
      const exercise = await prisma.exercise.create({
        data: {
          slug: suffix,
          knowledge_node_id: node.id,
          title: 'Quality exercise',
          summary: 'Quality',
          problem: 'Test',
          objective: 'Test',
          language: 'PYTHON',
          difficulty: 1,
          base_xp: 1,
          starter_code: '',
          function_name: 'test',
          constraints: [],
          hints: [],
        },
      });
      exerciseId = exercise.id;
      for (const status of ['FAILED', 'ERROR'] as const)
        await prisma.exerciseSubmission.create({
          data: {
            exercise_id: exerciseId,
            user_id: owner,
            assistance_mode: 'STANDARD',
            status,
            code: '',
            passed_public: 0,
            total_public: 1,
            passed_hidden: 0,
            total_hidden: 1,
          },
        });
    }, 30000);
    afterAll(async () => {
      if (previousCatalog)
        await prisma.profileAchievementCatalog.upsert({
          where: { id: 'profile-catalog' },
          create: { ...previousCatalog, value: previousCatalog.value ?? Prisma.JsonNull },
          update: {
            value: previousCatalog.value ?? Prisma.JsonNull,
            version: previousCatalog.version,
          },
        });
      else await prisma.profileAchievementCatalog.deleteMany({ where: { id: 'profile-catalog' } });
      await prisma.knowledgeNode.deleteMany({ where: { slug: suffix } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      if (addedQuizIds.length)
        await prisma.quiz.deleteMany({ where: { id: { in: addedQuizIds } } });
      await prisma.$disconnect();
      vi.unstubAllEnvs();
    });
    it('deduplicates content, caps daily spam and excludes self/fresh-account interactions', async () => {
      const metrics = await prisma.$transaction((tx) => profileActivityMetrics(tx, owner));
      expect(metrics).toMatchObject({
        posts: 5,
        comments: 6,
        peopleHelped: 5,
        likes: 20,
        followers: 1,
        learningActivities: 0,
      });
    });
    it('does not turn the same copied response into help for five people', async () => {
      const posts = await prisma.post.findMany({
        where: { author_id: { in: helpers } },
        select: { id: true },
      });
      await prisma.answer.createMany({
        data: posts.map((post) => ({
          author_id: visitor,
          post_id: post.id,
          body: 'One copied response repeated to many people.',
          created_at: now,
        })),
      });
      const metrics = await prisma.$transaction((tx) => profileActivityMetrics(tx, visitor));
      expect(metrics).toMatchObject({ comments: 1, peopleHelped: 1 });
      await prisma.answer.deleteMany({ where: { author_id: visitor } });
    });
    it('records bounded local metrics-query performance with real database reads', async () => {
      const durations: number[] = [];
      for (let i = 0; i < 25; i++) {
        const started = performance.now();
        await prisma.$transaction((tx) => profileActivityMetrics(tx, owner));
        durations.push(performance.now() - started);
      }
      durations.sort((first, second) => first - second);
      const report = {
        environment: 'PostgreSQL17 localhost Docker; warm process; includes transaction roundtrip',
        fixtures: {
          accounts: userIds.length,
          posts: await prisma.post.count({ where: { author_id: { in: userIds } } }),
          comments: await prisma.answer.count({ where: { author_id: { in: userIds } } }),
          votes: await prisma.postVote.count({ where: { user_id: { in: userIds } } }),
        },
        samples: durations.length,
        medianMs: durations[12],
        p95Ms: durations[23],
        maxMs: durations[24],
        note: 'Small deterministic fixture, not production-load or field-performance evidence.',
      };
      await mkdir('artifacts/profile', { recursive: true });
      await writeFile(
        'artifacts/profile/achievement-metrics-performance.json',
        JSON.stringify(report, null, 2) + '\n'
      );
      expect(report.p95Ms).toBeLessThan(2500);
    });
    it('awards season titles only for exact hashtags and valid unique event participation, once under concurrency', async () => {
      await Promise.all([reconcileProfileAchievements(owner), reconcileProfileAchievements(owner)]);
      const awards = await prisma.userProfileAchievement.findMany({ where: { userId: owner } });
      expect(awards.filter((award) => award.achievementId.startsWith('halloween'))).toHaveLength(3);
      expect(awards.some((award) => award.achievementId === 'learning-first')).toBe(false);
      for (const award of awards)
        expect(
          await prisma.notification.count({
            where: {
              userId: owner,
              resourceType: 'PROFILE_ACHIEVEMENT',
              resourceId: award.achievementId,
            },
          })
        ).toBe(1);
      const visitorState = await getProfileCustomization(visitor);
      expect(
        visitorState.achievements.find((award) => award.id === 'halloween-spirit')?.unlocked
      ).toBe(false);
    });
    it('claims the toast once across sessions while ordinary reads leave it pending', async () => {
      expect((await getProfileCustomization(owner)).newUnlocks).toEqual([]);
      expect(
        await prisma.userProfileAchievement.count({ where: { userId: owner, announcedAt: null } })
      ).toBeGreaterThan(0);
      const sessions = await Promise.all([
        getProfileCustomization(owner, { claimUnlocks: true }),
        getProfileCustomization(owner, { claimUnlocks: true }),
      ]);
      expect(sessions.filter((state) => state.newUnlocks.length)).toHaveLength(1);
    });
    it('persists photo, frame, title and profile preferences atomically, while refusing a stale session', async () => {
      const first = {
        ...preferences(),
        tags: ['React', 'python'],
        flag: 'BR',
        frameId: 'halloween',
        equippedTitleId: 'halloween-spirit',
        featuredAchievementIds: ['halloween-spirit'],
      };
      const outcomes = await Promise.allSettled([
        saveProfileCustomization(owner, {
          version: 0,
          preferences: first,
          avatarUrl: ownedPhoto,
          chat: {
            mode: 'dark',
            bubbleColor: '#0083fe',
            accentColor: null,
            backgroundColor: '#101010',
          },
        }),
        saveProfileCustomization(owner, { version: 0, preferences: first, avatarUrl: ownedPhoto }),
      ]);
      expect(outcomes.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
      expect(
        (outcomes.find((entry) => entry.status === 'rejected') as PromiseRejectedResult).reason.code
      ).toBe('PROFILE_VERSION_CONFLICT');
      const saved = await getProfileCustomization(owner);
      expect(saved.avatarUrl).toBe(ownedPhoto);
      expect(saved.preferences.tags).toEqual(['react', 'python']);
      const user = await prisma.user.findUniqueOrThrow({ where: { id: owner } });
      expect(user.avatar_config).toMatchObject({
        profileStyle: { frame: { id: 'halloween' }, title: { id: 'halloween-spirit' }, flag: 'BR' },
      });
      const other = await getProfileCustomization(visitor);
      expect(other.avatarUrl).toBeNull();
      expect(other.preferences.tags).toEqual([]);
      expect(await getPublicProfileCustomization(owner)).not.toHaveProperty('chat');
    });
    it('rejects unearned titles, frames, featured achievements and images owned by another account without partial changes', async () => {
      const state = await getProfileCustomization(owner);
      for (const [field, value, code] of [
        ['equippedTitleId', 'posts-1000', 'TITLE_LOCKED'],
        ['frameId', 'legendary', 'FRAME_LOCKED'],
        ['featuredAchievementIds', ['posts-1000'], 'ACHIEVEMENT_LOCKED'],
      ] as const) {
        await expect(
          saveProfileCustomization(owner, {
            version: state.version,
            preferences: { ...state.preferences, [field]: value },
            avatarUrl: null,
          })
        ).rejects.toMatchObject({ code });
      }
      await expect(
        saveProfileCustomization(visitor, {
          version: 0,
          preferences: preferences(),
          avatarUrl: ownedPhoto,
        })
      ).rejects.toMatchObject({ code: 'AVATAR_IMAGE_NOT_OWNED' });
      expect((await getProfileCustomization(owner)).avatarUrl).toBe(ownedPhoto);
      expect((await getProfileCustomization(owner)).version).toBe(state.version);
    });
    it('persists complete inline profile edits and rich preferences atomically after reload', async () => {
      const state = await getProfileCustomization(owner);
      const saved = await saveProfileCustomization(owner, {
        version: state.version,
        avatarUrl: ownedPhoto,
        preferences: {
          ...state.preferences,
          flags: ['BR', 'br-sp', 'community-communist'],
          tags: ['python', 'react'],
          tagColors: { react: '#0083fe' },
          studyDetails: [
            { subject: 'Python', description: 'Backend', progress: 65, status: 'studying' },
          ],
          socialLinks: [{ label: 'Meu site', url: 'https://example.com/' }],
        },
        profile: {
          displayName: 'Perfil atualizado',
          bio: 'Biografia persistente',
          institution: 'Fatec',
          pronouns: 'ele/dele',
          github_username: 'pedro',
          discord_username: 'pedro.dev',
          birthday: '2000-02-29',
        },
      });
      const reloaded = await getProfileCustomization(owner);
      expect(reloaded.version).toBe(state.version + 1);
      expect(reloaded.profile).toMatchObject({
        displayName: 'Perfil atualizado',
        bio: 'Biografia persistente',
        birthday: '2000-02-29',
      });
      expect(reloaded.preferences).toMatchObject({
        flags: ['BR', 'br-sp', 'community-communist'],
        flag: 'BR',
        studyDetails: [{ subject: 'Python', progress: 65 }],
        studies: ['Python'],
        tagColors: { react: '#0083fe' },
      });
      const user = await prisma.user.findUniqueOrThrow({ where: { id: owner } });
      expect(user.avatar_config).toMatchObject({
        displayName: 'Perfil atualizado',
        profileStyle: {
          flags: ['BR', 'br-sp', 'community-communist'],
          title: { id: 'halloween-spirit' },
        },
      });
      await expect(
        saveProfileCustomization(owner, {
          version: state.version,
          preferences: state.preferences,
          profile: { displayName: 'Stale name' },
        })
      ).rejects.toMatchObject({ code: 'PROFILE_VERSION_CONFLICT' });
      expect((await getProfileCustomization(owner)).profile?.displayName).toBe(
        saved.profile?.displayName
      );
      expect(await getPublicProfileCustomization(owner)).not.toHaveProperty('profile');
    });
    it('invalidates an open inline draft when a legacy profile edit commits', async () => {
      const state = await getProfileCustomization(owner);
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('stacklyst:profile:'||${owner}))`;
        await tx.user.update({
          where: { id: owner },
          data: { bio: 'Updated by the existing mobile editor' },
        });
        await bumpProfileVersion(tx, owner);
      });
      await expect(
        saveProfileCustomization(owner, {
          version: state.version,
          preferences: state.preferences,
          profile: { bio: 'Stale inline draft' },
        })
      ).rejects.toMatchObject({ code: 'PROFILE_VERSION_CONFLICT' });
      expect((await getProfileCustomization(owner)).profile?.bio).toBe(
        'Updated by the existing mobile editor'
      );
    });
    it('keeps legacy roundtrip edits effective even when GET included rich aliases', async () => {
      const own = await getProfileCustomization(owner);
      const legacy = structuredClone(own.preferences);
      legacy.flag = 'US';
      legacy.studies = ['Rust'];
      const saved = await saveProfileCustomization(owner, {
        version: own.version,
        preferences: legacy,
      });
      expect(saved.preferences).toMatchObject({
        flag: 'US',
        flags: ['US'],
        studies: ['Rust'],
        studyDetails: [{ subject: 'Rust', description: null, progress: null, status: 'studying' }],
      });
      const modern = structuredClone(saved.preferences);
      modern.flags = ['BR', 'br-rj'];
      modern.studyDetails = [
        { subject: 'React', description: 'UI', progress: 42, status: 'paused' },
      ];
      const updated = await saveProfileCustomization(owner, {
        version: saved.version,
        preferences: modern,
      });
      expect(updated.preferences).toMatchObject({
        flag: 'BR',
        flags: ['BR', 'br-rj'],
        studies: ['React'],
        studyDetails: [{ subject: 'React', progress: 42, status: 'paused' }],
      });
      const clear = structuredClone(updated.preferences);
      clear.flag = null;
      clear.studies = [];
      const removed = await saveProfileCustomization(owner, {
        version: updated.version,
        preferences: clear,
      });
      expect(removed.preferences).toMatchObject({
        flag: null,
        flags: [],
        studies: [],
        studyDetails: [],
      });
    });
    it.each(['color', 'gradient'] as const)(
      'persists a %s banner for the owner and visitors after reload',
      async (mode) => {
        const own = await getProfileCustomization(owner);
        const next = structuredClone(own.preferences);
        next.banner = { ...next.banner, mode, color: '#22c55e', secondaryColor: '#8e63ce' };
        await prisma.user.update({ where: { id: owner }, data: { banner_url: ownedPhoto } });
        await saveProfileCustomization(owner, { version: own.version, preferences: next });
        const reloaded = await getProfileCustomization(owner);
        expect(reloaded.preferences.banner).toMatchObject({
          mode,
          color: '#22c55e',
          secondaryColor: '#8e63ce',
        });
        expect(reloaded.bannerUrl).toBeNull();
        const publicProfile = await getPublicProfileCustomization(owner);
        expect(publicProfile?.preferences.banner).toMatchObject({
          mode,
          color: '#22c55e',
          secondaryColor: '#8e63ce',
        });
      }
    );
    it('removes a saved image on default reset without losing an unchanged old banner', async () => {
      const own = await getProfileCustomization(owner);
      const image = {
        ...own.preferences,
        banner: { ...own.preferences.banner, mode: 'image' as const, imageUrl: ownedPhoto },
      };
      const saved = await saveProfileCustomization(owner, {
        version: own.version,
        preferences: image,
      });
      expect(saved.bannerUrl).toBe(ownedPhoto);
      const reset = { ...saved.preferences, banner: { ...DEFAULT_PROFILE_PREFERENCES.banner } };
      const removed = await saveProfileCustomization(owner, {
        version: saved.version,
        preferences: reset,
      });
      expect(removed.bannerUrl).toBeNull();
      expect((await prisma.user.findUniqueOrThrow({ where: { id: owner } })).banner_url).toBeNull();
      // Older users can have a banner only in User.banner_url and default preferences.
      await prisma.user.update({ where: { id: owner }, data: { banner_url: ownedPhoto } });
      const legacy = await getProfileCustomization(owner);
      expect(legacy.bannerUrl).toBe(ownedPhoto);
      const edited = await saveProfileCustomization(owner, {
        version: legacy.version,
        preferences: legacy.preferences,
        profile: { bio: 'Only a bio edit' },
      });
      expect(edited.bannerUrl).toBe(ownedPhoto);
      const explicitReset = await saveProfileCustomization(owner, {
        version: edited.version,
        preferences: edited.preferences,
        clearBanner: true,
      });
      expect(explicitReset.bannerUrl).toBeNull();
    });
    it('awards a complete trail only after every real catalog assessment passed', async () => {
      const course = LEARNING_COURSES[0];
      const steps = [
        ...new Map(
          course.lessons
            .flatMap((lesson) => lesson.steps.filter((step) => step.type !== 'concept_explanation'))
            .map((step) => [step.id, step])
        ).values(),
      ];
      expect(steps.length).toBeGreaterThan(1);
      const existing = await prisma.quiz.findMany({
        where: { id: { in: steps.map((step) => step.id) } },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((row) => row.id));
      const missing = steps.filter((step) => !existingIds.has(step.id));
      addedQuizIds.push(...missing.map((step) => step.id));
      await prisma.quiz.createMany({
        data: missing.map((step) => ({
          id: step.id,
          question: 'Isolated curriculum assessment fixture',
          options: ['A'],
          correct_index: 0,
          is_daily: false,
        })),
        skipDuplicates: true,
      });
      await prisma.quizAttempt.createMany({
        data: steps.map((step, index) => ({
          user_id: young,
          quiz_id: step.id,
          selected_index: 0,
          is_correct: index !== steps.length - 1,
          xp_earned: 0,
        })),
      });
      const partial = await getProfileCustomization(young);
      expect(partial.achievements.find((award) => award.id === 'trails-1')).toMatchObject({
        unlocked: false,
        progress: 0,
      });
      await prisma.quizAttempt.update({
        where: { user_id_quiz_id: { user_id: young, quiz_id: steps.at(-1)!.id } },
        data: { is_correct: true },
      });
      const complete = await getProfileCustomization(young);
      expect(complete.achievements.find((award) => award.id === 'trails-1')).toMatchObject({
        unlocked: true,
        progress: 1,
      });
      expect(complete.achievements.find((award) => award.id === 'trails-3')?.unlocked).toBe(false);
    });
    it('does not grant learning credit for executor errors, only distinct passed activities', async () => {
      await prisma.exerciseSubmission.create({
        data: {
          exercise_id: exerciseId,
          user_id: owner,
          assistance_mode: 'STANDARD',
          status: 'PASSED',
          code: '',
          passed_public: 1,
          total_public: 1,
          passed_hidden: 1,
          total_hidden: 1,
        },
      });
      const state = await getProfileCustomization(owner);
      expect(state.achievements.find((award) => award.id === 'learning-first')).toMatchObject({
        unlocked: true,
        progress: 1,
      });
    });
    it('retains earned titles when the source post is deleted or the event expires', async () => {
      await prisma.post.delete({ where: { id: validPostId } });
      const row = await prisma.profileAchievementCatalog.findUniqueOrThrow({
        where: { id: 'profile-catalog' },
      });
      const catalog = structuredClone(DEFAULT_PROFILE_CATALOG);
      catalog.events = catalog.events.map((event) => ({ ...event, enabled: false }));
      await saveProfileCatalog(catalog, row.version);
      const state = await getProfileCustomization(owner);
      expect(state.achievements.find((award) => award.id === 'halloween-spirit')?.unlocked).toBe(
        true
      );
      expect(state.preferences.equippedTitleId).toBe('halloween-spirit');
    });
    it('keeps all new tables under RLS with no public write grants', async () => {
      const rows = await prisma.$queryRaw<
        Array<{ relname: string; relrowsecurity: boolean; public_privileges: number }>
      >`SELECT c.relname,c.relrowsecurity,COALESCE((SELECT count(*)::int FROM aclexplode(c.relacl) p WHERE p.grantee=0),0) AS public_privileges FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('profile_customizations','profile_achievement_catalogs','user_profile_achievements')`;
      expect(rows).toHaveLength(3);
      expect(rows.every((row) => row.relrowsecurity && row.public_privileges === 0)).toBe(true);
    });
  }
);
