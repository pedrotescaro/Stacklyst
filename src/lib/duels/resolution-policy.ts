import type { DuelSubmission } from '@prisma/client';
import { estimateCodeComplexity, complexityRank } from './complexity';
import { analyzeDuelSource } from './source-analysis';

export const DUEL_POLICY_VERSION = 2;
export type ComparableSubmission = Pick<
  DuelSubmission,
  | 'id'
  | 'user_id'
  | 'code'
  | 'status'
  | 'score'
  | 'runtime_ms'
  | 'complexity'
  | 'created_at'
  | 'passed_tests'
  | 'total_tests'
>;
type Comparison = {
  criterion: 'correctness' | 'complexity' | 'code_size' | 'identical_code' | 'tie' | 'none';
  first: ReturnType<typeof metrics> | null;
  second: ReturnType<typeof metrics> | null;
};
export type DuelResolutionDecision = {
  kind: 'closed' | 'review';
  winnerId: string | null;
  reason:
    | 'automatic_score'
    | 'deadline_score'
    | 'no_submissions'
    | 'no_valid_submissions'
    | 'judge_unavailable'
    | 'technical_draw'
    | 'identical_code';
  scoreGap: number;
  runtimeGap: number | null;
  comparison: Comparison;
};
function metrics(s: ComparableSubmission, language: string) {
  // Recompute legacy heuristic labels; old weighted scores do not choose winners.
  const source = analyzeDuelSource(s.code, language);
  const estimate = estimateCodeComplexity(
    s.code,
    language as Parameters<typeof estimateCodeComplexity>[1],
    ''
  );
  return {
    passed: s.passed_tests,
    total: s.total_tests,
    accepted: s.status === 'ACCEPTED',
    logicalLines: source.logicalLines,
    complexity: estimate.label,
    confidence: estimate.confidence,
    complexityReason: estimate.reason,
  };
}
function valid(s: ComparableSubmission | null): s is ComparableSubmission {
  return Boolean(
    s &&
    ['ACCEPTED', 'WRONG_ANSWER'].includes(s.status) &&
    Number.isInteger(s.total_tests) &&
    s.total_tests > 0 &&
    Number.isInteger(s.passed_tests) &&
    s.passed_tests > 0 &&
    s.passed_tests <= s.total_tests &&
    (s.status !== 'ACCEPTED' || s.passed_tests === s.total_tests)
  );
}
function correctness(a: ComparableSubmission, b: ComparableSubmission) {
  return (
    Number(a.status === 'ACCEPTED') - Number(b.status === 'ACCEPTED') ||
    a.passed_tests * b.total_tests - b.passed_tests * a.total_tests
  );
}
function compareEfficiency(a: ReturnType<typeof metrics>, b: ReturnType<typeof metrics>) {
  if (a.confidence === 'medium' && b.confidence === 'medium') {
    const gap = complexityRank(a.complexity) - complexityRank(b.complexity);
    if (gap) return gap;
  }
  return b.logicalLines - a.logicalLines;
}
export function chooseBestDuelSubmission(
  submissions: ComparableSubmission[],
  userId: string,
  acceptedOnly = false,
  language = 'TS'
) {
  return (
    submissions
      .filter((s) => s.user_id === userId && (!acceptedOnly || s.status === 'ACCEPTED'))
      .sort((a, b) => {
        if (valid(a) !== valid(b)) return valid(a) ? -1 : 1;
        if (valid(a) && valid(b)) {
          const gap = correctness(a, b);
          if (gap) return -gap;
          if (a.status === 'ACCEPTED' && b.status === 'ACCEPTED') {
            const efficiency = compareEfficiency(metrics(a, language), metrics(b, language));
            if (efficiency) return -efficiency;
          }
        }
        const outage =
          Number(b.status === 'JUDGE_UNAVAILABLE') - Number(a.status === 'JUDGE_UNAVAILABLE');
        return (
          outage || a.created_at.getTime() - b.created_at.getTime() || a.id.localeCompare(b.id)
        );
      })[0] ?? null
  );
}
export function decideDuelResolution(input: {
  first: ComparableSubmission | null;
  second: ComparableSubmission | null;
  reason: 'automatic_score' | 'deadline_score';
  language?: string;
}): DuelResolutionDecision {
  const { first, second } = input,
    language = input.language ?? 'TS';
  const comparison: Comparison = {
    criterion: 'none',
    first: first ? metrics(first, language) : null,
    second: second ? metrics(second, language) : null,
  };
  const base = {
    scoreGap: Math.abs((first?.score ?? 0) - (second?.score ?? 0)),
    runtimeGap:
      first?.runtime_ms != null && second?.runtime_ms != null
        ? Math.abs(first.runtime_ms - second.runtime_ms)
        : null,
    comparison,
  };
  const closed = (
    reason: DuelResolutionDecision['reason'],
    winnerId: string | null = null
  ): DuelResolutionDecision => ({ ...base, kind: 'closed', reason, winnerId });
  if (first?.status === 'JUDGE_UNAVAILABLE' || second?.status === 'JUDGE_UNAVAILABLE')
    return closed('judge_unavailable');
  if (!first && !second) return closed('no_submissions');
  const a = valid(first) ? first : null,
    b = valid(second) ? second : null;
  if (!a && !b) return closed('no_valid_submissions');
  if (!a || !b) {
    comparison.criterion = 'correctness';
    return closed(input.reason, (a ?? b)!.user_id);
  }
  const correctGap = correctness(a, b);
  if (correctGap) {
    comparison.criterion = 'correctness';
    return closed(input.reason, correctGap > 0 ? a.user_id : b.user_id);
  }
  if (a.status !== 'ACCEPTED' || b.status !== 'ACCEPTED') {
    comparison.criterion = 'tie';
    return closed('technical_draw');
  }
  const canonicalA = analyzeDuelSource(a.code, language).canonical,
    canonicalB = analyzeDuelSource(b.code, language).canonical;
  if (canonicalA && canonicalA === canonicalB) {
    comparison.criterion = 'identical_code';
    return { ...base, kind: 'review', winnerId: null, reason: 'identical_code' };
  }
  const ma = comparison.first!,
    mb = comparison.second!;
  if (
    ma.confidence === 'medium' &&
    mb.confidence === 'medium' &&
    complexityRank(ma.complexity) !== complexityRank(mb.complexity)
  ) {
    comparison.criterion = 'complexity';
    return closed(
      input.reason,
      complexityRank(ma.complexity) > complexityRank(mb.complexity) ? a.user_id : b.user_id
    );
  }
  if (ma.logicalLines !== mb.logicalLines) {
    comparison.criterion = 'code_size';
    return closed(input.reason, ma.logicalLines < mb.logicalLines ? a.user_id : b.user_id);
  }
  comparison.criterion = 'tie';
  return closed('technical_draw');
}
