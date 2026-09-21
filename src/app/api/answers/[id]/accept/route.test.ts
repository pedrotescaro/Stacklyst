import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { awardXPInTransaction } from '@/lib/xp';
const mocks = vi.hoisted(() => ({
  tx: { answer: { updateMany: vi.fn(), findUniqueOrThrow: vi.fn() } },
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn(async () => ({ id: 'owner' })) }));
vi.mock('@/lib/prisma', () => ({ prisma: { answer: { findUnique: vi.fn() } } }));
vi.mock('@/lib/xp', () => ({ awardXPInTransaction: vi.fn() }));
vi.mock('@/lib/learning/transaction', () => ({
  learningTransaction: (work: (tx: unknown) => unknown) => work(mocks.tx),
}));
describe('answer acceptance reward', () => {
  const send = () =>
    POST(new Request('https://stacklyst.test/api/answers/a/accept', { method: 'POST' }), {
      params: Promise.resolve({ id: 'a' }),
    });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      id: 'a',
      author_id: 'author',
      is_accepted: false,
      post: { author_id: 'owner', language: 'TS' },
    } as never);
    mocks.tx.answer.findUniqueOrThrow.mockResolvedValue({ id: 'a', is_accepted: true });
  });
  it('rewards only the request that claims the answer', async () => {
    mocks.tx.answer.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const responses = await Promise.all([send(), send()]);
    expect(responses.map((r) => r.status).sort()).toEqual([200, 400]);
    expect(awardXPInTransaction).toHaveBeenCalledExactlyOnceWith(mocks.tx, 'author', 'TS', 50);
    expect(mocks.tx.answer.updateMany).toHaveBeenCalledWith({
      where: { id: 'a', is_accepted: false, post: { author_id: 'owner' } },
      data: { is_accepted: true },
    });
  });
  it('does not claim or reward another user’s post', async () => {
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      post: { author_id: 'other' },
    } as never);
    expect((await send()).status).toBe(403);
    expect(mocks.tx.answer.updateMany).not.toHaveBeenCalled();
    expect(awardXPInTransaction).not.toHaveBeenCalled();
  });
  it('rejects a previously accepted answer before any write', async () => {
    vi.mocked(prisma.answer.findUnique).mockResolvedValue({
      is_accepted: true,
      post: { author_id: 'owner' },
    } as never);
    expect((await send()).status).toBe(400);
    expect(awardXPInTransaction).not.toHaveBeenCalled();
  });
});
