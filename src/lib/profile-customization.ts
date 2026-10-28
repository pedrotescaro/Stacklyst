import { z } from 'zod';
import { EXTRA_PROFILE_FRAMES } from '@/lib/profile-frames';
import { getProfileFlags as getFlagCatalog, isProfileFlagId } from '@/lib/profile-flags';

export { PROFILE_COUNTRY_CODES } from '@/lib/profile-flags';
export const PROFILE_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'special',
] as const;
export const PROFILE_METRICS = [
  'posts',
  'comments',
  'peopleHelped',
  'likes',
  'followers',
  'learningActivities',
  'completedTrails',
  'eventPosts',
  'eventComments',
  'eventComplete',
] as const;
export type ProfileRarity = (typeof PROFILE_RARITIES)[number];
export type ProfileMetric = (typeof PROFILE_METRICS)[number];
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use uma cor hexadecimal válida.');
const optionalColor = hex.nullable();
const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => !/[<>\u0000-\u0008]/.test(value), 'Remova caracteres inválidos.');
const assetUrl = z
  .string()
  .max(2048)
  .refine(
    (value) => /^\/(?!\/)/.test(value) || /^https:\/\//.test(value),
    'Use uma imagem HTTPS válida.'
  );
const tag = z
  .string()
  .trim()
  .transform((value) => value.replace(/^#/, '').toLowerCase())
  .pipe(
    z
      .string()
      .min(2)
      .max(24)
      .regex(/^[\p{L}\p{N}_+-]+$/u, 'Tags só podem conter letras, números, +, - e _.')
  );

const flagId = z.string().max(32).refine(isProfileFlagId, 'Escolha uma bandeira do catálogo.');
export const profileStudySchema = z
  .object({
    subject: safeText(60).min(2),
    description: safeText(160).nullable().default(null),
    progress: z.number().int().min(0).max(100).nullable().default(null),
    status: z.enum(['studying', 'paused', 'completed']).default('studying'),
  })
  .strict();
export type ProfileStudy = z.infer<typeof profileStudySchema>;
export const profileSocialLinkSchema = z
  .object({
    label: safeText(32).min(1),
    url: z
      .string()
      .trim()
      .max(500)
      .url()
      .refine((value) => {
        try {
          const url = new URL(value);
          return url.protocol === 'https:' && !url.username && !url.password;
        } catch {
          return false;
        }
      }, 'Use um link HTTPS sem credenciais.'),
  })
  .strict();

const optionalProfileText = (max: number) => safeText(max).nullable().optional();
export const profileBasicsSchema = z
  .object({
    displayName: safeText(50).min(1).optional(),
    bio: optionalProfileText(500),
    institution: optionalProfileText(100),
    pronouns: optionalProfileText(40),
    github_username: z
      .string()
      .trim()
      .max(39)
      .regex(/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?)?$/i, 'Informe um usuário GitHub válido.')
      .nullable()
      .optional(),
    discord_username: optionalProfileText(100),
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.')
      .refine((value) => {
        const date = new Date(value + 'T00:00:00.000Z');
        return (
          Number.isFinite(date.getTime()) &&
          date.toISOString().slice(0, 10) === value &&
          date <= new Date()
        );
      }, 'Informe uma data de nascimento válida.')
      .nullable()
      .optional(),
  })
  .strict();
export interface ProfileBasics {
  displayName: string;
  bio: string | null;
  institution: string | null;
  pronouns: string | null;
  github_username: string | null;
  discord_username: string | null;
  birthday: string | null;
}

export const profilePreferencesSchema = z
  .object({
    appearance: z
      .object({
        backgroundColor: optionalColor,
        accentColor: optionalColor,
        secondaryColor: optionalColor,
        cardColor: optionalColor,
        borderColor: optionalColor,
        buttonColor: optionalColor,
      })
      .strict(),
    nameStyle: z
      .object({
        color: optionalColor,
        bold: z.boolean(),
        italic: z.boolean(),
        underline: z.boolean(),
      })
      .strict(),
    banner: z
      .object({
        mode: z.enum(['default', 'color', 'gradient', 'image']),
        color: hex,
        secondaryColor: hex,
        imageUrl: assetUrl.nullable(),
        positionX: z.number().min(0).max(100),
        positionY: z.number().min(0).max(100),
      })
      .strict(),
    flag: flagId.nullable(),
    flags: z
      .array(flagId)
      .max(3)
      .transform((values) => [...new Set(values)])
      .optional(),
    frameId: z.string().min(1).max(80),
    tags: z
      .array(tag)
      .max(10)
      .transform((values) => [...new Set(values)]),
    tagColors: z
      .record(tag, hex)
      .refine((value) => Object.keys(value).length <= 10, 'Use até dez cores de tags.')
      .optional(),
    studies: z
      .array(safeText(60).min(2))
      .max(3)
      .transform((values) => [...new Set(values)]),
    studyDetails: z.array(profileStudySchema).max(3).optional(),
    socialLinks: z.array(profileSocialLinkSchema).max(5).optional(),
    music: z
      .object({
        trackId: z.string().regex(/^[a-zA-Z0-9]{22}$/),
        // Spotify metadata is plain text, rendered escaped by React/native Text.
        // Legitimate track/artist names can contain angle brackets.
        title: z.string().trim().max(200).nullable(),
        artist: z.string().trim().max(200).nullable(),
        artworkUrl: assetUrl.nullable(),
        album: z.string().trim().max(200).nullable().optional(),
        durationMs: z.number().int().min(0).max(86400000).nullable().optional(),
      })
      .strict()
      .nullable(),
    equippedTitleId: z.string().max(80).nullable(),
    featuredAchievementIds: z
      .array(z.string().max(80))
      .max(3)
      .transform((values) => [...new Set(values)]),
  })
  .strict();

export const privateChatSchema = z
  .object({
    mode: z.enum(['default', 'dark', 'custom']),
    bubbleColor: optionalColor,
    accentColor: optionalColor,
    backgroundColor: optionalColor,
  })
  .strict();
export type ProfilePreferences = z.infer<typeof profilePreferencesSchema>;
export type PrivateChatPreferences = z.infer<typeof privateChatSchema>;
export const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  appearance: {
    backgroundColor: null,
    accentColor: null,
    secondaryColor: null,
    cardColor: null,
    borderColor: null,
    buttonColor: null,
  },
  nameStyle: { color: null, bold: false, italic: false, underline: false },
  banner: {
    mode: 'default',
    color: '#0083fe',
    secondaryColor: '#7c3aed',
    imageUrl: null,
    positionX: 50,
    positionY: 50,
  },
  flag: null,
  frameId: 'none',
  tags: [],
  studies: [],
  music: null,
  equippedTitleId: null,
  featuredAchievementIds: [],
};
export const DEFAULT_CHAT_PREFERENCES: PrivateChatPreferences = {
  mode: 'default',
  bubbleColor: null,
  accentColor: null,
  backgroundColor: null,
};

export const achievementDefinitionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9][a-z0-9_-]{1,79}$/),
    name: safeText(60).min(2),
    description: safeText(200).min(5),
    icon: z.enum([
      'award',
      'message',
      'users',
      'heart',
      'code',
      'sparkles',
      'ghost',
      'gift',
      'cake',
      'sprout',
    ]),
    category: z.enum(['posts', 'comments', 'community', 'learning', 'event']),
    rarity: z.enum(PROFILE_RARITIES),
    color: hex,
    requirement: z
      .object({
        metric: z.enum(PROFILE_METRICS),
        target: z.number().int().min(1).max(1000000),
        eventId: z.string().max(80).optional(),
      })
      .strict(),
  })
  .strict();
export type AchievementDefinition = z.infer<typeof achievementDefinitionSchema>;
export const avatarFrameSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,80}$/),
    name: safeText(50),
    color: hex,
    decoration: z.enum([
      'none',
      'minimal',
      'neon',
      'cyberpunk',
      'circuit',
      'pixel',
      'galaxy',
      'hacker',
      'halloween',
      'christmas',
      'legendary',
      'alien',
      'hat',
      'pride',
      'country',
      'propeller',
      'orbit',
      'laurel',
      'aurora',
    ]),
    achievementId: z.string().max(80).optional(),
  })
  .strict();
export type AvatarFrameDefinition = z.infer<typeof avatarFrameSchema>;
export const profileEventSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9_-]{1,80}$/),
    name: safeText(80),
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
    hashtag: z
      .string()
      .min(2)
      .max(40)
      .regex(/^[\p{L}\p{N}_]+$/u),
    enabled: z.boolean(),
  })
  .strict()
  .refine(
    (value) => new Date(value.endsAt) > new Date(value.startsAt),
    'O término deve ser posterior ao início.'
  );
export const profileCatalogSchema = z
  .object({
    frames: z.array(avatarFrameSchema).min(1).max(100),
    achievements: z.array(achievementDefinitionSchema).min(1).max(150),
    events: z.array(profileEventSchema).max(30),
  })
  .strict()
  .superRefine((catalog, context) => {
    for (const key of ['frames', 'achievements', 'events'] as const)
      if (new Set(catalog[key].map((value) => value.id)).size !== catalog[key].length)
        context.addIssue({ code: 'custom', message: `IDs duplicados em ${key}.`, path: [key] });
    const eventIds = new Set(catalog.events.map((value) => value.id));
    const achievementIds = new Set(catalog.achievements.map((value) => value.id));
    for (const achievement of catalog.achievements)
      if (
        achievement.requirement.metric.startsWith('event') &&
        !eventIds.has(achievement.requirement.eventId || '')
      )
        context.addIssue({
          code: 'custom',
          message: 'Conquista de evento requer um evento existente.',
          path: ['achievements'],
        });
    for (const frame of catalog.frames)
      if (frame.achievementId && !achievementIds.has(frame.achievementId))
        context.addIssue({
          code: 'custom',
          message: 'Moldura requer conquista existente.',
          path: ['frames'],
        });
    if (
      !catalog.frames.some(
        (frame) => frame.id === 'none' && frame.decoration === 'none' && !frame.achievementId
      )
    )
      context.addIssue({
        code: 'custom',
        message: 'Mantenha a opção sem moldura disponível.',
        path: ['frames'],
      });
  });
export type ProfileCatalog = z.infer<typeof profileCatalogSchema>;
const achievement = (
  id: string,
  name: string,
  metric: ProfileMetric,
  target: number,
  category: AchievementDefinition['category'],
  rarity: ProfileRarity,
  color: string,
  eventId?: string
): AchievementDefinition => ({
  id,
  name,
  description:
    metric === 'posts'
      ? `Publique ${target} ${target === 1 ? 'publicação válida' : 'publicações válidas'}.`
      : metric === 'comments'
        ? `Escreva ${target} comentários válidos.`
        : metric === 'peopleHelped'
          ? `Responda a ${target} pessoas diferentes.`
          : metric === 'likes'
            ? `Receba ${target} curtidas válidas.`
            : metric === 'followers'
              ? `Conquiste ${target} seguidores válidos.`
              : metric === 'learningActivities'
                ? 'Conclua uma atividade com sucesso.'
                : metric === 'completedTrails'
                  ? `Conclua ${target} ${target === 1 ? 'trilha inteira' : 'trilhas inteiras'} de aprendizagem.`
                  : metric === 'eventPosts'
                    ? 'Publique com a hashtag do evento durante o período.'
                    : metric === 'eventComments'
                      ? `Comente em ${target} publicações diferentes do evento.`
                      : 'Conclua todos os desafios deste evento.',
  icon:
    id === 'posts-1'
      ? 'sprout'
      : category === 'event'
        ? 'ghost'
        : category === 'posts'
          ? 'award'
          : category === 'comments'
            ? 'message'
            : category === 'learning'
              ? 'code'
              : 'users',
  category,
  rarity,
  color,
  requirement: { metric, target, ...(eventId ? { eventId } : {}) },
});
const colors = {
  common: '#64748b',
  uncommon: '#16a34a',
  rare: '#0083fe',
  epic: '#a855f7',
  legendary: '#eab308',
  special: '#f97316',
};
export const DEFAULT_PROFILE_CATALOG: ProfileCatalog = {
  frames: [
    { id: 'none', name: 'Sem moldura', color: '#64748b', decoration: 'none' },
    { id: 'minimal', name: 'Minimalista', color: '#94a3b8', decoration: 'minimal' },
    { id: 'alien', name: 'Alienígena', color: '#72b981', decoration: 'alien' },
    { id: 'hat', name: 'Chapéu', color: '#94a3b8', decoration: 'hat' },
    { id: 'neon-blue', name: 'Neon azul', color: '#0083fe', decoration: 'neon' },
    { id: 'neon-purple', name: 'Neon roxo', color: '#a855f7', decoration: 'neon' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: '#ec4899', decoration: 'cyberpunk' },
    { id: 'circuit', name: 'Circuitos', color: '#06b6d4', decoration: 'circuit' },
    { id: 'pixel', name: 'Pixel art', color: '#f97316', decoration: 'pixel' },
    { id: 'galaxy', name: 'Galáxia', color: '#8b5cf6', decoration: 'galaxy' },
    { id: 'hacker', name: 'Hacker', color: '#22c55e', decoration: 'hacker' },
    {
      id: 'halloween',
      name: 'Halloween',
      color: '#f97316',
      decoration: 'halloween',
      achievementId: 'halloween-spirit',
    },
    {
      id: 'christmas',
      name: 'Natal',
      color: '#ef4444',
      decoration: 'christmas',
      achievementId: 'christmas-spirit',
    },
    {
      id: 'legendary',
      name: 'Lendária',
      color: '#eab308',
      decoration: 'legendary',
      achievementId: 'posts-1000',
    },
    ...EXTRA_PROFILE_FRAMES,
  ],
  achievements: [
    ...(
      [
        [1, 'Primeiros Passos', 'common'],
        [10, 'Voz Ativa', 'uncommon'],
        [50, 'Criador Ativo', 'rare'],
        [100, 'Criador Frequente', 'rare'],
        [200, 'Criador Consistente', 'epic'],
        [500, 'Veterano', 'epic'],
        [1000, 'Ícone do Stacklyst', 'legendary'],
      ] as const
    ).map(([target, name, rarity]) =>
      achievement(`posts-${target}`, name, 'posts', target, 'posts', rarity, colors[rarity])
    ),
    ...(
      [
        [5, 'Participativo', 'common'],
        [10, 'Comunicativo', 'uncommon'],
        [50, 'Conversador', 'rare'],
        [100, 'Voz da Comunidade', 'epic'],
      ] as const
    ).map(([target, name, rarity]) =>
      achievement(
        `comments-${target}`,
        name,
        'comments',
        target,
        'comments',
        rarity,
        colors[rarity]
      )
    ),
    achievement(
      'people-5',
      'Mão amiga',
      'peopleHelped',
      5,
      'community',
      'uncommon',
      colors.uncommon
    ),
    achievement(
      'people-10',
      'Conecta pessoas',
      'peopleHelped',
      10,
      'community',
      'rare',
      colors.rare
    ),
    achievement('likes-100', 'Em Destaque', 'likes', 100, 'community', 'rare', colors.rare),
    achievement('likes-1000', 'Apreciado', 'likes', 1000, 'community', 'epic', colors.epic),
    achievement('followers-100', 'Popular', 'followers', 100, 'community', 'epic', colors.epic),
    achievement(
      'followers-1000',
      'Comunicador',
      'followers',
      1000,
      'community',
      'legendary',
      colors.legendary
    ),
    achievement(
      'learning-first',
      'Aprendiz em ação',
      'learningActivities',
      1,
      'learning',
      'uncommon',
      colors.uncommon
    ),
    achievement('trails-1', 'Explorador', 'completedTrails', 1, 'learning', 'rare', colors.rare),
    achievement('trails-3', 'Maratonista', 'completedTrails', 3, 'learning', 'epic', colors.epic),
    achievement(
      'halloween-spirit',
      'Espírito de Halloween',
      'eventPosts',
      1,
      'event',
      'special',
      '#f97316',
      'halloween-2026'
    ),
    achievement(
      'halloween-night',
      'Criatura da Noite',
      'eventComments',
      5,
      'event',
      'special',
      '#a855f7',
      'halloween-2026'
    ),
    achievement(
      'halloween-legend',
      'Lenda Assombrada',
      'eventComplete',
      1,
      'event',
      'special',
      '#f97316',
      'halloween-2026'
    ),
    achievement(
      'christmas-spirit',
      'Espírito do Natal',
      'eventPosts',
      1,
      'event',
      'special',
      '#ef4444',
      'christmas-2026'
    ),
    achievement(
      'birthday-founder',
      'Celebração Stacklyst',
      'eventPosts',
      1,
      'event',
      'special',
      '#0083fe',
      'birthday-template'
    ),
  ],
  events: [
    {
      id: 'halloween-2026',
      name: 'Halloween no Stacklyst',
      startsAt: '2026-10-25T03:00:00.000Z',
      endsAt: '2026-11-01T03:00:00.000Z',
      hashtag: 'Halloween',
      enabled: true,
    },
    {
      id: 'christmas-2026',
      name: 'Natal no Stacklyst',
      startsAt: '2026-12-20T03:00:00.000Z',
      endsAt: '2026-12-26T03:00:00.000Z',
      hashtag: 'NatalStacklyst',
      enabled: true,
    },
    {
      id: 'birthday-template',
      name: 'Aniversário do Stacklyst',
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-01-02T00:00:00.000Z',
      hashtag: 'AniversarioStacklyst',
      enabled: false,
    },
  ],
};
export interface AchievementProgress extends AchievementDefinition {
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}
export interface ProfileCustomizationState {
  avatarUrl: string | null;
  /** Canonical persisted legacy banner, including removal after a reset. */
  bannerUrl?: string | null;
  preferences: ProfilePreferences;
  chat: PrivateChatPreferences;
  version: number;
  catalog: ProfileCatalog;
  achievements: AchievementProgress[];
  newUnlocks: string[];
  /** Private editable fields, returned only to the authenticated owner. */
  profile?: ProfileBasics;
}
export function getProfileFlags(locale = 'pt-BR') {
  return getFlagCatalog(locale);
}
export function getSelectedProfileFlags(preferences: ProfilePreferences) {
  return preferences.flags ?? (preferences.flag ? [preferences.flag] : []);
}
export function getProfileStudies(preferences: ProfilePreferences): ProfileStudy[] {
  return (
    preferences.studyDetails ??
    preferences.studies.map((subject) => ({
      subject,
      description: null,
      progress: null,
      status: 'studying' as const,
    }))
  );
}
/** Upgrade old JSON and old client payloads without resetting unrelated preferences. */
export function normalizeProfilePreferenceAliases(
  preferences: ProfilePreferences,
  current?: ProfilePreferences
): ProfilePreferences {
  const equal = (first: readonly string[], second: readonly string[]) =>
    first.length === second.length && first.every((value, index) => value === second[index]);
  const currentFlags = current ? getSelectedProfileFlags(current) : undefined;
  // Older apps spread a full GET response before changing only the legacy alias.
  // A changed new array wins; an unchanged array must not hide that older edit.
  const legacyFlagChanged = current && preferences.flag !== current.flag;
  const newFlagsChanged =
    preferences.flags !== undefined &&
    currentFlags !== undefined &&
    !equal(preferences.flags, currentFlags);
  const flags =
    legacyFlagChanged && !newFlagsChanged
      ? preferences.flag
        ? [preferences.flag]
        : []
      : (preferences.flags ?? currentFlags ?? getSelectedProfileFlags(preferences));
  const currentStudies = current ? getProfileStudies(current) : undefined;
  const studyKey = (studies: readonly ProfileStudy[]) =>
    JSON.stringify(
      studies.map((study) => [
        study.subject,
        study.description ?? null,
        study.progress ?? null,
        study.status,
      ])
    );
  const legacyStudiesChanged = current && !equal(preferences.studies, current.studies);
  const newStudiesChanged =
    preferences.studyDetails !== undefined &&
    currentStudies !== undefined &&
    studyKey(preferences.studyDetails) !== studyKey(currentStudies);
  const studyDetails =
    legacyStudiesChanged && !newStudiesChanged
      ? preferences.studies.map(
          (subject) =>
            currentStudies?.find((study) => study.subject === subject) ?? {
              subject,
              description: null,
              progress: null,
              status: 'studying' as const,
            }
        )
      : (preferences.studyDetails ?? currentStudies ?? getProfileStudies(preferences));
  const tagColors = Object.fromEntries(
    Object.entries(preferences.tagColors ?? current?.tagColors ?? {}).filter(([key]) =>
      preferences.tags.includes(key)
    )
  );
  return {
    ...preferences,
    flag: flags[0] ?? null,
    flags,
    tags: preferences.tags,
    tagColors,
    studies: studyDetails.map((study) => study.subject),
    studyDetails,
    socialLinks: preferences.socialLinks ?? current?.socialLinks ?? [],
  };
}
export function parseProfilePreferences(value: unknown): ProfilePreferences {
  const parsed = profilePreferencesSchema.safeParse(value);
  return parsed.success
    ? normalizeProfilePreferenceAliases(parsed.data)
    : structuredClone(DEFAULT_PROFILE_PREFERENCES);
}
export function parsePrivateChat(value: unknown): PrivateChatPreferences {
  const parsed = privateChatSchema.safeParse(value);
  return parsed.success ? parsed.data : structuredClone(DEFAULT_CHAT_PREFERENCES);
}
export function colorContrast(first: string, second: string) {
  const lum = (color: string) => {
    const rgb = [1, 3, 5]
      .map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const a = lum(first),
    b = lum(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
