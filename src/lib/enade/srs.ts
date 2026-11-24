/**
 * Spaced repetition for the error notebook (an SM-2 variant).
 *
 * A miss opens (or reopens) the item and schedules it for the next day. Each
 * correct answer afterwards stretches the interval by the item's ease. Two
 * consecutive correct answers mark the concept as recovered; it stays in the
 * notebook with a long maintenance interval instead of disappearing.
 */
export type ReviewSchedule = {
  status: 'OPEN' | 'RECOVERED';
  wrongCount: number;
  correctCount: number;
  streak: number;
  ease: number;
  intervalDays: number;
  dueAt: Date;
  recoveredAt: Date | null;
};

export const RECOVERY_STREAK = 2;
const DAY = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const MAX_EASE = 3;
const MAX_INTERVAL_DAYS = 365;

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY);
}

export function scheduleReview(
  previous: ReviewSchedule | null,
  correct: boolean,
  now: Date
): ReviewSchedule | null {
  if (!previous && correct) return null;
  if (!correct) {
    const ease = Math.max(MIN_EASE, (previous?.ease ?? 2.5) - 0.2);
    return {
      status: 'OPEN',
      wrongCount: (previous?.wrongCount ?? 0) + 1,
      correctCount: previous?.correctCount ?? 0,
      streak: 0,
      ease: Math.round(ease * 100) / 100,
      intervalDays: 1,
      dueAt: addDays(now, 1),
      recoveredAt: null,
    };
  }
  const base = previous!;
  const streak = base.streak + 1;
  const intervalDays =
    streak === 1
      ? 3
      : Math.min(
          MAX_INTERVAL_DAYS,
          Math.max(base.intervalDays + 1, Math.round(base.intervalDays * base.ease))
        );
  const recovered = streak >= RECOVERY_STREAK;
  return {
    status: recovered ? 'RECOVERED' : 'OPEN',
    wrongCount: base.wrongCount,
    correctCount: base.correctCount + 1,
    streak,
    ease: Math.min(MAX_EASE, Math.round((base.ease + 0.1) * 100) / 100),
    intervalDays,
    dueAt: addDays(now, intervalDays),
    recoveredAt: recovered ? (base.recoveredAt ?? now) : null,
  };
}

/** Recurring errors: the same question missed more than once. */
export function isRecurring(item: Pick<ReviewSchedule, 'wrongCount'>) {
  return item.wrongCount >= 2;
}
