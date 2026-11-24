import {
  createSession,
  ENADE_YEARS,
  gradeSession,
  QUESTION_BY_ID,
  SECTION_LABELS,
  standardConfig,
  type EnadeConfig,
  type EnadeSession,
} from './simulator';
import { primaryTopic } from './topics';
import type { AttemptKind } from './stats';

/** Pure attempt rules shared by the API, the server pages and tests. */

export const KIND_LABELS: Record<AttemptKind, string> = {
  STANDARD: 'Prova oficial completa',
  CUSTOM: 'Simulado personalizado',
  WRONG_ONLY: 'Refação das erradas',
  REVIEW: 'Revisão espaçada',
  TOPIC: 'Prática por assunto',
  PRACTICE: 'Questão avulsa',
};

/** A focused set of questions (review, topic practice, a single question). */
export function focusedConfig(
  questionIds: string[],
  mode: EnadeConfig['mode'],
  durationMinutes: number | null = null
): EnadeConfig {
  const questions = questionIds.map((id) => QUESTION_BY_ID.get(id));
  if (!questions.length || questions.some((q) => !q || q.annulled))
    throw new Error('Questões indisponíveis.');
  const years = [...new Set(questions.map((q) => q!.year))].sort();
  return {
    version: 1,
    years,
    section: 'all',
    questionCount: questions.length,
    order: 'sequential',
    durationMinutes,
    mode,
    includeDiscursive: questions.some((q) => q!.kind === 'discursive'),
  };
}

export function attemptTitle(kind: AttemptKind, session: EnadeSession, topicTitle?: string | null) {
  if (kind === 'STANDARD' && session.sourceYear) return `Enade ${session.sourceYear}`;
  if (kind === 'TOPIC' && topicTitle) return `Prática · ${topicTitle}`;
  if (kind === 'PRACTICE') {
    const q = QUESTION_BY_ID.get(session.questionIds[0]);
    return q ? `Enade ${q.year} · Questão ${q.number}` : KIND_LABELS.PRACTICE;
  }
  if (kind === 'CUSTOM') {
    const section = session.config.section ?? 'all';
    return `${KIND_LABELS.CUSTOM}${section === 'all' ? '' : ` · ${SECTION_LABELS[section]}`}`;
  }
  return KIND_LABELS[kind];
}

export function buildSession(
  input:
    | { kind: 'STANDARD'; year: number }
    | { kind: 'CUSTOM'; config: EnadeConfig }
    | {
        kind: 'WRONG_ONLY' | 'REVIEW' | 'TOPIC' | 'PRACTICE';
        questionIds: string[];
        mode: EnadeConfig['mode'];
      },
  seed: number,
  now: number
): EnadeSession {
  if (input.kind === 'STANDARD') {
    if (!ENADE_YEARS.includes(input.year)) throw new Error('Edição inválida.');
    return createSession(standardConfig(input.year), seed, now, undefined, input.year);
  }
  if (input.kind === 'CUSTOM') return createSession(input.config, seed, now);
  const ids = [...new Set(input.questionIds)];
  const config = focusedConfig(ids, input.mode);
  // Review order is shuffled so the learner recalls the concept, not the position.
  return createSession(
    { ...config, order: input.kind === 'PRACTICE' ? 'sequential' : 'random' },
    seed,
    now,
    ids
  );
}

export type RevealedAnswer = {
  questionId: string;
  year: number;
  section: string;
  topic: string | null;
  selected: string | null;
  correct: boolean | null;
};

/**
 * Answers that are final and visible to the learner: everything once the attempt
 * is finished, or each question checked in training mode. Annulled questions are
 * never graded. Discursive answers are recorded without automatic correction.
 */
export function revealedAnswers(session: EnadeSession): RevealedAnswer[] {
  const ids = session.finishedAt
    ? session.questionIds
    : session.config.mode === 'training'
      ? session.questionIds.filter((id) => session.checked.includes(id))
      : [];
  return ids.flatMap((id) => {
    const q = QUESTION_BY_ID.get(id);
    if (!q || q.annulled) return [];
    const raw = session.answers[id]?.trim() || null;
    const objective = q.kind === 'objective' && !!q.answer;
    if (!objective && (!session.finishedAt || raw === null)) return [];
    return [
      {
        questionId: id,
        year: q.year,
        section: q.section,
        topic: primaryTopic(id),
        selected: raw,
        correct: objective ? raw === q.answer : null,
      },
    ];
  });
}

export function attemptCounters(session: EnadeSession) {
  const result = gradeSession(session, session.finishedAt ?? session.updatedAt);
  return {
    answered_count: result.answered,
    scored_count: result.total,
    correct_count: session.finishedAt ? result.correct : 0,
    wrong_count: session.finishedAt ? result.total - result.correct : 0,
    blank_count: session.finishedAt ? result.unanswered : 0,
    elapsed_ms: Math.min(2_147_483_647, Math.round(result.elapsedMs)),
  };
}

/** Structural fields that cannot change after an attempt is created. */
export function sameStructure(a: EnadeSession, b: EnadeSession) {
  const config = a.config;
  const incoming = b.config;
  return (
    a.id === b.id &&
    a.seed === b.seed &&
    a.sourceYear === b.sourceYear &&
    a.startedAt === b.startedAt &&
    sameOrder(a.questionIds, b.questionIds) &&
    a.questionIds.every((id) => sameOrder(a.optionOrder[id] ?? [], b.optionOrder[id] ?? [])) &&
    sameOrder(config.years, incoming.years) &&
    (config.section ?? 'all') === incoming.section &&
    config.questionCount === incoming.questionCount &&
    config.order === incoming.order &&
    config.durationMinutes === incoming.durationMinutes &&
    config.mode === incoming.mode &&
    config.includeDiscursive === incoming.includeDiscursive
  );
}

function sameOrder<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function restartAttempt(previous: EnadeSession, now: number, seed: number): EnadeSession {
  return {
    ...previous,
    id: `${now}-${seed}`,
    seed,
    answers: {},
    marked: [],
    checked: [],
    currentIndex: 0,
    elapsedMs: 0,
    runningSince: now,
    paused: false,
    startedAt: now,
    finishedAt: null,
    updatedAt: now,
    finishReason: null,
  };
}
