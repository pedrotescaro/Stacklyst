import { describe, it, expect } from 'vitest';
import {
  chooseBestDuelSubmission,
  decideDuelResolution,
  type ComparableSubmission,
} from '../resolution-policy';
import { analyzeDuelSource } from '../source-analysis';
const linear = 'function solve(a) { let result=0; for(const x of a) result+=x; return result; }';
const quadratic =
  'function solve(a) { let result=0; for(const x of a) for(const y of a) result+=x+y; return result; }';
function submission(
  user_id: string,
  code = linear,
  extra: Partial<ComparableSubmission> = {}
): ComparableSubmission {
  return {
    id: user_id,
    user_id,
    code,
    status: 'ACCEPTED',
    passed_tests: 5,
    total_tests: 5,
    score: 1000,
    runtime_ms: 100,
    complexity: 'O(1)',
    created_at: new Date('2026-11-02T12:00:00Z'),
    ...extra,
  };
}
function decide(a: ComparableSubmission | null, b: ComparableSubmission | null, language = 'TS') {
  return decideDuelResolution({ first: a, second: b, language, reason: 'automatic_score' });
}
describe('ordered duel judging policy', () => {
  it('prioritizes accepted correctness over higher legacy scores, speed and brevity', () => {
    const partial = submission('b', 'function solve(){return 1}', {
      status: 'WRONG_ANSWER',
      passed_tests: 4,
      score: 9999,
      runtime_ms: 1,
    });
    expect(
      decide(submission('a', quadratic, { score: 700, runtime_ms: 1000 }), partial)
    ).toMatchObject({ kind: 'closed', winnerId: 'a', comparison: { criterion: 'correctness' } });
    expect(
      chooseBestDuelSubmission([partial, { ...submission('b'), id: 'accepted', score: 700 }], 'b')
        ?.id
    ).toBe('accepted');
  });
  it.each(['TS', 'JS', 'PYTHON'])(
    'makes lower supported Big-O win in %s despite legacy runtime/score differences',
    (language) => {
      const a =
        language === 'PYTHON'
          ? 'def solve(a):\n    total=0\n    for x in a:\n        total+=x\n    return total'
          : linear;
      const b =
        language === 'PYTHON'
          ? 'def solve(a):\n    total=0\n    for x in a:\n        for y in a:\n            total+=x+y\n    return total'
          : quadratic;
      const first = submission('a', a, { score: 800, runtime_ms: 5000 }),
        second = submission('b', b, { score: 999, runtime_ms: 1 });
      expect(decide(first, second, language)).toMatchObject({
        kind: 'closed',
        winnerId: 'a',
        comparison: { criterion: 'complexity' },
      });
      expect(decide(second, first, language).winnerId).toBe('a');
    }
  );
  it('uses useful lines after equal complexity, without rewarding minification', () => {
    const short = submission('a', 'function solve(a){return a.reduce((x,y)=>x+y,0)}');
    const long = submission('b', linear);
    expect(decide(short, long)).toMatchObject({
      winnerId: 'a',
      comparison: { criterion: 'code_size' },
    });
    const pretty = '// notes\nfunction solve(a) {\n\n return a.reduce((x,y) => x+y,0);\n}\n';
    expect(analyzeDuelSource(pretty).logicalLines).toBe(analyzeDuelSource(short.code).logicalLines);
    expect(decide(short, submission('b', pretty))).toMatchObject({
      kind: 'review',
      reason: 'identical_code',
    });
  });
  it('automatically draws different equivalent-sized solutions even with close scores and runtime', () => {
    const a = submission('a', 'function solve(a){return a+1}', { score: 950, runtime_ms: 100 });
    const b = submission('b', 'function solve(a){return 1+a}', { score: 947, runtime_ms: 103 });
    expect(decide(a, b)).toMatchObject({
      kind: 'closed',
      winnerId: null,
      reason: 'technical_draw',
    });
  });
  it('reviews exact accepted syntax only and preserves string content and Python block structure', () => {
    expect(decide(submission('a'), submission('b'))).toMatchObject({
      kind: 'review',
      reason: 'identical_code',
    });
    expect(analyzeDuelSource('function solve(){return "a b"}').canonical).not.toBe(
      analyzeDuelSource('function solve(){return "ab"}').canonical
    );
    const a = 'def solve(a):\n    if a:\n        return 1\n    return 0';
    const b = 'def solve(a):\n    if a:\n        return 1\n        return 0';
    expect(analyzeDuelSource(a, 'PYTHON').canonical).not.toBe(
      analyzeDuelSource(b, 'PYTHON').canonical
    );
    expect(analyzeDuelSource('// only a comment').canonical).toBeNull();
  });
  it('uses test coverage alone for partial submissions, never estimated Big-O or manual review', () => {
    const a = submission('a', linear, { status: 'WRONG_ANSWER', passed_tests: 4 });
    const b = submission('b', linear, { status: 'WRONG_ANSWER', passed_tests: 3 });
    expect(decide(a, b)).toMatchObject({ kind: 'closed', winnerId: 'a' });
    expect(decide(a, { ...b, passed_tests: 4 })).toMatchObject({
      kind: 'closed',
      winnerId: null,
      reason: 'technical_draw',
    });
  });
  it('does not mistake an opaque helper for a fast O(1) solution', () => {
    const result = decide(
      submission('a', 'function solve(a){return externalHelper(a)}'),
      submission('b', quadratic)
    );
    expect(result.comparison.criterion).toBe('code_size');
    expect(result.comparison.first?.confidence).toBe('low');
  });
  it('chooses the best attempt with the same policy used between participants', () => {
    const fast = submission('a', linear, { id: 'linear', runtime_ms: 1000, score: 800 }),
      slow = submission('a', quadratic, { id: 'quadratic', runtime_ms: 1, score: 999 });
    expect(chooseBestDuelSubmission([slow, fast], 'a')?.id).toBe('linear');
    expect(chooseBestDuelSubmission([fast, slow], 'a')?.id).toBe('linear');
  });
  it.each(['COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'WRONG_ANSWER'] as const)(
    'never awards XP or manual review for two invalid attempts (%s)',
    (status) => {
      expect(
        decide(submission('a', linear, { status, score: 0, passed_tests: 0 }), null)
      ).toMatchObject({ kind: 'closed', winnerId: null, reason: 'no_valid_submissions' });
    }
  );
  it('does not invent a winner for empty deadlines or provider outages', () => {
    expect(decide(null, null).reason).toBe('no_submissions');
    expect(
      decide(submission('a', linear, { status: 'JUDGE_UNAVAILABLE' }), submission('b'))
    ).toMatchObject({ winnerId: null, reason: 'judge_unavailable' });
  });
});
