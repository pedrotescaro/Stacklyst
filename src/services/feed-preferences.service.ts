import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ONBOARDING_STATE_KEY, parseOnboarding } from '@/lib/onboarding';
import { getFeedSettings, type FeedDefinition } from '@/lib/feed-preferences';
import { NotFoundError } from '@/lib/errors';

export async function loadFeedDefinition(userId: string | null, feedId?: string) {
  if (!userId || !feedId) return undefined;
  const state = await prisma.mobileState.findUnique({
    where: { user_id_key: { user_id: userId, key: ONBOARDING_STATE_KEY } },
  });
  const feed = getFeedSettings(parseOnboarding(state?.value)).feeds.find(
    (item) => item.id === feedId
  );
  if (!feed) throw new NotFoundError('FEED_NOT_FOUND', 'Feed não encontrado.');
  return feed;
}

/** Apply exclusions before pagination, so hidden posts never produce short or missing pages. */
export function feedDefinitionWhere(feed?: FeedDefinition): Prisma.PostWhereInput {
  if (!feed) return {};
  const code: Prisma.PostWhereInput = {
    AND: [{ code_snippet: { not: null } }, { code_snippet: { not: '' } }],
  };
  const media: Prisma.PostWhereInput = {
    OR: [
      { AND: [{ image_url: { not: null } }, { image_url: { not: '' } }] },
      { media: { some: {} } },
      {
        AND: [
          { attachments: { not: Prisma.DbNull } },
          { attachments: { not: Prisma.JsonNull } },
          { NOT: { attachments: { equals: [] } } },
        ],
      },
      { AND: [{ music: { not: Prisma.DbNull } }, { music: { not: Prisma.JsonNull } }] },
    ],
  };
  const poll: Prisma.PostWhereInput = { poll: { isNot: null } };
  const exclusions: Prisma.PostWhereInput[] = [];
  if (!feed.showCode) exclusions.push({ NOT: code });
  if (!feed.showMedia) exclusions.push({ NOT: media });
  if (!feed.showPolls) exclusions.push({ NOT: poll });
  if (!feed.showGeneral) exclusions.push({ OR: [code, media, poll] });
  for (const term of feed.blockedTerms) {
    // Escape LIKE wildcards: users block literal words, not SQL patterns.
    const literal = term.replace(/[\\%_]/g, '\\$&');
    exclusions.push({
      NOT: {
        OR: [
          { title: { contains: literal, mode: 'insensitive' } },
          { body: { contains: literal, mode: 'insensitive' } },
          {
            AND: [
              { code_snippet: { not: null } },
              { code_snippet: { contains: literal, mode: 'insensitive' } },
            ],
          },
          { poll: { is: { question: { contains: literal, mode: 'insensitive' } } } },
        ],
      },
    });
  }
  if (feed.id !== 'for-you' && feed.languages.length)
    exclusions.push({ language: { in: feed.languages } });
  return { AND: exclusions };
}
