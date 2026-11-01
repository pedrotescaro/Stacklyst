// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEARNING_LESSONS } from '@/lib/learning/catalog';

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  attempts: vi.fn(),
  submissions: vi.fn(),
  exercises: vi.fn(),
  paths: vi.fn(),
  records: vi.fn(),
  record: vi.fn(),
  grants: vi.fn(),
  transaction: vi.fn(),
  lock: vi.fn(),
}));
const db = {
  user: { findUnique: mocks.user },
  quizAttempt: { findMany: mocks.attempts },
  exerciseSubmission: { findMany: mocks.submissions },
  exercise: { findMany: mocks.exercises },
  learningPath: { findMany: mocks.paths },
  learningCredential: {
    findMany: mocks.records,
    findUnique: mocks.record,
    createMany: mocks.grants,
  },
  $executeRaw: mocks.lock,
};
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: mocks.user },
    quizAttempt: { findMany: mocks.attempts },
    exerciseSubmission: { findMany: mocks.submissions },
    exercise: { findMany: mocks.exercises },
    learningPath: { findMany: mocks.paths },
    learningCredential: {
      findMany: mocks.records,
      findUnique: mocks.record,
      createMany: mocks.grants,
    },
    $executeRaw: mocks.lock,
    $transaction: mocks.transaction,
  },
}));
import { getCredentialCollection, getEarnedCredentials, getPublicCredential } from '../repository';
import { verifyCredentialIntegrity } from '../integrity';

let rows: Array<Record<string, any>>;
beforeEach(() => {
  vi.clearAllMocks();
  rows = [];
  mocks.user.mockResolvedValue({
    username: 'learner',
    avatar_config: { displayName: 'Nome Exibido' },
  });
  mocks.attempts.mockResolvedValue([]);
  mocks.submissions.mockResolvedValue([]);
  mocks.exercises.mockResolvedValue([]);
  mocks.paths.mockResolvedValue([]);
  mocks.records.mockImplementation(async () => rows);
  mocks.record.mockImplementation(
    async ({ where }) => rows.find((row) => row.id === where.id) ?? null
  );
  mocks.grants.mockImplementation(async ({ data }) => {
    rows.push(...data.map((row: Record<string, any>) => ({ ...row, revokedAt: null })));
    return { count: data.length };
  });
  mocks.transaction.mockImplementation(async (work) => work(db));
});

describe('persisted learning credentials', () => {
  const lesson = LEARNING_LESSONS.get('learn-js-first-output')!;
  const required = lesson.steps.filter((step) => step.type !== 'concept_explanation');
  const completeLesson = () =>
    mocks.attempts.mockResolvedValue(required.map((step) => ({ quiz_id: step.id })));

  it('does not grant for opening a page, concepts only, or a partially completed lesson', async () => {
    expect((await getCredentialCollection('owner')).earnedCount).toBe(0);
    mocks.attempts.mockResolvedValue([
      { quiz_id: lesson.steps[0].id },
      { quiz_id: required[0].id },
    ]);
    expect((await getCredentialCollection('owner')).earnedCount).toBe(0);
    expect(mocks.grants).not.toHaveBeenCalled();
  });
  it('grants verified milestones once and keeps names, dates and requirements immutable on later profile edits', async () => {
    completeLesson();
    const first = await getCredentialCollection('owner');
    expect(first.earnedCount).toBe(2);
    const certificate = first.items.find(
      (item) => item.definition.kind === 'first_lesson'
    )!.credential!;
    expect(certificate.recipientName).toBe('Nome Exibido');
    expect(certificate.definition.requirements).toHaveLength(1);
    expect(verifyCredentialIntegrity(certificate)).toBe(true);
    mocks.user.mockResolvedValue({
      username: 'renamed',
      avatar_config: { displayName: 'Novo nome' },
    });
    const second = await getCredentialCollection('owner');
    expect(
      second.items.find((item) => item.definition.kind === 'first_lesson')!.credential
    ).toEqual(certificate);
    expect(mocks.grants).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(certificate)).not.toContain('owner');
    expect(certificate).not.toHaveProperty('email');
    expect(certificate).not.toHaveProperty('completedAt');
  });
  it('does not use a stale pass with fewer tests than the current published exercise', async () => {
    mocks.exercises.mockResolvedValue([
      {
        id: 'exercise',
        title: 'Real practice',
        language: 'TS',
        knowledge_node_id: 'node',
        estimated_minutes: 10,
        _count: { test_cases: 2 },
      },
    ]);
    mocks.submissions.mockResolvedValue([
      {
        exercise_id: 'exercise',
        total_public: 1,
        passed_public: 1,
        total_hidden: 0,
        passed_hidden: 0,
      },
    ]);
    expect((await getCredentialCollection('owner')).earnedCount).toBe(0);
    mocks.submissions.mockResolvedValue([
      {
        exercise_id: 'exercise',
        total_public: 1,
        passed_public: 1,
        total_hidden: 1,
        passed_hidden: 1,
      },
    ]);
    const complete = await getCredentialCollection('owner');
    expect(
      complete.items.find((item) => item.definition.id === 'practice:exercise:exercise')!.credential
        ?.status
    ).toBe('valid');
  });
  it('reads public profile grants without reconciling and omits tampered or revoked records', async () => {
    completeLesson();
    await getCredentialCollection('owner');
    mocks.transaction.mockClear();
    mocks.grants.mockClear();
    const valid = await getEarnedCredentials('owner');
    expect(valid).toHaveLength(2);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.grants).not.toHaveBeenCalled();
    rows[0].snapshot.recipientName = 'Tampered';
    rows[1].revokedAt = new Date();
    expect(await getEarnedCredentials('owner')).toEqual([]);
    expect(await getPublicCredential(rows[0].id)).toBeNull();
    expect((await getPublicCredential(rows[1].id))?.status).toBe('revoked');
    expect(await getPublicCredential('not-a-uuid')).toBeNull();
  });
  it('never reissues a revoked grant on another reconciliation', async () => {
    completeLesson();
    await getCredentialCollection('owner');
    const originalId = rows[0].id;
    rows[0].revokedAt = new Date();
    mocks.grants.mockClear();
    const result = await getCredentialCollection('owner');
    expect(
      result.items.some(
        (item) => item.credential?.id === originalId && item.credential?.status === 'revoked'
      )
    ).toBe(true);
    expect(result.earnedCount).toBe(1);
    expect(mocks.grants).not.toHaveBeenCalled();
  });
});
