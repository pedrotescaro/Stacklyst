import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { purgeExpiredSecurityAudit } from '@/lib/security-audit';

vi.mock('@/lib/security-audit', () => ({
  purgeExpiredSecurityAudit: vi.fn().mockResolvedValue({ count: 3 }),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn() }));

describe('audit cleanup authorization', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });
  const context = { params: Promise.resolve({}) };

  it.each([undefined, 'wrong', 'Bearer wrong'])(
    'denies missing or incorrect credentials: %s',
    async (authorization) => {
      vi.stubEnv('CRON_SECRET', 'test-job-secret');
      const response = await POST(
        new Request('http://localhost/api/cron/security-audit', {
          method: 'POST',
          headers: authorization ? { authorization } : {},
        }),
        context
      );
      expect(response.status).toBe(401);
      expect(purgeExpiredSecurityAudit).not.toHaveBeenCalled();
    }
  );

  it('fails closed when the cron secret is unconfigured', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const response = await POST(
      new Request('http://localhost/api/cron/security-audit', { method: 'POST' }),
      context
    );
    expect(response.status).toBe(401);
    expect(purgeExpiredSecurityAudit).not.toHaveBeenCalled();
  });

  it('allows the configured job and returns only a deletion count', async () => {
    vi.stubEnv('CRON_SECRET', 'test-job-secret');
    const response = await POST(
      new Request('http://localhost/api/cron/security-audit', {
        method: 'POST',
        headers: { authorization: 'Bearer test-job-secret' },
      }),
      context
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: 3 });
    expect(purgeExpiredSecurityAudit).toHaveBeenCalledOnce();
  });
});
