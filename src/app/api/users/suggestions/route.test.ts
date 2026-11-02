import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), suggestions: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.auth }));
vi.mock('@/services/follow-recommendation.service', () => ({
  getFollowRecommendations: mocks.suggestions,
}));
import { GET } from './route';
const context = { params: Promise.resolve({}) };
const request = (query = '') => new Request('https://stacklyst.test/api/users/suggestions' + query);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ id: 'viewer' });
  mocks.suggestions.mockResolvedValue([
    {
      id: 'candidate',
      username: 'candidate',
      avatar_url: null,
      total_xp: 0,
      reason: { type: 'active' },
    },
  ]);
});
describe('GET follow suggestions', () => {
  it('keeps the array contract and passes bounded exclusions for the authenticated viewer only', async () => {
    const response = await GET(
      request('?limit=3&exclude=already-visible,legacy_id&viewerId=someone-else'),
      context
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
    expect(mocks.suggestions).toHaveBeenCalledExactlyOnceWith('viewer', 3, undefined, {
      exclude: ['already-visible', 'legacy_id'],
    });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('vary')).toBe('Cookie, Authorization');
  });
  it('defaults to five and returns an empty array when no alternative exists', async () => {
    mocks.suggestions.mockResolvedValue([]);
    expect(await (await GET(request(), context)).json()).toEqual([]);
    expect(mocks.suggestions).toHaveBeenCalledExactlyOnceWith('viewer', 5, undefined, {
      exclude: [],
    });
  });
  it('does not query suggestions for anonymous requests', async () => {
    mocks.auth.mockResolvedValue(null);
    expect(await (await GET(request(), context)).json()).toEqual([]);
    expect(mocks.suggestions).not.toHaveBeenCalled();
  });
  it.each([
    '?limit=11',
    '?exclude=private%2Fsecret',
    '?exclude=a,,b',
    '?exclude=first&exclude=second',
  ])(
    'rejects invalid query %s without echoing request IDs or invoking the service',
    async (query) => {
      const response = await GET(request(query), context);
      expect(response.status).toBe(400);
      const payload = await response.json();
      expect(payload.error).toBe('INVALID_SUGGESTION_QUERY');
      expect(JSON.stringify(payload)).not.toContain('private/secret');
      expect(mocks.suggestions).not.toHaveBeenCalled();
    }
  );
});
