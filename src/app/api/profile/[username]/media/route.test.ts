import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';
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
  it('applies public audience access before paginating the owner’s actual images', async () => {
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
      where: {
        author_id: 'profile-owner',
        AND: [
          { author: {}, OR: [{ audience: 'everyone' }] },
          {
            OR: [
              { image_url: { not: null, notIn: [''] } },
              { attachments: { not: Prisma.DbNull } },
            ],
          },
        ],
      },
      take: 3,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: { id: true, title: true, image_url: true, attachments: true, created_at: true },
    });
    expect(Object.keys(mocks.posts.mock.calls[0][0].select)).toEqual([
      'id',
      'title',
      'image_url',
      'attachments',
      'created_at',
    ]);
    await GET(
      new Request(
        `https://stacklyst.test/api/profile/developer/media?type=photos&limit=2&cursor=${encodeURIComponent(data.nextCursor)}`
      ),
      context
    );
    expect(mocks.posts.mock.calls[1][0].where).toEqual({
      ...mocks.posts.mock.calls[0][0].where,
      OR: [
        { created_at: { lt: new Date('2026-10-26T12:00:00Z') } },
        { created_at: new Date('2026-10-26T12:00:00Z'), id: { lt: 'post-2' } },
      ],
    });
  });
  it('returns image and gif attachments in order without exposing attachment metadata', async () => {
    mocks.posts.mockResolvedValue([
      {
        id: 'multi-image-post',
        title: 'Duas imagens',
        image_url: '/legacy-cover.png',
        attachments: [
          { type: 'image', url: '/photo.png', owner_id: 'private-owner' },
          { type: 'gif', url: '/animation.gif' },
          { type: 'video', url: '/unsupported.mp4' },
          { type: 'image' },
          null,
        ],
        created_at: new Date('2026-10-27T12:00:00Z'),
      },
    ]);

    const response = await GET(
      new Request('https://stacklyst.test/api/profile/developer/media?type=photos'),
      context
    );
    const sharedFields = {
      id: 'multi-image-post',
      title: 'Duas imagens',
      created_at: '2026-10-27T12:00:00.000Z',
    };
    expect(await response.json()).toEqual({
      items: [
        { ...sharedFields, image_url: '/photo.png' },
        { ...sharedFields, image_url: '/animation.gif' },
      ],
      nextCursor: null,
    });
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
  it('combines text search with the photo cursor', async () => {
    const cursor = Buffer.from(
      JSON.stringify({ id: 'last', createdAt: '2026-10-27T12:00:00.000Z' })
    ).toString('base64url');
    await GET(
      new Request(
        `https://stacklyst.test/api/profile/developer/media?search=antigo&cursor=${cursor}`
      ),
      context
    );
    expect(mocks.posts.mock.calls[0][0].where).toMatchObject({
      author_id: 'profile-owner',
      AND: [
        { author: {}, OR: [{ audience: 'everyone' }] },
        {
          OR: [{ image_url: { not: null, notIn: [''] } }, { attachments: { not: Prisma.DbNull } }],
        },
        {
          OR: [
            { title: { contains: 'antigo', mode: 'insensitive' } },
            { body: { contains: 'antigo', mode: 'insensitive' } },
            { code_snippet: { contains: 'antigo', mode: 'insensitive' } },
          ],
        },
      ],
      OR: [
        { created_at: { lt: new Date('2026-10-27T12:00:00Z') } },
        { created_at: new Date('2026-10-27T12:00:00Z'), id: { lt: 'last' } },
      ],
    });
  });
});
