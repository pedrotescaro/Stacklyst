import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  post: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.auth }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: { findFirst: mocks.post },
    report: { upsert: mocks.upsert, update: mocks.update },
  },
}));
import { POST } from './route';
const ctx = { params: Promise.resolve({ id: 'post' }) };
const req = (reason: unknown) =>
  new Request('https://stacklyst.test/api/posts/post/report', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ id: 'viewer' });
  mocks.post.mockResolvedValue({ id: 'post' });
  mocks.upsert.mockResolvedValue({ id: 'report' });
});
it.each([123, null, {}, '', ' '.repeat(10), 'x'.repeat(1001)])(
  'rejects invalid report reason before a database write: %j',
  async (reason) => {
    expect((await POST(req(reason), ctx)).status).toBe(400);
    expect(mocks.upsert).not.toHaveBeenCalled();
  }
);
it('atomically reports the visible post under the authenticated owner', async () => {
  expect((await POST(req('  Spam  '), ctx)).status).toBe(200);
  expect(mocks.upsert).toHaveBeenCalledWith({
    where: { user_id_post_id: { user_id: 'viewer', post_id: 'post' } },
    create: { user_id: 'viewer', post_id: 'post', reason: 'Spam' },
    update: { reason: 'Spam' },
  });
});
it('recovers a duplicate conflict without turning a concurrent report into a 500', async () => {
  mocks.upsert.mockRejectedValueOnce({ code: 'P2002' });
  mocks.update.mockResolvedValue({ id: 'report' });
  expect((await POST(req('Spam'), ctx)).status).toBe(200);
  expect(mocks.update).toHaveBeenCalledOnce();
});
it('requires authentication and hides inaccessible posts', async () => {
  mocks.auth.mockResolvedValueOnce(null);
  expect((await POST(req('Spam'), ctx)).status).toBe(401);
  mocks.post.mockResolvedValue(null);
  expect((await POST(req('Spam'), ctx)).status).toBe(404);
  expect(mocks.upsert).not.toHaveBeenCalled();
});
