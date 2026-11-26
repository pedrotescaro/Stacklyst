import { describe, expect, it } from 'vitest';
import {
  getFollowProfileBanner,
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
  it('exposes selected public identity decorations without private configuration or a configured level', () => {
    const frame = { id: 'frame-neon', decoration: 'neon', color: '#0083fe' };
    const nameStyle = { color: '#c084fc', bold: true, italic: false, underline: true };
    const title = { id: 'pythonista', name: 'Pythonista', color: '#22c55e', rarity: 'rare' };
    expect(
      getFollowProfileIdentity({
        privateSecret: 'private',
        profileStyle: {
          frame,
          flags: ['BR', 'pride-trans', 'not-a-flag'],
          nameStyle: { ...nameStyle, privateSecret: 'private' },
          title: { ...title, privateSecret: 'private' },
          level: 99,
        },
      })
    ).toEqual({ frame, flags: ['BR', 'pride-trans'], nameStyle, title });
    expect(getFollowProfileIdentity({ frame: { ...frame, color: 'invalid' }, flag: 'BR' })).toEqual(
      { frame: null, flags: ['BR'] }
    );
    expect(getFollowProfileIdentity(null)).toEqual({ frame: null, flags: [] });
  });
  it('validates optional name and title decorations from serialized profile settings', () => {
    expect(
      getFollowProfileIdentity(
        JSON.stringify({
          profileStyle: {
            nameStyle: { color: 'url(private)', bold: 'true', italic: true },
            flags: ['BR', 'BR'],
            title: { name: 'a'.repeat(61) },
          },
        })
      )
    ).toEqual({
      frame: null,
      flags: ['BR'],
      nameStyle: { color: null, bold: false, italic: true, underline: false },
    });
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

  describe('Suggestion banners', () => {
    const prefs = (banner: Record<string, unknown>) => ({
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
        ...banner,
      },
      flag: null,
      frameId: 'none',
      tags: [],
      studies: [],
      music: null,
      equippedTitleId: null,
      featuredAchievementIds: [],
    });
    it('uses a GIF or image banner with its position', () => {
      expect(
        getFollowProfileBanner(
          prefs({ mode: 'image', imageUrl: 'https://static.klipy.com/x.webp', positionY: 30 })
        )
      ).toEqual({
        mode: 'image',
        imageUrl: 'https://static.klipy.com/x.webp',
        positionX: 50,
        positionY: 30,
      });
    });
    it('uses colors and gradients, and the legacy cover on the default setting', () => {
      expect(
        getFollowProfileBanner(
          prefs({ mode: 'gradient', color: '#111111', secondaryColor: '#222222' })
        )
      ).toEqual({
        mode: 'gradient',
        color: '#111111',
        secondaryColor: '#222222',
      });
      expect(getFollowProfileBanner(prefs({}), '/uploads/cover.png')).toMatchObject({
        mode: 'image',
        imageUrl: '/uploads/cover.png',
      });
      expect(getFollowProfileBanner(undefined, 'javascript:alert(1)')).toEqual({ mode: 'default' });
      expect(getFollowProfileBanner(undefined, null)).toEqual({ mode: 'default' });
    });
  });
});
