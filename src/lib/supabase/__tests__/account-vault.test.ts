// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { openAccount, sealAccount } from '@/lib/supabase/account-vault';

describe('account vault', () => {
  it('encrypts the refresh token and rejects modified ciphertext', () => {
    const account = { id: 'user-a', label: 'a@example.com', refreshToken: 'private-refresh-token' };
    const sealed = sealAccount(account);
    expect(sealed).not.toContain(account.refreshToken);
    expect(openAccount(sealed)).toEqual(account);
    const bytes = Buffer.from(sealed, 'base64url');
    bytes[bytes.length - 1] ^= 1;
    expect(openAccount(bytes.toString('base64url'))).toBeNull();
  });
});
