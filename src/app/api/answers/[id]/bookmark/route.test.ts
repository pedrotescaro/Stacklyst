// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  answer: { findUnique: vi.fn() },
  answerBookmark: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
  bookmark: { upsert: vi.fn(), deleteMany: vi.fn() },
  user: { id: 'viewer' },
  access: vi.fn(),
  block: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({ prisma: mocks }));
vi.mock('@/lib/auth', () => ({ requireAuth: async () => mocks.user }));
vi.mock('@/services/block.service', () => ({ BlockService: { assertCanInteract: mocks.block } }));
vi.mock('@/services/post-access.service', () => ({ assertPostAudience: mocks.access }));
import { GET, POST } from './route';

const params = { params: Promise.resolve({ id: 'reply-7' }) };
const save = (bookmarked: boolean) =>
  POST(
    new Request('https://stacklyst.test/api/answers/reply-7/bookmark', {
      method: 'POST',
      body: JSON.stringify({ bookmarked }),
    }),
    params
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.answer.findUnique.mockResolvedValue({
    id: 'reply-7',
    author_id: 'replier',
    post: { author_id: 'author', audience: 'everyone' },
  });
  mocks.answerBookmark.findUnique.mockResolvedValue(null);
});

describe('reply bookmarks', () => {
  it('saves only the chosen reply, never the thread’s original post', async () => {
    expect(await (await save(true)).json()).toMatchObject({ bookmarked: true });
    expect(mocks.answerBookmark.upsert).toHaveBeenCalledWith({
      where: { user_id_answer_id: { user_id: 'viewer', answer_id: 'reply-7' } },
      create: { user_id: 'viewer', answer_id: 'reply-7' },
      update: {},
    });
    expect(mocks.bookmark.upsert).not.toHaveBeenCalled();
  });

  it('removes only this reply', async () => {
    expect(await (await save(false)).json()).toMatchObject({ bookmarked: false });
    expect(mocks.answerBookmark.deleteMany).toHaveBeenCalledWith({
      where: { user_id: 'viewer', answer_id: 'reply-7' },
    });
    expect(mocks.bookmark.deleteMany).not.toHaveBeenCalled();
  });

  it('reads the saved state and checks blocks and audience first', async () => {
    mocks.answerBookmark.findUnique.mockResolvedValue({ id: 'b' });
    expect(await (await GET(new Request('https://stacklyst.test'), params)).json()).toEqual({
      bookmarked: true,
    });
    expect(mocks.block).toHaveBeenCalledWith('viewer', 'replier');
    expect(mocks.block).toHaveBeenCalledWith('viewer', 'author');
    expect(mocks.access).toHaveBeenCalledWith(
      { author_id: 'author', audience: 'everyone' },
      'viewer'
    );
  });

  it('returns 404 for a missing reply', async () => {
    mocks.answer.findUnique.mockResolvedValue(null);
    expect((await save(true)).status).toBe(404);
  });
});
