// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  application: { findUnique: vi.fn() },
  duel: { findUnique: vi.fn() },
  transaction: vi.fn(),
  xp: vi.fn(),
  push: vi.fn(),
}));
vi.mock('@/lib/mobile/push', () => ({ sendMobilePush: mocks.push }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: mocks.user,
    evaluatorApplication: mocks.application,
    duel: mocks.duel,
    $transaction: mocks.transaction,
  },
}));
vi.mock('@/lib/xp', () => ({ awardXPInTransaction: mocks.xp }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn() } }));

import { EvaluatorService } from '../evaluator.service';
import { LEARNING_COURSES } from '@/lib/learning/catalog';

const motivation =
  'Quero contribuir com avaliações técnicas claras e ajudar a comunidade a comparar soluções fundamentadas.';
const eligibility = {
  eligible: true,
  isAlreadyEvaluator: false,
  hasPendingApplication: false,
  completedTrails: [],
};

function makeTx() {
  return {
    $queryRaw: vi.fn().mockResolvedValue([{ id: 'applicant' }]),
    user: {
      findUnique: vi.fn().mockResolvedValue({ role: 'USER' }),
      findMany: vi.fn().mockResolvedValue([{ id: 'admin' }]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    evaluatorApplication: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'application' }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'application', status: 'APPROVED' }),
      findMany: vi.fn().mockResolvedValue([{ id: 'application' }]),
    },
    evaluatorProfile: { upsert: vi.fn(), update: vi.fn() },
    duel: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    duelEvaluation: { create: vi.fn().mockResolvedValue({ id: 'evaluation' }) },
    notification: {
      create: vi
        .fn()
        .mockImplementation(async ({ data }) => ({ id: data.id, userId: data.userId })),
      createManyAndReturn: vi
        .fn()
        .mockImplementation(async ({ data }) =>
          data.map(({ id, userId }: { id: string; userId: string }) => ({ id, userId }))
        ),
    },
    securityAuditEvent: { create: vi.fn() },
  };
}

describe('evaluator workflow persistence', () => {
  let tx: ReturnType<typeof makeTx>;
  beforeEach(() => {
    vi.clearAllMocks();
    tx = makeTx();
    mocks.push.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(async (run) => run(tx));
  });
  afterEach(() => vi.restoreAllMocks());

  it('recognizes a completed current learning course even below the XP threshold', async () => {
    const course = LEARNING_COURSES[0];
    mocks.user.findUnique.mockResolvedValue({
      quiz_attempts: course.lessons.flatMap((lesson) =>
        lesson.steps
          .filter((step) => step.type !== 'concept_explanation')
          .map((step) => ({ quiz_id: step.id }))
      ),
      evaluator_applications: [],
      evaluator_profile: null,
      total_xp: 0,
      role: 'USER',
    });
    expect(await EvaluatorService.checkEligibility('applicant')).toEqual(
      expect.objectContaining({
        eligible: true,
        completedTrails: expect.arrayContaining([course.language]),
      })
    );
  });

  it('creates the application and administrator notice in the same transaction', async () => {
    vi.spyOn(EvaluatorService, 'checkEligibility').mockResolvedValue(eligibility as any);
    await EvaluatorService.applyForEvaluator('applicant', motivation, [
      ' TypeScript ',
      'TypeScript',
    ]);
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.evaluatorApplication.create).toHaveBeenCalledWith({
      data: { user_id: 'applicant', motivation, tech_stack: ['TypeScript'], status: 'PENDING' },
    });
    expect(tx.notification.createManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ userId: 'admin', resourceType: 'EVALUATOR_APPLICATION' })],
      })
    );
  });

  it('rejects a concurrent duplicate after taking the account lock', async () => {
    vi.spyOn(EvaluatorService, 'checkEligibility').mockResolvedValue(eligibility as any);
    tx.evaluatorApplication.findFirst.mockResolvedValue({ id: 'another-request' } as any);
    await expect(
      EvaluatorService.applyForEvaluator('applicant', motivation, ['TypeScript'])
    ).rejects.toMatchObject({ code: 'EVALUATOR_APPLICATION_PENDING', statusCode: 400 });
    expect(tx.evaluatorApplication.create).not.toHaveBeenCalled();
    expect(tx.notification.createManyAndReturn).not.toHaveBeenCalled();
  });

  it('propagates delivery persistence failures instead of silently losing administrator notices', async () => {
    vi.spyOn(EvaluatorService, 'checkEligibility').mockResolvedValue(eligibility as any);
    tx.notification.createManyAndReturn.mockRejectedValue(new Error('notification storage failed'));
    await expect(
      EvaluatorService.applyForEvaluator('applicant', motivation, ['TypeScript'])
    ).rejects.toThrow('notification storage failed');
  });

  it.each(['APPROVED', 'REJECTED'] as const)(
    'atomically records %s and notifies the applicant',
    async (decision) => {
      vi.spyOn(EvaluatorService, 'checkEligibility').mockResolvedValue(eligibility as any);
      mocks.application.findUnique.mockResolvedValue({
        id: 'application',
        status: 'PENDING',
        user_id: 'applicant',
        user: { role: 'USER' },
        motivation,
        tech_stack: ['TypeScript'],
      });
      await EvaluatorService.reviewApplication(
        'application',
        'admin',
        decision,
        'Critérios objetivos conferidos com justificativa suficiente.'
      );
      expect(tx.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'evaluator-decision:application',
          userId: 'applicant',
          type: decision === 'APPROVED' ? 'EVALUATOR_APPROVED' : 'EVALUATOR_REJECTED',
          actorId: null,
        }),
        select: { id: true, userId: true },
      });
      expect(tx.securityAuditEvent.create).toHaveBeenCalled();
      if (decision === 'APPROVED') expect(tx.evaluatorProfile.upsert).toHaveBeenCalled();
      else expect(tx.evaluatorProfile.upsert).not.toHaveBeenCalled();
    }
  );

  const review = {
    duelId: 'duel',
    evaluatorId: 'reviewer',
    scorePlayer1: 900,
    scorePlayer2: 890,
    winnerId: 'challenger',
    humanFeedback: 'O primeiro código trata todos os casos de borda.',
    strengths: ['Clareza'],
    improvements: ['Documentar'],
  };
  function setPendingReview() {
    mocks.duel.findUnique.mockResolvedValue({
      id: 'duel',
      status: 'REVIEW_PENDING',
      challenger_id: 'challenger',
      opponent_id: 'opponent',
      language: 'TS',
    });
    mocks.user.findUnique.mockResolvedValue({
      role: 'EVALUATOR',
      evaluator_profile: { status: 'ACTIVE', tech_stack: ['TypeScript'] },
    });
  }

  it('closes the duel, awards XP once and persists delivery to both participants', async () => {
    setPendingReview();
    await EvaluatorService.submitDuelEvaluation(review);
    expect(mocks.xp).toHaveBeenCalledTimes(2);
    expect(tx.evaluatorProfile.update).toHaveBeenCalledWith({
      where: { user_id: 'reviewer' },
      data: { evaluations_count: { increment: 1 } },
    });
    expect(tx.notification.createManyAndReturn).toHaveBeenCalledWith({
      data: ['challenger', 'opponent'].map((id) =>
        expect.objectContaining({
          userId: id,
          type: 'EVALUATION_COMPLETED',
          resourceId: 'duel',
          resourceType: 'DUEL',
          actorId: null,
        })
      ),
      skipDuplicates: true,
      select: { id: true, userId: true },
    });
  });

  it('rejects a simultaneous second review before XP or notification effects', async () => {
    setPendingReview();
    tx.duel.updateMany.mockResolvedValue({ count: 0 });
    await expect(EvaluatorService.submitDuelEvaluation(review)).rejects.toMatchObject({
      code: 'DUEL_ALREADY_EVALUATED',
      statusCode: 400,
    });
    expect(mocks.xp).not.toHaveBeenCalled();
    expect(tx.notification.createManyAndReturn).not.toHaveBeenCalled();
  });

  it('rejects decimal scores before reaching PostgreSQL Int columns', async () => {
    setPendingReview();
    await expect(
      EvaluatorService.submitDuelEvaluation({ ...review, scorePlayer1: 900.5 })
    ).rejects.toMatchObject({ code: 'EVALUATION_INVALID_SCORE', statusCode: 400 });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('sends push only after commit and keeps a successful application when the provider fails', async () => {
    vi.spyOn(EvaluatorService, 'checkEligibility').mockResolvedValue(eligibility as any);
    let committed = false;
    let pushedBeforeCommit = false;
    mocks.transaction.mockImplementation(async (run) => {
      const result = await run(tx);
      committed = true;
      return result;
    });
    mocks.push.mockImplementation(async () => {
      pushedBeforeCommit ||= !committed;
      throw new Error('Push provider unavailable');
    });
    await expect(
      EvaluatorService.applyForEvaluator('applicant', motivation, ['TypeScript'])
    ).resolves.toEqual({ id: 'application' });
    expect(pushedBeforeCommit).toBe(false);
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith(
      'admin',
      'evaluator-application:application:admin'
    );
  });

  it.each([
    ['self review', 'challenger', { role: 'ADMIN' }, 'DUEL_SELF_REVIEW'],
    [
      'suspended',
      'reviewer',
      { role: 'EVALUATOR', evaluator_profile: { status: 'SUSPENDED', tech_stack: ['TypeScript'] } },
      'EVALUATOR_INACTIVE',
    ],
    [
      'wrong specialty',
      'reviewer',
      { role: 'EVALUATOR', evaluator_profile: { status: 'ACTIVE', tech_stack: ['Python'] } },
      'EVALUATOR_SPECIALTY_MISMATCH',
    ],
  ])('forbids %s', async (_label, evaluatorId, user, code) => {
    setPendingReview();
    mocks.user.findUnique.mockResolvedValue(user);
    await expect(
      EvaluatorService.submitDuelEvaluation({ ...review, evaluatorId: evaluatorId as string })
    ).rejects.toMatchObject({ code, statusCode: 403 });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
