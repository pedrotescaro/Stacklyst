/**
 * Learning analytics computed from the learner's real history. Pure functions:
 * the server loads the rows and the pages render the result.
 *
 * Two different counts are always kept apart so nothing is inflated:
 * - responses: every graded answer, including repeated attempts;
 * - unique questions: each official question counted once.
 */
export type AttemptKind = 'STANDARD' | 'CUSTOM' | 'WRONG_ONLY' | 'REVIEW' | 'TOPIC' | 'PRACTICE';

export type AnswerRecord = {
  questionId: string;
  attemptId: string;
  attemptKind: AttemptKind;
  topic: string | null;
  section: string;
  year: number;
  selected: string | null;
  correct: boolean | null;
  answeredAt: Date;
};

export type AttemptRecord = {
  id: string;
  kind: AttemptKind;
  mode: string;
  status: 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED';
  title: string;
  sourceYear: number | null;
  topic: string | null;
  questions: { year: number; topic: string | null }[];
  questionCount: number;
  answeredCount: number;
  scoredCount: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  elapsedMs: number;
  startedAt: Date;
  finishedAt: Date | null;
  updatedAt: Date;
};

export type DailyRecord = {
  day: string; // YYYY-MM-DD in the study timezone
  readingMs: number;
  practiceMs: number;
  questionsAnswered: number;
  questionsCorrect: number;
  articlesStudied: number;
};

export type StatsPeriod = '7d' | '30d' | '90d' | '365d' | 'all';
export type StatsActivity = 'all' | 'exam' | 'practice' | 'review';

export type StatsFilter = {
  period: StatsPeriod;
  topic?: string | null;
  category?: string | null;
  year?: number | null;
  activity: StatsActivity;
};

export const STUDY_TIME_ZONE = 'America/Sao_Paulo';
const DAY = 24 * 60 * 60 * 1000;
const CALENDAR_DAYS = 365;
const PERIOD_DAYS: Record<StatsPeriod, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': CALENDAR_DAYS,
  all: null,
};
export const ACTIVITY_KINDS: Record<Exclude<StatsActivity, 'all'>, AttemptKind[]> = {
  exam: ['STANDARD', 'CUSTOM', 'WRONG_ONLY'],
  practice: ['TOPIC', 'PRACTICE'],
  review: ['REVIEW'],
};
/** Attempts shown as "simulados" in history and averages (single-question practice is not). */
export const SIMULATION_KINDS: AttemptKind[] = [
  'STANDARD',
  'CUSTOM',
  'WRONG_ONLY',
  'REVIEW',
  'TOPIC',
];

const formatters = new Map<string, Intl.DateTimeFormat>();

export function dayKey(date: Date, timeZone = STUDY_TIME_ZONE) {
  const formatter =
    formatters.get(timeZone) ??
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  formatters.set(timeZone, formatter);
  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function shiftDay(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`);
  return new Date(date.getTime() + days * DAY).toISOString().slice(0, 10);
}

function weekKey(key: string) {
  const date = new Date(`${key}T12:00:00Z`);
  const weekday = (date.getUTCDay() + 6) % 7; // Monday = 0
  return shiftDay(key, -weekday);
}

const ratio = (part: number, total: number) => (total ? part / total : null);

export type TopicStat = {
  slug: string;
  responses: number;
  correct: number;
  wrong: number;
  accuracy: number | null;
  unique: number;
  latestAccuracy: number | null;
  lastAt: Date | null;
};

export function topicStats(answers: AnswerRecord[], key: (a: AnswerRecord) => string | null) {
  const groups = new Map<string, AnswerRecord[]>();
  for (const answer of answers) {
    if (answer.correct === null || answer.selected === null) continue;
    const slug = key(answer);
    if (!slug) continue;
    const group = groups.get(slug);
    if (group) group.push(answer);
    else groups.set(slug, [answer]);
  }
  return [...groups.entries()]
    .map(([slug, rows]): TopicStat => {
      const latest = latestPerQuestion(rows);
      const correct = rows.filter((r) => r.correct).length;
      return {
        slug,
        responses: rows.length,
        correct,
        wrong: rows.length - correct,
        accuracy: ratio(correct, rows.length),
        unique: latest.length,
        latestAccuracy: ratio(latest.filter((r) => r.correct).length, latest.length),
        lastAt: rows.reduce<Date | null>(
          (max, r) => (!max || r.answeredAt > max ? r.answeredAt : max),
          null
        ),
      };
    })
    .sort((a, b) => b.responses - a.responses || a.slug.localeCompare(b.slug));
}

function latestPerQuestion(rows: AnswerRecord[]) {
  const latest = new Map<string, AnswerRecord>();
  for (const row of rows) {
    const previous = latest.get(row.questionId);
    if (!previous || row.answeredAt >= previous.answeredAt) latest.set(row.questionId, row);
  }
  return [...latest.values()];
}

function firstPerQuestion(rows: AnswerRecord[]) {
  const first = new Map<string, AnswerRecord>();
  for (const row of rows) {
    const previous = first.get(row.questionId);
    if (!previous || row.answeredAt < previous.answeredAt) first.set(row.questionId, row);
  }
  return [...first.values()];
}

/** A subject counts as mastered with ≥ 3 distinct questions and ≥ 80% on the latest answers. */
export function isMastered(stat: TopicStat) {
  return stat.unique >= 3 && (stat.latestAccuracy ?? 0) >= 0.8;
}
/** A subject needs attention with ≥ 2 graded answers and < 60% of them correct. */
export function isStruggling(stat: TopicStat) {
  return stat.responses >= 2 && (stat.accuracy ?? 1) < 0.6;
}

export function attemptPercent(attempt: Pick<AttemptRecord, 'correctCount' | 'scoredCount'>) {
  return attempt.scoredCount ? Math.round((attempt.correctCount / attempt.scoredCount) * 100) : 0;
}

export function computeStats(
  input: {
    answers: AnswerRecord[];
    attempts: AttemptRecord[];
    daily: DailyRecord[];
    topicCategory: Map<string, string>;
  },
  filter: StatsFilter,
  now = new Date()
) {
  const days = PERIOD_DAYS[filter.period];
  const today = dayKey(now);
  const sinceKey = days === null ? null : shiftDay(today, 1 - days);
  const inPeriod = (at: Date) => !sinceKey || dayKey(at) >= sinceKey;
  const kinds = filter.activity === 'all' ? null : ACTIVITY_KINDS[filter.activity];
  const hasQuestionFilter = !!(filter.year || filter.topic || filter.category);
  const isScoped = hasQuestionFilter || !!kinds;
  const matchesTopic = (topic: string | null) =>
    (!filter.topic || topic === filter.topic) &&
    (!filter.category || (topic !== null && input.topicCategory.get(topic) === filter.category));

  const matchesQuestion = (question: { year: number; topic: string | null }) =>
    (!filter.year || question.year === filter.year) && matchesTopic(question.topic);
  const answers = input.answers.filter(
    (a) => inPeriod(a.answeredAt) && (!kinds || kinds.includes(a.attemptKind)) && matchesQuestion(a)
  );
  const answered = answers.filter((a) => a.selected !== null);
  const graded = answered.filter((a) => a.correct !== null);
  const correct = graded.filter((a) => a.correct).length;
  const unique = latestPerQuestion(graded);
  const first = firstPerQuestion(graded);

  const matchedAttempts = input.attempts.filter(
    (a) =>
      a.status !== 'ABANDONED' &&
      (!kinds || kinds.includes(a.kind)) &&
      (!hasQuestionFilter || a.questions.some(matchesQuestion))
  );
  const attempts = matchedAttempts.filter((a) => SIMULATION_KINDS.includes(a.kind));
  const scores = new Map<string, { correctCount: number; scoredCount: number }>();
  if (hasQuestionFilter) {
    for (const answer of input.answers) {
      if (answer.correct === null || !matchesQuestion(answer)) continue;
      const score = scores.get(answer.attemptId) ?? { correctCount: 0, scoredCount: 0 };
      score.scoredCount++;
      if (answer.correct) score.correctCount++;
      scores.set(answer.attemptId, score);
    }
  }
  const finished = attempts
    .filter((a) => a.status === 'FINISHED' && a.finishedAt && inPeriod(a.finishedAt))
    .sort((a, b) => a.finishedAt!.getTime() - b.finishedAt!.getTime());
  const scored = finished.flatMap((a) => {
    const score = hasQuestionFilter ? scores.get(a.id) : a;
    return score?.scoredCount ? [{ attempt: a, percent: attemptPercent(score) }] : [];
  });
  const best = scored.reduce<(typeof scored)[number] | null>(
    (current, item) => (!current || item.percent > current.percent ? item : current),
    null
  );

  const daily = isScoped
    ? matchedAttempts.flatMap((a): DailyRecord[] => {
        const date = a.finishedAt ?? a.updatedAt;
        return inPeriod(date)
          ? [
              {
                day: dayKey(date),
                readingMs: 0,
                practiceMs: a.elapsedMs,
                questionsAnswered: 0,
                questionsCorrect: 0,
                articlesStudied: 0,
              },
            ]
          : [];
      })
    : input.daily.filter((d) => !sinceKey || d.day >= sinceKey);
  const readingMs = daily.reduce((sum, d) => sum + d.readingMs, 0);
  const practiceMs = daily.reduce((sum, d) => sum + d.practiceMs, 0);

  const bucket = (keyOf: (day: string) => string) => {
    const map = new Map<string, { responses: number; correct: number; studyMs: number }>();
    for (const answer of graded) {
      const key = keyOf(dayKey(answer.answeredAt));
      const entry = map.get(key) ?? { responses: 0, correct: 0, studyMs: 0 };
      entry.responses++;
      if (answer.correct) entry.correct++;
      map.set(key, entry);
    }
    for (const day of daily) {
      const key = keyOf(day.day);
      const entry = map.get(key) ?? { responses: 0, correct: 0, studyMs: 0 };
      entry.studyMs += day.readingMs + day.practiceMs;
      map.set(key, entry);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ key, ...value, accuracy: ratio(value.correct, value.responses) }));
  };

  const byTopic = topicStats(answers, (a) => a.topic);
  const byCategory = topicStats(answers, (a) =>
    a.topic ? (input.topicCategory.get(a.topic) ?? null) : null
  );

  const comparisons = new Map<number, { id: string; date: Date; percent: number }[]>();
  for (const { attempt, percent } of scored)
    if (attempt.kind === 'STANDARD' && attempt.sourceYear)
      comparisons.set(attempt.sourceYear, [
        ...(comparisons.get(attempt.sourceYear) ?? []),
        { id: attempt.id, date: attempt.finishedAt!, percent },
      ]);

  return {
    totals: {
      responses: graded.length,
      answered: answered.length,
      uniqueAnswered: latestPerQuestion(answered).length,
      correct,
      wrong: graded.length - correct,
      accuracy: ratio(correct, graded.length),
      uniqueQuestions: unique.length,
      repeatedResponses: graded.length - unique.length,
      uniqueCorrect: unique.filter((a) => a.correct).length,
      firstTryAccuracy: ratio(first.filter((a) => a.correct).length, first.length),
      latestAccuracy: ratio(unique.filter((a) => a.correct).length, unique.length),
      discursive: answered.length - graded.length,
    },
    attempts: {
      finished: finished.length,
      inProgress: attempts.filter((a) => a.status === 'IN_PROGRESS' && inPeriod(a.updatedAt))
        .length,
      best: best ? { id: best.attempt.id, title: best.attempt.title, percent: best.percent } : null,
      average: scored.length
        ? Math.round(scored.reduce((sum, a) => sum + a.percent, 0) / scored.length)
        : null,
    },
    studyMs: { reading: readingMs, practice: practiceMs, total: readingMs + practiceMs, isScoped },
    timeline: scored.map(({ attempt, percent }) => ({
      id: attempt.id,
      date: attempt.finishedAt!,
      title: attempt.title,
      kind: attempt.kind,
      percent,
    })),
    weekly: bucket(weekKey),
    monthly: bucket((day) => day.slice(0, 7)),
    byTopic,
    byCategory,
    mastered: byTopic.filter(isMastered),
    struggling: byTopic
      .filter(isStruggling)
      .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || b.wrong - a.wrong),
    streak: computeStreak(daily, answered, now, days ?? CALENDAR_DAYS),
    comparisons: [...comparisons.entries()]
      .filter(([, list]) => list.length > 1)
      .map(([year, list]) => ({ year, attempts: list }))
      .sort((a, b) => b.year - a.year),
  };
}
export type EnadeStats = ReturnType<typeof computeStats>;

type DailyStudy = {
  durationMs: number;
  answers: number;
  articles: number;
};

export type StudyCalendarDay = DailyStudy & {
  day: string;
  level: number;
};

/** Consecutive study days (reading or answering), ending today or yesterday. */
export function computeStreak(
  daily: DailyRecord[],
  answered: AnswerRecord[],
  now = new Date(),
  calendarDays = CALENDAR_DAYS
) {
  const today = dayKey(now);
  const activity = new Map<string, DailyStudy>();
  const activityFor = (day: string) => {
    const existing = activity.get(day);
    if (existing) return existing;
    const entry = { durationMs: 0, answers: 0, articles: 0 };
    activity.set(day, entry);
    return entry;
  };
  for (const day of daily) {
    const durationMs = day.readingMs + day.practiceMs;
    if (durationMs <= 0 && day.questionsAnswered <= 0 && day.articlesStudied <= 0) continue;
    const entry = activityFor(day.day);
    entry.durationMs += durationMs;
    entry.articles += day.articlesStudied;
  }
  for (const answer of answered) activityFor(dayKey(answer.answeredAt)).answers++;

  let cursor = activity.has(today) ? today : shiftDay(today, -1);
  let current = 0;
  while (activity.has(cursor)) {
    current++;
    cursor = shiftDay(cursor, -1);
  }
  const sorted = [...activity.keys()].sort();
  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of sorted) {
    run = previous && shiftDay(previous, 1) === key ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = key;
  }
  const calendar = Array.from({ length: calendarDays }, (_, index): StudyCalendarDay => {
    const day = shiftDay(today, index + 1 - calendarDays);
    const entry = activity.get(day);
    const durationMs = entry?.durationMs ?? 0;
    const level = !entry
      ? 0
      : durationMs >= 60 * 60000
        ? 4
        : durationMs >= 30 * 60000
          ? 3
          : durationMs >= 10 * 60000
            ? 2
            : 1;
    return { day, level, durationMs, answers: entry?.answers ?? 0, articles: entry?.articles ?? 0 };
  });
  return { current, longest, activeDays: activity.size, calendar };
}
