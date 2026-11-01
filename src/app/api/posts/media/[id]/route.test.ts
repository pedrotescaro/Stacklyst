// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ viewer: vi.fn(), find: vi.fn(), download: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.viewer }));
vi.mock('@/lib/prisma', () => ({ prisma: { postMedia: { findFirst: mocks.find } } }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => ({ storage: { from: () => ({ download: mocks.download }) } }),
}));
import { GET } from './route';

describe('protected post media', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.viewer.mockResolvedValue({ id: 'viewer' });
    mocks.find.mockResolvedValue({
      storage_path: 'owner/private.webm',
      content_type: 'audio/webm',
    });
    mocks.download.mockResolvedValue({ data: new Blob(['0123456789']), error: null });
  });
  const context = { params: Promise.resolve({ id: 'opaque-media-id' }) };
  it('does not download files when the viewer cannot access the owning post', async () => {
    mocks.find.mockResolvedValue(null);
    expect((await GET(new Request('http://localhost/media'), context)).status).toBe(404);
    expect(mocks.download).not.toHaveBeenCalled();
  });
  it('proxies private bytes without reusable public or signed URLs', async () => {
    const response = await GET(new Request('http://localhost/media'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.has('location')).toBe(false);
    expect(await response.text()).toBe('0123456789');
    expect(mocks.find.mock.calls[0][0].where.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          post: expect.objectContaining({
            OR: expect.arrayContaining([{ audience: 'everyone' }, { author_id: 'viewer' }]),
          }),
        }),
      ])
    );
  });
  it('supports range requests for mobile audio seeking', async () => {
    const response = await GET(
      new Request('http://localhost/media', { headers: { range: 'bytes=2-5' } }),
      context
    );
    expect(response.status).toBe(206);
    expect(response.headers.get('content-range')).toBe('bytes 2-5/10');
    expect(await response.text()).toBe('2345');
  });
  it('supports suffix ranges and rejects out-of-bounds ranges', async () => {
    const suffix = await GET(
      new Request('http://localhost/media', { headers: { range: 'bytes=-3' } }),
      context
    );
    expect(await suffix.text()).toBe('789');
    expect(
      (
        await GET(
          new Request('http://localhost/media', { headers: { range: 'bytes=12-20' } }),
          context
        )
      ).status
    ).toBe(416);
  });
});
