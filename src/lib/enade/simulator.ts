import catalog from './exams.json';
import type { EnadeAttempt, EnadeQuestion } from './types';

export type EnadeConfig = {
  version: 1;
  years: number[];
  questionCount: number;
  order: 'sequential' | 'random';
  durationMinutes: number | null;
  mode: 'exam' | 'training';
  includeDiscursive: boolean;
};
export type SessionQuestion = EnadeQuestion & { year: number };
export type EnadeSession = EnadeAttempt & {
  version: 1;
  id: string;
  config: EnadeConfig;
  seed: number;
  questionIds: string[];
  optionOrder: Record<string, string[]>;
  currentIndex: number;
  elapsedMs: number;
  runningSince: number | null;
  paused: boolean;
  checked: string[];
  sourceYear?: number;
  finishReason: 'manual' | 'timeout' | null;
};
export type EnadeWorkspace = {
  version: 1;
  config: EnadeConfig | null;
  session: EnadeSession | null;
  updatedAt: number;
};
export const WORKSPACE_KEY = 'enade-simulator-v1';
export const ENADE_YEARS = catalog.map((e) => e.year);
export const QUESTION_BANK: SessionQuestion[] = catalog.flatMap((exam) =>
  exam.questions.map((question) => ({ ...question, year: exam.year }))
) as SessionQuestion[];
export const QUESTION_BY_ID = new Map(QUESTION_BANK.map((q) => [q.id, q]));
export const EMPTY_WORKSPACE: EnadeWorkspace = {
  version: 1,
  config: null,
  session: null,
  updatedAt: 0,
};
export const DEFAULT_CONFIG: EnadeConfig = {
  version: 1,
  years: [...ENADE_YEARS],
  questionCount: 20,
  order: 'random',
  durationMinutes: 60,
  mode: 'exam',
  includeDiscursive: false,
};

export function availableQuestions(config: Pick<EnadeConfig, 'years' | 'includeDiscursive'>) {
  return QUESTION_BANK.filter(
    (q) =>
      config.years.includes(q.year) &&
      !q.annulled &&
      (config.includeDiscursive || q.kind === 'objective')
  );
}
export function configErrors(config: EnadeConfig) {
  const errors: string[] = [];
  if (!config.years.length || config.years.some((year) => !ENADE_YEARS.includes(year)))
    errors.push('Selecione ao menos uma edição disponível.');
  const total = availableQuestions(config).length;
  if (
    !Number.isInteger(config.questionCount) ||
    config.questionCount < 1 ||
    config.questionCount > total
  )
    errors.push(`Escolha de 1 a ${total} questões.`);
  if (
    config.durationMinutes !== null &&
    (!Number.isFinite(config.durationMinutes) ||
      config.durationMinutes < 1 ||
      config.durationMinutes > 300)
  )
    errors.push('O tempo deve ficar entre 1 e 300 minutos.');
  if (!['sequential', 'random'].includes(config.order))
    errors.push('Selecione a ordem das questões.');
  if (!['exam', 'training'].includes(config.mode)) errors.push('Selecione o modo do simulado.');
  return errors;
}

// A separate stream per question keeps every alternative order stable on refresh,
// even when the session has a different subset or the user changes question.
function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let n = Math.imul(value ^ (value >>> 15), value | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(value: string) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return result >>> 0;
}
export function shuffle<T>(items: readonly T[], seed: number) {
  const result = [...items];
  const next = random(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createSession(
  config: EnadeConfig,
  seed: number,
  now: number,
  onlyIds?: string[],
  sourceYear?: number
): EnadeSession {
  if (sourceYear === undefined && configErrors(config).length)
    throw new Error('Configuração inválida.');
  const pool =
    sourceYear === undefined
      ? availableQuestions(config)
      : QUESTION_BANK.filter((q) => q.year === sourceYear);
  const filtered = onlyIds ? pool.filter((q) => onlyIds.includes(q.id)) : pool;
  const ordered = config.order === 'random' ? shuffle(filtered, seed) : filtered;
  const questions = ordered.slice(0, config.questionCount);
  if (!questions.length || questions.length !== config.questionCount)
    throw new Error('Quantidade indisponível.');
  return {
    version: 1,
    id: `${now}-${seed}`,
    config,
    seed,
    questionIds: questions.map((q) => q.id),
    optionOrder: Object.fromEntries(
      questions
        .filter((q) => q.kind === 'objective')
        .map((q) => [
          q.id,
          config.order === 'random'
            ? shuffle(['A', 'B', 'C', 'D', 'E'], seed ^ hash(q.id))
            : ['A', 'B', 'C', 'D', 'E'],
        ])
    ),
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
    ...(sourceYear !== undefined ? { sourceYear } : {}),
  };
}
export function standardConfig(year: number): EnadeConfig {
  return {
    version: 1,
    years: [year],
    questionCount: 40,
    order: 'sequential',
    durationMinutes: 240,
    mode: 'exam',
    includeDiscursive: true,
  };
}
export function sessionFromLegacy(
  year: number,
  attempt: EnadeAttempt | undefined,
  now: number
): EnadeSession {
  const session = createSession(
    standardConfig(year),
    0,
    attempt?.startedAt || now,
    undefined,
    year
  );
  if (!attempt) return session;
  const elapsedMs = Math.min(
    240 * 60000,
    Math.max(0, (attempt.finishedAt || now) - attempt.startedAt)
  );
  return {
    ...session,
    ...attempt,
    elapsedMs,
    runningSince: attempt.finishedAt ? null : now,
    finishReason: attempt.finishedAt ? 'manual' : null,
  };
}
export function sessionQuestions(session: EnadeSession) {
  return session.questionIds.map((id) => QUESTION_BY_ID.get(id)!);
}
export function elapsedTime(session: EnadeSession, now: number) {
  const value =
    session.elapsedMs +
    (session.runningSince === null ? 0 : Math.max(0, now - session.runningSince));
  return Math.min(
    value,
    session.config.durationMinutes === null ? Infinity : session.config.durationMinutes * 60000
  );
}
export function remainingTime(session: EnadeSession, now: number) {
  return session.config.durationMinutes === null
    ? null
    : Math.max(0, session.config.durationMinutes * 60000 - elapsedTime(session, now));
}
export function checkpoint(session: EnadeSession, now: number): EnadeSession {
  return {
    ...session,
    elapsedMs: elapsedTime(session, now),
    runningSince: session.paused || session.finishedAt ? null : now,
    updatedAt: now,
  };
}
export function finishSession(
  session: EnadeSession,
  now: number,
  reason: 'manual' | 'timeout' = 'manual'
): EnadeSession {
  return {
    ...checkpoint(session, now),
    finishedAt: now,
    runningSince: null,
    paused: false,
    finishReason: reason,
  };
}
export function pauseSession(session: EnadeSession, now: number): EnadeSession {
  if (session.finishedAt) return session;
  const next = checkpoint(session, now);
  return { ...next, paused: !session.paused, runningSince: session.paused ? now : null };
}
export function answerQuestion(
  session: EnadeSession,
  id: string,
  answer: string,
  now: number
): EnadeSession {
  if (session.finishedAt || session.paused || !session.questionIds.includes(id)) return session;
  const question = QUESTION_BY_ID.get(id)!;
  if (question.annulled || (question.kind === 'objective' && !/^[A-E]$/.test(answer)))
    return session;
  if (
    session.config.mode === 'training' &&
    session.checked.includes(id) &&
    question.kind === 'objective'
  )
    return session;
  return {
    ...checkpoint(session, now),
    answers: { ...session.answers, [id]: answer },
    checked:
      session.config.mode === 'training' && question.kind === 'objective'
        ? [...new Set([...session.checked, id])]
        : session.checked,
  };
}
export function navigateSession(session: EnadeSession, index: number, now: number): EnadeSession {
  return {
    ...checkpoint(session, now),
    currentIndex: Math.max(0, Math.min(session.questionIds.length - 1, index)),
  };
}
export function toggleReview(session: EnadeSession, id: string, now: number): EnadeSession {
  if (session.finishedAt || !session.questionIds.includes(id)) return session;
  return {
    ...checkpoint(session, now),
    marked: session.marked.includes(id)
      ? session.marked.filter((q) => q !== id)
      : [...session.marked, id],
  };
}
export function checkDiscursive(session: EnadeSession, now: number): EnadeSession {
  const id = session.questionIds[session.currentIndex];
  if (
    session.finishedAt ||
    session.paused ||
    session.config.mode !== 'training' ||
    QUESTION_BY_ID.get(id)?.kind !== 'discursive'
  )
    return session;
  return { ...checkpoint(session, now), checked: [...new Set([...session.checked, id])] };
}
export function randomUnanswered(session: EnadeSession, entropy: number) {
  const candidates = session.questionIds
    .map((id, index) => ({ id, index }))
    .filter(
      ({ id, index }) =>
        index !== session.currentIndex &&
        !session.answers[id]?.trim() &&
        !QUESTION_BY_ID.get(id)?.annulled
    );
  return candidates.length
    ? candidates[
        Math.min(candidates.length - 1, Math.floor(Math.max(0, entropy) * candidates.length))
      ].index
    : null;
}
export function displayLetter(
  session: EnadeSession,
  id: string,
  canonical: string | undefined | null
) {
  if (!canonical) return null;
  const index = session.optionOrder[id]?.indexOf(canonical) ?? -1;
  return index < 0 ? null : String.fromCharCode(65 + index);
}
export function gradeSession(session: EnadeSession, now = session.finishedAt || Date.now()) {
  const questions = sessionQuestions(session);
  const scored = questions.filter((q) => q.kind === 'objective' && !q.annulled && q.answer);
  const correct = scored.filter((q) => session.answers[q.id] === q.answer).length;
  const wrongIds = scored.filter((q) => session.answers[q.id] !== q.answer).map((q) => q.id);
  const elapsedMs = elapsedTime(session, now);
  return {
    correct,
    errors: scored.length - correct,
    total: scored.length,
    percent: scored.length ? Math.round((correct / scored.length) * 100) : 0,
    unanswered: scored.filter((q) => !session.answers[q.id]).length,
    wrongIds,
    elapsedMs,
    averageMs: questions.length ? elapsedMs / questions.length : 0,
    answered: questions.filter((q) => session.answers[q.id]?.trim()).length,
  };
}
export function repeatSession(session: EnadeSession, seed: number, now: number, wrongOnly = false) {
  const ids = wrongOnly ? gradeSession(session).wrongIds : undefined;
  if (wrongOnly && !ids?.length) return null;
  const config = { ...session.config, questionCount: ids?.length || session.config.questionCount };
  return createSession(config, seed, now, ids, wrongOnly ? undefined : session.sourceYear);
}
export function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${Math.floor(minutes / 60)
    .toString()
    .padStart(
      2,
      '0'
    )}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
