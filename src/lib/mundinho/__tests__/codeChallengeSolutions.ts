import { challengeExecutionLanguage } from '../codeChallenges';
import type { BattleLanguage, PublicQuestion } from '../types';

function call(language: BattleLanguage, name: string) {
  return `mundo.${name}()${language === 'GO' || language === 'PYTHON' ? '' : ';'}`;
}

function conditional(language: BattleLanguage, action: string) {
  if (language === 'PYTHON')
    return `if mundo.precisa_${action}():\n    mundo.${action}()\nelse:\n    pass`;
  if (language === 'RUST' || language === 'GO')
    return `if mundo.precisa_${action}() {\n    ${call(language, action)}\n} else {\n}`;
  return `if (mundo.precisa_${action}()) {\n    ${call(language, action)}\n} else {\n}`;
}

function whileLoop(language: BattleLanguage, sensor: string, body: string) {
  const indented = body
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n');
  if (language === 'PYTHON') return `while mundo.${sensor}():\n${indented}`;
  if (language === 'GO') return `for mundo.${sensor}() {\n${indented}\n}`;
  if (language === 'RUST') return `while mundo.${sensor}() {\n${indented}\n}`;
  return `while (mundo.${sensor}()) {\n${indented}\n}`;
}

/** Independent example solver: level two visits each target; level three sweeps the board. */
export function challengeSolution(question: PublicQuestion, requestedLanguage: BattleLanguage) {
  const language = challengeExecutionLanguage(requestedLanguage);
  const board = question.code!;
  const usedActions = [
    ...new Set(board.tiles.flatMap((tile) => (tile.action ? [tile.action] : []))),
  ];
  if (board.level === 3) {
    const check = usedActions.map((action) => conditional(language, action)).join('\n');
    return [
      whileLoop(language, 'pode_andar_esquerda', call(language, 'andar_esquerda')),
      whileLoop(language, 'pode_andar_direita', `${check}\n${call(language, 'andar_direita')}`),
      check,
    ].join('\n');
  }
  let position = board.start;
  const source: string[] = [];
  for (let target = 0; target < board.tiles.length; target++) {
    const action = board.tiles[target].action;
    if (!action) continue;
    while (position > target) {
      source.push(call(language, 'andar_esquerda'));
      position--;
    }
    while (position < target) {
      source.push(call(language, 'andar_direita'));
      position++;
    }
    source.push(conditional(language, action));
  }
  return source.join('\n');
}
