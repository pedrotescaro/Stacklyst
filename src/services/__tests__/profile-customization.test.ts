import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_PROFILE_PREFERENCES,
  DEFAULT_PROFILE_CATALOG,
  parseProfilePreferences,
} from '@/lib/profile-customization';
const mocks = vi.hoisted(() => ({
  catalog: vi.fn(),
  state: vi.fn(),
  awards: vi.fn(),
  metrics: vi.fn(),
  execute: vi.fn(),
  createAwards: vi.fn(),
  notify: vi.fn(),
  claim: vi.fn(),
  save: vi.fn(),
  user: vi.fn(),
  updateUser: vi.fn(),
  music: vi.fn(),
}));
vi.mock('@/lib/profile-music', () => ({ resolveSpotifyTrack: mocks.music }));
vi.mock('@/lib/prisma', () => {
  const tx = {
    profileCustomization: { findUnique: mocks.state, upsert: mocks.save },
    userProfileAchievement: {
      findMany: mocks.awards,
      createMany: mocks.createAwards,
      updateMany: mocks.claim,
    },
    notification: { createMany: mocks.notify },
    user: { findUnique: mocks.user, update: mocks.updateUser },
    $executeRaw: mocks.execute,
    $queryRaw: mocks.metrics,
  };
  return {
    prisma: {
      ...tx,
      profileAchievementCatalog: { findUnique: mocks.catalog },
      $transaction: async (callback: (tx: unknown) => unknown) => callback(tx),
    },
  };
});
import {
  saveProfileCustomization,
  getPublicProfileCustomization,
  getProfileCustomization,
  reconcileProfileAchievements,
  eventIsActive,
} from '../profile-customization.service';
const zero = {
  posts: 0,
  comments: 0,
  peopleHelped: 0,
  likes: 0,
  followers: 0,
  learningActivities: 0,
  eventPosts: 0,
  eventComments: 0,
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.catalog.mockResolvedValue({
    value: {
      ...DEFAULT_PROFILE_CATALOG,
      events: DEFAULT_PROFILE_CATALOG.events.map((event) => ({ ...event, enabled: false })),
    },
  });
  mocks.state.mockResolvedValue(null);
  mocks.awards.mockResolvedValue([]);
  mocks.metrics.mockResolvedValue([zero]);
  mocks.user.mockResolvedValue({
    avatar_url: null,
    avatar_config: { name: 'Existing name', hair: 4 },
  });
  mocks.save.mockResolvedValue({});
});
describe('Profile persistence and awards', () => {
  it('rejects owner impersonation and fabricated unlock lists in the payload', async () => {
    await expect(
      saveProfileCustomization('owner', {
        version: 0,
        preferences: DEFAULT_PROFILE_PREFERENCES,
        userId: 'victim',
      })
    ).rejects.toThrow();
    await expect(
      saveProfileCustomization('owner', {
        version: 0,
        preferences: { ...DEFAULT_PROFILE_PREFERENCES, unlockedAchievements: ['posts-1000'] },
      })
    ).rejects.toThrow();
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('persists owner preferences separately from private chat and preserves avatar fields', async () => {
    const preferences = {
      ...DEFAULT_PROFILE_PREFERENCES,
      tags: ['React', 'python'],
      studies: ['Engenharia de Software'],
      flag: 'BR',
      nameStyle: { color: '#ff4081', bold: true, italic: false, underline: false },
    };
    await saveProfileCustomization('owner', {
      version: 0,
      preferences,
      chat: {
        mode: 'custom',
        bubbleColor: '#0083fe',
        accentColor: '#0083fe',
        backgroundColor: '#101010',
      },
    });
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'owner' },
        create: expect.objectContaining({
          userId: 'owner',
          preferences: expect.objectContaining({ tags: ['react', 'python'], flag: 'BR' }),
        }),
      })
    );
    expect(mocks.updateUser.mock.calls[0][0].data.avatar_config).toEqual(
      expect.objectContaining({
        name: 'Existing name',
        hair: 4,
        profileStyle: expect.objectContaining({ flag: 'BR' }),
      })
    );
  });
  it('rejects stale saves, forged titles/frames and hidden featured awards', async () => {
    mocks.state.mockResolvedValue({
      version: 3,
      preferences: DEFAULT_PROFILE_PREFERENCES,
      chat: {},
    });
    await expect(
      saveProfileCustomization('owner', { version: 2, preferences: DEFAULT_PROFILE_PREFERENCES })
    ).rejects.toMatchObject({ code: 'PROFILE_VERSION_CONFLICT' });
    mocks.state.mockResolvedValue(null);
    await expect(
      saveProfileCustomization('owner', {
        version: 0,
        preferences: { ...DEFAULT_PROFILE_PREFERENCES, equippedTitleId: 'posts-1000' },
      })
    ).rejects.toMatchObject({ code: 'TITLE_LOCKED' });
    await expect(
      saveProfileCustomization('owner', {
        version: 0,
        preferences: { ...DEFAULT_PROFILE_PREFERENCES, frameId: 'legendary' },
      })
    ).rejects.toMatchObject({ code: 'FRAME_LOCKED' });
    await expect(
      saveProfileCustomization('owner', {
        version: 0,
        preferences: { ...DEFAULT_PROFILE_PREFERENCES, featuredAchievementIds: ['posts-1000'] },
      })
    ).rejects.toMatchObject({ code: 'ACHIEVEMENT_LOCKED' });
  });
  it('does not expose private chat or version to profile visitors', async () => {
    mocks.state.mockResolvedValue({
      version: 4,
      preferences: { ...DEFAULT_PROFILE_PREFERENCES, tags: ['python'] },
      chat: { mode: 'dark', backgroundColor: '#123456' },
    });
    const state = await getPublicProfileCustomization('owner');
    expect(state.preferences.tags).toEqual(['python']);
    expect(state).not.toHaveProperty('chat');
    expect(state).not.toHaveProperty('version');
    expect(mocks.createAwards).not.toHaveBeenCalled();
  });
  it('creates each award and notification only once, retaining previously earned titles', async () => {
    const definition = DEFAULT_PROFILE_CATALOG.achievements[0];
    const earned = {
      userId: 'owner',
      achievementId: definition.id,
      definition,
      unlockedAt: new Date(),
      announcedAt: null,
    };
    mocks.metrics.mockResolvedValue([{ ...zero, posts: 1 }]);
    mocks.awards.mockResolvedValueOnce([]).mockResolvedValueOnce([earned]);
    await reconcileProfileAchievements('owner');
    expect(mocks.createAwards).toHaveBeenCalledOnce();
    expect(mocks.notify).toHaveBeenCalledOnce();
    mocks.metrics.mockResolvedValue([zero]);
    mocks.awards.mockResolvedValue([earned]);
    const state = await getProfileCustomization('owner', { claimUnlocks: true });
    expect(mocks.createAwards).toHaveBeenCalledOnce();
    expect(state.achievements.find((item) => item.id === definition.id)?.unlocked).toBe(true);
    expect(state.newUnlocks).toEqual([definition.id]);
    expect(mocks.claim).toHaveBeenCalledOnce();
  });
  it('leaves toast claims untouched when editor, chat or save reads the profile', async () => {
    const definition = DEFAULT_PROFILE_CATALOG.achievements[0];
    mocks.awards.mockResolvedValue([
      {
        achievementId: definition.id,
        definition,
        unlockedAt: new Date(),
        announcedAt: null,
      },
    ]);
    const state = await getProfileCustomization('owner');
    expect(state.newUnlocks).toEqual([]);
    expect(mocks.claim).not.toHaveBeenCalled();
  });
  it('rejects images uploaded by another account before any profile write', async () => {
    await expect(
      saveProfileCustomization('owner', {
        version: 0,
        preferences: DEFAULT_PROFILE_PREFERENCES,
        avatarUrl: 'https://untrusted.example/avatar.png',
      })
    ).rejects.toMatchObject({ code: 'AVATAR_IMAGE_NOT_OWNED' });
    await expect(
      saveProfileCustomization('owner', {
        version: 0,
        preferences: {
          ...DEFAULT_PROFILE_PREFERENCES,
          banner: {
            ...DEFAULT_PROFILE_PREFERENCES.banner,
            mode: 'image',
            imageUrl: 'https://untrusted.example/banner.png',
          },
        },
      })
    ).rejects.toMatchObject({ code: 'BANNER_IMAGE_NOT_OWNED' });
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it('does not overwrite a photo when a stale version is rejected', async () => {
    mocks.state.mockResolvedValue({ version: 2, preferences: DEFAULT_PROFILE_PREFERENCES });
    await expect(
      saveProfileCustomization('owner', {
        version: 1,
        preferences: DEFAULT_PROFILE_PREFERENCES,
        avatarUrl: null,
      })
    ).rejects.toMatchObject({ code: 'PROFILE_VERSION_CONFLICT' });
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it('never distributes expired or disabled seasonal awards', async () => {
    const event = DEFAULT_PROFILE_CATALOG.events[0];
    expect(eventIsActive(event, new Date(event.endsAt))).toBe(false);
    expect(eventIsActive({ ...event, enabled: false }, new Date(event.startsAt))).toBe(false);
    mocks.metrics.mockResolvedValue([{ ...zero, eventPosts: 100, eventComments: 100 }]);
    await reconcileProfileAchievements('owner');
    expect(mocks.createAwards).not.toHaveBeenCalled();
  });
  it('resolves new Spotify tracks on the server and refuses client metadata replacement', async () => {
    const trackId = '0VjIjW4GlUZAMYd2vXMi3b';
    mocks.music.mockResolvedValue({
      trackId,
      title: 'Official track',
      artist: 'Official artist',
      artworkUrl: null,
    });
    await saveProfileCustomization('owner', {
      version: 0,
      preferences: {
        ...DEFAULT_PROFILE_PREFERENCES,
        music: { trackId, title: 'Forged', artist: 'Forged', artworkUrl: null },
      },
    });
    expect(mocks.music).toHaveBeenCalledExactlyOnceWith(trackId);
    expect(mocks.save.mock.calls[0][0].create.preferences.music.title).toBe('Official track');
  });
  it('keeps other preferences valid when Spotify metadata is temporarily unavailable', async () => {
    const trackId = '0VjIjW4GlUZAMYd2vXMi3b';
    mocks.music.mockResolvedValue({
      trackId,
      title: 'Faixa do Spotify',
      artist: '',
      artworkUrl: null,
      metadataUnavailable: true,
    });
    await saveProfileCustomization('owner', {
      version: 0,
      preferences: {
        ...DEFAULT_PROFILE_PREFERENCES,
        tags: ['python'],
        flag: 'BR',
        music: { trackId, title: null, artist: null, artworkUrl: null },
      },
    });
    const stored = mocks.save.mock.calls[0][0].create.preferences;
    expect(stored.music).not.toHaveProperty('metadataUnavailable');
    expect(parseProfilePreferences(stored)).toMatchObject({
      tags: ['python'],
      flag: 'BR',
      music: { trackId },
    });
  });
  it('preserves legitimate angle brackets in official song metadata after persistence', async () => {
    const trackId = '0VjIjW4GlUZAMYd2vXMi3b';
    mocks.music.mockResolvedValue({
      trackId,
      title: '<song>',
      artist: 'Artist > name',
      artworkUrl: null,
    });
    await saveProfileCustomization('owner', {
      version: 0,
      preferences: {
        ...DEFAULT_PROFILE_PREFERENCES,
        tags: ['react'],
        music: { trackId, title: null, artist: null, artworkUrl: null },
      },
    });
    const restored = parseProfilePreferences(mocks.save.mock.calls[0][0].create.preferences);
    expect(restored).toMatchObject({
      tags: ['react'],
      music: { title: '<song>', artist: 'Artist > name' },
    });
  });
});
