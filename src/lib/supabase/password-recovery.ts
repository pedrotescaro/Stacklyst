import { createHmac, timingSafeEqual } from 'node:crypto';
import { JWT_SECRET } from '@/lib/config';

export const RECOVERY_COOKIE = 'stacklyst-password-recovery';
export const RECOVERY_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth/reset-password',
  maxAge: 15 * 60,
};
const audience = 'stacklyst:password-recovery';

function signature(value: string) {
  if (
    process.env.NODE_ENV === 'production' &&
    JWT_SECRET === 'stacklyst-dev-only-secret-do-not-use-in-production'
  ) {
    throw new Error('JWT_SECRET must be configured in production.');
  }
  return createHmac('sha256', JWT_SECRET).update(value).digest();
}

export function issueRecoveryProof(userId: string) {
  const value = Buffer.from(
    JSON.stringify({
      sub: userId,
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + RECOVERY_COOKIE_OPTIONS.maxAge,
    })
  ).toString('base64url');
  return `${value}.${signature(value).toString('base64url')}`;
}

export function verifyRecoveryProof(token: string | undefined, userId: string) {
  if (!token || token.length > 2048) return false;
  try {
    const [value, supplied, extra] = token.split('.');
    if (!value || !supplied || extra) return false;
    const expected = signature(value);
    const actual = Buffer.from(supplied, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString('utf-8'));
    return (
      payload.sub === userId &&
      payload.aud === audience &&
      typeof payload.exp === 'number' &&
      payload.exp > Date.now() / 1000
    );
  } catch {
    return false;
  }
}
