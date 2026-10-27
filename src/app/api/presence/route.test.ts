import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  record: vi.fn(),
  summary: vi.fn(),
  limit: vi.fn(),
}));
vi.mock('@/lib/auth-session', () => ({ getAuthUserId: mocks.identity }));
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn() }));
vi.mock('@/lib/platform-presence', () => ({
  getPlatformPresence: mocks.summary,
  recordPlatformPresence: mocks.record,
}));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: mocks.limit }));
import { GET, POST } from './route';
const context = { params: Promise.resolve({}) };
const request = (headers = {}, body = { userId: 'spoofed-user' }) =>
  new Request('https://stacklyst.test/api/presence', {
    method: 'POST',
    headers: { 'X-Platform-Presence': '1', ...headers },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.identity.mockResolvedValue('verified-user');
});
describe('Platform presence', () => {
  it('uses only the verified identity, never a client-supplied account or timestamp', async () => {
    expect((await POST(request(), context)).status).toBe(204);
    expect(mocks.record).toHaveBeenCalledExactlyOnceWith('verified-user');
    expect(mocks.limit).toHaveBeenCalled();
  });
  it('rejects anonymous heartbeats and cross-origin cookie requests', async () => {
    mocks.identity.mockResolvedValue(null);
    expect((await POST(request(), context)).status).toBe(401);
    expect((await POST(request({ Origin: 'https://other.test' }), context)).status).toBe(403);
    expect((await POST(request({ 'X-Platform-Presence': '' }), context)).status).toBe(403);
    expect(mocks.record).not.toHaveBeenCalled();
  });
  it('accepts the public host behind a reverse proxy without trusting another origin', async () => {
    const response = await POST(
      request({ Host: 'public.stacklyst.test', Origin: 'https://public.stacklyst.test' }),
      context
    );
    expect(response.status).toBe(204);
    expect(
      (
        await POST(
          request({ Host: 'public.stacklyst.test', Origin: 'https://external.test' }),
          context
        )
      ).status
    ).toBe(403);
  });
  it('returns an actual zero and public projection without requiring login', async () => {
    const summary = {
      activeCount: 0,
      avatars: [{ id: 'u', username: 'dev', avatarUrl: '/avatar.png' }],
      observedAt: '2026-10-27T12:00:00Z',
      activeWindowSeconds: 60,
    };
    mocks.summary.mockResolvedValue(summary);
    const response = await GET(new Request('https://stacklyst.test/api/presence'), context);
    expect(await response.json()).toEqual(summary);
    expect(mocks.identity).not.toHaveBeenCalled();
  });
  it('reports failure as unavailable instead of fabricating a zero', async () => {
    mocks.summary.mockRejectedValue(new Error('DB unavailable'));
    const response = await GET(new Request('https://stacklyst.test/api/presence'), context);
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty('activeCount');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
