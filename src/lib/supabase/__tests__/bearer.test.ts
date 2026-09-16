// @vitest-environment node
import { AuthRetryableFetchError } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), createClient: vi.fn() }));
vi.mock('@supabase/supabase-js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@supabase/supabase-js')>()),
  createClient: mocks.createClient,
}));
vi.mock('@/lib/supabase/env', () => ({
  getSupabasePublicConfig: () => ({ url: 'https://example.supabase.co', key: 'publishable-key' }),
}));
import { verifyBearerIdentity } from '../bearer';

describe('verified native bearer identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockReturnValue({ auth: { getUser: mocks.getUser } });
  });

  it('verifies the supplied token with Auth and does not persist a session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'native-user' } }, error: null });
    await expect(verifyBearerIdentity('Bearer opaque-token')).resolves.toBe('native-user');
    expect(mocks.getUser).toHaveBeenCalledWith('opaque-token');
    expect(mocks.createClient).toHaveBeenCalledWith(expect.any(String), 'publishable-key', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  });

  it.each(['', 'Basic secret', 'Bearer', 'Bearer token another', 'Bearer token\n'])(
    'rejects malformed authorization %j before calling Auth',
    async (header) => {
      await expect(verifyBearerIdentity(header)).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        statusCode: 401,
      });
      expect(mocks.getUser).not.toHaveBeenCalled();
    }
  );

  it('rejects a revoked token even if an identity accompanies the error', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'stale-user' } },
      error: { status: 401, message: 'Invalid JWT' },
    });
    await expect(verifyBearerIdentity('Bearer revoked')).rejects.toMatchObject({
      code: 'INVALID_TOKEN',
      statusCode: 401,
    });
  });

  it('returns a recoverable error for Auth outages', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: new AuthRetryableFetchError('Unavailable', 503),
    });
    await expect(verifyBearerIdentity('Bearer token')).rejects.toMatchObject({
      code: 'AUTH_TEMPORARILY_UNAVAILABLE',
      statusCode: 503,
    });
  });

  it('returns a recoverable error for thrown network failures', async () => {
    mocks.getUser.mockRejectedValue(new TypeError('fetch failed'));
    await expect(verifyBearerIdentity('Bearer token')).rejects.toMatchObject({
      code: 'AUTH_TEMPORARILY_UNAVAILABLE',
      statusCode: 503,
    });
  });
});
