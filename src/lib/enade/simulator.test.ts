import { describe, expect, it } from 'vitest';
import {
  answerQuestion,
  availableQuestions,
  checkpoint,
  configErrors,
  createSession,
  DEFAULT_CONFIG,
  displayLetter,
  elapsedTime,
  finishSession,
  gradeSession,
  navigateSession,
  pauseSession,
  QUESTION_BY_ID,
  randomUnanswered,
  remainingTime,
  repeatSession,
  sessionFromLegacy,
  shuffle,
  toggleReview,
} from './simulator';
import { enadeSessionSchema, enadeWorkspaceSchema } from './simulator-schema';
import { explanationFor, questionPresentation } from './feedback';
import contents from '../../../public/enade/2021/questions.json';
const stamp = 1800000000000;
const config = { ...DEFAULT_CONFIG, years: [2021], questionCount: 10 };

describe('configurable Enade domain', () => {
  it('filters years and optional discursives, excluding annulled questions', () => {
    expect(availableQuestions({ years: [2008], includeDiscursive: false })).toHaveLength(32);
    expect(availableQuestions({ years: [2008], includeDiscursive: true })).toHaveLength(36);
    expect(availableQuestions(DEFAULT_CONFIG)).toHaveLength(171);
    expect(availableQuestions({ years: [2017, 2021], includeDiscursive: true })).toHaveLength(79);
    expect(configErrors({ ...config, years: [] })).not.toHaveLength(0);
    expect(configErrors({ ...config, questionCount: 36 })).not.toHaveLength(0);
    for (const minutes of [1, 17, 35.5, 300, null])
      expect(configErrors({ ...config, durationMinutes: minutes })).toEqual([]);
    for (const minutes of [0, 301, NaN])
      expect(configErrors({ ...config, durationMinutes: minutes })).not.toHaveLength(0);
  });
  it('keeps question and option permutations stable for a seed across serialization', () => {
    const a = createSession(config, 123, stamp);
    const b = createSession(config, 123, stamp + 5000);
    expect(a.questionIds).toEqual(b.questionIds);
    expect(a.optionOrder).toEqual(b.optionOrder);
    expect(a.questionIds).not.toEqual(createSession(config, 456, stamp).questionIds);
    expect(enadeSessionSchema.parse(JSON.parse(JSON.stringify(a)))).toEqual(a);
    expect(shuffle(['A', 'B', 'C', 'D', 'E'], 123).sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
  it('grades canonical answers even when display letters have been shuffled', () => {
    let session = createSession({ ...config, questionCount: 35 }, 891, stamp);
    for (const id of session.questionIds) {
      const answer = QUESTION_BY_ID.get(id)!.answer!;
      const shown = displayLetter(session, id, answer)!;
      expect(session.optionOrder[id][shown.charCodeAt(0) - 65]).toBe(answer);
      session = answerQuestion(session, id, answer, stamp + 1000);
    }
    expect(gradeSession(session).correct).toBe(35);
    expect(gradeSession(session).errors).toBe(0);
  });
  it('counts unanswered objectives as errors at timeout and excludes self-assessed questions', () => {
    let session = createSession(
      {
        ...config,
        includeDiscursive: true,
        questionCount: 40,
        order: 'sequential',
        durationMinutes: 1,
      },
      1,
      stamp
    );
    const objective = session.questionIds.find(
      (id) => QUESTION_BY_ID.get(id)!.kind === 'objective'
    )!;
    session = answerQuestion(
      session,
      objective,
      QUESTION_BY_ID.get(objective)!.answer!,
      stamp + 5000
    );
    session = answerQuestion(session, '2021-discursive-1', 'Resposta de estudo', stamp + 6000);
    const result = gradeSession(finishSession(session, stamp + 70000, 'timeout'));
    expect(result).toMatchObject({
      correct: 1,
      errors: 34,
      unanswered: 34,
      total: 35,
      elapsedMs: 60000,
      averageMs: 1500,
    });
  });
  it('uses wall-clock elapsed time across refresh, excluding explicit pauses', () => {
    const initial = createSession({ ...config, durationMinutes: 1 }, 1, stamp);
    const active = checkpoint(initial, stamp + 10000);
    expect(remainingTime(active, stamp + 25000)).toBe(35000);
    const paused = pauseSession(active, stamp + 30000);
    expect(remainingTime(paused, stamp + 900000)).toBe(30000);
    const resumed = pauseSession(JSON.parse(JSON.stringify(paused)), stamp + 900000);
    expect(remainingTime(resumed, stamp + 910000)).toBe(20000);
    const untimed = createSession({ ...config, durationMinutes: null }, 1, stamp);
    expect(remainingTime(untimed, stamp + 900000)).toBeNull();
    expect(elapsedTime(untimed, stamp + 900000)).toBe(900000);
  });
  it('navigates, marks, and jumps only to an unanswered question', () => {
    let session = createSession(config, 3, stamp);
    session = toggleReview(session, session.questionIds[0], stamp + 1);
    expect(session.marked).toEqual([session.questionIds[0]]);
    session = navigateSession(session, 999, stamp + 2);
    expect(session.currentIndex).toBe(9);
    const current = session.currentIndex;
    for (const [index, id] of session.questionIds.entries())
      if (index !== 4 && index !== current) session = answerQuestion(session, id, 'A', stamp + 3);
    expect(randomUnanswered(session, 0.9)).toBe(4);
    session = answerQuestion(session, session.questionIds[4], 'A', stamp + 4);
    expect(randomUnanswered(session, 0)).toBeNull();
  });
  it('reveals feedback only after an answer in training, and preserves the first answer', () => {
    let session = createSession({ ...config, mode: 'training', order: 'sequential' }, 1, stamp);
    const q = QUESTION_BY_ID.get(session.questionIds[0])!;
    const content = contents.find((item) => item.id === q.id)!;
    expect(questionPresentation(session, q, content).reveal).toBe(false);
    session = answerQuestion(session, q.id, q.answer!, stamp + 1000);
    expect(questionPresentation(session, q, content)).toMatchObject({
      reveal: true,
      feedback: 'correct',
    });
    const other = q.answer === 'A' ? 'B' : 'A';
    expect(answerQuestion(session, q.id, other, stamp + 2000).answers[q.id]).toBe(q.answer);
    const exam = { ...session, config: { ...session.config, mode: 'exam' as const } };
    expect(questionPresentation(exam, q, content).reveal).toBe(false);
    expect(questionPresentation(finishSession(exam, stamp + 2000), q, content).reveal).toBe(true);
  });
  it('repeats either the configuration or exactly the missed/blank objective IDs', () => {
    let session = createSession(config, 5, stamp);
    const correct = session.questionIds[0];
    session = answerQuestion(session, correct, QUESTION_BY_ID.get(correct)!.answer!, stamp + 1000);
    session = finishSession(session, stamp + 2000);
    expect(repeatSession(session, 6, stamp + 3000)!.config).toEqual(config);
    const missed = repeatSession(session, 6, stamp + 3000, true)!;
    expect(missed.questionIds).toHaveLength(9);
    expect(missed.questionIds).not.toContain(correct);
    expect(new Set(missed.questionIds)).toEqual(new Set(gradeSession(session).wrongIds));
    expect(missed.answers).toEqual({});
  });
  it('upgrades standard legacy drafts while preserving the original full exam route', () => {
    const session = sessionFromLegacy(
      2021,
      {
        answers: { '2021-objective-1': 'E' },
        marked: [],
        startedAt: stamp,
        updatedAt: stamp,
        finishedAt: null,
      },
      stamp + 5000
    );
    expect(session).toMatchObject({
      sourceYear: 2021,
      elapsedMs: 5000,
      config: { questionCount: 40 },
    });
    expect(enadeSessionSchema.safeParse(session).success).toBe(true);
    expect(
      enadeWorkspaceSchema.safeParse({ version: 1, config, session, updatedAt: stamp }).success
    ).toBe(false);
  });
  it('rejects invalid session references and has a study explanation for every valid objective', () => {
    const session = createSession(config, 123, stamp);
    expect(enadeSessionSchema.safeParse({ ...session, currentIndex: 12 }).success).toBe(false);
    expect(
      enadeSessionSchema.safeParse({
        ...session,
        questionIds: Array(10).fill(session.questionIds[0]),
      }).success
    ).toBe(false);
    expect(enadeSessionSchema.safeParse({ ...session, optionOrder: {} }).success).toBe(false);
    for (const q of availableQuestions(DEFAULT_CONFIG))
      expect(explanationFor(q).length).toBeGreaterThan(80);
  });
});
