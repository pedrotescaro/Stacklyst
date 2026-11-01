// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  profile: vi.fn(),
  list: vi.fn(),
  target: vi.fn(),
  submit: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.auth, requireEvaluator: mocks.auth }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    evaluatorProfile: { findUnique: mocks.profile },
    duel: { findMany: mocks.list, findFirst: mocks.target },
  },
}));
vi.mock('@/services/evaluator.service', () => ({
  EvaluatorService: { submitDuelEvaluation: mocks.submit },
}));
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
import { GET, POST } from './route';

const context = { params: Promise.resolve({}) };
describe('human evaluation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ id: 'reviewer', role: 'EVALUATOR' });
    mocks.profile.mockResolvedValue({ status: 'ACTIVE', tech_stack: ['TypeScript'] });
    mocks.list.mockResolvedValue([{ id: 'new-duel' }]);
    mocks.target.mockResolvedValue({ id: 'old-duel' });
  });

  it('includes a notified older duel while applying all queue authorization rules', async () => {
    const response = await GET(
      new Request('http://localhost/api/evaluations?duel=old-duel'),
      context
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([{ id: 'old-duel' }, { id: 'new-duel' }]);
    expect(mocks.target).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              status: 'REVIEW_PENDING',
              challenger_id: { not: 'reviewer' },
              opponent_id: { not: 'reviewer' },
              solutions: { some: {} },
              language: { in: ['TS'] },
            },
            { id: 'old-duel' },
          ],
        },
      })
    );
  });

  it('does not reveal an unauthorized or already closed target', async () => {
    mocks.target.mockResolvedValue(null);
    const response = await GET(
      new Request('http://localhost/api/evaluations?duel=private-duel'),
      context
    );
    await expect(response.json()).resolves.toEqual([{ id: 'new-duel' }]);
  });

  it('rejects suspended evaluators before listing any code', async () => {
    mocks.profile.mockResolvedValue({ status: 'SUSPENDED', tech_stack: ['TypeScript'] });
    const response = await GET(new Request('http://localhost/api/evaluations'), context);
    expect(response.status).toBe(403);
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it('allows an administrator without an evaluator profile', async () => {
    mocks.auth.mockResolvedValue({ id: 'admin', role: 'ADMIN' });
    mocks.profile.mockResolvedValue(null);
    const response = await GET(new Request('http://localhost/api/evaluations'), context);
    expect(response.status).toBe(200);
    expect(mocks.list).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ language: undefined }) })
    );
  });

  it.each([900.5, -1, 1001])('rejects invalid score %s with HTTP 400', async (score) => {
    const response = await POST(
      new Request('http://localhost/api/evaluations', {
        method: 'POST',
        body: JSON.stringify({
          duel_id: 'duel',
          score_player1: score,
          score_player2: 800,
          winner_id: 'first',
          human_feedback: 'Feedback técnico claro.',
        }),
      }),
      context
    );
    expect(response.status).toBe(400);
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('uses the authenticated evaluator and trims feedback before saving', async () => {
    mocks.submit.mockResolvedValue({ id: 'evaluation' });
    const response = await POST(
      new Request('http://localhost/api/evaluations', {
        method: 'POST',
        body: JSON.stringify({
          evaluator_id: 'someone-else',
          duel_id: 'duel',
          score_player1: 900,
          score_player2: 800,
          winner_id: 'first',
          human_feedback: '  Feedback técnico claro.  ',
        }),
      }),
      context
    );
    expect(response.status).toBe(200);
    expect(mocks.submit).toHaveBeenCalledWith({
      duelId: 'duel',
      evaluatorId: 'reviewer',
      scorePlayer1: 900,
      scorePlayer2: 800,
      winnerId: 'first',
      humanFeedback: 'Feedback técnico claro.',
      strengths: [],
      improvements: [],
    });
  });

  it('preserves HTTP 403 for evaluator authorization errors', async () => {
    mocks.auth.mockRejectedValue(new ForbiddenError());
    const response = await GET(new Request('http://localhost/api/evaluations'), context);
    expect(response.status).toBe(403);
    expect(mocks.profile).not.toHaveBeenCalled();
  });
});
