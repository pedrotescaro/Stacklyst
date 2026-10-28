import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ findMany: vi.fn(), language: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { user: { findMany: mocks.findMany } } }));
vi.mock('@/lib/learning/language-xp', () => ({ getLanguageLeaderboard: mocks.language }));
import { GET } from './route';

const privateConfig = {
  secret: 'private',
  displayName: 'Pessoa',
  profileStyle: {
    frame: { id: 'neon-blue', decoration: 'neon', color: '#0083fe', privateValue: 'hidden' },
    title: {
      id: 'first-post',
      name: 'Pioneiro',
      color: '#0083fe',
      rarity: 'common',
      icon: 'sprout',
      privateValue: 'hidden',
    },
    nameStyle: {
      color: '#abcdef',
      bold: true,
      italic: false,
      underline: false,
      privateValue: 'hidden',
    },
  },
};
const frame = {
  displayName: 'Pessoa',
  profileStyle: {
    frame: { id: 'neon-blue', decoration: 'neon', color: '#0083fe' },
    title: {
      id: 'first-post',
      name: 'Pioneiro',
      color: '#0083fe',
      rarity: 'common',
      icon: 'sprout',
    },
    nameStyle: { color: '#abcdef', bold: true, italic: false, underline: false },
  },
};
const request = (query = '') => new Request(`https://stacklyst.test/api/leaderboard${query}`);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findMany.mockResolvedValue([
    {
      username: 'a',
      avatar_url: null,
      avatar_config: privateConfig,
      total_xp: 150,
      streak_days: 0,
      last_active_at: null,
      created_at: new Date('2026-01-01'),
    },
  ]);
  mocks.language.mockResolvedValue([
    {
      username: 'b',
      avatar_url: null,
      avatar_config: privateConfig,
      xp: 75,
      streak_days: 0,
      last_active_at: null,
      created_at: new Date('2026-01-01'),
    },
  ]);
});

describe('leaderboard identities', () => {
  it('returns global XP ordering with only public identity data', async () => {
    const response = await GET(request());
    const rows = await response.json();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ rank: 1, username: 'a', xp: 150, avatar_config: frame });
    expect(JSON.stringify(rows)).not.toContain('private');
    expect(JSON.stringify(rows)).not.toContain('hidden');
    expect(mocks.findMany.mock.calls[0][0]).toMatchObject({
      take: 50,
      select: { total_xp: true, avatar_config: true },
    });
  });
  it('returns language XP with the same public identity and existing array contract', async () => {
    const response = await GET(request('?language=JS'));
    expect(mocks.language).toHaveBeenCalledWith('JS', 50);
    expect(await response.json()).toMatchObject([
      { rank: 1, username: 'b', xp: 75, avatar_config: frame },
    ]);
  });
  it('keeps public title and name when no frame exists', async () => {
    mocks.language.mockResolvedValue([
      {
        username: 'c',
        avatar_url: null,
        avatar_config: {
          displayName: 'João',
          profileStyle: {
            title: { id: 'first-post', name: 'Pioneiro', color: '#0083fe', rarity: 'common' },
          },
        },
        xp: 1,
      },
    ]);
    const response = await GET(request('?language=JS'));
    expect(await response.json()).toMatchObject([
      { avatar_config: { displayName: 'João', profileStyle: { title: { name: 'Pioneiro' } } } },
    ]);
  });
  it('rejects invalid language', async () => {
    const response = await GET(request('?language=UNKNOWN'));
    expect(response.status).toBe(400);
    expect(mocks.language).not.toHaveBeenCalled();
  });
});
