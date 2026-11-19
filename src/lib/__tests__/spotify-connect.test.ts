// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAuthorization,
  exchangeCode,
  freshSession,
  isSameOriginRequest,
  readOAuthState,
  readSession,
  sealSession,
  spotifyConnectConfigured,
  spotifyRedirectUri,
  type SpotifySession,
} from '@/lib/spotify-connect';
import { getSpotifyCredentials } from '@/lib/profile-music';

const session: SpotifySession = {
  uid: 'user-1',
  refreshToken: 'refresh-1',
  accessToken: 'access-1',
  accessTokenExpiresAt: Date.now() + 3_600_000,
  scope: 'streaming',
  account: { id: 'spotify-user', displayName: 'Pedro', product: 'premium' },
};

describe('spotify-connect', () => {
  beforeEach(() => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', 'client-id');
    vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'client-secret');
    vi.stubEnv('SPOTIFY_TOKEN_SECRET', 'a'.repeat(48));
    vi.stubEnv('SPOTIFY_REDIRECT_URI', '');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://stacklyst.example');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('never falls back to credentials committed in source', () => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', '');
    vi.stubEnv('SPOTIFY_CLIENT_SECRET', '');
    expect(getSpotifyCredentials()).toBeNull();
    expect(spotifyConnectConfigured()).toBe(false);
  });

  it('refuses to run in production without a strong encryption secret', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SPOTIFY_TOKEN_SECRET', '');
    vi.stubEnv('JWT_SECRET', 'short');
    expect(spotifyConnectConfigured()).toBe(false);
  });

  it('builds the redirect URI from configuration, never localhost', () => {
    expect(spotifyRedirectUri()).toBe('https://stacklyst.example/api/spotify/callback');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    expect(spotifyRedirectUri()).toBe('http://127.0.0.1:3000/api/spotify/callback');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://evil.example');
    expect(() => spotifyRedirectUri()).toThrow();
  });

  it('starts PKCE authorization with a random state bound to the user', async () => {
    const auth = await createAuthorization('user-1');
    const url = new URL(auth.url);
    expect(url.origin).toBe('https://accounts.spotify.com');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('client_id')).toBe('client-id');
    expect(url.searchParams.get('scope')).toContain('streaming');
    expect(auth.url).not.toContain('client-secret');
    const state = url.searchParams.get('state')!;
    expect(state.length).toBeGreaterThanOrEqual(40);

    await expect(readOAuthState(auth.cookie, 'user-1', state)).resolves.toMatchObject({
      uid: 'user-1',
    });
    await expect(readOAuthState(auth.cookie, 'user-2', state)).rejects.toThrow();
    await expect(readOAuthState(auth.cookie, 'user-1', `${state}x`)).rejects.toThrow();
    await expect(readOAuthState('tampered', 'user-1', state)).rejects.toThrow();
  });

  it('keeps tokens encrypted and rejects a cookie from another user', async () => {
    const { cookie } = await sealSession(session);
    expect(cookie).not.toContain('refresh-1');
    expect(cookie).not.toContain('access-1');
    await expect(readSession(cookie, 'user-1')).resolves.toMatchObject({
      refreshToken: 'refresh-1',
    });
    await expect(readSession(cookie, 'user-2')).resolves.toBeNull();
    vi.stubEnv('SPOTIFY_TOKEN_SECRET', 'b'.repeat(48));
    await expect(readSession(cookie, 'user-1')).resolves.toBeNull();
  });

  it('exchanges the code with the PKCE verifier and records the account plan', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 })
      )
      .mockResolvedValueOnce(Response.json({ id: 'sp', display_name: 'Ana', product: 'free' }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await exchangeCode('code-1', { uid: 'user-1', state: 's', verifier: 'v' });
    const body = String(fetchMock.mock.calls[0][1].body);
    expect(body).toContain('code_verifier=v');
    expect(fetchMock.mock.calls[0][1].redirect).toBe('error');
    expect(result).toMatchObject({ refreshToken: 'rt', account: { product: 'free' } });
  });

  it('reports users missing from the Spotify app allowlist', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 })
        )
        .mockResolvedValueOnce(new Response('', { status: 403 }))
    );
    await expect(
      exchangeCode('code-1', { uid: 'user-1', state: 's', verifier: 'v' })
    ).rejects.toMatchObject({ kind: 'not_allowed' });
  });

  it('refreshes expired access tokens and keeps a rotated refresh token', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ access_token: 'new', refresh_token: 'rt-2', expires_in: 3600 })
        )
        .mockResolvedValueOnce(Response.json({ id: 'sp', product: 'premium' }))
    );
    const { session: next, rotated } = await freshSession({
      ...session,
      accessTokenExpiresAt: Date.now() - 1,
    });
    expect(rotated).toBe(true);
    expect(next).toMatchObject({ accessToken: 'new', refreshToken: 'rt-2' });

    await expect(freshSession(session)).resolves.toMatchObject({ rotated: false });
  });

  it('marks a revoked grant so the connection can be cleared', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ error: 'invalid_grant' }, { status: 400 }))
    );
    await expect(freshSession({ ...session, accessTokenExpiresAt: 0 })).rejects.toMatchObject({
      kind: 'revoked',
    });
  });

  it('accepts only same-origin browser requests for token endpoints', () => {
    const url = 'https://stacklyst.example/api/spotify/token';
    expect(isSameOriginRequest(new Request(url))).toBe(true);
    expect(
      isSameOriginRequest(new Request(url, { headers: { 'sec-fetch-site': 'cross-site' } }))
    ).toBe(false);
    expect(
      isSameOriginRequest(new Request(url, { headers: { origin: 'https://evil.example' } }))
    ).toBe(false);
    expect(
      isSameOriginRequest(
        new Request(url, {
          headers: { origin: 'https://stacklyst.example', 'sec-fetch-site': 'same-origin' },
        })
      )
    ).toBe(true);
  });
});
