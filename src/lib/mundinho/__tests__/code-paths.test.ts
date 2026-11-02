import { describe, expect, it } from 'vitest';
import { codeChallenges, replayTrace } from '../codeChallenges';
import { codePathInfo } from '../code-paths';

describe('visible challenge paths', () => {
  it('distinguishes the one-step start from the two-step gap in the nursery', () => {
    const question = codeChallenges('TS').find((entry) => entry.id.includes('viveiro'))!;
    expect(codePathInfo(question, 0)).toEqual({ kind: 'short', steps: 1 });
    expect(codePathInfo(question, 3)).toEqual({ kind: 'long', steps: 2 });
    expect(codePathInfo(question, 2)).toBeNull();
    expect(replayTrace(question, ['andar', 'regar', 'andar', 'curar', 'andar']).position).toBe(3);
    expect(
      replayTrace(question, ['andar', 'regar', 'andar', 'curar', 'andar', 'andar']).position
    ).toBe(4);
  });

  it('reports a three-step segment without adding a movement penalty to each tile', () => {
    const question = codeChallenges('PYTHON').find((entry) => entry.id.includes('pomar'))!;
    expect(codePathInfo(question, 2)).toEqual({ kind: 'long', steps: 3 });
    expect(codePathInfo(question, 3)).toEqual({ kind: 'long', steps: 3 });
    expect(replayTrace(question, ['andar', 'andar', 'andar', 'andar']).position).toBe(4);
  });

  it('supports a start in the middle and reverse routes', () => {
    const bridge = codeChallenges('JS').find((entry) => entry.id.includes('ponte'))!;
    expect(codePathInfo(bridge, 2)).toEqual({ kind: 'long', steps: 2 });
    expect(codePathInfo(bridge, 1)).toEqual({ kind: 'long', steps: 2 });
    const reverse = codeChallenges('JS').find((entry) => entry.id.includes('trilha-invertida'))!;
    expect(codePathInfo(reverse, 4)).toEqual({ kind: 'short', steps: 1 });
    expect(codePathInfo(reverse, 2)).toEqual({ kind: 'long', steps: 2 });
  });
});
