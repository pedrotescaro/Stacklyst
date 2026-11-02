// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  claim: vi.fn(),
  solution: vi.fn(),
  evaluation: vi.fn(),
  userUpdate: vi.fn(),
  reviewers: vi.fn(),
  notification: vi.fn(),
  xp: vi.fn(),
  push: vi.fn(),
}));
vi.mock('@/lib/mobile/push', () => ({ sendMobilePush: mocks.push }));
vi.mock('@/lib/xp', () => ({ awardXPInTransaction: mocks.xp }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    duel: { findUnique: mocks.findUnique },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        duel: { updateMany: mocks.claim },
        duelSolution: { upsert: mocks.solution },
        duelEvaluation: { create: mocks.evaluation },
        user: { update: mocks.userUpdate, findMany: mocks.reviewers },
        notification: { createManyAndReturn: mocks.notification },
      }),
  },
}));
import { resolveDuelAtDeadline, reconcileDuelReview } from '../resolution';

describe('duel resolution atomicity', () => {
  const submission = (user: string, score: number, status = 'ACCEPTED') => ({
    id: user,
    user_id: user,
    code:
      score < 800
        ? 'function solve(a){for(const x of a) for(const y of a) console.log(x,y);}'
        : 'function solve(a){for(const x of a) console.log(x);}',
    score,
    status,
    passed_tests: status === 'ACCEPTED' ? 5 : 0,
    total_tests: 5,
    runtime_ms: 10,
    complexity: 'O(n)',
    created_at: new Date(),
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.claim.mockResolvedValue({ count: 1 });
    mocks.reviewers.mockResolvedValue([
      { id: 'reviewer', role: 'EVALUATOR', evaluator_profile: { tech_stack: ['TypeScript'] } },
    ]);
    mocks.notification.mockResolvedValue([{ id: 'duel-review:duel:reviewer', userId: 'reviewer' }]);
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

  it('converges simultaneous technical ties to one durable review request', async () => {
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
      submissions: [submission('a', 950), submission('b', 950)],
    });
    const results = await Promise.all(
      Array.from({ length: 50 }, () => resolveDuelAtDeadline('duel'))
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(mocks.claim).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REVIEW_PENDING', winner_id: null }),
      })
    );
    expect(mocks.xp).not.toHaveBeenCalled();
    expect(mocks.notification).toHaveBeenCalledExactlyOnceWith({
      data: [
        {
          id: 'duel-review:duel:reviewer',
          userId: 'reviewer',
          type: 'DUEL_REQUEST',
          resourceId: 'duel',
          resourceType: 'DUEL_REVIEW',
          actorId: null,
        },
      ],
      skipDuplicates: true,
      select: { id: true, userId: true },
    });
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith('reviewer', 'duel-review:duel:reviewer');
  });

  it('reconciles an old unnecessary review to an automatic result exactly once', async () => {
    let claimed = false;
    mocks.claim.mockImplementation(async () =>
      claimed ? { count: 0 } : ((claimed = true), { count: 1 })
    );
    mocks.findUnique.mockResolvedValue({
      id: 'duel',
      status: 'REVIEW_PENDING',
      closed_reason: 'technical_tie',
      challenger_id: 'a',
      opponent_id: 'b',
      language: 'TS',
      submissions: [submission('a', 950), submission('b', 700)],
    });
    const result = await Promise.all(Array.from({ length: 20 }, () => reconcileDuelReview('duel')));
    expect(result.filter(Boolean)).toHaveLength(1);
    expect(mocks.claim).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'REVIEW_PENDING',
          closed_reason: 'technical_tie',
          evaluations: { none: { type: 'HUMAN_EVALUATED' } },
        }),
        data: expect.objectContaining({ status: 'CLOSED', winner_id: 'a' }),
      })
    );
    expect(mocks.xp).toHaveBeenCalledTimes(1);
    expect(mocks.notification).not.toHaveBeenCalled();
    expect(mocks.evaluation).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          system_analysis: expect.objectContaining({
            policyVersion: 2,
            comparison: expect.objectContaining({ criterion: 'complexity' }),
          }),
        }),
      })
    );
  });
  it('does not revise closed or already human-reviewed results', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'duel',
      status: 'CLOSED',
      closed_reason: 'human_evaluation',
    });
    expect(await reconcileDuelReview('duel')).toBeNull();
    expect(mocks.claim).not.toHaveBeenCalled();
  });
  it('keeps the review durable when the mobile push provider fails', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'duel',
      status: 'ACTIVE',
      challenger_id: 'a',
      opponent_id: 'b',
      language: 'TS',
      submissions: [submission('a', 950), submission('b', 950)],
    });
    mocks.push.mockRejectedValueOnce(new Error('Push unavailable'));
    await expect(resolveDuelAtDeadline('duel')).resolves.not.toBeNull();
    expect(mocks.notification).toHaveBeenCalledTimes(1);
    expect(mocks.evaluation).toHaveBeenCalledTimes(1);
    expect(mocks.xp).not.toHaveBeenCalled();
  });
  it('never pushes a review notification before its database transaction commits', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'duel',
      status: 'ACTIVE',
      challenger_id: 'a',
      opponent_id: 'b',
      language: 'TS',
      submissions: [submission('a', 950), submission('b', 950)],
    });
    mocks.notification.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(resolveDuelAtDeadline('duel')).rejects.toThrow('Database unavailable');
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
