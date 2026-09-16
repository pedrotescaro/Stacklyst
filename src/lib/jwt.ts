/**
 * JWT utility module for Stacklyst.
 *
 * Provides token signing, verification, and cookie management.
 * This serves as a secondary authentication layer on top of Supabase Auth.
 *
 * Flow:
 * 1. User authenticates via Supabase (OAuth or email/password)
 * 2. After successful auth, we sign a JWT with user data
 * 3. JWT is stored as an httpOnly cookie
 * 4. On each request, we verify the JWT as a secondary check
 * 5. If JWT is invalid/expired, we fall back to Supabase session verification
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { JWT_SECRET, JWT_COOKIE_NAME, JWT_COOKIE_OPTIONS, JWT_EXPIRES_IN } from '@/lib/config';
import { logger } from '@/lib/logger';

export interface JwtPayload {
  sub: string; // user ID
  username: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Sign a new JWT token for the given user.
 */
export async function signJwt(payload: {
  userId: string;
  username: string;
  email: string;
}): Promise<string> {
  return new SignJWT({
    username: payload.username,
    email: payload.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getEncodedJwtSecret());
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload if valid, null otherwise.
 */
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    if (
      process.env.NODE_ENV === 'production' &&
      JWT_SECRET === 'stacklyst-dev-only-secret-do-not-use-in-production'
    ) {
      logger.error('JWT verification refused: dev-only secret in production');
      return null;
    }
    const { payload } = await jwtVerify(token, getEncodedJwtSecret(), {
      algorithms: ['HS256'],
    });
    return normalizeJwtPayload(payload);
  } catch (err) {
    logger.debug('JWT verification failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Set the JWT token as an httpOnly cookie.
 * Call this after successful authentication.
 */
export async function setJwtCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(JWT_COOKIE_NAME, token, JWT_COOKIE_OPTIONS);
}

/**
 * Remove the JWT cookie (used during logout).
 */
export async function removeJwtCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(JWT_COOKIE_NAME);
}

/**
 * Get the JWT token from the cookie.
 * Returns null if not found.
 */
export async function getJwtFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME);
  return token?.value ?? null;
}

/**
 * Extract and verify JWT from cookies.
 * Returns the decoded payload if valid, null otherwise.
 */
export async function getJwtUser(): Promise<JwtPayload | null> {
  const token = await getJwtFromCookie();
  if (!token) return null;
  return await verifyJwt(token);
}

function getEncodedJwtSecret() {
  return new TextEncoder().encode(JWT_SECRET);
}

function normalizeJwtPayload(payload: JWTPayload): JwtPayload | null {
  if (
    typeof payload.sub !== 'string' ||
    typeof payload.username !== 'string' ||
    typeof payload.email !== 'string' ||
    typeof payload.iat !== 'number' ||
    typeof payload.exp !== 'number'
  ) {
    return null;
  }

  return {
    sub: payload.sub,
    username: payload.username,
    email: payload.email,
    iat: payload.iat,
    exp: payload.exp,
  };
}
