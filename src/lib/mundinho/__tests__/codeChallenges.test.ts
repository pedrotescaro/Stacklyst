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
import { instrumentChallengeSource } from '../codeChallengeStructures';
import { challengeSolution } from './codeChallengeSolutions';

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

  it.each(languages)(
    'selects stable level-specific requirements and preserves old ids in %s',
    (language) => {
      const basic = codeChallenges(language);
      for (const level of [2, 3]) {
        const questions = codeChallenges(language, level);
        expect(questions).toHaveLength(basic.length);
        expect(questions[0].code!.level).toBe(level);
        expect(questions[0].code!.requiredStructures).toEqual(
          level === 2 ? ['conditional'] : ['conditional', 'loop']
        );
        expect(questions[0].code!.commands).toContain('mundo.precisa_coletar()');
        expect(questions[0].code!.hint).toBeTruthy();
        for (const question of questions) {
          expect(codeChallenge(language, question.id)).toEqual(question);
          expect(evaluateTrace(solve(question).join('\n'), question).passed).toBe(false);
        }
        expect(codeChallenge(language, undefined, level)).toEqual(questions[0]);
        expect(codeChallenge(language, basic[0].id, level)).toEqual(basic[0]);
      }
      if (language !== 'HTML' && language !== 'CSS') {
        const legacy = codeChallenge(language, `code-crystals-${language}`, 3)!;
        expect(legacy.code!.requiredStructures).toEqual([]);
        expect(evaluateTrace(solve(legacy).join('\n'), legacy).passed).toBe(true);
      }
    }
  );

  it.each(['JS', 'TS', 'HTML', 'CSS'] as const)(
    'executes level-two and level-three solutions with real board sensors in %s',
    async (language) => {
      for (const level of [2, 3]) {
        for (const slug of ['cristais', 'ponte', 'expedicao', 'trilha-invertida']) {
          const question = codeChallenges(language, level).find((entry) =>
            entry.id.includes(`-${slug}-`)
          )!;
          const prepared = instrumentChallengeSource(
            language,
            challengeSolution(question, language),
            question
          );
          expect(prepared.error, question.id).toBeUndefined();
          const execution = await executeCode(
            challengeProgram(language, prepared.source, question),
            challengeExecutionLanguage(language)
          );
          expect(execution.ok, execution.error).toBe(true);
          const result = evaluateTrace(execution.output, question);
          expect(result.passed, `${question.id}: ${result.error}`).toBe(true);
          expect(result.trace.some((line) => line.startsWith('__mundinho'))).toBe(false);
        }
      }
    },
    60000
  );

  it.skipIf(spawnSync('python', ['--version']).status !== 0)(
    'runs both advanced tiers with real Python sensors',
    () => {
      for (const level of [2, 3]) {
        for (const question of codeChallenges('PYTHON', level)) {
          const prepared = instrumentChallengeSource(
            'PYTHON',
            challengeSolution(question, 'PYTHON'),
            question
          );
          expect(prepared.error, question.id).toBeUndefined();
          const run = spawnSync(
            'python',
            ['-c', challengeProgram('PYTHON', prepared.source, question)],
            { encoding: 'utf8' }
          );
          expect(run.status, `${question.id}: ${run.stderr}`).toBe(0);
          const result = evaluateTrace(run.stdout, question);
          expect(result.passed, `${question.id}: ${result.error}`).toBe(true);
        }
      }
    },
    60000
  );

  it.skipIf(spawnSync('rustc', ['--version']).status !== 0)(
    'compiles both advanced tiers with real Rust sensors',
    () => {
      const directory = mkdtempSync(join(tmpdir(), 'mundinho-rust-structures-'));
      try {
        for (const level of [2, 3]) {
          const question = codeChallenges('RUST', level).find((entry) =>
            entry.id.includes('-expedicao-')
          )!;
          const prepared = instrumentChallengeSource(
            'RUST',
            challengeSolution(question, 'RUST'),
            question
          );
          expect(prepared.error).toBeUndefined();
          const input = join(directory, 'main.rs');
          const output = join(directory, process.platform === 'win32' ? 'main.exe' : 'main');
          writeFileSync(input, challengeProgram('RUST', prepared.source, question));
          const compiled = spawnSync('rustc', [input, '-o', output], { encoding: 'utf8' });
          expect(compiled.status, compiled.stderr).toBe(0);
          const run = spawnSync(output, [], { encoding: 'utf8' });
          expect(run.status, run.stderr).toBe(0);
          expect(evaluateTrace(run.stdout, question).passed).toBe(true);
        }
      } finally {
        for (const entry of readdirSync(directory)) rmSync(join(directory, entry), { force: true });
        rmdirSync(directory);
      }
    },
    30000
  );

  it('requires a reached condition and repeated loop actions instead of inert syntax', () => {
    const question = codeChallenges('JS', 3)[0];
    const solution = source(solve(question), 'JS');
    const inert = `if (false) { if (mundo.tem_objeto()) { mundo.coletar(); } else { mundo.andar_direita(); } while (false) { mundo.andar_direita(); } }\n${solution}`;
    const prepared = instrumentChallengeSource('JS', inert, question);
    expect(prepared.error).toBeUndefined();
    return executeCode(challengeProgram('JS', prepared.source, question), 'JS').then(
      (execution) => {
        expect(execution.ok).toBe(true);
        expect(evaluateTrace(execution.output, question).passed).toBe(false);
        expect(
          evaluateTrace(
            `__mundinho_condicional__\n__mundinho_laco__\n__mundinho_laco__\n${solve(question).join('\n')}`,
            question
          ).passed
        ).toBe(false);
      }
    );
  });
  it('does not count two different one-iteration loops as a repeated loop', async () => {
    const question = codeChallenges('JS', 3)[0];
    const source = `if (mundo.tem_objeto()) { mundo.coletar(); } else {}
for (let i = 0; i < 1; i++) { mundo.andar_direita(); mundo.coletar(); }
for (let i = 0; i < 1; i++) { mundo.andar_direita(); mundo.coletar(); mundo.andar_direita(); mundo.coletar(); }`;
    const prepared = instrumentChallengeSource('JS', source, question);
    expect(prepared.error).toBeUndefined();
    const execution = await executeCode(challengeProgram('JS', prepared.source, question), 'JS');
    expect(execution.ok).toBe(true);
    const result = evaluateTrace(execution.output, question);
    expect(result.passed).toBe(false);
    expect(result.error).toContain('pelo menos duas iterações');
  });
});
