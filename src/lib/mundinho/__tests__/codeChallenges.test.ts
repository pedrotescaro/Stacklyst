import { describe, expect, it } from 'vitest';
import { challengeProgram, codeChallenge, evaluateTrace } from '../codeChallenges';
import { executeCode } from '../../code-execution/server';

describe('Clareira dos cristais', () => {
  it.each(['JS', 'TS'] as const)(
    'executes a real %s loop in the isolated runtime',
    async (language) => {
      const challenge = codeChallenge(language)!;
      const starter = await executeCode(
        challengeProgram(language, challenge.code!.starter),
        language
      );
      expect(starter.ok).toBe(true);
      expect(evaluateTrace(starter.output).passed).toBe(false);
      const solution = challenge.code!.starter.replace(
        '// Colete o cristal aqui',
        'mundo.coletar();'
      );
      const result = await executeCode(challengeProgram(language, solution), language);
      expect(result.ok).toBe(true);
      expect(evaluateTrace(result.output)).toEqual({
        passed: true,
        trace: ['andar', 'coletar', 'andar', 'coletar', 'andar', 'coletar'],
      });
    },
    20000
  );
  it('rejects repeated collection, overshooting, excessive output and unrelated stdout', () => {
    for (const trace of [
      'coletar',
      'andar\ncoletar\ncoletar',
      'andar\nandar\nandar\nandar',
      'andar\n'.repeat(30),
      'true',
    ])
      expect(evaluateTrace(trace).passed).toBe(false);
  });
});
