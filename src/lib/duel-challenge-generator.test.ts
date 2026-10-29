import { describe, expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import { CHALLENGE_LIBRARY, generateProceduralDuelProblem } from './duel-challenge-generator';
import { EXTRA_DUEL_CHALLENGES } from './duel-extra-challenges';
import { getTrustedDuelProblem } from './duels/problems';
const solutions: Record<string, string> = {
  'vowel-tally': `function countVowels(s){return (s.match(/[aeiou]/gi)||[]).length}`,
  'unique-sorted': `function uniqueSorted(a){return [...new Set(a)].sort((a,b)=>a-b)}`,
  'rotate-array': `function rotateArray(a,k){if(!a.length)return [];k%=a.length;return k?[...a.slice(-k),...a.slice(0,-k)]:a}`,
  'chunk-array': `function chunkArray(a,n){const out=[];for(let i=0;i<a.length;i+=n)out.push(a.slice(i,i+n));return out}`,
  'prefix-sums': `function prefixSums(a){let total=0;return a.map(x=>total+=x)}`,
  'matrix-transpose': `function transpose(a){return a.length?a[0].map((_,i)=>a.map(row=>row[i])):[]}`,
  'balanced-depth': `function maxDepth(s){let n=0,max=0;for(const ch of s){n+=ch==='('?1:-1;max=Math.max(max,n)}return max}`,
  'longest-increasing': `function lisLength(a){let d=a.map(()=>1);for(let i=0;i<a.length;i++)for(let j=0;j<i;j++)if(a[j]<a[i])d[i]=Math.max(d[i],d[j]+1);return Math.max(0,...d)}`,
  'edit-distance': `function editDistance(a,b){let d=Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i?j?0:i:j));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}`,
  'min-coins': `function minCoins(coins,n){const d=Array(n+1).fill(Infinity);d[0]=0;for(let i=1;i<=n;i++)for(const c of coins)if(c<=i)d[i]=Math.min(d[i],d[i-c]+1);return Number.isFinite(d[n])?d[n]:-1}`,
};
describe('Expanded duel challenges', () => {
  for (const problem of EXTRA_DUEL_CHALLENGES)
    it(`evaluates and resolves ${problem.id}`, () => {
      expect(getTrustedDuelProblem(problem.id + '-generated')?.title).toBe(problem.title);
      for (const test of problem.testCases) {
        expect(
          runInNewContext(
            solutions[problem.id] + ';' + test.testExpression.JS,
            {},
            { timeout: 1000 }
          )
        ).toBe(true);
        expect(test.testExpression.TS).toBe(test.testExpression.JS);
      }
    });
  it.each(['Fácil', 'Médio', 'Difícil'] as const)('exhausts %s before repeating', (difficulty) => {
    const count = CHALLENGE_LIBRARY.filter((c) => c.difficulty === difficulty).length;
    const ids: string[] = [];
    const titles = new Set<string>();
    for (let i = 0; i < count; i++) {
      const p = generateProceduralDuelProblem('TS', difficulty, undefined, ids);
      ids.push(p.id);
      titles.add(p.title);
    }
    expect(titles.size).toBe(count);
  });
});
