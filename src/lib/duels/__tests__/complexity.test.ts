import { describe, expect, it } from 'vitest';
import { estimateCodeComplexity, scoreComplexity } from '../complexity';

describe('duel complexity estimate', () => {
  it.each([
    [
      'JS',
      'function solve(a,t){let left=0,right=a.length-1;while(left<=right){const mid=Math.floor((left+right)/2);if(a[mid]===t)return mid;if(a[mid]<t)left=mid+1;else right=mid-1;}return -1}',
    ],
    [
      'PYTHON',
      'def solve(a,t):\n    left=0\n    right=len(a)-1\n    while left<=right:\n        mid=(left+right)//2\n        if a[mid]==t: return mid\n        if a[mid]<t: left=mid+1\n        else: right=mid-1\n    return -1',
    ],
  ])('recognizes the shrinking interval of binary search in %s', (language, code) => {
    expect(estimateCodeComplexity(code, language as 'JS' | 'PYTHON', 'solve')).toMatchObject({
      label: 'O(log n)',
      confidence: 'medium',
    });
  });
  it.each([
    ['JS', 'function solve(a){for(const x of a) for(const y of a) console.log(x,y)}', 'O(n²)'],
    ['JS', 'function solve(a){return a.map(x=>a.map(y=>x+y))}', 'O(n²)'],
    ['PYTHON', 'def solve(a):\n    return [x+y for x in a for y in a]', 'O(n²)'],
    ['JS', 'function solve(a){const text="for while //";return a.length}', 'O(1)'],
    ['PYTHON', 'def solve(n):\n    while n>0:\n        n //= 2\n    return n', 'O(log n)'],
    ['JS', 'function solve(a){for(let i=0;i<10;i++) console.log(i);return a.length}', 'O(1)'],
    ['JS', 'function solve(a){for(const x of a) a.includes(x);return true}', 'O(n²)'],
    ['PYTHON', 'def solve(a):\n    return set(a)', 'O(n)'],
    ['JS', 'function solve(a){return opaque(a)}', 'Indeterminada'],
  ])(
    'parses %s growth without counting strings/comments as control flow',
    (language, code, label) => {
      expect(estimateCodeComplexity(code, language as 'JS' | 'PYTHON', 'solve').label).toBe(label);
    }
  );
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
