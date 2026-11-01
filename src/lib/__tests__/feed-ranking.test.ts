import { describe, expect, it } from 'vitest';
import {
  buildPopularFeedCursorWhere,
  encodePopularFeedCursor,
  rankRecentFeedPage,
} from '../feed-ranking';

const now = new Date('2026-11-01T12:00:00Z').getTime();
function post(id: string, author: string, language: string | null = null, hours = 1) {
  return {
    id,
    author_id: author,
    language,
    created_at: new Date(now - hours * 3600000),
    upvotes: 0,
  };
}
describe('Recent feed ranking', () => {
  it('keeps a new general post visible while ranking matching languages and connections', () => {
    const posts = [
      post('new-general', 'first', null, 0),
      post('unrelated', 'second', 'JAVA'),
      post('typescript', 'third', 'TS'),
      post('friend', 'fourth', 'JAVA'),
    ];
    const ranked = rankRecentFeedPage(posts, {
      languages: ['TS'],
      followingIds: new Set(['fourth']),
      now,
    });
    expect(ranked.map((post) => post.id)).toEqual([
      'new-general',
      'typescript',
      'friend',
      'unrelated',
    ]);
    expect(posts.map((post) => post.id)).toEqual([
      'new-general',
      'unrelated',
      'typescript',
      'friend',
    ]);
  });
  it('diversifies authors without dropping or duplicating a post', () => {
    const posts = [post('one', 'prolific'), post('two', 'prolific'), post('three', 'another')];
    const ranked = rankRecentFeedPage(posts, { now });
    expect(ranked.map((post) => post.id)).toEqual(['one', 'three', 'two']);
    expect(new Set(ranked.map((post) => post.id)).size).toBe(posts.length);
  });
  it('prevents an old popular post from displacing the newest post', () => {
    const posts = [
      post('fresh', 'a', null, 0),
      { ...post('popular', 'b', 'TS', 72), upvotes: 9999 },
      post('recent', 'c', null, 1),
    ];
    expect(rankRecentFeedPage(posts, { languages: ['TS'], now }).map((post) => post.id)).toEqual([
      'fresh',
      'recent',
      'popular',
    ]);
  });
  it('includes every popularity tie breaker in a following-feed cursor', () => {
    const item = post('last', 'author');
    const cursor = encodePopularFeedCursor({ ...item, upvotes: 4 });
    expect(buildPopularFeedCursorWhere(cursor)).toEqual({
      OR: [
        { upvotes: { lt: 4 } },
        { upvotes: 4, created_at: { lt: item.created_at } },
        { upvotes: 4, created_at: item.created_at, id: { lt: item.id } },
      ],
    });
  });
  it('rejects malformed or oversized popularity values before querying PostgreSQL', () => {
    for (const p of [1.5, '4', 9999999999999]) {
      const cursor = Buffer.from(
        JSON.stringify({ t: new Date(now).toISOString(), i: 'post', p })
      ).toString('base64url');
      expect(() => buildPopularFeedCursorWhere(cursor)).toThrow('Cursor inválido');
    }
  });
});
