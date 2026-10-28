import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({
  auth: vi.fn(),
  availability: vi.fn(),
  search: vi.fn(),
  limit: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: mock.auth, requireAuth: mock.auth }));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: mock.limit }));
vi.mock('@/lib/profile-music', async () => ({
  ...(await vi.importActual<typeof import('@/lib/profile-music')>('@/lib/profile-music')),
  spotifySearchAvailability: mock.availability,
  searchSpotifyTrackPage: mock.search,
}));
import { GET } from './route';
import { UnauthorizedError } from '@/lib/errors';
import { SpotifyCatalogError } from '@/lib/profile-music';
const context = { params: Promise.resolve({}) };
const req = (query = 'q=Lady+Gaga&offset=10') =>
  new Request('https://stacklyst.test/api/profile/music/search?' + query);
beforeEach(() => {
  vi.clearAllMocks();
  mock.auth.mockResolvedValue({ id: 'owner' });
  mock.availability.mockReturnValue({ configured: true, reason: null });
  mock.search.mockResolvedValue({
    tracks: [
      {
        trackId: '11dFghVXANMlKmJXsNCbNl',
        title: 'Actual track',
        artist: 'Artist',
        artworkUrl: null,
        album: 'Album',
        durationMs: 120000,
      },
    ],
    offset: 10,
    nextOffset: 20,
    total: 30,
  });
});
describe('profile music search API', () => {
  it('requires an authenticated account and validates pagination before upstream calls', async () => {
    mock.auth.mockRejectedValue(new UnauthorizedError());
    expect((await GET(req(), context)).status).toBe(401);
    expect(mock.search).not.toHaveBeenCalled();
    mock.auth.mockResolvedValue({ id: 'owner' });
    expect((await GET(req('q=Lady&offset=1001'), context)).status).toBe(400);
    expect(mock.search).not.toHaveBeenCalled();
  });
  it('returns actual paginated metadata with cache control and verified rate-limit identity', async () => {
    const response = await GET(req(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      configured: true,
      offset: 10,
      nextOffset: 20,
      total: 30,
      tracks: [{ album: 'Album', durationMs: 120000 }],
    });
    expect(mock.search).toHaveBeenCalledExactlyOnceWith('Lady Gaga', 10);
    expect(mock.limit).toHaveBeenCalledWith('profile-music-search:owner', expect.any(Object));
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('reports missing public approval without pretending an empty query is a real search', async () => {
    mock.availability.mockReturnValue({ configured: false, reason: 'approval_required' });
    const response = await GET(req(), context);
    expect(await response.json()).toMatchObject({
      configured: false,
      reason: 'approval_required',
      tracks: [],
      nextOffset: null,
    });
    expect(mock.search).not.toHaveBeenCalled();
  });
  it('preserves quota reason and retry timing without leaking provider payloads', async () => {
    mock.search.mockRejectedValue(new SpotifyCatalogError('quota_exceeded', 429, 37));
    const response = await GET(req(), context);
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('37');
    expect(await response.json()).toMatchObject({
      configured: true,
      unavailable: true,
      tracks: [],
      reason: 'quota_exceeded',
      upstreamStatus: 429,
      retryAfter: 37,
    });
  });
});
