// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  authorization: null as string | null,
  getAll: vi.fn(),
  set: vi.fn(),
  createServerClient: vi.fn(),
}));
vi.mock('../dev-ssl', () => ({}));
vi.mock('@supabase/ssr', () => ({ createServerClient: mocks.createServerClient }));
vi.mock('next/headers', () => ({
  headers: async () =>
    new Headers(mocks.authorization === null ? {} : { authorization: mocks.authorization }),
  cookies: async () => ({ getAll: mocks.getAll, set: mocks.set }),
}));
vi.mock('@/lib/supabase/env', () => ({
  getSupabasePublicConfig: () => ({ url: 'https://example.supabase.co', key: 'publishable' }),
}));
import { createClient } from '../server';

describe('native storage client cookie isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorization = null;
    mocks.getAll.mockReturnValue([{ name: 'browser-token', value: 'other-user' }]);
  });

  it('preserves browser session cookies when authorization is absent', async () => {
    await createClient();
    const options = mocks.createServerClient.mock.calls[0][2];
    expect(options.cookies.getAll()).toEqual([{ name: 'browser-token', value: 'other-user' }]);
    options.cookies.setAll([{ name: 'refreshed', value: 'new', options: {} }]);
    expect(mocks.set).toHaveBeenCalledWith('refreshed', 'new', {});
  });

  it('uses only explicit authorization and cannot read or replace browser cookies', async () => {
    mocks.authorization = 'Bearer native-token';
    await createClient();
    const options = mocks.createServerClient.mock.calls[0][2];
    expect(options.global.headers.Authorization).toBe('Bearer native-token');
    expect(options.cookies.getAll()).toEqual([]);
    options.cookies.setAll([{ name: 'refreshed', value: 'new', options: {} }]);
    expect(mocks.getAll).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });
});
