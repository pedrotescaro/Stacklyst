import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthIdentity: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
vi.mock('@/lib/auth-session', () => ({ getAuthIdentity: mocks.getAuthIdentity }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import Home from './page';

beforeEach(() => vi.clearAllMocks());

describe('Application root', () => {
  it.each([
    [null, '/login'],
    [{ id: 'viewer' }, '/feed'],
  ])('redirects the verified identity %j to %s', async (identity, destination) => {
    mocks.getAuthIdentity.mockResolvedValueOnce(identity);
    await expect(Home()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith(destination);
  });
});
