import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { learningTransaction } from '@/lib/learning/transaction';
import { buildCredentialCatalog, credentialGoalProgress, firstLessonGoal } from './catalog';
import {
  credentialSnapshotSchema,
  type CredentialCollection,
  type CredentialRecord,
  type CredentialSnapshot,
} from './types';
import { createCredentialHash, verifyCredentialIntegrity } from './integrity';

const recordSelect = {
  id: true,
  definitionId: true,
  definitionVersion: true,
  snapshot: true,
  integrityHash: true,
  issuedAt: true,
  verifiedAt: true,
  revokedAt: true,
} as const;
type StoredRecord = Prisma.LearningCredentialGetPayload<{ select: typeof recordSelect }>;

function publicRecord(row: StoredRecord): CredentialRecord | null {
  const parsed = credentialSnapshotSchema.safeParse(row.snapshot);
  if (!parsed.success) return null;
  const snapshot = parsed.data;
  if (
    snapshot.id !== row.id ||
    snapshot.definition.id !== row.definitionId ||
    snapshot.definition.version !== row.definitionVersion ||
    snapshot.issuedAt !== row.issuedAt.toISOString() ||
    snapshot.verifiedAt !== row.verifiedAt.toISOString()
  )
    return null;
  const record: CredentialRecord = {
    ...snapshot,
    integrityHash: row.integrityHash,
    status: row.revokedAt ? 'revoked' : 'valid',
  };
  return verifyCredentialIntegrity(record) ? record : null;
}

/** The caller holds learning:<userId>'s transaction lock when granting credentials. */
export async function reconcileCredentialsInTransaction(
  tx: Prisma.TransactionClient,
  userId: string
): Promise<CredentialCollection> {
  const [user, correctAttempts, submissions, exercises, paths, earned] = await Promise.all([
    tx.user.findUnique({ where: { id: userId }, select: { username: true, avatar_config: true } }),
    tx.quizAttempt.findMany({
      where: { user_id: userId, is_correct: true },
      select: { quiz_id: true },
    }),
    tx.exerciseSubmission.findMany({
      where: { user_id: userId, status: 'PASSED' },
      select: {
        exercise_id: true,
        total_public: true,
        passed_public: true,
        total_hidden: true,
        passed_hidden: true,
      },
    }),
    tx.exercise.findMany({
      where: { is_published: true },
      select: {
        id: true,
        title: true,
        language: true,
        knowledge_node_id: true,
        estimated_minutes: true,
        _count: { select: { test_cases: true } },
      },
    }),
    tx.learningPath.findMany({
      where: { is_published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        nodes: {
          orderBy: { position: 'asc' },
          select: {
            knowledge_node: {
              select: { id: true, title: true, language: true, is_published: true },
            },
          },
        },
      },
    }),
    tx.learningCredential.findMany({
      where: { userId },
      select: recordSelect,
      orderBy: { issuedAt: 'desc' },
    }),
  ]);
  if (!user) throw new NotFoundError('USER_NOT_FOUND', 'Usuário não encontrado.');
  const completedSteps = new Set(correctAttempts.map((attempt) => attempt.quiz_id));
  const currentTestCounts = new Map(
    exercises.map((exercise) => [exercise.id, exercise._count.test_cases])
  );
  const passedExercises = new Set(
    submissions
      .filter(
        (submission) =>
          submission.total_public + submission.total_hidden > 0 &&
          submission.total_public + submission.total_hidden ===
            currentTestCounts.get(submission.exercise_id) &&
          submission.passed_public === submission.total_public &&
          submission.passed_hidden === submission.total_hidden
      )
      .map((submission) => submission.exercise_id)
  );
  const catalog = buildCredentialCatalog({
    completedStepIds: completedSteps,
    exercises: exercises.map((exercise) => ({
      ...exercise,
      testCount: exercise._count.test_cases,
    })),
    paths: paths
      .filter(
        (path) =>
          path.nodes.length > 0 && path.nodes.every((node) => node.knowledge_node.is_published)
      )
      .map((path) => ({ ...path, nodes: path.nodes.map((node) => node.knowledge_node) })),
  });
  const goals = [firstLessonGoal(catalog.lessons, completedSteps), ...catalog.goals];
  const existing = new Map(
    earned.map((row) => [`${row.definitionId}:${row.definitionVersion}`, row])
  );
  const now = new Date();
  const issuedAt = now.toISOString();
  const config =
    user.avatar_config &&
    typeof user.avatar_config === 'object' &&
    !Array.isArray(user.avatar_config)
      ? (user.avatar_config as Record<string, Prisma.JsonValue>)
      : {};
  const displayName = [config.displayName, config.name].find(
    (value) => typeof value === 'string' && value.trim()
  );
  const recipientName = (
    typeof displayName === 'string' ? displayName.trim() : user.username
  ).slice(0, 100);
  const additions: Prisma.LearningCredentialCreateManyInput[] = [];
  for (const target of goals) {
    const key = `${target.definition.id}:${target.definition.version}`;
    if (
      existing.has(key) ||
      !credentialGoalProgress(target, completedSteps, passedExercises).eligible
    )
      continue;
    const snapshot: CredentialSnapshot = {
      id: randomUUID(),
      definition: target.definition,
      recipientName,
      recipientUsername: user.username,
      issuedAt,
      verifiedAt: issuedAt,
    };
    // Only this public projection is snapshotted. No answers, code, user ID or email.
    credentialSnapshotSchema.parse(snapshot);
    additions.push({
      id: snapshot.id,
      userId,
      definitionId: target.definition.id,
      definitionVersion: target.definition.version,
      snapshot: snapshot as unknown as Prisma.InputJsonValue,
      integrityHash: createCredentialHash(snapshot),
      issuedAt: now,
      verifiedAt: now,
    });
  }
  if (additions.length)
    await tx.learningCredential.createMany({ data: additions, skipDuplicates: true });
  const rows = additions.length
    ? await tx.learningCredential.findMany({
        where: { userId },
        select: recordSelect,
        orderBy: { issuedAt: 'desc' },
      })
    : earned;
  const records = new Map(
    rows.map((row) => [`${row.definitionId}:${row.definitionVersion}`, publicRecord(row)])
  );
  const items: CredentialCollection['items'] = goals.map((target) => {
    const progress = credentialGoalProgress(target, completedSteps, passedExercises);
    const credential = records.get(`${target.definition.id}:${target.definition.version}`) ?? null;
    return {
      definition: credential?.definition ?? target.definition,
      completed:
        credential?.status === 'valid'
          ? credential.definition.requirements.length
          : progress.completed,
      total: credential
        ? credential.definition.requirements.length
        : target.definition.kind === 'first_lesson'
          ? 1
          : progress.total,
      credential,
    };
  });
  const known = new Set(items.map((item) => `${item.definition.id}:${item.definition.version}`));
  // Previously earned snapshots stay reviewable after a curriculum revision.
  for (const credential of records.values()) {
    if (credential && !known.has(`${credential.definition.id}:${credential.definition.version}`))
      items.push({
        definition: credential.definition,
        completed: credential.definition.requirements.length,
        total: credential.definition.requirements.length,
        credential,
      });
  }
  return { items, earnedCount: items.filter((item) => item.credential?.status === 'valid').length };
}

export async function reconcileCredentials(userId: string): Promise<CredentialCollection> {
  return learningTransaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`learning:${userId}`}))`;
    return reconcileCredentialsInTransaction(tx, userId);
  });
}
export const getCredentialCollection = reconcileCredentials;

/** Public profile reads never grant certificates or modify progress. */
export async function getEarnedCredentials(userId: string): Promise<CredentialRecord[]> {
  const rows = await prisma.learningCredential.findMany({
    where: { userId, revokedAt: null },
    select: recordSelect,
    orderBy: { issuedAt: 'desc' },
  });
  return rows
    .map(publicRecord)
    .filter((record): record is CredentialRecord => record?.status === 'valid');
}

export async function getPublicCredential(id: string): Promise<CredentialRecord | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const row = await prisma.learningCredential.findUnique({ where: { id }, select: recordSelect });
  if (!row) return null;
  const record = publicRecord(row);
  if (!record) return null;
  return record;
}
