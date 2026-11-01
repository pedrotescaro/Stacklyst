import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/mobile/push', () => ({ sendMobilePush: vi.fn().mockResolvedValue(undefined) }));
import {
  getEvaluatorNotificationPresentation,
  notifyDuelReviewers,
  notifyEvaluatorApplication,
} from '../notifications';

describe('evaluator notification routing', () => {
  it('routes human review to matching active evaluators and admins, excluding players', async () => {
    const db = {
      user: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'admin', role: 'ADMIN', evaluator_profile: null },
          { id: 'ts', role: 'EVALUATOR', evaluator_profile: { tech_stack: ['TypeScript'] } },
          { id: 'python', role: 'EVALUATOR', evaluator_profile: { tech_stack: ['Python'] } },
          { id: 'player', role: 'ADMIN', evaluator_profile: null },
        ]),
      },
      notification: { createManyAndReturn: vi.fn().mockResolvedValue([]) },
    };
    await notifyDuelReviewers(db as any, {
      id: 'duel',
      language: 'TS',
      challenger_id: 'player',
      opponent_id: 'other',
    });
    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { role: 'ADMIN' },
            {
              role: 'EVALUATOR',
              evaluator_profile: { is: { status: { in: ['ACTIVE', 'PROBATION'] } } },
            },
          ],
        },
      })
    );
    expect(db.notification.createManyAndReturn).toHaveBeenCalledWith({
      data: ['admin', 'ts'].map((id) => ({
        id: `duel-review:duel:${id}`,
        userId: id,
        type: 'DUEL_REQUEST',
        resourceId: 'duel',
        resourceType: 'DUEL_REVIEW',
        actorId: null,
      })),
      skipDuplicates: true,
      select: { id: true, userId: true },
    });
  });

  it('creates stable administrative notices so recovery can be retried', async () => {
    const db = {
      user: { findMany: vi.fn().mockResolvedValue([{ id: 'admin' }]) },
      notification: { createManyAndReturn: vi.fn().mockResolvedValue([]) },
    };
    await notifyEvaluatorApplication(db as any, { id: 'application' });
    expect(db.user.findMany).toHaveBeenCalledWith({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    expect(db.notification.createManyAndReturn).toHaveBeenCalledWith({
      data: [
        {
          id: 'evaluator-application:application:admin',
          userId: 'admin',
          type: 'EVALUATION_COMPLETED',
          resourceId: 'application',
          resourceType: 'EVALUATOR_APPLICATION',
          actorId: null,
        },
      ],
      skipDuplicates: true,
      select: { id: true, userId: true },
    });
  });

  it.each([
    [
      { type: 'EVALUATION_COMPLETED', resourceType: 'EVALUATOR_APPLICATION' },
      '/admin?tab=evaluators',
      'Nova candidatura a avaliador',
    ],
    [
      { type: 'DUEL_REQUEST', resourceType: 'DUEL_REVIEW', resourceId: 'a/b' },
      '/evaluations?duel=a%2Fb',
      'Duelo aguardando sua avaliação',
    ],
    [
      { type: 'EVALUATOR_APPROVED', resourceType: 'EVALUATOR' },
      '/evaluators/apply',
      'Candidatura a avaliador aprovada',
    ],
    [
      { type: 'EVALUATOR_REJECTED', resourceType: 'EVALUATOR' },
      '/evaluators/apply',
      'Candidatura a avaliador analisada',
    ],
    [
      { type: 'EVALUATION_COMPLETED', resourceType: 'DUEL', resourceId: 'duel' },
      '/duels/duel',
      'Avaliação do duelo concluída',
    ],
  ])('provides an actionable destination for %j', (notification, link, title) => {
    expect(getEvaluatorNotificationPresentation(notification as any)).toEqual(
      expect.objectContaining({ link, title })
    );
  });

  it('leaves ordinary duel invitations and unrelated notices unchanged', () => {
    expect(
      getEvaluatorNotificationPresentation({ type: 'DUEL_REQUEST', resourceType: 'DUEL' })
    ).toBeNull();
    expect(getEvaluatorNotificationPresentation({ type: 'LIKE', resourceType: 'POST' })).toBeNull();
  });
});
