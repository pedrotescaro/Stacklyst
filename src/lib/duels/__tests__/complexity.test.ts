import { describe, expect, it } from 'vitest';
import { estimateCodeComplexity, scoreComplexity } from '../complexity';

describe('duel complexity estimate', () => {
  it('detects a dominant linear pass', () => {
    const result = estimateCodeComplexity(
      'function solve(items: number[]) { for (const item of items) { console.log(item); } }',
      'TS',
      'solve'
    );
    expect(result.label).toBe('O(n)');
  });

  it('detects nested loops and sorting', () => {
    expect(
      estimateCodeComplexity(
        'function solve(a) { for (const x of a) { for (const y of a) { x === y; } } }',
        'JS',
        'solve'
      ).label
    ).toBe('O(n²)');
    expect(
      estimateCodeComplexity('def solve(a):\n    return sorted(a)', 'PYTHON', 'solve').label
    ).toBe('O(n log n)');
  });

  it('awards less efficiency score as the estimate drifts from the expected class', () => {
    expect(scoreComplexity('O(n)', 'O(n)')).toBe(200);
    expect(scoreComplexity('O(n log n)', 'O(n)')).toBe(140);
    expect(scoreComplexity('O(n²)', 'O(n)')).toBe(70);
  });
});
