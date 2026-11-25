import { describe, expect, it } from 'vitest';
import {
  attemptCounters,
  buildSession,
  revealedAnswers,
  restartAttempt,
  sameStructure,
} from './attempts';
import {
  answerQuestion,
  checkDiscursive,
  finishSession,
  navigateSession,
  QUESTION_BY_ID,
} from './simulator';
import { enadeSessionSchema } from './simulator-schema';
import { computeStats, type AttemptRecord, type DailyRecord } from './stats';

const startedAt = 1_800_000_000_000;
const exam = buildSession({ kind: 'STANDARD', year: 2021 }, 42, startedAt);

describe('ENADE attempt persistence rules', () => {
  it('accepts JSONB object ordering while preserving the question and option order', () => {
    const reverseKeys = <T>(record: Record<string, T>) =>
      Object.fromEntries(Object.entries(record).reverse());
    const restored = {
      ...exam,
      config: { ...reverseKeys(exam.config), ...exam.config },
      optionOrder: reverseKeys(exam.optionOrder),
    };
    expect(Object.keys(restored.config)).not.toEqual(Object.keys(exam.config));
    expect(sameStructure(restored, enadeSessionSchema.parse(exam))).toBe(true);
    expect(sameStructure(restored, { ...exam, questionIds: [...exam.questionIds].reverse() })).toBe(
      false
    );
    const id = '2021-objective-1';
    expect(
      sameStructure(restored, {
        ...exam,
        optionOrder: { ...exam.optionOrder, [id]: [...exam.optionOrder[id]].reverse() },
      })
    ).toBe(false);
  });

  it('keeps consecutive checkpoints in the same clock tick and replays the original selection', () => {
    const jumped = navigateSession(exam, 2, startedAt);
    const answered = answerQuestion(jumped, '2021-objective-1', 'E', startedAt);
    expect(jumped.updatedAt).toBe(startedAt + 1);
    expect(answered.updatedAt).toBe(startedAt + 2);
    const replay = restartAttempt(finishSession(answered, startedAt + 1000), startedAt + 2000, 100);
    expect(replay.questionIds).toEqual(exam.questionIds);
    expect(replay.optionOrder).toEqual(exam.optionOrder);
    expect(replay).toMatchObject({ answers: {}, finishedAt: null, elapsedMs: 0, currentIndex: 0 });
  });

  it('records answers at each feedback boundary and distinguishes blanks from discursive work', () => {
    const objective = '2021-objective-1';
    const discursive = '2021-discursive-1';
    const practice = buildSession(
      {
        kind: 'TOPIC',
        mode: 'training',
        questionIds: [objective, discursive, '2021-objective-2'],
      },
      44,
      startedAt
    );
    const checked = checkDiscursive(
      navigateSession(practice, practice.questionIds.indexOf(discursive), startedAt + 10),
      startedAt + 11
    );
    const withEssay = answerQuestion(checked, discursive, 'Minha resolução', startedAt + 12);
    const selected = answerQuestion(
      withEssay,
      objective,
      QUESTION_BY_ID.get(objective)!.answer!,
      startedAt + 13
    );
    expect(revealedAnswers(selected)).toEqual([
      expect.objectContaining({ questionId: objective, correct: true }),
    ]);
    expect(enadeSessionSchema.safeParse({ ...selected, checked: [] }).success).toBe(false);
    const finished = finishSession(selected, startedAt + 20);
    expect(attemptCounters(finished)).toMatchObject({ answered_count: 2, blank_count: 1 });
    expect(revealedAnswers(finished)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          questionId: discursive,
          selected: 'Minha resolução',
          correct: null,
        }),
        expect.objectContaining({ questionId: '2021-objective-2', selected: null, correct: false }),
      ])
    );
  });
});

describe('ENADE study statistics', () => {
  it('counts submitted responses and matches mixed attempts by the selected question filters', () => {
    const now = new Date('2026-11-24T17:00:00Z');
    const attempt: AttemptRecord = {
      id: 'mixed',
      kind: 'CUSTOM',
      mode: 'exam',
      status: 'FINISHED',
      title: 'Misto',
      sourceYear: null,
      topic: null,
      questionCount: 4,
      answeredCount: 3,
      scoredCount: 3,
      correctCount: 2,
      wrongCount: 1,
      blankCount: 1,
      elapsedMs: 180_000,
      startedAt: now,
      finishedAt: now,
      updatedAt: now,
      questions: [
        { year: 2021, topic: 'rup' },
        { year: 2017, topic: 'redes' },
      ],
    };
    const base = {
      attemptId: attempt.id,
      attemptKind: attempt.kind,
      section: 'specific',
      answeredAt: now,
    };
    const input = {
      attempts: [attempt],
      answers: [
        { ...base, questionId: 'r1', year: 2021, topic: 'rup', selected: 'B', correct: true },
        { ...base, questionId: 'r2', year: 2021, topic: 'rup', selected: null, correct: false },
        { ...base, questionId: 'r3', year: 2021, topic: 'rup', selected: 'Texto', correct: null },
        { ...base, questionId: 'r4', year: 2017, topic: 'redes', selected: 'D', correct: true },
      ],
      daily: [
        {
          day: '2026-11-24',
          readingMs: 500,
          practiceMs: 200,
          articlesStudied: 0,
          questionsAnswered: 3,
          questionsCorrect: 2,
        },
      ],
      topicCategory: new Map([
        ['rup', 'software'],
        ['redes', 'infra'],
      ]),
    };
    const stats = computeStats(
      input,
      { period: '7d', activity: 'exam', year: 2021, category: 'software' },
      now
    );
    expect(stats.totals).toMatchObject({
      answered: 2,
      uniqueAnswered: 2,
      responses: 1,
      wrong: 0,
      discursive: 1,
    });
    expect(stats.attempts).toMatchObject({ finished: 1, best: { percent: 50 }, average: 50 });
    expect(stats.studyMs).toEqual({
      reading: 0,
      practice: 180_000,
      total: 180_000,
      isScoped: true,
    });
    expect(stats.streak.calendar).toHaveLength(7);
    expect(stats.streak.calendar.at(-1)).toEqual({
      day: '2026-11-24',
      level: 1,
      durationMs: 180_000,
      answers: 2,
      articles: 0,
    });
    expect(
      computeStats(input, { period: '7d', activity: 'all', year: 2017, topic: 'rup' }, now).attempts
        .finished
    ).toBe(0);
  });

  it('fills the last 365 São Paulo study days while keeping streak totals for older activity', () => {
    const daily = (day: string, readingMs: number, articlesStudied = 0): DailyRecord => ({
      day,
      readingMs,
      practiceMs: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      articlesStudied,
    });
    const stats = computeStats(
      {
        attempts: [],
        answers: [],
        daily: [
          daily('2025-01-01', 60_000),
          daily('2025-01-02', 60_000),
          daily('2025-01-03', 60_000),
          daily('2026-11-23', 20 * 60_000),
          daily('2026-11-24', 0, 1),
        ],
        topicCategory: new Map(),
      },
      { period: 'all', activity: 'all' },
      new Date('2026-11-25T02:15:00Z')
    );

    expect(stats.streak).toMatchObject({ current: 2, longest: 3, activeDays: 5 });
    expect(stats.streak.calendar).toHaveLength(365);
    expect(stats.streak.calendar[0]).toMatchObject({ day: '2025-11-25', level: 0 });
    expect(stats.streak.calendar.slice(-3)).toEqual([
      { day: '2026-11-22', level: 0, durationMs: 0, answers: 0, articles: 0 },
      { day: '2026-11-23', level: 2, durationMs: 20 * 60_000, answers: 0, articles: 0 },
      { day: '2026-11-24', level: 1, durationMs: 0, answers: 0, articles: 1 },
    ]);
  });
});
