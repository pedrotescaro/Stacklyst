import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReactionService } from '../reaction.service';
import { awardXPInTransaction } from '@/lib/xp';
const mocks = vi.hoisted(() => ({
  tx: {
    $executeRaw: vi.fn(),
    post: { findUnique: vi.fn() },
    reaction: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), update: vi.fn() },
    user: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    languageTrail: { findUnique: vi.fn(), update: vi.fn() },
    notification: { create: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({
  prisma: { $transaction: (fn: (tx: unknown) => unknown) => fn(mocks.tx) },
}));
vi.mock('@/lib/xp', () => ({ awardXPInTransaction: vi.fn() }));
describe('reaction reward consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tx.post.findUnique.mockResolvedValue({ id: 'p', author_id: 'author', language: 'TS' });
    mocks.tx.reaction.findUnique.mockResolvedValue({ type: 'FIRE' });
    mocks.tx.user.findUniqueOrThrow.mockResolvedValue({ total_xp: 501 });
    mocks.tx.languageTrail.findUnique.mockResolvedValue({ id: 'trail', xp: 501 });
  });
  it('allows removal and reverses XP and level without negative awards', async () => {
    expect(await ReactionService.toggleReaction('u', 'p', null)).toBeNull();
    expect(mocks.tx.user.update).toHaveBeenCalledWith({
      where: { id: 'u' },
      data: { total_xp: { decrement: 2 } },
    });
    expect(mocks.tx.languageTrail.update).toHaveBeenCalledWith({
      where: { id: 'trail' },
      data: { xp: 499, level: 1 },
    });
    expect(awardXPInTransaction).not.toHaveBeenCalled();
    expect(mocks.tx.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.tx.reaction.findUnique.mock.invocationCallOrder[0]
    );
  });
  it('never makes legacy balances negative', async () => {
    mocks.tx.user.findUniqueOrThrow.mockResolvedValue({ total_xp: 0 });
    mocks.tx.languageTrail.findUnique.mockResolvedValue({ id: 'trail', xp: 1 });
    await ReactionService.toggleReaction('u', 'p', null);
    expect(mocks.tx.user.update).toHaveBeenCalledWith({
      where: { id: 'u' },
      data: { total_xp: { decrement: 0 } },
    });
    expect(mocks.tx.languageTrail.update).toHaveBeenCalledWith({
      where: { id: 'trail' },
      data: { xp: 0, level: 1 },
    });
  });
  it('awards inside the same transaction on creation', async () => {
    mocks.tx.reaction.findUnique.mockResolvedValue(null);
    mocks.tx.reaction.create.mockResolvedValue({ type: 'HEART' });
    expect(await ReactionService.toggleReaction('u', 'p', 'HEART')).toBe('HEART');
    expect(awardXPInTransaction).toHaveBeenCalledExactlyOnceWith(mocks.tx, 'u', 'TS', 2);
  });
  it('does not reward a repeated reaction', async () => {
    expect(await ReactionService.toggleReaction('u', 'p', 'FIRE')).toBe('FIRE');
    expect(awardXPInTransaction).not.toHaveBeenCalled();
    expect(mocks.tx.reaction.create).not.toHaveBeenCalled();
  });
});
