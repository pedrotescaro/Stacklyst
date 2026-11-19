/**
 * Per-user Spotify connection (Authorization Code + PKCE), server only.
 *
 * Security model:
 * - The Client Secret and the user's refresh token never reach the browser.
 * - Tokens live in an encrypted (JWE, A256GCM), httpOnly, SameSite=Lax cookie
 *   scoped to /api/spotify, so ordinary page requests never carry it.
 * - Every cookie payload is bound to the Stacklyst user id. Another account
 *   signing in on the same browser cannot reuse the connection.
 * - OAuth `state` is random, single use, expires in 10 minutes and is compared
 *   in constant time; the PKCE verifier stays server side in that cookie.
 * - Only fixed Spotify hosts are contacted, with redirects disabled.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { getSpotifyCredentials } from '@/lib/profile-music';

export const SPOTIFY_SESSION_COOKIE = 'sl_spotify';
export const SPOTIFY_STATE_COOKIE = 'sl_spotify_oauth';
export const SPOTIFY_COOKIE_PATH = '/api/spotify';

/** Minimum scopes for the Web Playback SDK plus starting playback on its device. */
export const SPOTIFY_CONNECT_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
] as const;

const STATE_TTL_SECONDS = 10 * 60;
const SESSION_TTL_SECONDS = 180 * 24 * 60 * 60;
const ACCESS_TOKEN_SKEW_MS = 60_000;
const ACCOUNTS_URL = 'https://accounts.spotify.com';
const API_URL = 'https://api.spotify.com/v1';

export interface SpotifyOAuthState {
  uid: string;
  state: string;
  verifier: string;
}

export interface SpotifyAccount {
  id: string;
  displayName: string | null;
  product: string | null;
}

export interface SpotifySession {
  uid: string;
  refreshToken: string;
  accessToken: string;
  /** Epoch milliseconds. */
  accessTokenExpiresAt: number;
  scope: string;
  account: SpotifyAccount;
}

export class SpotifyConnectError extends Error {
  constructor(
    public readonly kind:
      | 'not_configured'
      | 'invalid_state'
      | 'denied'
      | 'not_allowed'
      | 'revoked'
      | 'upstream',
    message = 'Não foi possível falar com o Spotify agora.'
  ) {
    super(message);
    this.name = 'SpotifyConnectError';
  }
}

function encryptionKey(): Uint8Array | null {
  const dedicated = process.env.SPOTIFY_TOKEN_SECRET?.trim();
  const shared = process.env.JWT_SECRET?.trim();
  const material =
    dedicated ||
    shared ||
    (process.env.NODE_ENV === 'production' ? null : 'stacklyst-dev-only-spotify-connector');
  if (!material || (process.env.NODE_ENV === 'production' && material.length < 32)) return null;
  // Domain separation: a key derived for this cookie is useless for session JWTs.
  return new Uint8Array(
    createHash('sha256').update(`stacklyst:spotify-connect:v1:${material}`).digest()
  );
}

export function spotifyConnectConfigured() {
  return Boolean(getSpotifyCredentials() && encryptionKey());
}

function requireConfig() {
  const credentials = getSpotifyCredentials();
  const key = encryptionKey();
  if (!credentials || !key) throw new SpotifyConnectError('not_configured');
  return { ...credentials, key };
}

/**
 * The redirect URI must match one registered in the Spotify dashboard exactly,
 * so it comes from configuration and never from the request Host header.
 * Spotify rejects "localhost"; local development uses http://127.0.0.1:3000.
 */
export function spotifyRedirectUri(): string {
  const explicit = process.env.SPOTIFY_REDIRECT_URI?.trim();
  const base = explicit || process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://127.0.0.1:3000';
  const url = new URL(base);
  if (url.username || url.password) throw new SpotifyConnectError('not_configured');
  if (url.hostname === 'localhost') url.hostname = '127.0.0.1';
  const loopback = url.hostname === '127.0.0.1' || url.hostname === '[::1]';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))
    throw new SpotifyConnectError('not_configured');
  if (!explicit) url.pathname = '/api/spotify/callback';
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: SPOTIFY_COOKIE_PATH,
    maxAge,
  };
}

async function seal(payload: Record<string, unknown>, ttlSeconds: number, key: Uint8Array) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .encrypt(key);
}

async function unseal(token: string | undefined, key: Uint8Array) {
  if (!token || token.length > 8192) return null;
  try {
    const { payload } = await jwtDecrypt(token, key, { contentEncryptionAlgorithms: ['A256GCM'] });
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

const base64url = (bytes: Buffer) => bytes.toString('base64url');

export async function createAuthorization(uid: string) {
  const { clientId, key } = requireConfig();
  const state = base64url(randomBytes(32));
  const verifier = base64url(randomBytes(64));
  const challenge = base64url(createHash('sha256').update(verifier).digest());
  const url = new URL('/authorize', ACCOUNTS_URL);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SPOTIFY_CONNECT_SCOPES.join(' '),
    redirect_uri: spotifyRedirectUri(),
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    // Lets people pick another Spotify account instead of silently reusing one.
    show_dialog: 'true',
  }).toString();
  const cookie = await seal({ uid, state, verifier }, STATE_TTL_SECONDS, key);
  return { url: url.toString(), cookie, maxAge: STATE_TTL_SECONDS };
}

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function readOAuthState(
  cookie: string | undefined,
  uid: string,
  state: string | null
): Promise<SpotifyOAuthState> {
  const { key } = requireConfig();
  const payload = await unseal(cookie, key);
  if (
    !payload ||
    typeof payload.uid !== 'string' ||
    typeof payload.state !== 'string' ||
    typeof payload.verifier !== 'string' ||
    !state ||
    state.length > 128 ||
    payload.uid !== uid ||
    !sameSecret(payload.state, state)
  ) {
    throw new SpotifyConnectError('invalid_state', 'O pedido de conexão expirou. Tente de novo.');
  }
  return { uid, state, verifier: payload.verifier };
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

async function tokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const { clientId, clientSecret } = requireConfig();
  let response: Response;
  try {
    response = await fetch(`${ACCOUNTS_URL}/api/token`, {
      method: 'POST',
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
  } catch {
    throw new SpotifyConnectError('upstream');
  }
  if (!response.ok) {
    let error: unknown;
    try {
      error = (await response.json())?.error;
    } catch {
      /* The provider body is never echoed to clients. */
    }
    throw new SpotifyConnectError(error === 'invalid_grant' ? 'revoked' : 'upstream');
  }
  const data = (await response.json()) as Partial<TokenResponse>;
  if (
    typeof data.access_token !== 'string' ||
    !Number.isFinite(Number(data.expires_in)) ||
    (data.refresh_token !== undefined && typeof data.refresh_token !== 'string')
  ) {
    throw new SpotifyConnectError('upstream');
  }
  return data as TokenResponse;
}

async function fetchAccount(accessToken: string): Promise<SpotifyAccount> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/me`, {
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new SpotifyConnectError('upstream');
  }
  // Apps in Spotify development mode answer 403 for users missing from the
  // dashboard's user list.
  if (response.status === 403) throw new SpotifyConnectError('not_allowed');
  if (!response.ok) throw new SpotifyConnectError('upstream');
  const data = (await response.json()) as Record<string, unknown>;
  if (typeof data.id !== 'string') throw new SpotifyConnectError('upstream');
  const text = (value: unknown, max: number) =>
    typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max) : null;
  return {
    id: data.id.slice(0, 128),
    displayName: text(data.display_name, 100),
    product: text(data.product, 32),
  };
}

export async function exchangeCode(code: string | null, oauth: SpotifyOAuthState) {
  if (!code || code.length > 2048) throw new SpotifyConnectError('invalid_state');
  const token = await tokenRequest(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: spotifyRedirectUri(),
      code_verifier: oauth.verifier,
    })
  );
  if (!token.refresh_token) throw new SpotifyConnectError('upstream');
  const account = await fetchAccount(token.access_token);
  return {
    uid: oauth.uid,
    refreshToken: token.refresh_token,
    accessToken: token.access_token,
    accessTokenExpiresAt: Date.now() + Number(token.expires_in) * 1000,
    scope: token.scope || '',
    account,
  } satisfies SpotifySession;
}

export async function sealSession(session: SpotifySession) {
  const { key } = requireConfig();
  return {
    cookie: await seal({ ...session }, SESSION_TTL_SECONDS, key),
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function readSession(
  cookie: string | undefined,
  uid: string
): Promise<SpotifySession | null> {
  const key = encryptionKey();
  if (!key || !getSpotifyCredentials()) return null;
  const payload = await unseal(cookie, key);
  const account = payload?.account as Partial<SpotifyAccount> | undefined;
  if (
    !payload ||
    payload.uid !== uid ||
    typeof payload.refreshToken !== 'string' ||
    typeof payload.accessToken !== 'string' ||
    typeof payload.accessTokenExpiresAt !== 'number' ||
    typeof account?.id !== 'string'
  ) {
    return null;
  }
  return {
    uid,
    refreshToken: payload.refreshToken,
    accessToken: payload.accessToken,
    accessTokenExpiresAt: payload.accessTokenExpiresAt,
    scope: typeof payload.scope === 'string' ? payload.scope : '',
    account: {
      id: account.id,
      displayName: typeof account.displayName === 'string' ? account.displayName : null,
      product: typeof account.product === 'string' ? account.product : null,
    },
  };
}

/** Returns a session whose access token stays valid for at least a minute. */
export async function freshSession(
  session: SpotifySession
): Promise<{ session: SpotifySession; rotated: boolean }> {
  if (session.accessTokenExpiresAt - ACCESS_TOKEN_SKEW_MS > Date.now()) {
    return { session, rotated: false };
  }
  const token = await tokenRequest(
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: session.refreshToken })
  );
  const next: SpotifySession = {
    ...session,
    accessToken: token.access_token,
    accessTokenExpiresAt: Date.now() + Number(token.expires_in) * 1000,
    // Spotify may rotate refresh tokens; keep the newest one.
    refreshToken: token.refresh_token || session.refreshToken,
    scope: token.scope || session.scope,
  };
  // Plan changes (Free <-> Premium) decide whether full playback is possible.
  try {
    next.account = await fetchAccount(next.accessToken);
  } catch {
    /* Keep the last known account details. */
  }
  return { session: next, rotated: true };
}

export function publicAccount(session: SpotifySession | null) {
  return session
    ? {
        connected: true as const,
        displayName: session.account.displayName,
        product: session.account.product,
        premium: session.account.product === 'premium',
      }
    : { connected: false as const };
}

/**
 * Cookie-authenticated endpoints accept only same-origin browser requests.
 * SameSite=Lax already blocks cross-site POSTs; this also covers GETs that
 * return tokens and older browsers.
 */
export function isSameOriginRequest(request: Request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
