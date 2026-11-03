import { createHash } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import {
  DEFAULT_CHAT_PREFERENCES,
  DEFAULT_PROFILE_CATALOG,
  DEFAULT_PROFILE_PREFERENCES,
  profilePreferencesSchema,
} from '../../src/lib/profile-customization';
import { calculateLevel } from '../../src/lib/learning/rewards';
import demoAssets from '../demo-profile-assets.json';
import {
  COMMUNITY_NAMESPACE,
  COMMUNITY_NOTES,
  COMMUNITY_PROFILES,
  COMMUNITY_THREADS,
  communityPartBody,
} from './content';

type DemoAsset = { emails: string[]; avatar_url: string };
const assets: Record<string, DemoAsset> = demoAssets;
const asJson = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

export function communityId(kind: string, key: string) {
  const hash = createHash('sha256').update(`${COMMUNITY_NAMESPACE}:${kind}:${key}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function communityPreferences(username: string) {
  const profile = COMMUNITY_PROFILES.find((p) => p.username === username);
  if (!profile) throw new Error(`Unknown editorial profile: ${username}`);
  return profilePreferencesSchema.parse({
    ...DEFAULT_PROFILE_PREFERENCES,
    frameId: profile.frameId,
    equippedTitleId: profile.titleId,
    nameStyle: {
      color: profile.color,
      bold: true,
      italic: username === 'beatriztech',
      underline: false,
    },
    banner: {
      ...DEFAULT_PROFILE_PREFERENCES.banner,
      mode: 'gradient',
      color: profile.secondaryColor,
      secondaryColor: profile.color,
    },
    appearance: { ...DEFAULT_PROFILE_PREFERENCES.appearance, accentColor: profile.color },
    flag: 'BR',
    flags: ['BR'],
    socialLinks: [],
    tags: profile.tags,
    tagColors: Object.fromEntries(profile.tags.map((tag) => [tag, profile.color])),
    studies: [profile.study],
    studyDetails: [
      {
        subject: profile.study,
        description: 'Caderno de estudos do perfil editorial.',
        status: 'studying',
        progress: null,
      },
    ],
  });
}

/** Fail on username collisions instead of taking over an ordinary member's account. */
export async function planCommunity(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    where: { username: { in: COMMUNITY_PROFILES.map((p) => p.username) } },
    select: { id: true, username: true, email: true },
  });
  for (const profile of COMMUNITY_PROFILES) {
    const asset = assets[profile.username];
    if (!asset) throw new Error(`Missing avatar and reserved emails: ${profile.username}`);
    const existing = users.find((u) => u.username === profile.username);
    if (existing && !asset.emails.includes(existing.email))
      throw new Error(`Username belongs to a non-demo account: ${profile.username}`);
    communityPreferences(profile.username);
    if (
      !DEFAULT_PROFILE_CATALOG.frames.some((f) => f.id === profile.frameId) ||
      !DEFAULT_PROFILE_CATALOG.achievements.some((a) => a.id === profile.titleId)
    )
      throw new Error(`Unknown frame or title for ${profile.username}`);
  }
  const ids = users.map((u) => u.id);
  const managedPosts = await prisma.post.count({
    where: { author_id: { in: ids }, client_id: { startsWith: `${COMMUNITY_NAMESPACE}:` } },
  });
  return {
    profiles: COMMUNITY_PROFILES.length,
    newProfiles: COMMUNITY_PROFILES.length - users.length,
    threads: COMMUNITY_THREADS.length,
    notes: COMMUNITY_NOTES.length,
    continuations: COMMUNITY_THREADS.reduce((sum, t) => sum + t.parts.length - 1, 0),
    discussionMessages: COMMUNITY_THREADS.length * 2,
    existingManagedPosts: managedPosts,
    users,
  };
}

/** Only touches reserved demo identities and stable IDs owned by this collection. */
export async function publishCommunity(
  prisma: PrismaClient,
  userIds: Record<string, string>,
  initializeProgressFor: readonly string[] = []
) {
  await planCommunity(prisma);
  return prisma.$transaction(
    async (tx) => {
      // Serialize publishers. Auth provisioning happens before this short database transaction.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(571139, 20261103)`;
      for (const profile of COMMUNITY_PROFILES) {
        const id = userIds[profile.username];
        if (!id) throw new Error(`Missing Auth identity for ${profile.username}`);
        const preferences = communityPreferences(profile.username);
        const frame = DEFAULT_PROFILE_CATALOG.frames.find((f) => f.id === profile.frameId)!;
        const title = DEFAULT_PROFILE_CATALOG.achievements.find((a) => a.id === profile.titleId)!;
        const existing = await tx.user.findUnique({
          where: { id },
          select: { avatar_config: true, email: true, username: true },
        });
        if (
          existing &&
          (existing.username !== profile.username ||
            !assets[profile.username].emails.includes(existing.email))
        )
          throw new Error(`Identity collision for ${profile.username}`);
        const config =
          existing?.avatar_config &&
          typeof existing.avatar_config === 'object' &&
          !Array.isArray(existing.avatar_config)
            ? existing.avatar_config
            : {};
        const visual = {
          displayName: profile.displayName,
          editorialDemo: true,
          profileStyle: {
            frame,
            title: {
              id: title.id,
              name: title.name,
              color: title.color,
              rarity: title.rarity,
              icon: title.icon,
            },
            nameStyle: preferences.nameStyle,
            flag: 'BR',
            flags: ['BR'],
          },
        };
        const data = {
          username: profile.username,
          bio: `${profile.bio}\nPerfil editorial de demonstração.`,
          avatar_url: assets[profile.username].avatar_url,
          avatar_config: asJson({ ...config, ...visual }),
          ...(initializeProgressFor.includes(profile.username) ? { total_xp: profile.xp } : {}),
        };
        await tx.user.upsert({
          where: { id },
          create: {
            ...data,
            id,
            email: assets[profile.username].emails.at(-1)!,
            total_xp: profile.xp,
          },
          // Existing members' progression, credentials and settings outside the visuals survive.
          update: data,
        });
        await tx.languageTrail.upsert({
          where: { user_id_language: { user_id: id, language: profile.language } },
          create: {
            user_id: id,
            language: profile.language,
            xp: profile.xp,
            level: calculateLevel(profile.xp).level,
          },
          update: initializeProgressFor.includes(profile.username)
            ? { xp: profile.xp, level: calculateLevel(profile.xp).level }
            : {},
        });
        const previous = await tx.profileCustomization.findUnique({ where: { userId: id } });
        await tx.profileCustomization.upsert({
          where: { userId: id },
          create: {
            userId: id,
            preferences: asJson(preferences),
            chat: asJson(DEFAULT_CHAT_PREFERENCES),
          },
          update: {
            preferences: asJson({ ...((previous?.preferences as object) ?? {}), ...preferences }),
            version: { increment: 1 },
          },
        });
        await tx.userProfileAchievement.upsert({
          where: { userId_achievementId: { userId: id, achievementId: title.id } },
          create: {
            userId: id,
            achievementId: title.id,
            definition: asJson(title),
            announcedAt: new Date(),
          },
          update: { definition: asJson(title) },
        });
      }

      // Keep the whole collection in the past even when run early on release day.
      const latest =
        Math.max(...COMMUNITY_THREADS.map((t) => Date.parse(t.publishedAt))) + 28 * 60_000;
      const timeShift = Math.min(0, Date.now() - latest - 60 * 60_000);
      for (const thread of COMMUNITY_THREADS) {
        const authorId = userIds[thread.author];
        const clientId = `${COMMUNITY_NAMESPACE}:${thread.key}`;
        const postId = communityId('post', `${authorId}:${thread.key}`);
        const publishedAt = new Date(Date.parse(thread.publishedAt) + timeShift);
        const data = {
          title: `(1/${thread.parts.length}) ${thread.title}`,
          body: communityPartBody(thread, 0),
          language: thread.language,
          code_snippet: thread.parts[0].code ?? null,
        };
        const post = await tx.post.upsert({
          where: { author_id_client_id: { author_id: authorId, client_id: clientId } },
          create: {
            ...data,
            id: postId,
            author_id: authorId,
            client_id: clientId,
            created_at: publishedAt,
          },
          update: data,
        });
        let parentId: string | null = null;
        for (let index = 1; index < thread.parts.length; index++) {
          const id = communityId('part', `${post.id}:${index}`);
          const body = {
            body: communityPartBody(thread, index),
            code_snippet: thread.parts[index].code ?? null,
          };
          await tx.answer.upsert({
            where: { id },
            create: {
              ...body,
              id,
              post_id: post.id,
              author_id: authorId,
              parent_id: parentId,
              created_at: new Date(+publishedAt + index * 120_000),
            },
            update: body,
          });
          parentId = id;
        }
        // Discussion starts at the root, outside the author's numbered chain and depth cap.
        const questionId = communityId('discussion', post.id);
        await tx.answer.upsert({
          where: { id: questionId },
          create: {
            id: questionId,
            post_id: post.id,
            author_id: userIds[thread.discussion.author],
            body: thread.discussion.body,
            created_at: new Date(+publishedAt + 17 * 60_000),
          },
          update: { body: thread.discussion.body },
        });
        const responseId = communityId('response', post.id);
        await tx.answer.upsert({
          where: { id: responseId },
          create: {
            id: responseId,
            post_id: post.id,
            author_id: authorId,
            parent_id: questionId,
            body: thread.discussion.response,
            created_at: new Date(+publishedAt + 28 * 60_000),
          },
          update: { body: thread.discussion.response },
        });
      }
      for (const [index, note] of COMMUNITY_NOTES.entries()) {
        const authorId = userIds[note.author];
        const data = { title: note.title, body: note.body, language: note.language };
        await tx.post.upsert({
          where: {
            author_id_client_id: {
              author_id: authorId,
              client_id: `${COMMUNITY_NAMESPACE}:${note.key}`,
            },
          },
          create: {
            ...data,
            id: communityId('post', `${authorId}:${note.key}`),
            author_id: authorId,
            client_id: `${COMMUNITY_NAMESPACE}:${note.key}`,
            created_at: new Date(
              Date.parse('2026-11-02T10:26:00-03:00') + index * 67 * 60_000 + timeShift
            ),
          },
          update: data,
        });
      }
      return {
        profiles: COMMUNITY_PROFILES.length,
        posts: COMMUNITY_THREADS.length + COMMUNITY_NOTES.length,
        answers: COMMUNITY_THREADS.reduce((sum, t) => sum + t.parts.length - 1 + 2, 0),
      };
    },
    { timeout: 120_000, maxWait: 15_000 }
  );
}
