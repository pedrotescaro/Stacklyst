import type { DuelSubmission } from '@prisma/client';

const TIE_SCORE_THRESHOLD = 5;
const TIE_RUNTIME_RATIO = 0.05;

export type ComparableSubmission = Pick<
  DuelSubmission,
  'id' | 'user_id' | 'code' | 'status' | 'score' | 'runtime_ms' | 'complexity' | 'created_at'
>;

export type DuelResolutionDecision =
  | {
      kind: 'closed';
      winnerId: string | null;
      reason: 'automatic_score' | 'deadline_score' | 'no_submissions';
      scoreGap: number;
      runtimeGap: number | null;
    }
  | {
      kind: 'review';
      winnerId: null;
      reason: 'technical_tie';
      scoreGap: number;
      runtimeGap: number | null;
    };

function submissionOrder(left: ComparableSubmission, right: ComparableSubmission) {
  const acceptedGap = Number(right.status === 'ACCEPTED') - Number(left.status === 'ACCEPTED');
  if (acceptedGap !== 0) return acceptedGap;
  if (right.score !== left.score) return right.score - left.score;
  const leftRuntime = left.runtime_ms ?? Number.MAX_SAFE_INTEGER;
  const rightRuntime = right.runtime_ms ?? Number.MAX_SAFE_INTEGER;
  if (leftRuntime !== rightRuntime) return leftRuntime - rightRuntime;
  return left.created_at.getTime() - right.created_at.getTime();
}

export function chooseBestDuelSubmission(
  submissions: ComparableSubmission[],
  userId: string,
  acceptedOnly = false
) {
  return (
    submissions
      .filter(
        (submission) =>
          submission.user_id === userId && (!acceptedOnly || submission.status === 'ACCEPTED')
      )
      .sort(submissionOrder)[0] ?? null
  );
}

export function decideDuelResolution(input: {
  first: ComparableSubmission | null;
  second: ComparableSubmission | null;
  reason: 'automatic_score' | 'deadline_score';
}): DuelResolutionDecision {
  const { first, second } = input;
  if (!first && !second) {
    return {
      kind: 'closed',
      winnerId: null,
      reason: 'no_submissions',
      scoreGap: 0,
      runtimeGap: null,
    };
  }
  if (!first || !second) {
    return {
      kind: 'closed',
      winnerId: (first ?? second)!.user_id,
      reason: input.reason,
      scoreGap: (first ?? second)!.score,
      runtimeGap: null,
    };
  }

  const scoreGap = Math.abs(first.score - second.score);
  const runtimeGap =
    first.runtime_ms === null || second.runtime_ms === null
      ? null
      : Math.abs(first.runtime_ms - second.runtime_ms);
  const runtimeBase = Math.max(
    1,
    Math.min(
      first.runtime_ms ?? Number.MAX_SAFE_INTEGER,
      second.runtime_ms ?? Number.MAX_SAFE_INTEGER
    )
  );
  const runtimeIsTied = runtimeGap === null || runtimeGap / runtimeBase <= TIE_RUNTIME_RATIO;

  if (scoreGap <= TIE_SCORE_THRESHOLD && runtimeIsTied) {
    return { kind: 'review', winnerId: null, reason: 'technical_tie', scoreGap, runtimeGap };
  }

  const winner =
    first.score > second.score
      ? first
      : second.score > first.score
        ? second
        : (first.runtime_ms ?? Number.MAX_SAFE_INTEGER) <=
            (second.runtime_ms ?? Number.MAX_SAFE_INTEGER)
          ? first
          : second;

  return { kind: 'closed', winnerId: winner.user_id, reason: input.reason, scoreGap, runtimeGap };
}
