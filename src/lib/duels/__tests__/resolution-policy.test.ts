import { describe, expect, it } from 'vitest';
import {
  chooseBestDuelSubmission,
  decideDuelResolution,
  type ComparableSubmission,
} from '../resolution-policy';

function submission(
  userId: string,
  score: number,
  runtimeMs: number | null,
  status: ComparableSubmission['status'] = 'ACCEPTED',
  seconds = 0
): ComparableSubmission {
  return {
    id: `${userId}-${score}-${seconds}`,
    user_id: userId,
    code: 'function solve() {}',
    status,
    score,
    runtime_ms: runtimeMs,
    complexity: 'O(n)',
    created_at: new Date(2026, 0, 1, 0, 0, seconds),
  };
}

describe('duel resolution policy', () => {
  it.each(['COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'WRONG_ANSWER'] as const)(
    'never invents victory or human-review XP for only invalid tests (%s)',
    (status) => {
      expect(
        decideDuelResolution({
          first: submission('a', 0, 10, status),
          second: null,
          reason: 'deadline_score',
        })
      ).toMatchObject({ winnerId: null, reason: 'no_valid_submissions' });
      expect(
        decideDuelResolution({
          first: submission('a', 0, 10, status),
          second: submission('b', 0, 10, status),
          reason: 'deadline_score',
        })
      ).toMatchObject({ winnerId: null, reason: 'no_valid_submissions' });
    }
  );
  it('chooses an accepted attempt before a higher-scoring rejected attempt', () => {
    const rejected = submission('first', 900, 10, 'WRONG_ANSWER');
    const accepted = submission('first', 850, 20, 'ACCEPTED', 1);
    expect(chooseBestDuelSubmission([rejected, accepted], 'first')?.id).toBe(accepted.id);
  });

  it('sends a close score and runtime to human review', () => {
    const decision = decideDuelResolution({
      first: submission('first', 950, 100),
      second: submission('second', 947, 103),
      reason: 'automatic_score',
    });
    expect(decision).toMatchObject({ kind: 'review', reason: 'technical_tie', winnerId: null });
  });

  it('resolves a clear score advantage automatically', () => {
    const decision = decideDuelResolution({
      first: submission('first', 930, 150),
      second: submission('second', 880, 80),
      reason: 'automatic_score',
    });
    expect(decision).toMatchObject({ kind: 'closed', winnerId: 'first' });
  });

  it('closes an empty deadline without inventing a winner', () => {
    expect(
      decideDuelResolution({ first: null, second: null, reason: 'deadline_score' })
    ).toMatchObject({ kind: 'closed', winnerId: null, reason: 'no_submissions' });
  });

  it.each([null, submission('second', 950, 20)])(
    'never awards a winner when one participant could not be judged',
    (other) => {
      expect(
        decideDuelResolution({
          first: submission('first', 0, null, 'JUDGE_UNAVAILABLE'),
          second: other,
          reason: 'deadline_score',
        })
      ).toMatchObject({ kind: 'closed', winnerId: null, reason: 'judge_unavailable' });
    }
  );
});
