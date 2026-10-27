import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { hasDatabaseConnection } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { signJwt, setJwtCookie } from '@/lib/jwt';
vi.mock('@/lib/prisma', () => ({ hasDatabaseConnection: vi.fn(() => false), prisma: {} }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/jwt', () => ({ signJwt: vi.fn(), setJwtCookie: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

describe('Native OAuth code delivery', () => {
  async function mobile(query: string) {
    const response = await GET(
      new Request('https://stacklyst.test/api/auth/callback?client=mobile&' + query)
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.headers.has('set-cookie')).toBe(false);
    expect(await response.text()).toBe('');
    expect(hasDatabaseConnection).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
    expect(signJwt).not.toHaveBeenCalled();
    expect(setJwtCookie).not.toHaveBeenCalled();
    const location = response.headers.get('location')!;
    expect(location.endsWith('#')).toBe(true);
    const destination = new URL(location);
    expect(destination.protocol).toBe('stacklyst:');
    expect(destination.host).toBe('auth');
    expect(destination.pathname).toBe('/callback');
    return destination.searchParams;
  }

  it('delivers a PKCE code without exchanging it or touching the database/session cookies', async () => {
    const params = await mobile('code=one-time-pkce-code');
    expect([...params]).toEqual([['code', 'one-time-pkce-code']]);
  });

  it('delivers provider errors and recovery confirmation data', async () => {
    const error = await mobile(
      new URLSearchParams({
        error: 'access_denied',
        error_code: 'provider_error',
        error_description: 'Acesso cancelado pelo provedor.',
      }).toString()
    );
    expect(Object.fromEntries(error)).toEqual({
      error: 'access_denied',
      error_code: 'provider_error',
      error_description: 'Acesso cancelado pelo provedor.',
    });
    const recovery = await mobile('type=recovery&token_hash=one-time-email-hash');
    expect(Object.fromEntries(recovery)).toEqual({
      type: 'recovery',
      token_hash: 'one-time-email-hash',
    });
  });

  it.each([
    'https://attacker.example',
    '//attacker.example',
    'evil-app://auth/callback',
    '/\\attacker.example',
  ])('ignores arbitrary destinations %j and never forwards session tokens', async (target) => {
    const params = await mobile(
      new URLSearchParams({
        code: 'one-time-code',
        redirectTo: target,
        redirect_to: target,
        next: target,
        returnTo: target,
        access_token: 'never-forward-this-access-token',
        refresh_token: 'never-forward-this-refresh-token',
        provider_token: 'never-forward-this-provider-token',
      }).toString() + '#access_token=never-inherit-this-fragment'
    );
    expect([...params]).toEqual([['code', 'one-time-code']]);
  });

  it.each([
    'code=first&code=second',
    'code=one&client=mobile',
    'code=one&type=unsupported',
    'code=one&error_description=line%0D%0Ainjection',
    'code=' + 'x'.repeat(2049),
    'code=one&error_description=' + 'x'.repeat(1025),
    'type=recovery&token_hash=' + 'x'.repeat(1025),
    'access_token=not-a-pkce-code&refresh_token=never-forward',
    '',
  ])('returns a bounded native error for malformed input %#', async (query) => {
    const params = await mobile(query);
    expect(Object.fromEntries(params)).toEqual({
      error: 'invalid_callback',
      error_description: 'Link de acesso inválido ou expirado.',
    });
  });
});

describe('OAuth redirect destination', () => {
  it('keeps the web callback database guard when a native client is not requested', async () => {
    const response = await GET(
      new Request('https://stacklyst.test/api/auth/callback?code=web-code')
    );
    expect(new URL(response.headers.get('location')!).pathname).toBe('/login');
    expect(hasDatabaseConnection).toHaveBeenCalledOnce();
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each([
    '@attacker.example',
    '//attacker.example',
    '/\\attacker.example',
    'https://attacker.example',
    ':8443',
    '\n@attacker.example',
  ])('rejects %j', async (next) => {
    const response = await GET(
      new Request(`https://stacklyst.test/api/auth/callback?next=${encodeURIComponent(next)}`)
    );
    expect(response.headers.get('location')).toBe('https://stacklyst.test/feed');
  });
  it('retains local paths, queries and fragments', async () => {
    const response = await GET(
      new Request(
        'https://stacklyst.test/api/auth/callback?next=' +
          encodeURIComponent('/jobs?search=ts#list')
      )
    );
    expect(response.headers.get('location')).toBe('https://stacklyst.test/jobs?search=ts#list');
  });
});

describe('Web email callbacks', () => {
  it('exchanges a recovery code and opens password reset without requiring the application database', async () => {
    const exchange = vi.fn(async () => ({
      data: {
        user: { id: 'recovery-user' },
        session: { access_token: 'private' },
        redirectType: 'recovery',
      },
      error: null,
    }));
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: { exchangeCodeForSession: exchange },
    } as never);
    const response = await GET(
      new Request('https://stacklyst.test/api/auth/callback?code=valid-code&next=/reset-password')
    );
    expect(response.headers.get('location')).toBe('https://stacklyst.test/reset-password');
    expect(exchange).toHaveBeenCalledWith('valid-code');
    expect(response.headers.get('set-cookie')).toContain('stacklyst-password-recovery=');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(hasDatabaseConnection).not.toHaveBeenCalled();
    expect(signJwt).not.toHaveBeenCalled();
  });
  it('verifies recovery token hashes for email templates, including links opened in another browser', async () => {
    const verifyOtp = vi.fn(async () => ({
      data: { user: { id: 'recovery-user' }, session: { access_token: 'private' } },
      error: null,
    }));
    vi.mocked(createClient).mockResolvedValueOnce({ auth: { verifyOtp } } as never);
    const response = await GET(
      new Request('https://stacklyst.test/api/auth/callback?token_hash=valid-hash&type=recovery')
    );
    expect(response.headers.get('location')).toBe('https://stacklyst.test/reset-password');
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: 'valid-hash', type: 'recovery' });
    expect(response.headers.get('location')).not.toContain('valid-hash');
  });
  it('does not accept an expired token or create a recovery session', async () => {
    vi.mocked(createClient).mockResolvedValueOnce({
      auth: {
        exchangeCodeForSession: vi.fn(async () => ({
          data: {},
          error: { message: 'Expired token' },
        })),
      },
    } as never);
    const response = await GET(
      new Request('https://stacklyst.test/api/auth/callback?code=expired&next=/reset-password')
    );
    expect(new URL(response.headers.get('location')!).pathname).toBe('/login');
    expect(setJwtCookie).not.toHaveBeenCalled();
  });
});

it('cannot turn a normal OAuth code into a password-recovery proof by changing next', async () => {
  vi.mocked(createClient).mockResolvedValueOnce({
    auth: {
      exchangeCodeForSession: vi.fn(async () => ({
        data: {
          user: { id: 'normal-user' },
          session: { access_token: 'private' },
          redirectType: null,
        },
        error: null,
      })),
    },
  } as never);
  const response = await GET(
    new Request('https://stacklyst.test/api/auth/callback?code=oauth-code&next=/reset-password')
  );
  expect(new URL(response.headers.get('location')!).pathname).toBe('/forgot-password');
  expect(response.headers.get('set-cookie')).toBeNull();
});
