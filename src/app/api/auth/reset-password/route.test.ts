import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  proof: undefined as string | undefined,
  cookies: [] as Array<{ name: string; value: string }>,
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => (mocks.proof ? { value: mocks.proof } : undefined),
    getAll: () => mocks.cookies,
  }),
}));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: mocks }) }));
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn(async () => null) }));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: vi.fn() }));
import { issueRecoveryProof } from '@/lib/supabase/password-recovery';
import { GET, POST } from './route';
const context = { params: Promise.resolve({}) };
function request(body: unknown = { password: 'new-strong-password' }) {
  return new Request('https://stacklyst.test/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function cookieHeader(response: Response, name: string) {
  return response.headers.getSetCookie().find((entry) => entry.startsWith(`${name}=`));
}

beforeEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  mocks.proof = undefined;
  mocks.cookies = [];
  mocks.getUser.mockResolvedValue({
    data: { user: { id: 'verified-user', email: 'recovered@example.com' } },
    error: null,
  });
  mocks.updateUser.mockResolvedValue({ error: null });
  mocks.signOut.mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());
describe('Recovery-only password update', () => {
  it('rejects a regular signed-in session without the emailed recovery proof', async () => {
    const status = await GET(
      new Request('https://stacklyst.test/api/auth/reset-password'),
      context
    );
    expect(status.status).toBe(401);
    expect(await status.json()).not.toHaveProperty('email');
    expect((await POST(request(), context)).status).toBe(401);
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
  it('rejects forged proof, a proof for another account, and expired proof', async () => {
    mocks.proof = issueRecoveryProof('different-user');
    expect((await POST(request(), context)).status).toBe(401);
    mocks.proof = issueRecoveryProof('verified-user') + 'forged';
    expect((await POST(request(), context)).status).toBe(401);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));
    mocks.proof = issueRecoveryProof('verified-user');
    vi.setSystemTime(new Date('2026-10-26T12:16:00Z'));
    expect((await POST(request(), context)).status).toBe(401);
    expect(mocks.updateUser).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
  it('returns the verified email and completes password recovery with one server-side sign-out', async () => {
    mocks.proof = issueRecoveryProof('verified-user');
    const status = await GET(
      new Request('https://stacklyst.test/api/auth/reset-password'),
      context
    );
    expect(status.status).toBe(200);
    expect(await status.json()).toEqual({ valid: true, email: 'recovered@example.com' });
    expect(status.headers.get('cache-control')).toBe('private, no-store');
    const response = await POST(request(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'new-strong-password' });
    expect(mocks.signOut).toHaveBeenCalledExactlyOnceWith({ scope: 'global' });
    expect(mocks.updateUser.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.signOut.mock.invocationCallOrder[0]
    );
    const recovery = cookieHeader(response, 'stacklyst-password-recovery');
    expect(recovery).toContain('HttpOnly');
    expect(recovery).toContain('Path=/api/auth/reset-password;');
    expect(recovery).toContain('Max-Age=0');
    for (const [name, path] of [
      ['stacklyst-jwt', '/'],
      ['stacklyst_saved_account', '/'],
      ['sl_spotify', '/api/spotify'],
    ]) {
      const cleared = cookieHeader(response, name);
      expect(cleared).toContain(`Path=${path};`);
      expect(cleared).toContain('Max-Age=0');
    }
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it.each([false, true])(
    'expires only this project’s Supabase cookies when sign-out fails (network rejection: %s)',
    async (networkFailure) => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.test');
      mocks.proof = issueRecoveryProof('verified-user');
      mocks.cookies = [
        { name: 'sb-project-auth-token.0', value: 'fixture-cookie-part-0' },
        { name: 'sb-project-auth-token.1', value: 'fixture-cookie-part-1' },
        { name: 'sb-other-auth-token', value: 'separate-project-cookie' },
      ];
      if (networkFailure) mocks.signOut.mockRejectedValueOnce(new Error('Connection unavailable'));
      else mocks.signOut.mockResolvedValueOnce({ error: { status: 503 } });

      const response = await POST(request(), context);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
      expect(mocks.signOut).toHaveBeenCalledExactlyOnceWith({ scope: 'global' });
      for (const chunk of ['sb-project-auth-token.0', 'sb-project-auth-token.1']) {
        const cleared = cookieHeader(response, chunk);
        expect(cleared).toMatch(/^sb-project-auth-token\.\d=; Path=\/;/);
        expect(cleared).toContain('Max-Age=0');
      }
      expect(cookieHeader(response, 'sb-other-auth-token')).toBeUndefined();
      expect(cookieHeader(response, 'stacklyst-password-recovery')).toContain('Max-Age=0');
    }
  );
  it('keeps recovery available without logging out if the password update itself fails', async () => {
    mocks.proof = issueRecoveryProof('verified-user');
    mocks.updateUser.mockResolvedValueOnce({ error: { status: 400 } });
    const response = await POST(request(), context);
    expect(response.status).toBe(400);
    expect(cookieHeader(response, 'stacklyst-password-recovery')).toBeUndefined();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
  it('rejects a missing Supabase session even when the proof exists', async () => {
    mocks.proof = issueRecoveryProof('verified-user');
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'expired' } });
    expect((await POST(request(), context)).status).toBe(401);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
