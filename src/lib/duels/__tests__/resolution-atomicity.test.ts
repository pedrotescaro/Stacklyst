// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  claim: vi.fn(),
  solution: vi.fn(),
  evaluation: vi.fn(),
  userUpdate: vi.fn(),
  xp: vi.fn(),
}));
vi.mock('@/lib/xp', () => ({ awardXPInTransaction: mocks.xp }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    duel: { findUnique: mocks.findUnique },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        duel: { updateMany: mocks.claim },
        duelSolution: { upsert: mocks.solution },
        duelEvaluation: { create: mocks.evaluation },
        user: { update: mocks.userUpdate },
      }),
  },
}));
import { resolveDuelAtDeadline } from '../resolution';

describe('duel resolution atomicity', () => {
  const submission = (user: string, score: number, status = 'ACCEPTED') => ({
    id: user,
    user_id: user,
    code: '',
    score,
    status,
    runtime_ms: 10,
    complexity: 'O(n)',
    created_at: new Date(),
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.claim.mockResolvedValue({ count: 1 });
  });

  it('records an outage as no contest without XP, cooldowns or abandonment mutations', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'duel',
      status: 'ACTIVE',
      challenger_id: 'a',
      opponent_id: 'b',
      language: 'TS',
      submissions: [submission('a', 0, 'JUDGE_UNAVAILABLE'), submission('b', 950)],
    });
    await resolveDuelAtDeadline('duel');
    expect(mocks.claim).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          winner_id: null,
          closed_reason: 'judge_unavailable',
          xp_awarded_at: null,
        }),
      })
    );
    expect(mocks.xp).not.toHaveBeenCalled();
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it('converges 50 simultaneous deadline resolutions to one reward', async () => {
    let claimed = false;
    mocks.claim.mockImplementation(async () => {
      if (claimed) return { count: 0 };
      claimed = true;
      return { count: 1 };
    });
    mocks.findUnique.mockResolvedValue({
      id: 'duel',
      status: 'ACTIVE',
      challenger_id: 'a',
      opponent_id: 'b',
      language: 'TS',
      submissions: [submission('a', 950), submission('b', 700)],
    });
    const results = await Promise.all(
      Array.from({ length: 50 }, () => resolveDuelAtDeadline('duel'))
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(mocks.xp).toHaveBeenCalledExactlyOnceWith(expect.anything(), 'a', 'TS', 50);
    expect(mocks.evaluation).toHaveBeenCalledTimes(1);
  });
});
