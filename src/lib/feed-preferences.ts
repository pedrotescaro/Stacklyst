import { z } from 'zod';

export const feedLanguageSchema = z.enum(['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA']);
export const FEED_LANGUAGES = [
  { code: 'JS', label: 'JavaScript' },
  { code: 'TS', label: 'TypeScript' },
  { code: 'PYTHON', label: 'Python' },
  { code: 'RUST', label: 'Rust' },
  { code: 'GO', label: 'Go' },
  { code: 'JAVA', label: 'Java' },
] as const;

export const feedDefinitionSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,64}$/),
  name: z.string().trim().min(1, 'Dê um nome ao feed.').max(32),
  source: z.enum(['for-you', 'following']),
  visible: z.boolean(),
  languages: z.array(feedLanguageSchema).max(6),
  showCode: z.boolean(),
  showMedia: z.boolean(),
  showPolls: z.boolean(),
  showGeneral: z.boolean(),
  blockedTerms: z.array(z.string().trim().min(1).max(60)).max(50),
});
export type FeedDefinition = z.infer<typeof feedDefinitionSchema>;

export const feedSettingsSchema = z
  .object({ feeds: z.array(feedDefinitionSchema).min(2).max(12), defaultFeedId: z.string() })
  .superRefine((settings, ctx) => {
    const valid =
      new Set(settings.feeds.map((feed) => feed.id)).size === settings.feeds.length &&
      settings.feeds.some((feed) => feed.id === 'following' && feed.source === 'following') &&
      settings.feeds.some((feed) => feed.id === 'for-you' && feed.source === 'for-you') &&
      settings.feeds.some((feed) => feed.id === settings.defaultFeedId && feed.visible);
    if (!valid)
      ctx.addIssue({
        code: 'custom',
        message: 'Mantenha os feeds padrão e um feed inicial visível.',
      });
  });
export type FeedSettings = z.infer<typeof feedSettingsSchema>;

export function createFeed(
  id: string,
  name: string,
  languages: FeedDefinition['languages']
): FeedDefinition {
  return {
    id,
    name,
    source: id === 'following' ? 'following' : 'for-you',
    visible: true,
    languages,
    showCode: true,
    showMedia: true,
    showPolls: true,
    showGeneral: true,
    blockedTerms: [],
  };
}

export function getFeedSettings(
  preferences?: {
    feed: 'for-you' | 'following';
    languages: FeedDefinition['languages'];
    feedSettings?: FeedSettings;
  } | null
): FeedSettings {
  return (
    preferences?.feedSettings ?? {
      defaultFeedId: preferences?.feed ?? 'for-you',
      feeds: [
        createFeed('following', 'Seguindo', []),
        createFeed('for-you', 'Para você', preferences?.languages ?? ['JS']),
      ],
    }
  );
}
