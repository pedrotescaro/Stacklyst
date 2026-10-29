import { Prisma } from '@prisma/client';
import { EXTRA_PROFILE_FRAMES } from '@/lib/profile-frames';
import { prisma } from '@/lib/prisma';
import { AppError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import {
  DEFAULT_PROFILE_CATALOG,
  DEFAULT_CHAT_PREFERENCES,
  profileCatalogSchema,
  profilePreferencesSchema,
  profileBasicsSchema,
  normalizeProfilePreferenceAliases,
  privateChatSchema,
  achievementDefinitionSchema,
  parseProfilePreferences,
  parsePrivateChat,
  colorContrast,
  type ProfileCatalog,
  type AchievementDefinition,
  type AchievementProgress,
  type ProfileCustomizationState,
  type ProfileMetric,
} from '@/lib/profile-customization';
import { resolveSpotifyTrack } from '@/lib/profile-music';
import { isOwnedProfileUpload } from '@/lib/profile-upload';
import { z } from 'zod';
import { LEARNING_COURSES } from '@/lib/learning/catalog';

const CATALOG_ID = 'profile-catalog';
type Transaction = Prisma.TransactionClient;
type Metrics = Record<ProfileMetric, number>;
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
const completedTrailRequirements = JSON.stringify(
  LEARNING_COURSES.map((course) => ({
    id: course.id,
    steps: [
      ...new Set(
        course.lessons.flatMap((lesson) =>
          lesson.steps.filter((step) => step.type !== 'concept_explanation').map((step) => step.id)
        )
      ),
    ],
  }))
);
const profileUserSelection = {
  avatar_url: true,
  banner_url: true,
  avatar_config: true,
  username: true,
  bio: true,
  institution: true,
  pronouns: true,
  github_username: true,
  discord_username: true,
  birthday: true,
} as const;
function editableProfile(user: {
  username?: string;
  avatar_config?: unknown;
  bio?: string | null;
  institution?: string | null;
  pronouns?: string | null;
  github_username?: string | null;
  discord_username?: string | null;
  birthday?: Date | string | null;
}) {
  const avatar =
    user.avatar_config &&
    typeof user.avatar_config === 'object' &&
    !Array.isArray(user.avatar_config)
      ? (user.avatar_config as Record<string, unknown>)
      : {};
  return {
    displayName:
      typeof avatar.displayName === 'string'
        ? avatar.displayName
        : typeof avatar.name === 'string'
          ? avatar.name
          : user.username || '',
    bio: user.bio ?? null,
    institution: user.institution ?? null,
    pronouns: user.pronouns ?? null,
    github_username: user.github_username ?? null,
    discord_username: user.discord_username ?? null,
    birthday: user.birthday ? new Date(user.birthday).toISOString().slice(0, 10) : null,
  };
}

export async function getProfileCatalog(): Promise<ProfileCatalog> {
  const row = await prisma.profileAchievementCatalog.findUnique({ where: { id: CATALOG_ID } });
  const parsed = profileCatalogSchema.safeParse(row?.value);
  if (!parsed.success) return structuredClone(DEFAULT_PROFILE_CATALOG);
  // Older persisted catalogs retain their custom entries and gain the new built-in options.
  const ids = new Set(parsed.data.frames.map((frame) => frame.id));
  return {
    ...parsed.data,
    achievements: parsed.data.achievements.map((achievement) =>
      achievement.id === 'posts-1' && achievement.name === 'Primeiros Passos'
        ? { ...achievement, name: 'Iniciante' }
        : achievement
    ),
    frames: [...parsed.data.frames, ...EXTRA_PROFILE_FRAMES.filter((frame) => !ids.has(frame.id))],
  };
}

export async function saveProfileCatalog(value: unknown, version: number) {
  const catalog = profileCatalogSchema.parse(value);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('stacklyst:profile-catalog'))`;
    const existing = await tx.profileAchievementCatalog.findUnique({ where: { id: CATALOG_ID } });
    if ((existing?.version || 0) !== version)
      throw new AppError(
        'CATALOG_VERSION_CONFLICT',
        'O catálogo mudou. Recarregue antes de salvar.',
        409
      );
    const updated = await tx.profileAchievementCatalog.upsert({
      where: { id: CATALOG_ID },
      create: { id: CATALOG_ID, value: json(catalog) },
      update: { value: json(catalog), version: { increment: 1 } },
    });
    return { catalog, version: updated.version };
  });
}

/** Server-only counters. Deleted activities disappear from progress; existing awards remain earned. */
export async function profileActivityMetrics(tx: Transaction, userId: string): Promise<Metrics> {
  const [row] = await tx.$queryRaw<
    Array<{
      posts: number;
      comments: number;
      peopleHelped: number;
      likes: number;
      followers: number;
      learningActivities: number;
      completedTrails: number;
    }>
  >`
    WITH normalized_posts AS (
      SELECT MIN(created_at) AS created_at FROM "Post"
      WHERE author_id=${userId} AND char_length(trim(title))>=4 AND char_length(trim(body))>=40
      GROUP BY md5(lower(regexp_replace(trim(title)||' '||trim(body),'[[:space:]]+',' ','g')))
    ), daily_posts AS (
      SELECT LEAST(COUNT(*),5)::int AS amount FROM normalized_posts GROUP BY date_trunc('day',created_at)
    ), valid_comments AS (
      SELECT DISTINCT ON (lower(regexp_replace(trim(a.body),'[[:space:]]+',' ','g')))
        a.body, COALESCE(parent.author_id,p.author_id) AS target FROM "Answer" a
      JOIN "Post" p ON p.id=a.post_id LEFT JOIN "Answer" parent ON parent.id=a.parent_id
      WHERE a.author_id=${userId} AND COALESCE(parent.author_id,p.author_id)<>${userId}
        AND char_length(trim(a.body))>=12
      ORDER BY lower(regexp_replace(trim(a.body),'[[:space:]]+',' ','g')),a.created_at,a.id
    ), valid_likes AS (
      SELECT v.user_id AS actor,v.created_at FROM "PostVote" v JOIN "Post" p ON p.id=v.post_id
      JOIN "User" u ON u.id=v.user_id
      WHERE p.author_id=${userId} AND v.user_id<>${userId} AND v.value=1 AND u.created_at <= v.created_at-INTERVAL '24 hours'
      UNION ALL
      SELECT v.user_id AS actor,v.created_at FROM "AnswerVote" v JOIN "Answer" a ON a.id=v.answer_id
      JOIN "User" u ON u.id=v.user_id
      WHERE a.author_id=${userId} AND v.user_id<>${userId} AND v.value=1 AND u.created_at <= v.created_at-INTERVAL '24 hours'
    ), daily_likes AS (
      SELECT LEAST(COUNT(*),20)::int AS amount FROM valid_likes GROUP BY actor,date_trunc('day',created_at)
    ) SELECT
      COALESCE((SELECT SUM(amount)::int FROM daily_posts),0) AS posts,
      (SELECT COUNT(DISTINCT lower(regexp_replace(trim(body),'[[:space:]]+',' ','g')))::int FROM valid_comments) AS comments,
      (SELECT COUNT(DISTINCT target)::int FROM valid_comments) AS "peopleHelped",
      COALESCE((SELECT SUM(amount)::int FROM daily_likes),0) AS likes,
      (SELECT COUNT(*)::int FROM "Follow" f JOIN "User" u ON u.id=f."followerId"
        WHERE f."followingId"=${userId} AND f."followerId"<>${userId} AND u.created_at<=f."createdAt"-INTERVAL '24 hours') AS followers,
      (SELECT COUNT(DISTINCT exercise_id)::int FROM exercise_submissions WHERE user_id=${userId} AND status='PASSED') AS "learningActivities",
      (SELECT COUNT(*)::int FROM jsonb_array_elements(${completedTrailRequirements}::jsonb) course
        WHERE jsonb_array_length(course->'steps') > 0
        AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(course->'steps') required_step
          WHERE NOT EXISTS (SELECT 1 FROM "QuizAttempt" attempt WHERE attempt.user_id=${userId}
            AND attempt.quiz_id=required_step.value AND attempt.is_correct=true)
        )) AS "completedTrails"
  `;
  return {
    ...row,
    completedTrails: row.completedTrails ?? 0,
    eventPosts: 0,
    eventComments: 0,
    eventComplete: 0,
  };
}

export function eventIsActive(event: ProfileCatalog['events'][number], now: Date) {
  return event.enabled && now >= new Date(event.startsAt) && now < new Date(event.endsAt);
}
export function eventHashtagPattern(hashtag: string) {
  return `(^|[^[:alnum:]_])#${hashtag}([^[:alnum:]_]|$)`;
}

async function eventMetrics(
  tx: Transaction,
  userId: string,
  event: ProfileCatalog['events'][number],
  now: Date
) {
  if (!eventIsActive(event, now)) return { eventPosts: 0, eventComments: 0, eventComplete: 0 };
  const pattern = eventHashtagPattern(event.hashtag);
  const [row] = await tx.$queryRaw<Array<{ eventPosts: number; eventComments: number }>>`
    WITH valid_event_comments AS (
      SELECT DISTINCT ON (lower(regexp_replace(trim(a.body),'[[:space:]]+',' ','g'))) a.post_id
      FROM "Answer" a JOIN "Post" p ON p.id=a.post_id
      WHERE a.author_id=${userId} AND p.author_id<>${userId} AND char_length(trim(a.body))>=12
      AND a.created_at>=${new Date(event.startsAt)} AND a.created_at<${new Date(event.endsAt)}
      AND p.created_at>=${new Date(event.startsAt)} AND p.created_at<${new Date(event.endsAt)} AND p.body ~* ${pattern}
      ORDER BY lower(regexp_replace(trim(a.body),'[[:space:]]+',' ','g')),a.created_at,a.id
    ) SELECT (SELECT COUNT(DISTINCT md5(lower(regexp_replace(trim(body),'[[:space:]]+',' ','g'))))::int FROM "Post"
      WHERE author_id=${userId} AND created_at>=${new Date(event.startsAt)} AND created_at<${new Date(event.endsAt)}
      AND char_length(trim(title))>=4 AND char_length(trim(body))>=40 AND body ~* ${pattern}) AS "eventPosts",
    (SELECT COUNT(DISTINCT post_id)::int FROM valid_event_comments) AS "eventComments"
  `;
  return { ...row, eventComplete: 0 };
}

function unlockedDefinitions(
  rows: { achievementId: string; definition: Prisma.JsonValue; unlockedAt: Date }[]
) {
  return rows.flatMap((row) => {
    const parsed = achievementDefinitionSchema.safeParse(row.definition);
    return parsed.success
      ? [
          {
            ...parsed.data,
            progress: parsed.data.requirement.target,
            unlocked: true,
            unlockedAt: row.unlockedAt.toISOString(),
          },
        ]
      : [];
  });
}

async function reconcileInTransaction(tx: Transaction, userId: string, catalog: ProfileCatalog) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('stacklyst:profile:'||${userId}))`;
  const metrics = await profileActivityMetrics(tx, userId);
  const now = new Date();
  const events = new Map<string, Awaited<ReturnType<typeof eventMetrics>>>();
  for (const event of catalog.events)
    if (eventIsActive(event, now)) events.set(event.id, await eventMetrics(tx, userId, event, now));
  const progressFor = (definition: AchievementDefinition) => {
    const event = definition.requirement.eventId
      ? events.get(definition.requirement.eventId)
      : null;
    const metric = definition.requirement.metric;
    if (metric === 'eventComplete') {
      if (!event) return 0;
      const challenges = catalog.achievements.filter(
        (item) =>
          item.requirement.eventId === definition.requirement.eventId &&
          item.requirement.metric !== 'eventComplete'
      );
      return challenges.length &&
        challenges.every(
          (item) =>
            (event[item.requirement.metric as keyof typeof event] || 0) >= item.requirement.target
        )
        ? 1
        : 0;
    }
    return metric.startsWith('event')
      ? event?.[metric as keyof typeof event] || 0
      : metrics[metric];
  };
  let earned = await tx.userProfileAchievement.findMany({ where: { userId } });
  const owned = new Set(earned.map((item) => item.achievementId));
  const newlyEarned = catalog.achievements.filter(
    (definition) =>
      !owned.has(definition.id) && progressFor(definition) >= definition.requirement.target
  );
  if (newlyEarned.length) {
    await tx.userProfileAchievement.createMany({
      data: newlyEarned.map((definition) => ({
        userId,
        achievementId: definition.id,
        definition: json(definition),
      })),
      skipDuplicates: true,
    });
    await tx.notification.createMany({
      data: newlyEarned.map((definition) => ({
        userId,
        type: 'XP_MILESTONE' as const,
        resourceId: definition.id,
        resourceType: 'PROFILE_ACHIEVEMENT',
      })),
    });
    earned = await tx.userProfileAchievement.findMany({ where: { userId } });
  }
  const definitions = unlockedDefinitions(earned);
  const known = new Map(catalog.achievements.map((definition) => [definition.id, definition]));
  for (const definition of definitions)
    if (!known.has(definition.id)) known.set(definition.id, definition);
  const earnedMap = new Map(earned.map((row) => [row.achievementId, row]));
  const achievements: AchievementProgress[] = [...known.values()].map((definition) => ({
    ...definition,
    progress: earnedMap.has(definition.id)
      ? Math.max(progressFor(definition), definition.requirement.target)
      : progressFor(definition),
    unlocked: earnedMap.has(definition.id),
    unlockedAt: earnedMap.get(definition.id)?.unlockedAt.toISOString() || null,
  }));
  return { achievements, earned };
}

export async function reconcileProfileAchievements(userId: string) {
  const catalog = await getProfileCatalog();
  return prisma.$transaction((tx) => reconcileInTransaction(tx, userId, catalog), {
    timeout: 20000,
  });
}
export async function syncProfileAchievementsSafely(...userIds: string[]) {
  for (const userId of new Set(userIds)) {
    try {
      await reconcileProfileAchievements(userId);
    } catch (error) {
      logger.warn('Profile achievement reconciliation deferred', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export async function getProfileCustomization(
  userId: string,
  options: { claimUnlocks?: boolean } = {}
): Promise<ProfileCustomizationState> {
  const catalog = await getProfileCatalog();
  return prisma.$transaction(
    async (tx) => {
      const { achievements, earned } = await reconcileInTransaction(tx, userId, catalog);
      const row = await tx.profileCustomization.findUnique({ where: { userId } });
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: profileUserSelection,
      });
      if (!user) throw new NotFoundError('USER_NOT_FOUND');
      // Only the explicit notification consumer may claim the transient toast.
      // Editor/chat reads must not silently consume an award before it is shown.
      const newUnlocks = options.claimUnlocks
        ? earned.filter((item) => !item.announcedAt).map((item) => item.achievementId)
        : [];
      if (newUnlocks.length)
        await tx.userProfileAchievement.updateMany({
          where: { userId, achievementId: { in: newUnlocks }, announcedAt: null },
          data: { announcedAt: new Date() },
        });
      return {
        preferences: parseProfilePreferences(row?.preferences),
        chat: parsePrivateChat(row?.chat),
        version: row?.version || 0,
        avatarUrl: user.avatar_url,
        bannerUrl: user.banner_url ?? null,
        profile: editableProfile(user),
        catalog,
        achievements,
        newUnlocks,
      };
    },
    { timeout: 20000 }
  );
}

export async function getPublicProfileCustomization(userId: string) {
  const row = await prisma.profileCustomization.findUnique({
    where: { userId },
    select: { preferences: true },
  });
  const preferences = parseProfilePreferences(row?.preferences);
  const selected = await prisma.userProfileAchievement.findMany({
    where: { userId, achievementId: { in: preferences.featuredAchievementIds } },
    select: { achievementId: true, definition: true, unlockedAt: true },
  });
  return { preferences, achievements: unlockedDefinitions(selected) };
}

export const saveProfileCustomizationSchema = z
  .object({
    version: z.number().int().min(0),
    preferences: profilePreferencesSchema,
    chat: privateChatSchema.optional(),
    avatarUrl: z.string().max(2048).nullable().optional(),
    profile: profileBasicsSchema.optional(),
    clearBanner: z.boolean().optional(),
  })
  .strict()
  .refine((value) => !value.clearBanner || value.preferences.banner.mode === 'default', {
    path: ['clearBanner'],
    message: 'Remova a capa somente ao escolher o banner padrão.',
  });
export async function saveProfileCustomization(
  userId: string,
  input: unknown
): Promise<ProfileCustomizationState> {
  const parsed = saveProfileCustomizationSchema.parse(input);
  const existing = await prisma.profileCustomization.findUnique({ where: { userId } });
  const current = parseProfilePreferences(existing?.preferences);
  parsed.preferences = normalizeProfilePreferenceAliases(parsed.preferences, current);
  const bannerImage = parsed.preferences.banner.imageUrl;
  if (
    bannerImage &&
    bannerImage !== current.banner.imageUrl &&
    !isOwnedProfileUpload(bannerImage, userId)
  )
    throw new ValidationError(
      'BANNER_IMAGE_NOT_OWNED',
      'Envie uma imagem pela sua conta para usar no banner.'
    );
  // Client metadata is never authoritative, even when the track ID stays the same.
  if (parsed.preferences.music) {
    if (current.music?.trackId === parsed.preferences.music.trackId) {
      parsed.preferences.music = current.music;
    } else {
      const resolved = await resolveSpotifyTrack(parsed.preferences.music.trackId);
      // Availability diagnostics are transport-only and must not contaminate
      // the strict persisted preferences schema.
      parsed.preferences.music = {
        trackId: resolved.trackId,
        title: resolved.title,
        artist: resolved.artist,
        artworkUrl: resolved.artworkUrl,
        ...(resolved.album !== undefined ? { album: resolved.album } : {}),
        ...(resolved.durationMs !== undefined ? { durationMs: resolved.durationMs } : {}),
      };
    }
  }
  const catalog = await getProfileCatalog();
  await prisma.$transaction(
    async (tx) => {
      const { achievements } = await reconcileInTransaction(tx, userId, catalog);
      const row = await tx.profileCustomization.findUnique({ where: { userId } });
      if ((row?.version || 0) !== parsed.version)
        throw new AppError(
          'PROFILE_VERSION_CONFLICT',
          'Seu perfil mudou em outra sessão. Recarregue antes de salvar.',
          409,
          { currentVersion: row?.version || 0 }
        );
      const earned = new Set(achievements.filter((item) => item.unlocked).map((item) => item.id));
      const title = parsed.preferences.equippedTitleId
        ? achievements.find(
            (item) => item.id === parsed.preferences.equippedTitleId && item.unlocked
          )
        : null;
      if (parsed.preferences.equippedTitleId && !title)
        throw new ForbiddenError('TITLE_LOCKED', 'Esse título ainda não foi conquistado.');
      if (parsed.preferences.featuredAchievementIds.some((id) => !earned.has(id)))
        throw new ForbiddenError(
          'ACHIEVEMENT_LOCKED',
          'Você só pode destacar conquistas desbloqueadas.'
        );
      const frame = catalog.frames.find((item) => item.id === parsed.preferences.frameId);
      if (!frame) throw new ValidationError('FRAME_NOT_FOUND', 'Escolha uma moldura do catálogo.');
      if (frame.achievementId && !earned.has(frame.achievementId))
        throw new ForbiddenError(
          'FRAME_LOCKED',
          'Conquiste o requisito desta moldura antes de equipá-la.'
        );
      if (parsed.preferences.banner.mode === 'image' && !parsed.preferences.banner.imageUrl)
        throw new ValidationError(
          'BANNER_IMAGE_REQUIRED',
          'Envie uma imagem para usar este banner.'
        );
      const { color } = parsed.preferences.nameStyle,
        background = parsed.preferences.appearance.backgroundColor;
      if (color && background && colorContrast(color, background) < 4.5)
        throw new ValidationError(
          'NAME_CONTRAST',
          'Escolha uma cor de nome com mais contraste em relação ao fundo.'
        );
      const card = parsed.preferences.appearance.cardColor;
      if (background && card) {
        const foreground =
          colorContrast('#ffffff', background) >= colorContrast('#000000', background)
            ? '#ffffff'
            : '#000000';
        if (colorContrast(foreground, card) < 4.5)
          throw new ValidationError(
            'CARD_CONTRAST',
            'Escolha fundo e cartões com luminosidade semelhante para manter o texto legível.'
          );
      }
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: profileUserSelection,
      });
      if (!user) throw new NotFoundError('USER_NOT_FOUND');
      if (
        parsed.avatarUrl &&
        parsed.avatarUrl !== user.avatar_url &&
        !isOwnedProfileUpload(parsed.avatarUrl, userId)
      )
        throw new ValidationError(
          'AVATAR_IMAGE_NOT_OWNED',
          'Envie uma foto pela sua conta para usar no perfil.'
        );
      await tx.profileCustomization.upsert({
        where: { userId },
        create: {
          userId,
          preferences: json(parsed.preferences),
          chat: json(parsed.chat || DEFAULT_CHAT_PREFERENCES),
        },
        update: {
          preferences: json(parsed.preferences),
          ...(parsed.chat ? { chat: json(parsed.chat) } : {}),
          version: { increment: 1 },
        },
      });
      const avatar =
        user.avatar_config &&
        typeof user.avatar_config === 'object' &&
        !Array.isArray(user.avatar_config)
          ? user.avatar_config
          : {};
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(parsed.avatarUrl !== undefined ? { avatar_url: parsed.avatarUrl } : {}),
          ...(parsed.profile
            ? {
                ...(parsed.profile.bio !== undefined ? { bio: parsed.profile.bio || null } : {}),
                ...(parsed.profile.institution !== undefined
                  ? { institution: parsed.profile.institution || null }
                  : {}),
                ...(parsed.profile.pronouns !== undefined
                  ? { pronouns: parsed.profile.pronouns || null }
                  : {}),
                ...(parsed.profile.github_username !== undefined
                  ? { github_username: parsed.profile.github_username || null }
                  : {}),
                ...(parsed.profile.discord_username !== undefined
                  ? { discord_username: parsed.profile.discord_username || null }
                  : {}),
                ...(parsed.profile.birthday !== undefined
                  ? {
                      birthday: parsed.profile.birthday
                        ? new Date(parsed.profile.birthday + 'T00:00:00.000Z')
                        : null,
                    }
                  : {}),
              }
            : {}),
          banner_url:
            parsed.preferences.banner.mode === 'image'
              ? parsed.preferences.banner.imageUrl
              : parsed.preferences.banner.mode === 'default'
                ? parsed.clearBanner || current.banner.mode !== 'default'
                  ? null
                  : undefined
                : null,
          avatar_config: json({
            ...avatar,
            ...(parsed.profile?.displayName !== undefined
              ? { name: parsed.profile.displayName, displayName: parsed.profile.displayName }
              : {}),
            profileStyle: {
              nameStyle: parsed.preferences.nameStyle,
              frame:
                frame.id === 'none'
                  ? null
                  : { id: frame.id, decoration: frame.decoration, color: frame.color },
              flag: parsed.preferences.flag,
              flags: parsed.preferences.flags,
              title: title
                ? {
                    id: title.id,
                    name: title.name,
                    icon: title.icon,
                    color: title.color,
                    rarity: title.rarity,
                  }
                : null,
            },
          }),
        },
      });
    },
    { timeout: 20000 }
  );
  return getProfileCustomization(userId);
}

export async function findProfileCustomizationByUsername(username: string) {
  const user = await prisma.user.findFirst({
    where: { username: { equals: username, mode: 'insensitive' } },
    select: { id: true },
  });
  if (!user) throw new NotFoundError('USER_NOT_FOUND', 'Perfil não encontrado.');
  return getPublicProfileCustomization(user.id);
}
