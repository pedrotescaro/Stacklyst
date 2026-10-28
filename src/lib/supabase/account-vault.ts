import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { JWT_SECRET } from '@/lib/config';

export const ACCOUNT_COOKIE = 'stacklyst_saved_account';
export const ACCOUNT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

export type SavedAccount = {
  id: string;
  label: string;
  refreshToken: string;
};

function key() {
  if (
    process.env.NODE_ENV === 'production' &&
    JWT_SECRET === 'stacklyst-dev-only-secret-do-not-use-in-production'
  ) {
    throw new Error('JWT_SECRET must be configured to save accounts.');
  }
  return createHash('sha256').update('stacklyst-account-vault-v1:').update(JWT_SECRET).digest();
}

export function sealAccount(account: SavedAccount) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(account), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}

export function openAccount(value: string | undefined): SavedAccount | null {
  if (!value || value.length > 3500) return null;
  try {
    const bytes = Buffer.from(value, 'base64url');
    if (bytes.length < 29) return null;
    const decipher = createDecipheriv('aes-256-gcm', key(), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const account: unknown = JSON.parse(
      Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')
    );
    if (!account || typeof account !== 'object') return null;
    const candidate = account as Record<string, unknown>;
    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.label !== 'string' ||
      typeof candidate.refreshToken !== 'string'
    )
      return null;
    return { id: candidate.id, label: candidate.label, refreshToken: candidate.refreshToken };
  } catch {
    return null;
  }
}
