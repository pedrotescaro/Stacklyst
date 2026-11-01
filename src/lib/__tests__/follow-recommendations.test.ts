import { describe, expect, it } from 'vitest';
import { scoreFollowCandidate, type RecommendationCandidate } from '../follow-recommendations';
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
