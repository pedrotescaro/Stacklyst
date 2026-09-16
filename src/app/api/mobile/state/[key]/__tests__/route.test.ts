// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ create: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() }));
vi.mock('@/lib/auth', () => ({
  getAuthUser: async () => ({ id: 'owner' }),
  requireAuth: async () => ({ id: 'owner' }),
}));
vi.mock('@/lib/prisma', () => ({ prisma: { mobileState: mocks } }));
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
import { GET, PUT } from '../route';

const context = { params: Promise.resolve({ key: 'draft:post' }) };
const request = (version: number, value: string) =>
  new Request('https://stacklyst.test/api/mobile/state/draft:post', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version, value }),
  });

describe('mobile state owner scope and optimistic concurrency', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads only the authenticated owner state', async () => {
    mocks.findUnique.mockResolvedValue({ version: 1, value: 'mine' });
    const response = await GET(new Request('https://stacklyst.test'), context);
    expect(response.status).toBe(200);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { user_id_key: { user_id: 'owner', key: 'draft:post' } },
    });
  });

  it('allows one initial create and rejects a racing create without overwriting it', async () => {
    let stored: unknown;
    mocks.create.mockImplementation(async ({ data }) => {
      if (stored) throw Object.assign(new Error('Already exists'), { code: 'P2002' });
      stored = { ...data, version: 1 };
      return stored;
    });
    const responses = await Promise.all([
      PUT(request(0, 'first'), context),
      PUT(request(0, 'second'), context),
    ]);
    expect(responses.map((r) => r.status)).toEqual([200, 409]);
    expect(stored).toMatchObject({ user_id: 'owner', value: 'first', version: 1 });
    expect(await responses[1].json()).toMatchObject({ error: 'DRAFT_CONFLICT' });
  });

  it('atomically accepts one writer for a version and returns conflict to the stale writer', async () => {
    let stored = { version: 4, value: 'old' };
    mocks.updateMany.mockImplementation(async ({ where, data }) => {
      expect(where.user_id).toBe('owner');
      if (where.version !== stored.version) return { count: 0 };
      stored = { version: stored.version + 1, value: data.value };
      return { count: 1 };
    });
    const responses = await Promise.all([
      PUT(request(4, 'new'), context),
      PUT(request(4, 'stale'), context),
    ]);
    expect(responses.map((r) => r.status)).toEqual([200, 409]);
    expect(await responses[0].json()).toEqual({ version: 5, value: 'new' });
    expect(stored).toEqual({ version: 5, value: 'new' });
  });

  it('rejects arbitrary state keys before reading storage', async () => {
    const response = await GET(new Request('https://stacklyst.test'), {
      params: Promise.resolve({ key: 'other-user-state' }),
    });
    expect(response.status).toBe(400);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });
});
