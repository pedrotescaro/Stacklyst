import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
  proof: undefined as string | undefined,
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => (mocks.proof ? { value: mocks.proof } : undefined) }),
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
beforeEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  mocks.proof = undefined;
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'verified-user' } }, error: null });
  mocks.updateUser.mockResolvedValue({ error: null });
});
describe('Recovery-only password update', () => {
  it('rejects a regular signed-in session without the emailed recovery proof', async () => {
    expect(
      (await GET(new Request('https://stacklyst.test/api/auth/reset-password'), context)).status
    ).toBe(401);
    expect((await POST(request(), context)).status).toBe(401);
    expect(mocks.updateUser).not.toHaveBeenCalled();
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
  it('updates through Supabase only with a valid verified session and signed recovery proof, then expires the proof', async () => {
    mocks.proof = issueRecoveryProof('verified-user');
    expect(
      (await GET(new Request('https://stacklyst.test/api/auth/reset-password'), context)).status
    ).toBe(200);
    const response = await POST(request(), context);
    expect(response.status).toBe(200);
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'new-strong-password' });
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('rejects a missing Supabase session even when the proof exists', async () => {
    mocks.proof = issueRecoveryProof('verified-user');
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'expired' } });
    expect((await POST(request(), context)).status).toBe(401);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
