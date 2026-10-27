import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { DEFAULT_PROFILE_PREFERENCES } from '@/lib/profile-customization';
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  own: vi.fn(),
  public: vi.fn(),
  save: vi.fn(),
  catalog: vi.fn(),
  saveCatalog: vi.fn(),
  catalogRow: vi.fn(),
  limit: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({
  getAuthUser: mocks.auth,
  requireAuth: async () => {
    const user = await mocks.auth();
    if (!user) throw new UnauthorizedError();
    return user;
  },
  requireAdmin: async () => {
    const user = await mocks.auth();
    if (!user) throw new UnauthorizedError();
    if (user.role !== 'ADMIN') throw new ForbiddenError();
    return user;
  },
}));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: mocks.limit }));
vi.mock('@/lib/prisma', () => ({
  prisma: { profileAchievementCatalog: { findUnique: mocks.catalogRow } },
}));
vi.mock('@/services/profile-customization.service', () => ({
  getProfileCustomization: mocks.own,
  findProfileCustomizationByUsername: mocks.public,
  saveProfileCustomization: mocks.save,
  getProfileCatalog: mocks.catalog,
  saveProfileCatalog: mocks.saveCatalog,
}));
import { GET, PUT } from './route';
import { GET as achievements } from '../achievements/route';
import { GET as getCatalog, PUT as updateCatalog } from '../../admin/profile-catalog/route';
const context = { params: Promise.resolve({}) };
const request = (path = '/profile/customization', body?: unknown) =>
  new Request(
    `https://stacklyst.test/api${path}`,
    body === undefined
      ? {}
      : {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ id: 'authenticated-owner', role: 'USER' });
  mocks.own.mockResolvedValue({
    preferences: DEFAULT_PROFILE_PREFERENCES,
    chat: { mode: 'dark' },
    version: 2,
    avatarUrl: null,
  });
  mocks.save.mockResolvedValue({ version: 3 });
  mocks.public.mockResolvedValue({ preferences: DEFAULT_PROFILE_PREFERENCES, achievements: [] });
  mocks.catalogRow.mockResolvedValue(null);
  mocks.catalog.mockResolvedValue({ events: [] });
  mocks.saveCatalog.mockResolvedValue({ version: 1 });
});
describe('Profile personalization access boundaries', () => {
  it('requires authentication for own reads, writes and achievement notifications', async () => {
    mocks.auth.mockResolvedValue(null);
    expect((await GET(request(), context)).status).toBe(401);
    expect((await PUT(request(undefined, {}), context)).status).toBe(401);
    expect((await achievements(request('/profile/achievements?notify=1'), context)).status).toBe(
      401
    );
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.own).not.toHaveBeenCalled();
  });
  it('always uses the authenticated account for own reads and saves', async () => {
    const payload = { version: 2, preferences: DEFAULT_PROFILE_PREFERENCES, avatarUrl: null };
    const response = await PUT(request('/profile/customization?userId=victim', payload), context);
    expect(response.status).toBe(200);
    expect(mocks.save).toHaveBeenCalledWith('authenticated-owner', payload);
    expect(response.headers.get('cache-control')).toContain('no-store');
    await GET(request('/profile/customization?userId=victim'), context);
    expect(mocks.own).toHaveBeenCalledWith('authenticated-owner');
  });
  it('uses the public projection when visiting another profile', async () => {
    const response = await GET(request('/profile/customization?username=another-person'), context);
    expect(mocks.public).toHaveBeenCalledWith('another-person');
    expect(mocks.own).not.toHaveBeenCalled();
    expect(await response.json()).not.toHaveProperty('chat');
  });
  it('claims pending toasts only when an explicit notification consumer opts in', async () => {
    await achievements(request('/profile/achievements'), context);
    expect(mocks.own).toHaveBeenLastCalledWith('authenticated-owner', { claimUnlocks: false });
    await achievements(request('/profile/achievements?notify=1'), context);
    expect(mocks.own).toHaveBeenLastCalledWith('authenticated-owner', { claimUnlocks: true });
  });
  it('rejects catalog reads and writes for a regular account', async () => {
    expect((await getCatalog(request('/admin/profile-catalog'), context)).status).toBe(403);
    expect(
      (await updateCatalog(request('/admin/profile-catalog', { version: 0, catalog: {} }), context))
        .status
    ).toBe(403);
    expect(mocks.saveCatalog).not.toHaveBeenCalled();
  });
  it('allows an administrator and rejects unknown catalog-envelope fields', async () => {
    mocks.auth.mockResolvedValue({ id: 'admin', role: 'ADMIN' });
    expect((await getCatalog(request('/admin/profile-catalog'), context)).status).toBe(200);
    const payload = { version: 0, catalog: { events: [] } };
    expect((await updateCatalog(request('/admin/profile-catalog', payload), context)).status).toBe(
      200
    );
    expect(mocks.saveCatalog).toHaveBeenCalledWith(payload.catalog, 0);
    expect(
      (
        await updateCatalog(
          request('/admin/profile-catalog', { ...payload, userId: 'someone' }),
          context
        )
      ).status
    ).toBe(400);
  });
});
