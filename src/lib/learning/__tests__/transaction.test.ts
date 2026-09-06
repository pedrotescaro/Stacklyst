// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { $transaction: mocks.transaction } }));
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn() } }));
import { learningTransaction, LEARNING_TRANSACTION_OPTIONS } from '../transaction';

describe('learning transaction failures', () => {
  beforeEach(() => vi.clearAllMocks());
  it('uses a bounded database transaction and returns the confirmed result', async () => {
    const work = vi.fn();
    mocks.transaction.mockResolvedValue({ xpEarned: 10 });
    await expect(learningTransaction(work)).resolves.toEqual({ xpEarned: 10 });
    expect(mocks.transaction).toHaveBeenCalledWith(work, LEARNING_TRANSACTION_OPTIONS);
  });
  it.each(['P2028', 'P2034', 'P2024'])(
    'maps %s to a retryable response without blind retry',
    async (code) => {
      mocks.transaction.mockRejectedValue({ code });
      await expect(learningTransaction(vi.fn())).rejects.toMatchObject({
        code: 'PROGRESS_SAVE_UNAVAILABLE',
        statusCode: 503,
      });
      expect(mocks.transaction).toHaveBeenCalledTimes(1);
    }
  );
  it('does not hide unrelated programming errors', async () => {
    const error = new Error('unexpected');
    mocks.transaction.mockRejectedValue(error);
    await expect(learningTransaction(vi.fn())).rejects.toBe(error);
  });
});
