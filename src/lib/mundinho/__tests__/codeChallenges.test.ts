import { describe, expect, it } from 'vitest';
import {
  challengeExecutionLanguage,
  challengeProgram,
  codeChallenge,
  codeChallenges,
  evaluateTrace,
  replayTrace,
} from '../codeChallenges';
import type { BattleLanguage, PublicQuestion } from '../types';
import { executeCode } from '../../code-execution/server';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function solve(question: PublicQuestion) {
  const board = question.code!;
  let position = board.start;
  const commands: string[] = [];
  for (let target = 0; target < board.tiles.length; target++) {
    const action = board.tiles[target].action;
    if (!action) continue;
    while (position < target) {
      commands.push('andar');
      position++;
    }
    while (position > target) {
      commands.push('voltar');
      position--;
    }
    commands.push(action);
  }
  return commands;
}
function source(trace: string[], language: BattleLanguage) {
  return trace
    .map(
      (action) =>
        `mundo.${action === 'andar' ? 'andar_direita' : action === 'voltar' ? 'andar_esquerda' : action}()${language === 'PYTHON' || language === 'GO' ? '' : ';'}`
    )
    .join('\n');
}

describe('Desafios de código do Mundinho', () => {
  const languages: BattleLanguage[] = ['PYTHON', 'JS', 'TS', 'RUST', 'GO', 'JAVA', 'HTML', 'CSS'];
  it.each(languages)(
    'has at least 20 distinct solvable boards and stable ids for %s',
    (language) => {
      const questions = codeChallenges(language);
      expect(questions.length).toBeGreaterThanOrEqual(20);
      expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
      expect(
        new Set(
          questions.map((q) => JSON.stringify([q.code!.start, q.code!.tiles.map((t) => t.action)]))
        ).size
      ).toBeGreaterThanOrEqual(20);
      for (const question of questions) {
        expect(codeChallenge(language, question.id)).toEqual(question);
        expect(evaluateTrace(solve(question).join('\n'), question).passed, question.id).toBe(true);
        expect(question.code!.language).toBe(challengeExecutionLanguage(language));
      }
    }
  );
  it.each(['JS', 'TS'] as const)(
    'executes every scenario through the isolated %s runtime',
    async (language) => {
      for (const question of codeChallenges(language)) {
        const execution = await executeCode(
          challengeProgram(language, source(solve(question), language)),
          language
        );
        expect(execution.ok, question.id).toBe(true);
        expect(evaluateTrace(execution.output, question).passed, question.id).toBe(true);
      }
    },
    60000
  );
  it.skipIf(spawnSync('python', ['--version']).status !== 0)(
    'runs all scenarios with a local Python interpreter when available',
    () => {
      for (const question of codeChallenges('PYTHON')) {
        const program = challengeProgram('PYTHON', source(solve(question), 'PYTHON'));
        const run = spawnSync('python', ['-c', program], { encoding: 'utf8' });
        expect(run.status, `${question.id}: ${run.stderr}`).toBe(0);
        expect(evaluateTrace(run.stdout, question).passed, question.id).toBe(true);
      }
    }
  );
  it.skipIf(spawnSync('rustc', ['--version']).status !== 0)(
    'compiles and runs a mixed-action scenario with Rust when available',
    () => {
      const directory = mkdtempSync(join(tmpdir(), 'mundinho-rust-'));
      try {
        const question = codeChallenges('RUST').find((entry) => entry.id.includes('expedicao'))!;
        const input = join(directory, 'main.rs');
        const output = join(directory, process.platform === 'win32' ? 'main.exe' : 'main');
        writeFileSync(input, challengeProgram('RUST', source(solve(question), 'RUST')));
        const compiled = spawnSync('rustc', [input, '-o', output], { encoding: 'utf8' });
        expect(compiled.status, compiled.stderr).toBe(0);
        const run = spawnSync(output, [], { encoding: 'utf8' });
        expect(run.status, run.stderr).toBe(0);
        expect(evaluateTrace(run.stdout, question).passed).toBe(true);
      } finally {
        for (const entry of readdirSync(directory)) rmSync(join(directory, entry), { force: true });
        rmdirSync(directory);
      }
    },
    30000
  );
  it('accepts alternative valid routes and replays the partial trace', () => {
    const question = codeChallenges('JS')[3];
    const trace = ['andar', 'andar', 'ativar', 'voltar', 'voltar', 'voltar', 'voltar', 'ativar'];
    expect(evaluateTrace(trace.join('\n'), question).passed).toBe(true);
    expect(replayTrace(question, trace.slice(0, 3))).toEqual({ position: 4, completed: [4] });
  });
  it('rejects wrong actions, duplicate actions, leaving the board and unrelated output', () => {
    const question = codeChallenges('JS')[0];
    for (const trace of [
      'coletar',
      'andar\nregar',
      'andar\ncoletar\ncoletar',
      'voltar',
      'andar\n'.repeat(50),
      'true',
    ])
      expect(evaluateTrace(trace, question).passed, trace).toBe(false);
  });
  it.each(['JS', 'TS'] as const)(
    'resumes old crystal challenges in %s',
    async (language) => {
      const question = codeChallenge(language, `code-crystals-${language}`)!;
      const starter = await executeCode(
        challengeProgram(language, question.code!.starter),
        language
      );
      expect(starter.ok).toBe(true);
      expect(evaluateTrace(starter.output, question).passed).toBe(false);
      const solution = question.code!.starter.replace(
        '// Colete o cristal aqui',
        'mundo.coletar();'
      );
      const result = await executeCode(challengeProgram(language, solution), language);
      expect(result.ok).toBe(true);
      expect(evaluateTrace(result.output, question).passed).toBe(true);
    },
    20000
  );
  it('uses JavaScript explicitly for HTML and CSS courses', () => {
    for (const language of ['HTML', 'CSS'] as const) {
      expect(challengeExecutionLanguage(language)).toBe('JS');
      expect(codeChallenges(language)[0].code!.language).toBe('JS');
    }
  });
});
