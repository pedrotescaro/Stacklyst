// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  lock: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  requireAuth: mocks.requireAuth,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: (callback: (tx: unknown) => unknown) =>
      callback({
        $executeRaw: mocks.lock,
        post: {
          findUnique: mocks.findUnique,
          updateMany: mocks.updateMany,
          update: mocks.update,
        },
      }),
  },
}));

import { POST } from './route';

function makeRequest(body?: unknown) {
  return new Request('https://stacklyst.test/api/posts/post-2/pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/posts/[id]/pin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ id: 'owner-1', username: 'pedro' });
    mocks.lock.mockResolvedValue(undefined);
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.update.mockResolvedValue({});
  });

  it('returns 404 when the post does not exist and 403 for non-authors', async () => {
    mocks.findUnique.mockResolvedValueOnce(null);
    const missing = await POST(makeRequest({ pinned: true }), {
      params: Promise.resolve({ id: 'missing' }),
    });
    expect(missing.status).toBe(404);

    mocks.findUnique.mockResolvedValueOnce({
      id: 'post-2',
      author_id: 'other-user',
      is_pinned: false,
    });
    const forbidden = await POST(makeRequest({ pinned: true }), {
      params: Promise.resolve({ id: 'post-2' }),
    });
    expect(forbidden.status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('unpins previous author posts under advisory lock when pinning a new main post', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'post-2',
      author_id: 'owner-1',
      is_pinned: false,
    });

    const response = await POST(makeRequest({ pinned: true }), {
      params: Promise.resolve({ id: 'post-2' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true, postId: 'post-2', pinned: true });
    expect(mocks.lock).toHaveBeenCalledOnce();
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { author_id: 'owner-1', is_pinned: true, id: { not: 'post-2' } },
      data: { is_pinned: false },
    });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 'post-2' },
      data: { is_pinned: true },
    });
  });

  it('unpins a pinned post without clearing unrelated posts and validates malformed JSON', async () => {
    const invalid = await POST(makeRequest('{bad-json'), {
      params: Promise.resolve({ id: 'post-2' }),
    });
    expect(invalid.status).toBe(400);

    mocks.findUnique.mockResolvedValue({
      id: 'post-2',
      author_id: 'owner-1',
      is_pinned: true,
    });

    const response = await POST(makeRequest({ pinned: false }), {
      params: Promise.resolve({ id: 'post-2' }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true, postId: 'post-2', pinned: false });
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 'post-2' },
      data: { is_pinned: false },
    });
  });
});
