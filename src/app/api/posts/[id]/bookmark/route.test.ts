// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  post: { findUnique: vi.fn() },
  bookmark: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  user: { id: 'viewer' },
  access: vi.fn(),
  block: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({ prisma: mocks }));
vi.mock('@/lib/auth', () => ({
  getAuthUser: async () => mocks.user,
  requireAuth: async () => mocks.user,
}));
vi.mock('@/services/block.service', () => ({ BlockService: { assertCanInteract: mocks.block } }));
vi.mock('@/services/post-access.service', () => ({ assertPostAudience: mocks.access }));
import { GET, POST } from './route';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.post.findUnique.mockResolvedValue({
    id: 'post',
    author_id: 'author',
    audience: 'everyone',
  });
  mocks.bookmark.findUnique.mockResolvedValue(null);
  mocks.bookmark.findFirst.mockResolvedValue(null);
  mocks.bookmark.upsert.mockResolvedValue({ id: 'saved' });
});
const invoke = (body?: unknown) =>
  POST(
    new Request('https://stacklyst.test/api/posts/post/bookmark', {
      method: 'POST',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    { params: Promise.resolve({ id: 'post' }) }
  );

describe('post bookmark persistence', () => {
  it('saves an explicit state idempotently instead of toggling a repeated request', async () => {
    for (let index = 0; index < 2; index++)
      expect(await (await invoke({ bookmarked: true })).json()).toMatchObject({ bookmarked: true });
    expect(mocks.bookmark.upsert).toHaveBeenCalledTimes(2);
    expect(mocks.bookmark.findFirst).not.toHaveBeenCalled();
    expect(mocks.bookmark.delete).not.toHaveBeenCalled();
    expect(mocks.bookmark.upsert).toHaveBeenCalledWith({
      where: { user_id_post_id: { user_id: 'viewer', post_id: 'post' } },
      create: { user_id: 'viewer', post_id: 'post' },
      update: {},
    });
  });
  it('removes only this user’s saved post even when it is already absent', async () => {
    expect(await (await invoke({ bookmarked: false })).json()).toMatchObject({ bookmarked: false });
    expect(mocks.bookmark.deleteMany).toHaveBeenCalledExactlyOnceWith({
      where: { user_id: 'viewer', post_id: 'post' },
    });
  });
  it('keeps the empty POST toggle used by older clients', async () => {
    expect(await (await invoke()).json()).toMatchObject({ bookmarked: true });
    expect(mocks.bookmark.create).toHaveBeenCalledOnce();
    mocks.bookmark.findFirst.mockResolvedValue({ id: 'saved' });
    expect(await (await invoke()).json()).toMatchObject({ bookmarked: false });
    expect(mocks.bookmark.delete).toHaveBeenCalledWith({ where: { id: 'saved' } });
  });
  it('reads fresh state with privacy and audience checks before querying bookmarks', async () => {
    mocks.bookmark.findUnique.mockResolvedValue({ id: 'saved' });
    const response = await GET(new Request('https://stacklyst.test/api/posts/post/bookmark'), {
      params: Promise.resolve({ id: 'post' }),
    });
    expect(await response.json()).toEqual({ bookmarked: true });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.block).toHaveBeenCalledWith('viewer', 'author');
    expect(mocks.access).toHaveBeenCalledWith(expect.objectContaining({ id: 'post' }), 'viewer');
  });
  it('rejects invalid requested state without writing', async () => {
    expect((await invoke({ bookmarked: 'yes' })).status).toBe(400);
    expect(mocks.bookmark.upsert).not.toHaveBeenCalled();
  });
});
