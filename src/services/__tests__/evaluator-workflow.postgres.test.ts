// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import type { Prisma, PrismaClient } from '@prisma/client';

const context = vi.hoisted(() => ({ db: null as any }));
vi.mock('@/lib/mobile/push', () => ({ sendMobilePush: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/prisma', () => ({
  prisma: new Proxy({}, { get: (_target, key) => context.db?.[key] }),
}));
import { EvaluatorService } from '../evaluator.service';

let client: PrismaClient | undefined;
afterAll(async () => {
  await client?.$disconnect();
});

describe.skipIf(process.env.STACKLYST_EVALUATOR_POSTGRES !== '1')(
  'evaluator workflow on PostgreSQL with unconditional rollback',
  () => {
    it('delivers applications, pending reviews and results exactly once only to eligible synthetic recipients', async () => {
      const dotenv = await import('dotenv');
      dotenv.config({ path: '.env.local', quiet: true });
      const connectionString =
        process.env.STACKLYST_TEST_DATABASE_URL ||
        process.env.DATABASE_URL ||
        process.env.DIRECT_URL;
      if (!connectionString)
        throw new Error('Configure PostgreSQL for rollback-only evaluator checks.');
      const dns = await import('node:dns');
      dns.setDefaultResultOrder('ipv4first');
      const { PrismaClient } = await import('@prisma/client');
      const { PrismaPg } = await import('@prisma/adapter-pg');
      client = new PrismaClient({
        adapter: new PrismaPg({
          connectionString,
          max: 1,
          connectionTimeoutMillis: 10000,
          ssl: { rejectUnauthorized: false },
        }),
      });
      const ids = {
        admin: randomUUID(),
        applicant: randomUUID(),
        python: randomUUID(),
        suspended: randomUUID(),
        first: randomUUID(),
        second: randomUUID(),
      };
      const userIds = Object.values(ids);
      const duelId = randomUUID();
      let applicationId: string | undefined;
      const rollback = new Error('ROLLBACK_EVALUATOR_WORKFLOW_FIXTURES');

      await expect(
        client.$transaction(
          async (tx) => {
            await tx.user.createMany({
              data: userIds.map((id) => ({
                id,
                username: `eval-qa-${id}`,
                email: `eval-qa-${id}@example.invalid`,
                role:
                  id === ids.admin
                    ? ('ADMIN' as const)
                    : [ids.python, ids.suspended].includes(id)
                      ? ('EVALUATOR' as const)
                      : ('USER' as const),
                total_xp: id === ids.applicant ? 2000 : 0,
              })),
            });
            await tx.evaluatorProfile.createMany({
              data: [
                { user_id: ids.python, tech_stack: ['Python'], status: 'ACTIVE' },
                { user_id: ids.suspended, tech_stack: ['TypeScript'], status: 'SUSPENDED' },
              ],
            });
            await tx.duel.create({
              data: {
                id: duelId,
                challenger_id: ids.first,
                opponent_id: ids.second,
                language: 'TS',
                status: 'REVIEW_PENDING',
                problem_title: 'Rollback-only synthetic evaluator check',
                problem_body: 'Two tied synthetic solutions.',
              },
            });
            await tx.duelSolution.createMany({
              data: [ids.first, ids.second].map((id) => ({
                duel_id: duelId,
                user_id: id,
                code: 'const answer = 42;',
                score: 950,
              })),
            });

            // Every discovery query is restricted to synthetic fixtures, even while exercising the
            // actual service and notification functions. No real account can receive a test notice.
            const scoped = new Proxy(tx, {
              get: (target, key) => {
                if (key === '$transaction')
                  return (run: (db: Prisma.TransactionClient) => Promise<unknown>) => run(scoped);
                const model = target[key as keyof typeof target] as any;
                if (['user', 'evaluatorApplication', 'duel'].includes(String(key))) {
                  return new Proxy(model, {
                    get: (delegate, method) => {
                      if (method === 'findMany')
                        return (args: any = {}) =>
                          delegate.findMany({
                            ...args,
                            where: {
                              AND: [
                                args.where ?? {},
                                key === 'user'
                                  ? { id: { in: userIds } }
                                  : key === 'evaluatorApplication'
                                    ? { user_id: { in: userIds } }
                                    : { id: duelId },
                              ],
                            },
                          });
                      const value = delegate[method];
                      return typeof value === 'function' ? value.bind(delegate) : value;
                    },
                  });
                }
                return typeof model === 'function' ? model.bind(target) : model;
              },
            });
            context.db = scoped;

            const motivation =
              'Quero ajudar a comunidade com revisões técnicas claras, cuidadosas e fundamentadas em critérios objetivos.';
            const application = await EvaluatorService.applyForEvaluator(
              ids.applicant,
              motivation,
              ['TypeScript']
            );
            applicationId = application.id;
            await expect(
              EvaluatorService.applyForEvaluator(ids.applicant, motivation, ['TypeScript'])
            ).rejects.toMatchObject({ code: 'EVALUATOR_APPLICATION_PENDING' });
            expect(
              await tx.notification.count({
                where: {
                  resourceId: application.id,
                  resourceType: 'EVALUATOR_APPLICATION',
                  userId: ids.admin,
                },
              })
            ).toBe(1);

            await EvaluatorService.reviewApplication(
              application.id,
              ids.admin,
              'APPROVED',
              'Requisitos e motivação técnica conferidos de forma objetiva.'
            );
            expect((await tx.user.findUniqueOrThrow({ where: { id: ids.applicant } })).role).toBe(
              'EVALUATOR'
            );
            expect(
              await tx.notification.count({
                where: { userId: ids.applicant, resourceType: 'DUEL_REVIEW', resourceId: duelId },
              })
            ).toBe(1);
            await EvaluatorService.recoverPendingNotifications();
            expect(await EvaluatorService.recoverPendingNotifications()).toEqual({
              applicationNotifications: 0,
              reviewNotifications: 0,
            });
            const queueNotices = await tx.notification.findMany({
              where: { resourceType: 'DUEL_REVIEW', resourceId: duelId },
              select: { userId: true },
            });
            expect(queueNotices.map((notice) => notice.userId).sort()).toEqual(
              [ids.admin, ids.applicant].sort()
            );

            await EvaluatorService.submitDuelEvaluation({
              duelId,
              evaluatorId: ids.applicant,
              scorePlayer1: 950,
              scorePlayer2: 940,
              winnerId: ids.first,
              humanFeedback: 'A primeira solução trata os casos de borda com maior clareza.',
              strengths: ['Clareza'],
              improvements: ['Documentação'],
            });
            const duel = await tx.duel.findUniqueOrThrow({ where: { id: duelId } });
            expect(duel.status).toBe('CLOSED');
            expect(duel.winner_id).toBe(ids.first);
            expect(
              (await tx.evaluatorProfile.findUniqueOrThrow({ where: { user_id: ids.applicant } }))
                .evaluations_count
            ).toBe(1);
            expect(
              (await tx.user.findUniqueOrThrow({ where: { id: ids.applicant } })).total_xp
            ).toBe(2010);
            expect((await tx.user.findUniqueOrThrow({ where: { id: ids.first } })).total_xp).toBe(
              50
            );
            expect(
              await tx.notification.count({
                where: {
                  resourceType: 'DUEL',
                  resourceId: duelId,
                  userId: { in: [ids.first, ids.second] },
                  type: 'EVALUATION_COMPLETED',
                },
              })
            ).toBe(2);
            expect(await EvaluatorService.recoverPendingNotifications()).toEqual({
              applicationNotifications: 0,
              reviewNotifications: 0,
            });
            throw rollback;
          },
          { timeout: 90000 }
        )
      ).rejects.toBe(rollback);

      expect(await client.user.count({ where: { id: { in: userIds } } })).toBe(0);
      expect(
        await client.notification.count({ where: { resourceId: { in: [duelId, applicationId!] } } })
      ).toBe(0);
      expect(await client.securityAuditEvent.count({ where: { resource_id: applicationId } })).toBe(
        0
      );
      context.db = null;
    }, 100000);
  }
);
