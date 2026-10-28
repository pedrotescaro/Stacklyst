import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ profile: vi.fn(), posts: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/prisma', () => ({
  prisma: { user: { findFirst: mocks.profile }, post: { findMany: mocks.posts } },
}));
import { GET } from './route';
const context = { params: Promise.resolve({ username: 'developer' }) };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.profile.mockResolvedValue({ id: 'profile-owner' });
  mocks.posts.mockResolvedValue([]);
});
describe('Profile media from actual publications', () => {
  it('queries only public photo fields and paginates the owner’s actual images', async () => {
    mocks.posts.mockResolvedValue(
      [1, 2, 3].map((index) => ({
        id: `post-${index}`,
        title: `Foto ${index}`,
        image_url: `/photo-${index}.png`,
        created_at: new Date(`2026-10-${28 - index}T12:00:00Z`),
      }))
    );
    const response = await GET(
      new Request('https://stacklyst.test/api/profile/developer/media?type=photos&limit=2'),
      context
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.items).toHaveLength(2);
    expect(data.nextCursor).toBeTruthy();
    expect(mocks.posts.mock.calls[0][0]).toMatchObject({
      where: { author_id: 'profile-owner', image_url: { not: null, notIn: [''] } },
      take: 3,
      select: { id: true, title: true, image_url: true, created_at: true },
    });
    expect(Object.keys(mocks.posts.mock.calls[0][0].select)).toEqual([
      'id',
      'title',
      'image_url',
      'created_at',
    ]);
    await GET(
      new Request(
        `https://stacklyst.test/api/profile/developer/media?type=photos&limit=2&cursor=${encodeURIComponent(data.nextCursor)}`
      ),
      context
    );
    expect(mocks.posts.mock.calls[1][0].where.OR).toHaveLength(2);
  });
  it('returns an honest empty video collection when the existing storage has no video records', async () => {
    const response = await GET(
      new Request('https://stacklyst.test/api/profile/developer/media?type=videos'),
      context
    );
    expect(await response.json()).toEqual({ items: [], nextCursor: null });
    expect(mocks.posts).not.toHaveBeenCalled();
  });
  it('rejects malformed cursors and invalid filters and reports missing users', async () => {
    expect(
      (
        await GET(
          new Request('https://stacklyst.test/api/profile/developer/media?cursor=not-valid-json'),
          context
        )
      ).status
    ).toBe(400);
    expect(
      (
        await GET(
          new Request('https://stacklyst.test/api/profile/developer/media?type=private'),
          context
        )
      ).status
    ).toBe(400);
    mocks.profile.mockResolvedValue(null);
    expect(
      (await GET(new Request('https://stacklyst.test/api/profile/missing/media'), context)).status
    ).toBe(404);
  });
});
