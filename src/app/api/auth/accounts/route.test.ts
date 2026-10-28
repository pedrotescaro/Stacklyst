// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getSession: vi.fn(),
  setSession: vi.fn(),
  refresh: vi.fn(),
  removeJwt: vi.fn(),
  values: new Map<string, string>(),
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (key: string) => (mocks.values.has(key) ? { value: mocks.values.get(key) } : undefined),
    set: (key: string, value: string) => mocks.values.set(key, value),
    delete: (key: string) => mocks.values.delete(key),
  }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: mocks.getUser,
      getSession: mocks.getSession,
      setSession: mocks.setSession,
    },
  }),
}));
vi.mock('@/lib/jwt', () => ({ removeJwtCookie: mocks.removeJwt }));
vi.mock('@/lib/supabase/env', () => ({
  getSupabasePublicConfig: () => ({ url: 'https://example.test', key: 'key' }),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: { refreshSession: mocks.refresh } }),
}));
import { GET, POST } from './route';
import { ACCOUNT_COOKIE, openAccount, sealAccount } from '@/lib/supabase/account-vault';

function request(action: string, origin = 'https://stacklyst.test') {
  return new Request('https://stacklyst.test/api/auth/accounts', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ action }),
  });
}

describe('account switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.values.clear();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'a', email: 'a@example.com' } },
      error: null,
    });
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'a' }, refresh_token: 'refresh-a' } },
    });
  });

  it('saves only a verified session and rejects a cross-origin mutation', async () => {
    expect((await POST(request('save', 'https://evil.test'))).status).toBe(403);
    expect(mocks.values.size).toBe(0);
    expect((await POST(request('save'))).status).toBe(200);
    expect(openAccount(mocks.values.get(ACCOUNT_COOKIE))).toEqual({
      id: 'a',
      label: 'a@example.com',
      refreshToken: 'refresh-a',
    });
    expect((await (await GET()).json()).saved).toBeNull();
  });

  it('refreshes the other account and keeps the old account available for switching back', async () => {
    mocks.values.set(
      ACCOUNT_COOKIE,
      sealAccount({ id: 'b', label: 'b@example.com', refreshToken: 'refresh-b' })
    );
    mocks.refresh.mockResolvedValue({
      data: {
        user: { id: 'b' },
        session: { access_token: 'access-b', refresh_token: 'new-refresh-b' },
      },
      error: null,
    });
    mocks.setSession.mockResolvedValue({ error: null });
    expect((await POST(request('switch'))).status).toBe(200);
    expect(mocks.setSession).toHaveBeenCalledWith({
      access_token: 'access-b',
      refresh_token: 'new-refresh-b',
    });
    expect(openAccount(mocks.values.get(ACCOUNT_COOKIE))?.refreshToken).toBe('refresh-a');
    expect(mocks.removeJwt).toHaveBeenCalledOnce();
  });

  it('keeps the current session and backup when the saved session is revoked', async () => {
    mocks.values.set(
      ACCOUNT_COOKIE,
      sealAccount({ id: 'b', label: 'b@example.com', refreshToken: 'revoked' })
    );
    mocks.refresh.mockResolvedValue({ data: { session: null }, error: new Error('revoked') });
    expect((await POST(request('switch'))).status).toBe(401);
    expect(mocks.setSession).not.toHaveBeenCalled();
    expect(openAccount(mocks.values.get(ACCOUNT_COOKIE))?.refreshToken).toBe('revoked');
  });
});
