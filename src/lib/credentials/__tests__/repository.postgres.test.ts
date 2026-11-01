// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it, vi } from 'vitest';
import type { Prisma } from '@prisma/client';
const state = vi.hoisted(() => ({ tx: null as Prisma.TransactionClient | null }));
vi.mock('@/lib/learning/transaction', async () => {
  const actual = await vi.importActual<typeof import('@/lib/learning/transaction')>(
    '@/lib/learning/transaction'
  );
  return {
    ...actual,
    learningTransaction: (work: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
      state.tx ? work(state.tx) : actual.learningTransaction(work),
  };
});
import { prisma } from '@/lib/prisma';
import { LEARNING_LESSONS } from '@/lib/learning/catalog';
import { saveLessonAssessment } from '@/lib/learning/lesson-progress';
import { recordExerciseSubmission } from '@/lib/exercises/repository';
import { reconcileCredentialsInTransaction } from '../repository';
import { verifyCredentialIntegrity } from '../integrity';

describe.skipIf(process.env.CREDENTIAL_DB_TEST !== '1')(
  'credential issuance through real Prisma with rollback',
  () => {
    afterAll(async () => {
      await prisma.$disconnect();
    });
    it('grants only after a whole real lesson, remains idempotent on review, keeps the snapshot and respects revocation', async () => {
      const rollback = new Error('CREDENTIAL_TEST_ROLLBACK');
      const id = randomUUID();
      const lesson = LEARNING_LESSONS.get('learn-js-first-output')!;
      try {
        await prisma.$transaction(
          async (tx) => {
            state.tx = tx;
            await tx.user.create({
              data: {
                id,
                username: `cert_${id}`,
                email: `${id}@example.invalid`,
                avatar_config: { displayName: 'Nome do certificado' },
              },
            });
            expect((await reconcileCredentialsInTransaction(tx, id)).earnedCount).toBe(0);
            const required = lesson.steps.filter((step) => step.type !== 'concept_explanation');
            await saveLessonAssessment(id, lesson, required[0], false, 1);
            expect(await tx.learningCredential.count({ where: { userId: id } })).toBe(0);
            await saveLessonAssessment(id, lesson, required[0], true, 0);
            expect(await tx.learningCredential.count({ where: { userId: id } })).toBe(0);
            await saveLessonAssessment(id, lesson, required[1], true, 0);
            const records = await tx.learningCredential.findMany({
              where: { userId: id },
              orderBy: { definitionId: 'asc' },
            });
            expect(records).toHaveLength(2);
            const certificate = records.find((row) => row.definitionId === 'first-lesson')!;
            const snapshot =
              certificate.snapshot as unknown as import('../types').CredentialSnapshot;
            expect(snapshot.recipientName).toBe('Nome do certificado');
            expect(snapshot).not.toHaveProperty('completedAt');
            expect(
              verifyCredentialIntegrity({
                ...snapshot,
                integrityHash: certificate.integrityHash,
                status: 'valid',
              })
            ).toBe(true);
            const xp = (
              await tx.user.findUniqueOrThrow({ where: { id }, select: { total_xp: true } })
            ).total_xp;
            await Promise.all([
              reconcileCredentialsInTransaction(tx, id),
              reconcileCredentialsInTransaction(tx, id),
            ]);
            await saveLessonAssessment(id, lesson, required[1], true, 0);
            await tx.user.update({
              where: { id },
              data: { avatar_config: { displayName: 'Nome alterado' } },
            });
            await reconcileCredentialsInTransaction(tx, id);
            expect(await tx.learningCredential.count({ where: { userId: id } })).toBe(2);
            expect(
              (await tx.learningCredential.findUniqueOrThrow({ where: { id: certificate.id } }))
                .snapshot
            ).toEqual(snapshot);
            expect(
              (await tx.user.findUniqueOrThrow({ where: { id }, select: { total_xp: true } }))
                .total_xp
            ).toBe(xp);
            await tx.learningCredential.update({
              where: { id: certificate.id },
              data: { revokedAt: new Date(), revocationReason: 'QA rollback' },
            });
            const revoked = await reconcileCredentialsInTransaction(tx, id);
            expect(revoked.earnedCount).toBe(1);
            expect(
              revoked.items.find((item) => item.definition.id === 'first-lesson')!.credential
                ?.status
            ).toBe('revoked');
            expect(await tx.learningCredential.count({ where: { userId: id } })).toBe(2);
            throw rollback;
          },
          { maxWait: 10000, timeout: 90000 }
        );
      } catch (error) {
        if (error !== rollback) throw error;
      } finally {
        state.tx = null;
      }
      expect(await prisma.user.count({ where: { id } })).toBe(0);
      expect(await prisma.learningCredential.count({ where: { userId: id } })).toBe(0);
    }, 110000);
    it('issues practice credentials only from a nonempty complete exercise assessment through the submission hook', async () => {
      const rollback = new Error('CREDENTIAL_PRACTICE_TEST_ROLLBACK');
      const userId = randomUUID();
      try {
        await prisma.$transaction(
          async (tx) => {
            state.tx = tx;
            await tx.user.create({
              data: { id: userId, username: `cert_${userId}`, email: `${userId}@example.invalid` },
            });
            const exercise = await tx.exercise.findFirstOrThrow({
              where: { is_published: true },
              select: {
                id: true,
                language: true,
                knowledge_node_id: true,
                base_xp: true,
                test_cases: { select: { id: true, is_hidden: true } },
              },
            });
            const assessment = {
              ok: true,
              passed: true,
              passedTests: exercise.test_cases.length,
              totalTests: exercise.test_cases.length,
              tests: exercise.test_cases.map((test) => ({
                id: test.id,
                label: 'QA only',
                hidden: test.is_hidden,
                passed: true,
              })),
              consoleOutput: '',
              executionMs: 1,
            };
            const empty = await recordExerciseSubmission({
              exercise,
              userId,
              code: '// QA rollback',
              assistanceMode: 'STANDARD',
              evaluation: { ...assessment, passedTests: 0, totalTests: 0, tests: [] },
            });
            expect(empty.firstCompletion).toBe(false);
            expect((await reconcileCredentialsInTransaction(tx, userId)).earnedCount).toBe(0);
            const passed = await recordExerciseSubmission({
              exercise,
              userId,
              code: '// QA rollback',
              assistanceMode: 'STANDARD',
              evaluation: assessment,
            });
            expect(passed.firstCompletion).toBe(true);
            expect(
              await tx.learningCredential.count({
                where: { userId, definitionId: `practice:exercise:${exercise.id}` },
              })
            ).toBe(1);
            const review = await recordExerciseSubmission({
              exercise,
              userId,
              code: '// QA rollback',
              assistanceMode: 'STANDARD',
              evaluation: assessment,
            });
            expect(review.firstCompletion).toBe(false);
            expect(review.xpEarned).toBe(0);
            expect(
              await tx.learningCredential.count({ where: { userId, definitionId: 'first-lesson' } })
            ).toBe(0);
            expect(
              await tx.learningCredential.count({
                where: { userId, definitionId: `practice:exercise:${exercise.id}` },
              })
            ).toBe(1);
            throw rollback;
          },
          { maxWait: 10000, timeout: 90000 }
        );
      } catch (error) {
        if (error !== rollback) throw error;
      } finally {
        state.tx = null;
      }
      expect(await prisma.user.count({ where: { id: userId } })).toBe(0);
      expect(await prisma.learningCredential.count({ where: { userId } })).toBe(0);
    }, 110000);
  }
);
