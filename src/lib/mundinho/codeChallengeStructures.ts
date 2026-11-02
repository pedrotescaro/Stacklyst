import 'server-only';

import { javascriptLanguage, typescriptLanguage } from '@codemirror/lang-javascript';
import { pythonLanguage } from '@codemirror/lang-python';
import { rustLanguage } from '@codemirror/lang-rust';
import { javaLanguage } from '@codemirror/lang-java';
import type { SyntaxNode } from '@lezer/common';
import type { BattleLanguage, PublicQuestion } from './types';

type Insertion = { at: number; text: string };
type Structures = {
  conditional: boolean;
  loop: boolean;
  insertions: Insertion[];
  reserved: boolean;
};
const ACTIONS = new Set([
  'andar_direita',
  'andar_esquerda',
  'coletar',
  'regar',
  'acender',
  'ativar',
  'quebrar',
  'abrir',
  'plantar',
  'curar',
  'consertar',
  'libertar',
]);
const SENSORS = new Set([
  'tem_objeto',
  'pode_andar_direita',
  'pode_andar_esquerda',
  ...Array.from(ACTIONS)
    .filter((name) => !name.startsWith('andar_'))
    .map((name) => `precisa_${name}`),
]);
const CONDITIONALS = new Set(['IfStatement', 'IfExpression']);
const LOOPS = new Set([
  'ForStatement',
  'EnhancedForStatement',
  'WhileStatement',
  'DoStatement',
  'ForExpression',
  'WhileExpression',
  'LoopExpression',
]);

function children(node: SyntaxNode) {
  const result: SyntaxNode[] = [];
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (!/Comment$/.test(child.name)) result.push(child);
  }
  return result;
}

function visit(node: SyntaxNode, callback: (node: SyntaxNode) => void) {
  callback(node);
  for (let child = node.firstChild; child; child = child.nextSibling) visit(child, callback);
}

function callName(node: SyntaxNode, source: string) {
  if (node.name !== 'CallExpression' && node.name !== 'MethodInvocation') return null;
  const expression = source
    .slice(node.from, node.to)
    .replace(/\/\/[^\r\n]*|\/\*[\s\S]*?\*\//g, ' ');
  return /^mundo\s*\.\s*([a-z_]+)\s*\(/.exec(expression)?.[1] ?? null;
}

function hasCall(node: SyntaxNode, source: string, names: Set<string>) {
  let found = false;
  visit(node, (child) => {
    const name = callName(child, source);
    if (name && names.has(name)) found = true;
  });
  return found;
}

function hasFinalElse(node: SyntaxNode): boolean {
  const parts = children(node);
  const index = parts.findIndex((child) => child.name === 'else');
  const branch = parts[index + 1];
  return index >= 0 && Boolean(branch) && (!CONDITIONALS.has(branch.name) || hasFinalElse(branch));
}

function instrumentLoopBody(body: SyntaxNode, source: string, python: boolean): Insertion[] {
  if (python) {
    const statement = children(body).find((child) => child.name !== ':');
    if (!statement) return [];
    const colon = children(body).find((child) => child.name === ':');
    const before = source.slice(colon?.to ?? body.from, statement.from);
    if (!before.includes('\n'))
      return [{ at: statement.from, text: `mundo._laco(${body.from}); ` }];
    const lineStart = source.lastIndexOf('\n', statement.from - 1) + 1;
    const indentation = source.slice(lineStart, statement.from);
    return [{ at: statement.from, text: `mundo._laco(${body.from})\n${indentation}` }];
  }
  if (source[body.from] === '{')
    return [{ at: body.from + 1, text: `\nmundo._laco(${body.from});\n` }];
  return [
    { at: body.from, text: `{mundo._laco(${body.from});` },
    { at: body.to, text: '}' },
  ];
}

function parsedStructures(language: BattleLanguage, source: string): Structures {
  const parser =
    language === 'PYTHON'
      ? pythonLanguage.parser
      : language === 'RUST'
        ? rustLanguage.parser
        : language === 'JAVA'
          ? javaLanguage.parser
          : language === 'TS'
            ? typescriptLanguage.parser
            : javascriptLanguage.parser;
  const result: Structures = { conditional: false, loop: false, insertions: [], reserved: false };
  const tree = parser.parse(source);
  visit(tree.topNode, (node) => {
    const name = callName(node, source);
    if (name === '_condicao' || name === '_laco') result.reserved = true;
    const parts = children(node);
    if (CONDITIONALS.has(node.name) && hasFinalElse(node)) {
      const condition = parts[parts.findIndex((child) => child.name === 'if') + 1];
      const branches = parts.filter(
        (child) => child !== condition && child.name !== 'if' && child.name !== 'else'
      );
      if (
        condition &&
        hasCall(condition, source, SENSORS) &&
        branches.some((branch) => hasCall(branch, source, ACTIONS)) &&
        condition.name !== 'LetCondition'
      ) {
        let from = condition.from;
        let to = condition.to;
        if (condition.name === 'ParenthesizedExpression') {
          from++;
          to--;
        }
        result.conditional = true;
        result.insertions.push({ at: from, text: 'mundo._condicao(' }, { at: to, text: ')' });
      }
    }
    if (LOOPS.has(node.name)) {
      const body =
        node.name === 'DoStatement'
          ? parts[1]
          : (parts.find((child) => child.name === 'Body') ?? parts.at(-1));
      if (body && hasCall(body, source, ACTIONS)) {
        const insertions = instrumentLoopBody(body, source, language === 'PYTHON');
        if (insertions.length) {
          result.loop = true;
          result.insertions.push(...insertions);
        }
      }
    }
  });
  return result;
}

type Token = { value: string; from: number; to: number };
/** Go's quoted strings, raw strings, runes and both comment forms are excluded before keyword analysis. */
function goTokens(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) {
      index++;
      continue;
    }
    if (source.startsWith('//', index)) {
      index = source.indexOf('\n', index + 2);
      if (index < 0) break;
      continue;
    }
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2);
      index = end < 0 ? source.length : end + 2;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      index++;
      while (index < source.length) {
        if (quote !== '`' && source[index] === '\\') {
          index += 2;
          continue;
        }
        if (source[index++] === quote) break;
      }
      continue;
    }
    const from = index;
    if (/[\p{L}_]/u.test(char)) {
      while (index < source.length && /[\p{L}\p{N}_]/u.test(source[index])) index++;
    } else index++;
    tokens.push({ value: source.slice(from, index), from, to: index });
  }
  return tokens;
}

function goStructures(source: string): Structures {
  const result: Structures = { conditional: false, loop: false, insertions: [], reserved: false };
  const tokens = goTokens(source);
  const pairs = new Map<number, number>();
  const stack: number[] = [];
  for (let index = 0; index < tokens.length; index++) {
    const value = tokens[index].value;
    if (['(', '[', '{'].includes(value)) stack.push(index);
    else if ([')', ']', '}'].includes(value)) {
      const start = stack.pop();
      if (start !== undefined && '([{'.indexOf(tokens[start].value) === ')]}'.indexOf(value))
        pairs.set(start, index);
    }
  }
  function worldCall(from: number, to: number, names: Set<string>) {
    for (let index = from; index < to - 3; index++) {
      if (
        tokens[index].value === 'mundo' &&
        tokens[index + 1].value === '.' &&
        names.has(tokens[index + 2].value) &&
        tokens[index + 3].value === '('
      )
        return true;
    }
    return false;
  }
  result.reserved = worldCall(0, tokens.length, new Set(['_condicao', '_laco']));
  function bodyAt(start: number): number | undefined {
    for (let index = start; index < tokens.length; index++) {
      const value = tokens[index].value;
      if (value === '(' || value === '[') {
        const end = pairs.get(index);
        if (end === undefined) return;
        index = end;
      } else if (value === '{') {
        const end = pairs.get(index);
        if (end === undefined) return;
        // A range expression may end with a composite literal before the loop body.
        if (tokens[end + 1]?.value === '{') {
          index = end;
          continue;
        }
        return index;
      } else if (value === '}') return;
    }
  }
  function finalElse(start: number): { from: number; to: number } | undefined {
    if (tokens[start]?.value !== 'else') return;
    const next = start + 1;
    if (tokens[next]?.value === '{') {
      const end = pairs.get(next);
      return end === undefined ? undefined : { from: next, to: end };
    }
    if (tokens[next]?.value === 'if') {
      const body = bodyAt(next + 1);
      if (body === undefined) return;
      const end = pairs.get(body);
      return end === undefined ? undefined : finalElse(end + 1);
    }
  }
  for (let index = 0; index < tokens.length; index++) {
    const value = tokens[index].value;
    if (value !== 'if' && value !== 'for') continue;
    const body = bodyAt(index + 1);
    if (body === undefined) continue;
    const end = pairs.get(body);
    if (end === undefined) continue;
    if (value === 'for' && worldCall(body + 1, end, ACTIONS)) {
      result.loop = true;
      result.insertions.push({
        at: tokens[body].to,
        text: `\nmundo._laco(${tokens[body].from});\n`,
      });
    } else if (value === 'if') {
      const alternative = finalElse(end + 1);
      if (
        !alternative ||
        !worldCall(index + 1, body, SENSORS) ||
        !(worldCall(body + 1, end, ACTIONS) || worldCall(end + 1, alternative.to, ACTIONS))
      )
        continue;
      let condition = index + 1;
      for (let part = condition; part < body; part++) {
        if (tokens[part].value === '(' || tokens[part].value === '[') {
          part = pairs.get(part) ?? body;
        } else if (tokens[part].value === ';') condition = part + 1;
      }
      if (condition >= body) continue;
      result.conditional = true;
      result.insertions.push(
        { at: tokens[condition].from, text: 'mundo._condicao(' },
        { at: tokens[body - 1].to, text: ')' }
      );
    }
  }
  return result;
}

/** Parse real control flow on the server; instrumentation is observed by the isolated runtime. */
export function instrumentChallengeSource(
  language: BattleLanguage,
  source: string,
  question: PublicQuestion
): { source: string; error?: string } {
  const required = question.code?.requiredStructures ?? [];
  if (!required.length) return { source };
  const structures = language === 'GO' ? goStructures(source) : parsedStructures(language, source);
  if (structures.reserved || /__mundinho_(?:condicional|laco)__/.test(source))
    return {
      source,
      error: 'Use os comandos e sensores públicos do mundo; os marcadores internos são reservados.',
    };
  if (required.includes('conditional') && !structures.conditional)
    return { source, error: 'Use if e else com um sensor do mundo para decidir uma ação.' };
  if (required.includes('loop') && !structures.loop)
    return {
      source,
      error: 'Use um laço for ou while (ou loop no Rust) para repetir as ações do mundo.',
    };
  let instrumented = source;
  for (const insertion of structures.insertions.sort((left, right) => right.at - left.at)) {
    instrumented =
      instrumented.slice(0, insertion.at) + insertion.text + instrumented.slice(insertion.at);
  }
  return { source: instrumented };
}
