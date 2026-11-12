import { prisma } from '@/lib/prisma';

export interface PopularHashtag {
  tag: string;
  count: number;
}

/**
 * A hashtag starts after a non-word boundary (so URL fragments like `/#x` and
 * HTML entities like `&#123;` are ignored), begins with a letter, and is at most
 * 50 characters. Accented letters are included through the POSIX classes.
 */
const HASHTAG_PATTERN = '(^|[^[:alnum:]_&/])#([[:alpha:]][[:alnum:]_]{1,49})';

export const HashtagService = {
  /** Most used hashtags in public posts the viewer is allowed to see. */
  async popular(viewerId: string | null, limit = 12): Promise<PopularHashtag[]> {
    const take = Math.min(Math.max(Math.floor(limit), 1), 30);
    const rows = await prisma.$queryRaw<Array<{ tag: string; count: number }>>`
      SELECT lower(m[2]) AS tag, COUNT(DISTINCT p.id)::int AS count
      FROM "Post" p
      CROSS JOIN LATERAL regexp_matches(
        COALESCE(p.title, '') || ' ' || COALESCE(p.body, ''),
        ${HASHTAG_PATTERN},
        'g'
      ) AS m
      WHERE p.audience = 'everyone'
        AND NOT EXISTS (
          SELECT 1 FROM "user_blocks" b
          WHERE (b."blockerId" = ${viewerId} AND b."blockedId" = p.author_id)
             OR (b."blockedId" = ${viewerId} AND b."blockerId" = p.author_id)
        )
      GROUP BY 1
      ORDER BY count DESC, max(p.created_at) DESC
      LIMIT ${take}
    `;
    return rows.map((row) => ({ tag: row.tag, count: Number(row.count) }));
  },
};
