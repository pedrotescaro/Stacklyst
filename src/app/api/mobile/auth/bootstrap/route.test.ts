// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  verifyBearerUser: vi.fn(),
  bootstrapMobileUser: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.getAuthUser }));
vi.mock('@/lib/supabase/bearer', () => ({ verifyBearerUser: mocks.verifyBearerUser }));
vi.mock('@/lib/mobile/auth-bootstrap', () => ({ bootstrapMobileUser: mocks.bootstrapMobileUser }));
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
import { POST } from './route';

const context = { params: Promise.resolve({}) };
const verifiedUser = { id: 'verified-id', email: 'verified@example.com' };

describe('native account bootstrap authorization', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getAuthUser.mockResolvedValue({ id: 'browser-admin', role: 'ADMIN' });
    mocks.verifyBearerUser.mockResolvedValue(verifiedUser);
    mocks.bootstrapMobileUser.mockResolvedValue({
      created: true,
      user: { id: 'verified-id', username: 'verified_user' },
    });
  });

  it('requires explicit bearer authorization even when web cookies are present', async () => {
    const response = await POST(
      new Request('https://stacklyst.test/api/mobile/auth/bootstrap', {
        method: 'POST',
        headers: { cookie: 'stacklyst-jwt=browser-admin' },
      }),
      context
    );
    expect(response.status).toBe(401);
    expect(mocks.getAuthUser).not.toHaveBeenCalled();
    expect(mocks.verifyBearerUser).not.toHaveBeenCalled();
    expect(mocks.bootstrapMobileUser).not.toHaveBeenCalled();
  });

  it('rejects an invalid bearer without reading cookies or writing any profile', async () => {
    mocks.verifyBearerUser.mockRejectedValue(new UnauthorizedError('INVALID_TOKEN'));
    const response = await POST(
      new Request('https://stacklyst.test/api/mobile/auth/bootstrap', {
        method: 'POST',
        headers: { authorization: 'Bearer revoked', cookie: 'session=browser-admin' },
      }),
      context
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: 'INVALID_TOKEN' });
    expect(mocks.getAuthUser).not.toHaveBeenCalled();
    expect(mocks.bootstrapMobileUser).not.toHaveBeenCalled();
  });

  it('uses only the verified Supabase identity, ignoring body identity and role', async () => {
    const response = await POST(
      new Request('https://stacklyst.test/api/mobile/auth/bootstrap', {
        method: 'POST',
        headers: { authorization: 'Bearer verified-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'victim', email: 'victim@example.com', role: 'ADMIN' }),
      }),
      context
    );
    expect(response.status).toBe(201);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(mocks.verifyBearerUser).toHaveBeenCalledWith('Bearer verified-token');
    expect(mocks.bootstrapMobileUser).toHaveBeenCalledExactlyOnceWith(verifiedUser);
    expect(mocks.getAuthUser).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      success: true,
      created: true,
      user: { id: 'verified-id', username: 'verified_user' },
    });
  });

  it('returns 200 when the application profile already exists', async () => {
    mocks.bootstrapMobileUser.mockResolvedValue({
      created: false,
      user: { id: 'verified-id', username: 'preserved' },
    });
    const response = await POST(
      new Request('https://stacklyst.test/api/mobile/auth/bootstrap', {
        method: 'POST',
        headers: { authorization: 'Bearer verified-token' },
      }),
      context
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ created: false });
  });
});
