// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthRetryableFetchError } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));
vi.mock('@/lib/jwt', () => ({
  verifyJwt: vi.fn(),
}));
vi.mock('@/lib/supabase/bearer', () => ({
  verifyBearerIdentity: vi.fn(),
}));
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import { createServerClient } from '@supabase/ssr';
import { verifyJwt } from '@/lib/jwt';
import { updateSession } from '@/lib/supabase/middleware';
import { verifyBearerIdentity } from '@/lib/supabase/bearer';
import { UnauthorizedError } from '@/lib/errors';
import { proxy } from '@/proxy';

const getClaims = vi.fn();
let cookieMethods: any;

describe('Supabase session proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getClaims.mockReset();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key');
    vi.mocked(createServerClient).mockImplementation((_url, _key, options: any) => {
      cookieMethods = options.cookies;
      return { auth: { getClaims } } as any;
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('delivers native OAuth callbacks without reading or refreshing browser cookies', async () => {
    const response = await proxy(
      new NextRequest('https://stacklyst.test/api/auth/callback?client=mobile&code=one-time', {
        headers: { cookie: 'sb-auth-token=browser-session' },
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(createServerClient).not.toHaveBeenCalled();
    expect(getClaims).not.toHaveBeenCalled();
    expect(verifyJwt).not.toHaveBeenCalled();
    expect(verifyBearerIdentity).not.toHaveBeenCalled();
  });

  it('allows a signed-in user to add an account and does not rotate their session on the OAuth callback', async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: 'user-1' } }, error: null });
    const login = await updateSession(new NextRequest('https://stacklyst.test/login?addAccount=1'));
    expect(login.status).toBe(200);
    const callback = await proxy(
      new NextRequest('https://stacklyst.test/api/auth/callback?addAccount=1&code=one-time')
    );
    expect(callback.status).toBe(200);
    expect(createServerClient).toHaveBeenCalledTimes(1);
  });

  it('rejects bootstrap without Authorization before inspecting any browser session cookies', async () => {
    const response = await proxy(
      new NextRequest('https://stacklyst.test/api/mobile/auth/bootstrap', {
        method: 'POST',
        headers: { cookie: 'stacklyst-jwt=valid-local-token; sb-auth-token=valid-browser-token' },
      })
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: 'UNAUTHORIZED',
      message: 'Autenticação necessária',
    });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(createServerClient).not.toHaveBeenCalled();
    expect(getClaims).not.toHaveBeenCalled();
    expect(verifyJwt).not.toHaveBeenCalled();
    expect(verifyBearerIdentity).not.toHaveBeenCalled();
  });

  it('verifies bootstrap bearer without consulting a browser session', async () => {
    vi.mocked(verifyBearerIdentity).mockResolvedValueOnce('native-user');
    const response = await proxy(
      new NextRequest('https://stacklyst.test/api/mobile/auth/bootstrap', {
        method: 'POST',
        headers: { authorization: 'Bearer native-token', cookie: 'stacklyst-jwt=browser-user' },
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(verifyBearerIdentity).toHaveBeenCalledExactlyOnceWith('Bearer native-token');
    expect(createServerClient).not.toHaveBeenCalled();
    expect(getClaims).not.toHaveBeenCalled();
    expect(verifyJwt).not.toHaveBeenCalled();
  });

  it('never falls back to browser cookies after bootstrap bearer verification fails', async () => {
    vi.mocked(verifyBearerIdentity).mockRejectedValueOnce(new UnauthorizedError('INVALID_TOKEN'));
    const response = await proxy(
      new NextRequest('https://stacklyst.test/api/mobile/auth/bootstrap', {
        method: 'POST',
        headers: { authorization: 'Bearer revoked', cookie: 'stacklyst-jwt=browser-user' },
      })
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: 'INVALID_TOKEN' });
    expect(createServerClient).not.toHaveBeenCalled();
    expect(verifyJwt).not.toHaveBeenCalled();
  });

  it.each(['/api/auth/register', '/api/mobile/auth/bootstrap/other', '/api/mobile/learning'])(
    'preserves normal browser session processing outside the exact bootstrap path: %s',
    async (pathname) => {
      getClaims.mockResolvedValue({ data: { claims: null }, error: null });
      const response = await proxy(new NextRequest(`https://stacklyst.test${pathname}`));
      expect(response.status).toBe(200);
      expect(createServerClient).toHaveBeenCalledOnce();
      expect(getClaims).toHaveBeenCalledOnce();
      expect(verifyBearerIdentity).not.toHaveBeenCalled();
    }
  );

  it('keeps public routes available when Supabase is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');

    const response = await updateSession(new NextRequest('https://stacklyst.test/'));

    expect(response.status).toBe(200);
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it('keeps protected routes closed when Supabase is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');

    const response = await updateSession(new NextRequest('https://stacklyst.test/feed'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://stacklyst.test/login');
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it('always verifies Supabase claims even when the local JWT exists', async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: 'user-1' } }, error: null });
    vi.mocked(verifyJwt).mockResolvedValue({ sub: 'user-1' } as any);

    const request = new NextRequest('https://stacklyst.test/feed', {
      headers: { cookie: 'stacklyst-jwt=valid-local-token' },
    });
    const response = await updateSession(request);

    expect(response.status).toBe(200);
    expect(getClaims).toHaveBeenCalledOnce();
    expect(verifyJwt).not.toHaveBeenCalled();
  });

  it('uses the local JWT only during a temporary Supabase failure', async () => {
    getClaims.mockResolvedValue({
      data: null,
      error: new AuthRetryableFetchError('Service temporarily unavailable', 503),
    });
    vi.mocked(verifyJwt).mockResolvedValue({ sub: 'user-1' } as any);

    const request = new NextRequest('https://stacklyst.test/feed', {
      headers: { cookie: 'stacklyst-jwt=valid-local-token' },
    });
    const response = await updateSession(request);

    expect(response.status).toBe(200);
    expect(verifyJwt).toHaveBeenCalledWith('valid-local-token');
  });

  it('does not let a local JWT override an invalid Supabase session', async () => {
    getClaims.mockResolvedValue({
      data: null,
      error: {
        code: 'refresh_token_not_found',
        message: 'Refresh token is invalid',
        status: 400,
      },
    });

    const request = new NextRequest('https://stacklyst.test/feed', {
      headers: { cookie: 'stacklyst-jwt=valid-local-token' },
    });
    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://stacklyst.test/login');
    expect(verifyJwt).not.toHaveBeenCalled();
  });

  it('preserves refreshed cookie attributes and no-cache headers on redirects', async () => {
    getClaims.mockImplementation(async () => {
      cookieMethods.setAll(
        [
          {
            name: 'sb-auth-token',
            value: 'fresh-token',
            options: { httpOnly: true, maxAge: 3600, path: '/', sameSite: 'lax' },
          },
        ],
        {
          'Cache-Control': 'private, no-store',
          Expires: '0',
          Pragma: 'no-cache',
        }
      );
      return { data: null, error: null };
    });

    const response = await updateSession(new NextRequest('https://stacklyst.test/feed'));
    const setCookie = response.headers.get('set-cookie') || '';

    expect(response.status).toBe(307);
    expect(setCookie).toContain('sb-auth-token=fresh-token');
    expect(setCookie.toLowerCase()).toContain('httponly');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
  });
});
