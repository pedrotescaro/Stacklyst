import { describe, expect, it } from 'vitest';
import { createFeed, feedSettingsSchema, getFeedSettings } from '../feed-preferences';
import { parseOnboarding } from '../onboarding';

describe('feed preferences validation', () => {
  it('keeps legacy language preferences and creates the two built-in feeds', () => {
    const prefs = parseOnboarding({ feed: 'following', languages: ['PYTHON'] })!;
    expect(getFeedSettings(prefs).defaultFeedId).toBe('following');
    expect(getFeedSettings(prefs).feeds.map((feed) => feed.id)).toEqual(['following', 'for-you']);
  });
  it('rejects duplicate IDs, missing built-ins, hidden defaults and more than 12 feeds', () => {
    const settings = getFeedSettings();
    expect(
      feedSettingsSchema.safeParse({ ...settings, feeds: [settings.feeds[0], settings.feeds[0]] })
        .success
    ).toBe(false);
    expect(
      feedSettingsSchema.safeParse({
        ...settings,
        feeds: settings.feeds.map((feed) => ({ ...feed, visible: false })),
      }).success
    ).toBe(false);
    expect(
      feedSettingsSchema.safeParse({
        ...settings,
        feeds: [
          ...settings.feeds,
          ...Array.from({ length: 11 }, (_, i) => createFeed(`custom-${i}`, 'Custom', [])),
        ],
      }).success
    ).toBe(false);
  });
});
