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
