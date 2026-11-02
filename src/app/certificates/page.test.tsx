import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getAuthUser: vi.fn(), redirect: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.getAuthUser }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
import CertificatesPage from './page';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.redirect.mockImplementation((path: string) => {
    throw new Error(`redirect:${path}`);
  });
});

it('keeps old collection links working by opening the owner profile certificates tab', async () => {
  mocks.getAuthUser.mockResolvedValue({ username: 'ana test' });
  await expect(CertificatesPage()).rejects.toThrow('redirect:/profile/ana%20test?tab=certificates');
});

it('requires authentication before resolving the owner destination', async () => {
  mocks.getAuthUser.mockResolvedValue(null);
  await expect(CertificatesPage()).rejects.toThrow('redirect:/login');
  expect(mocks.redirect).toHaveBeenCalledTimes(1);
});
