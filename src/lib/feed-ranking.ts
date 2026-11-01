import { decodeCursor } from './pagination';
import { ValidationError } from './errors';

interface RecentFeedPost {
  id: string;
  author_id: string;
  created_at: Date | string;
  language?: string | null;
  upvotes?: number;
  _count?: { answers?: number };
}

/** Rank an already paginated chronological block. No candidate is discarded, so
 * the chronological cursor keeps every visible post reachable exactly once. */
export function rankRecentFeedPage<T extends RecentFeedPost>(
  posts: T[],
  preferences: { languages?: string[]; followingIds?: Set<string>; now?: number } = {}
): T[] {
  if (posts.length < 2) return posts;
  const now = preferences.now ?? Date.now();
  const interests = new Set(preferences.languages ?? []);
  const newest = posts[0];
  // Keep the newest post first: refresh must always reveal a newly published post.
  const result = [newest];
  const remaining = posts.slice(1);
  const authors = new Map<string, number>([[newest.author_id, 1]]);
  const score = (post: T) => {
    const ageHours = Math.max(0, (now - new Date(post.created_at).getTime()) / 3600000);
    return (
      40 * Math.exp(-ageHours / 24) +
      (post.language && interests.has(post.language) ? 12 : 0) +
      (preferences.followingIds?.has(post.author_id) ? 8 : 0) +
      Math.min(6, Math.log1p(Math.max(0, post.upvotes ?? 0) + (post._count?.answers ?? 0)) * 2) -
      (authors.get(post.author_id) ?? 0) * 14
    );
  };
  while (remaining.length) {
    let bestIndex = 0;
    for (let index = 1; index < remaining.length; index++) {
      if (score(remaining[index]) > score(remaining[bestIndex])) bestIndex = index;
    }
    const [next] = remaining.splice(bestIndex, 1);
    result.push(next);
    authors.set(next.author_id, (authors.get(next.author_id) ?? 0) + 1);
  }
  return result;
}

export function encodePopularFeedCursor(post: { created_at: Date; id: string; upvotes: number }) {
  return Buffer.from(
    JSON.stringify({ t: post.created_at.toISOString(), i: post.id, p: post.upvotes })
  ).toString('base64url');
}

/** Popular is an explicit following-feed choice, with the complete order in its cursor. */
export function buildPopularFeedCursorWhere(cursor?: string) {
  if (!cursor) return {};
  const chronological = decodeCursor(cursor);
  if (
    !Number.isFinite(new Date(chronological.t).getTime()) ||
    typeof chronological.i !== 'string' ||
    !chronological.i ||
    chronological.i.length > 128
  ) {
    throw new ValidationError('INVALID_CURSOR', 'Cursor inválido');
  }
  let popularity: unknown;
  try {
    popularity = JSON.parse(Buffer.from(cursor, 'base64url').toString()).p;
  } catch {
    /* Legacy chronological cursor. */
  }
  if (popularity === undefined) {
    return {
      OR: [
        { created_at: { lt: new Date(chronological.t) } },
        { created_at: new Date(chronological.t), id: { lt: chronological.i } },
      ],
    };
  }
  if (
    typeof popularity !== 'number' ||
    !Number.isInteger(popularity) ||
    popularity < -2147483648 ||
    popularity > 2147483647
  ) {
    throw new ValidationError('INVALID_CURSOR', 'Cursor inválido');
  }
  return {
    OR: [
      { upvotes: { lt: popularity } },
      { upvotes: popularity, created_at: { lt: new Date(chronological.t) } },
      { upvotes: popularity, created_at: new Date(chronological.t), id: { lt: chronological.i } },
    ],
  };
}
