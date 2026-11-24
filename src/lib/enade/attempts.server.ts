import 'server-only';
import { Prisma, type EnadeAttempt } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
import { enadeSessionSchema } from './simulator-schema';
import {
  ENADE_YEARS,
  QUESTION_BY_ID,
  sessionFromLegacy,
  WORKSPACE_KEY,
  type EnadeConfig,
  type EnadeSession,
} from './simulator';
import {
  attemptCounters,
  attemptTitle,
  buildSession,
  revealedAnswers,
  restartAttempt,
  sameStructure,
} from './attempts';
import { scheduleReview, type ReviewSchedule } from './srs';
import { dayKey } from './stats';
import type { EnadeAttempt as LegacyAttempt } from './types';

export type CreateAttemptInput =
  | { kind: 'STANDARD'; year: number }
  | { kind: 'CUSTOM'; config: EnadeConfig }
  | {
      kind: 'WRONG_ONLY' | 'REVIEW' | 'TOPIC' | 'PRACTICE';
      questionIds: string[];
      mode: EnadeConfig['mode'];
      topic?: string | null;
      topicTitle?: string | null;
    };

const MAX_PRACTICE_DELTA_MS = 6 * 60 * 60 * 1000;
const CLOCK_TOLERANCE_MS = 5 * 60 * 1000;

function seed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

export function attemptDto(row: EnadeAttempt) {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    title: row.title,
    version: row.version,
    session: row.state as unknown as EnadeSession,
  };
}
export type AttemptDto = ReturnType<typeof attemptDto>;

export async function createAttempt(
  userId: string,
  input: CreateAttemptInput,
  options: { parentId?: string; replay?: EnadeSession; resume?: boolean; now?: number } = {}
) {
  const now = options.now ?? Date.now();
  let session: EnadeSession;
  try {
    session = options.replay
      ? restartAttempt(options.replay, now, seed())
      : buildSession(input, seed(), now);
  } catch (error) {
    throw new ValidationError(
      'VALIDATION_ERROR',
      (error as Error).message || 'Configuração inválida.'
    );
  }
  const parsed = enadeSessionSchema.safeParse(session);
  if (!parsed.success)
    throw new ValidationError('VALIDATION_ERROR', 'Não foi possível montar este simulado.');
  const topic = 'topic' in input ? (input.topic ?? null) : null;
  const title = attemptTitle(input.kind, session, 'topicTitle' in input ? input.topicTitle : null);
  const create = (db: Tx | typeof prisma) =>
    db.enadeAttempt.create({
      data: {
        user_id: userId,
        kind: input.kind,
        mode: session.config.mode,
        title,
        source_year: session.sourceYear ?? null,
        topic,
        parent_id: options.parentId ?? null,
        state: parsed.data as unknown as Prisma.InputJsonValue,
        question_count: session.questionIds.length,
        started_at: new Date(session.startedAt),
        ...attemptCounters(session),
      },
    });
  if (!options.resume) return { row: await create(prisma), created: true };
  return prisma.$transaction(async (tx) => {
    await lockEnadeUser(tx, userId);
    const running = await tx.enadeAttempt.findFirst({
      where: {
        user_id: userId,
        status: 'IN_PROGRESS',
        kind: input.kind,
        mode: session.config.mode,
        ...(input.kind === 'STANDARD'
          ? { source_year: input.year }
          : { state: { path: ['questionIds'], equals: session.questionIds } }),
      },
      orderBy: { updated_at: 'desc' },
    });
    return running ? { row: running, created: false } : { row: await create(tx), created: true };
  });
}

export async function getOwnedAttempt(userId: string, id: string) {
  const row = await prisma.enadeAttempt.findFirst({ where: { id, user_id: userId } });
  if (!row) throw new NotFoundError('NOT_FOUND', 'Simulado não encontrado.');
  return row;
}

type Tx = Prisma.TransactionClient;

export async function lockEnadeUser(tx: Tx, userId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`enade:${userId}`}))`;
}

async function addDaily(
  tx: Tx,
  userId: string,
  at: Date,
  delta: Partial<{
    reading_ms: number;
    practice_ms: number;
    questions_answered: number;
    questions_correct: number;
    articles_studied: number;
  }>
) {
  const values = Object.fromEntries(Object.entries(delta).filter(([, v]) => v && v > 0));
  if (!Object.keys(values).length) return;
  const day = new Date(`${dayKey(at)}T00:00:00Z`);
  await tx.enadeDailyActivity.upsert({
    where: { user_id_day: { user_id: userId, day } },
    create: { user_id: userId, day, ...values },
    update: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { increment: v }])),
  });
}
export { addDaily as addDailyActivity };

function toSchedule(item: {
  status: 'OPEN' | 'RECOVERED';
  wrong_count: number;
  correct_count: number;
  streak: number;
  ease: number;
  interval_days: number;
  due_at: Date;
  recovered_at: Date | null;
}): ReviewSchedule {
  return {
    status: item.status,
    wrongCount: item.wrong_count,
    correctCount: item.correct_count,
    streak: item.streak,
    ease: item.ease,
    intervalDays: item.interval_days,
    dueAt: item.due_at,
    recoveredAt: item.recovered_at,
  };
}

/**
 * Persists newly revealed answers once (idempotent per attempt and question),
 * then updates the error notebook and the daily history from those rows only.
 */
async function recordAnswers(
  tx: Tx,
  userId: string,
  attemptId: string,
  session: EnadeSession,
  at: Date
) {
  const revealed = revealedAnswers(session);
  if (!revealed.length) return { answered: 0, correct: 0 };
  const existing = await tx.enadeAnswer.findMany({
    where: { attempt_id: attemptId, question_id: { in: revealed.map((a) => a.questionId) } },
    select: { question_id: true },
  });
  const known = new Set(existing.map((a) => a.question_id));
  const fresh = revealed.filter((a) => !known.has(a.questionId));
  if (!fresh.length) return { answered: 0, correct: 0 };
  await tx.enadeAnswer.createMany({
    data: fresh.map((a) => ({
      attempt_id: attemptId,
      user_id: userId,
      question_id: a.questionId,
      year: a.year,
      section: a.section,
      topic: a.topic,
      selected: a.selected,
      correct: a.correct,
      answered_at: at,
    })),
  });
  // Only answered objective questions feed the notebook; a blank is not a misconception.
  const graded = fresh.filter((a) => a.correct !== null && a.selected !== null);
  const items = await tx.enadeReviewItem.findMany({
    where: { user_id: userId, question_id: { in: graded.map((a) => a.questionId) } },
  });
  const byQuestion = new Map(items.map((item) => [item.question_id, item]));
  const updates = graded.flatMap((answer) => {
    const previous = byQuestion.get(answer.questionId);
    const next = scheduleReview(previous ? toSchedule(previous) : null, !!answer.correct, at);
    if (!next) return [];
    return [
      {
        question_id: answer.questionId,
        topic: answer.topic,
        status: next.status,
        wrong_count: next.wrongCount,
        correct_count: next.correctCount,
        streak: next.streak,
        ease: next.ease,
        interval_days: next.intervalDays,
        due_at: next.dueAt,
        recovered_at: next.recoveredAt,
        last_selected: answer.selected,
        last_attempt_id: attemptId,
        last_reviewed_at: previous ? at : null,
        first_wrong_at: previous?.first_wrong_at ?? at,
        last_wrong_at: !answer.correct ? at : (previous?.last_wrong_at ?? at),
      },
    ];
  });
  if (updates.length)
    await tx.$executeRaw`
    INSERT INTO enade_review_items (
      user_id, question_id, topic, status, wrong_count, correct_count, streak, ease, interval_days,
      due_at, recovered_at, last_selected, last_attempt_id, last_reviewed_at,
      first_wrong_at, last_wrong_at, updated_at
    )
    SELECT ${userId}, item.*, ${at}
    FROM jsonb_to_recordset(${JSON.stringify(updates)}::jsonb) AS item (
      question_id text, topic text, status "EnadeReviewStatus", wrong_count integer, correct_count integer,
      streak integer, ease double precision, interval_days integer, due_at timestamp,
      recovered_at timestamp, last_selected text, last_attempt_id text, last_reviewed_at timestamp,
      first_wrong_at timestamp, last_wrong_at timestamp
    )
    ON CONFLICT (user_id, question_id) DO UPDATE SET
      topic = EXCLUDED.topic, status = EXCLUDED.status, wrong_count = EXCLUDED.wrong_count,
      correct_count = EXCLUDED.correct_count, streak = EXCLUDED.streak, ease = EXCLUDED.ease,
      interval_days = EXCLUDED.interval_days, due_at = EXCLUDED.due_at, recovered_at = EXCLUDED.recovered_at,
      last_selected = EXCLUDED.last_selected, last_attempt_id = EXCLUDED.last_attempt_id,
      last_reviewed_at = EXCLUDED.last_reviewed_at, last_wrong_at = EXCLUDED.last_wrong_at,
      updated_at = EXCLUDED.updated_at
  `;
  return {
    answered: fresh.filter((a) => a.selected !== null).length,
    correct: fresh.filter((a) => a.correct).length,
  };
}

/** Saves an autosave snapshot. Older snapshots never overwrite newer ones. */
export async function saveAttempt(userId: string, id: string, body: unknown) {
  const parsed = enadeSessionSchema.safeParse(body);
  if (!parsed.success)
    throw new ValidationError('VALIDATION_ERROR', 'Progresso do simulado inválido.');
  const next = parsed.data as EnadeSession;
  const now = Date.now();
  if (next.updatedAt > now + CLOCK_TOLERANCE_MS)
    throw new ValidationError(
      'VALIDATION_ERROR',
      'Confira o relógio do dispositivo e tente novamente.'
    );

  return prisma.$transaction(async (tx) => {
    await lockEnadeUser(tx, userId);
    const row = await tx.enadeAttempt.findFirst({ where: { id, user_id: userId } });
    if (!row) throw new NotFoundError('NOT_FOUND', 'Simulado não encontrado.');
    const stored = row.state as unknown as EnadeSession;
    if (!sameStructure(stored, next))
      throw new ValidationError(
        'VALIDATION_ERROR',
        'O progresso enviado pertence a outro simulado.'
      );
    if (row.status !== 'IN_PROGRESS' || next.updatedAt <= stored.updatedAt)
      return { row, stale: next.updatedAt < stored.updatedAt || row.status !== 'IN_PROGRESS' };
    if (!keepsCheckedAnswers(stored, next))
      throw new AppError(
        'DRAFT_CONFLICT',
        'Outra aba já conferiu uma resposta. Recarregue o simulado para continuar.',
        409
      );
    if (next.elapsedMs < stored.elapsedMs || next.elapsedMs > next.updatedAt - next.startedAt)
      throw new ValidationError(
        'VALIDATION_ERROR',
        'O tempo enviado para este simulado é inválido.'
      );
    const fresh = await persistSnapshot(tx, userId, row, next, new Date(now));
    return { row: fresh, stale: false };
  });
}

function keepsCheckedAnswers(stored: EnadeSession, next: EnadeSession) {
  return stored.checked.every(
    (id) =>
      next.checked.includes(id) &&
      (QUESTION_BY_ID.get(id)?.kind !== 'objective' || stored.answers[id] === next.answers[id])
  );
}

async function persistSnapshot(
  tx: Tx,
  userId: string,
  row: EnadeAttempt,
  next: EnadeSession,
  at: Date
) {
  const id = row.id;
  const counters = attemptCounters(next);
  const updated = await tx.enadeAttempt.updateMany({
    where: { id, user_id: userId, version: row.version },
    data: {
      state: next as unknown as Prisma.InputJsonValue,
      status: next.finishedAt ? 'FINISHED' : 'IN_PROGRESS',
      finished_at: next.finishedAt ? new Date(next.finishedAt) : null,
      version: { increment: 1 },
      ...counters,
    },
  });
  if (!updated.count)
    throw new AppError(
      'DRAFT_CONFLICT',
      'Outra aba salvou este simulado. Recarregue para continuar.',
      409
    );
  const recorded = await recordAnswers(tx, userId, id, next, at);
  await addDaily(tx, userId, at, {
    practice_ms: Math.min(MAX_PRACTICE_DELTA_MS, Math.max(0, counters.elapsed_ms - row.elapsed_ms)),
    questions_answered: recorded.answered,
    questions_correct: recorded.correct,
  });
  return tx.enadeAttempt.findUniqueOrThrow({ where: { id } });
}

export async function abandonAttempt(userId: string, id: string) {
  const result = await prisma.enadeAttempt.updateMany({
    where: { id, user_id: userId, status: 'IN_PROGRESS' },
    data: { status: 'ABANDONED', version: { increment: 1 } },
  });
  if (!result.count) throw new NotFoundError('NOT_FOUND', 'Simulado em andamento não encontrado.');
}

const LEGACY_MARKER = 'enade-history-imported-v1';

export function isLegacyEnadeKey(key: string) {
  return key === WORKSPACE_KEY || ENADE_YEARS.some((year) => key === `enade-ads-${year}`);
}

function legacySession(key: string, value: unknown) {
  if (!isLegacyEnadeKey(key)) return null;
  try {
    const kind = key === WORKSPACE_KEY ? 'CUSTOM' : 'STANDARD';
    const source = kind === 'STANDARD' ? value : (value as { session?: unknown })?.session;
    let parsed = enadeSessionSchema.safeParse(source);
    const year = kind === 'STANDARD' ? Number(key.replace('enade-ads-', '')) : undefined;
    if (!parsed.success && year !== undefined) {
      const saved = source as LegacyAttempt;
      parsed = enadeSessionSchema.safeParse(sessionFromLegacy(year, saved, saved.updatedAt));
    }
    if (!parsed.success || parsed.data.sourceYear !== year) return null;
    const session = parsed.data as EnadeSession;
    if (session.updatedAt > Date.now() + CLOCK_TOLERANCE_MS) return null;
    if (
      !session.finishedAt &&
      !Object.keys(session.answers).length &&
      !session.marked.length &&
      !session.elapsedMs &&
      session.currentIndex === 0
    )
      return null;
    if (year !== undefined) {
      const expected = buildSession({ kind: 'STANDARD', year }, session.seed, session.startedAt);
      // Original standard drafts borrowed the stable structure of the official edition.
      if (!sameStructure({ ...expected, id: session.id }, session)) return null;
    }
    return { session, kind, clientRef: `legacy:${key}:${session.id}` } as const;
  } catch {
    // Damaged legacy data stays in the source slot.
    return null;
  }
}

async function persistLegacy(
  tx: Tx,
  userId: string,
  legacy: NonNullable<ReturnType<typeof legacySession>>
) {
  const { session, kind, clientRef } = legacy;
  const at = new Date(session.finishedAt ?? session.updatedAt);
  const existing = await tx.enadeAttempt.findUnique({
    where: { user_id_client_ref: { user_id: userId, client_ref: clientRef } },
  });
  if (existing) {
    const previous = existing.state as unknown as EnadeSession;
    if (
      existing.status !== 'IN_PROGRESS' ||
      session.updatedAt <= previous.updatedAt ||
      !sameStructure(previous, session) ||
      !keepsCheckedAnswers(previous, session)
    )
      return false;
    await persistSnapshot(tx, userId, existing, session, at);
    return true;
  }
  const created = await tx.enadeAttempt.create({
    data: {
      user_id: userId,
      kind,
      mode: session.config.mode,
      status: session.finishedAt ? 'FINISHED' : 'IN_PROGRESS',
      title: attemptTitle(kind, session),
      source_year: session.sourceYear ?? null,
      client_ref: clientRef,
      state: session as unknown as Prisma.InputJsonValue,
      question_count: session.questionIds.length,
      started_at: new Date(session.startedAt),
      finished_at: session.finishedAt ? new Date(session.finishedAt) : null,
      ...attemptCounters(session),
    },
  });
  const recorded = await recordAnswers(tx, userId, created.id, session, at);
  await addDaily(tx, userId, at, {
    practice_ms: Math.min(MAX_PRACTICE_DELTA_MS, created.elapsed_ms),
    questions_answered: recorded.answered,
    questions_correct: recorded.correct,
  });
  return true;
}

export async function importBrowserProgress(userId: string, key: string, value: unknown) {
  const legacy = legacySession(key, value);
  if (!legacy) return false;
  await importLegacyProgress(userId);
  return prisma.$transaction(async (tx) => {
    await lockEnadeUser(tx, userId);
    return persistLegacy(tx, userId, legacy);
  });
}

/**
 * One-time import of progress saved before the history existed (one slot per
 * edition plus the custom workspace in MobileState). Original rows stay intact.
 */
export async function importLegacyProgress(userId: string) {
  const marker = await prisma.mobileState.findUnique({
    where: { user_id_key: { user_id: userId, key: LEGACY_MARKER } },
    select: { key: true },
  });
  if (marker) return;
  const rows = await prisma.mobileState.findMany({
    where: {
      user_id: userId,
      key: { in: [...ENADE_YEARS.map((year) => `enade-ads-${year}`), WORKSPACE_KEY] },
    },
  });
  const legacy = rows
    .flatMap((row) => {
      const result = legacySession(row.key, row.value);
      return result ? [result] : [];
    })
    .sort((a, b) => a.session.updatedAt - b.session.updatedAt);

  await prisma.$transaction(async (tx) => {
    await lockEnadeUser(tx, userId);
    const imported = await tx.mobileState.findUnique({
      where: { user_id_key: { user_id: userId, key: LEGACY_MARKER } },
      select: { key: true },
    });
    if (imported) return;
    for (const entry of legacy) await persistLegacy(tx, userId, entry);
    await tx.mobileState.upsert({
      where: { user_id_key: { user_id: userId, key: LEGACY_MARKER } },
      create: { user_id: userId, key: LEGACY_MARKER, value: { importedAt: Date.now() } },
      update: {},
    });
  });
}
