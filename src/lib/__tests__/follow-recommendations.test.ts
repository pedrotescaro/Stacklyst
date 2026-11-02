import { describe, expect, it } from 'vitest';
import {
  getFollowProfileIdentity,
  scoreFollowCandidate,
  type RecommendationCandidate,
  parseFollowRecommendationQuery,
  normalizeFollowRecommendationExclusions,
} from '../follow-recommendations';
const now = Date.parse('2026-11-01T12:00:00Z');
const base: RecommendationCandidate = {
  id: 'candidate',
  activityAt: now,
  followers: 0,
  mutualCount: 0,
  interactionCount: 0,
  languages: [],
};
describe('Profile recommendation relevance', () => {
  it('validates bounded refresh exclusions while preserving legacy text IDs', () => {
    expect(parseFollowRecommendationQuery(new URLSearchParams())).toEqual({
      limit: 5,
      exclude: [],
    });
    expect(
      parseFollowRecommendationQuery(
        new URLSearchParams({
          limit: '3',
          exclude: 'legacy-user_1,123e4567-e89b-12d3-a456-426614174000,legacy-user_1',
        })
      )
    ).toEqual({ limit: 3, exclude: ['legacy-user_1', '123e4567-e89b-12d3-a456-426614174000'] });
    expect(normalizeFollowRecommendationExclusions([' legacy-user '])).toEqual(['legacy-user']);
    const invalidQueries: Record<string, string>[] = [
      { limit: '11' },
      { limit: '0' },
      { limit: '1.5' },
      { exclude: 'user,,another' },
      { exclude: 'private/user' },
      { exclude: '../private' },
      { exclude: 'a'.repeat(121) },
      { exclude: Array.from({ length: 51 }, (_, i) => `user-${i}`).join(',') },
      { exclude: 'a'.repeat(6050) },
    ];
    for (const query of invalidQueries)
      expect(() => parseFollowRecommendationQuery(new URLSearchParams(query))).toThrow();
    expect(() =>
      parseFollowRecommendationQuery(new URLSearchParams('exclude=first&exclude=second'))
    ).toThrow();
  });
  it('exposes only validated frames and selected flags, without titles or private configuration', () => {
    const frame = { id: 'frame-neon', decoration: 'neon', color: '#0083fe' };
    expect(
      getFollowProfileIdentity({
        privateSecret: 'private',
        profileStyle: {
          frame,
          flags: ['BR', 'pride-trans', 'not-a-flag'],
          title: { name: 'Hidden title' },
          level: 99,
        },
      })
    ).toEqual({ frame, flags: ['BR', 'pride-trans'] });
    expect(getFollowProfileIdentity({ frame: { ...frame, color: 'invalid' }, flag: 'BR' })).toEqual(
      { frame: null, flags: ['BR'] }
    );
    expect(getFollowProfileIdentity(null)).toEqual({ frame: null, flags: [] });
  });
  it('prioritizes real connections and shared interests over raw popularity', () => {
    const popular = scoreFollowCandidate({ ...base, followers: 1000000000 }, ['TS'], now);
    const mutual = scoreFollowCandidate({ ...base, mutualCount: 1 }, ['TS'], now);
    const interested = scoreFollowCandidate({ ...base, languages: ['TS'] }, ['TS'], now);
    expect(mutual.score).toBeGreaterThan(popular.score);
    expect(interested.score).toBeGreaterThan(popular.score);
    expect(mutual.reason).toEqual({ type: 'mutual', count: 1 });
    expect(interested.reason).toEqual({ type: 'language', language: 'TS' });
  });
  it('explains only actual signals and favors recently active discovery profiles', () => {
    expect(scoreFollowCandidate({ ...base, interactionCount: 2 }, [], now).reason).toEqual({
      type: 'interaction',
    });
    expect(scoreFollowCandidate(base, ['TS'], now).reason).toEqual({ type: 'active' });
    expect(scoreFollowCandidate(base, [], now).score).toBeGreaterThan(
      scoreFollowCandidate({ ...base, activityAt: now - 180 * 86400000 }, [], now).score
    );
  });
});
