import type { Language } from '@prisma/client';
import type { SyntaxNode } from '@lezer/common';
import { duelSourceTree } from './source-analysis';

export type ComplexityClass =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n³)'
  | 'O(2ⁿ)'
  | 'Indeterminada';
const RANK: Record<ComplexityClass, number> = {
  'O(1)': 6,
  'O(log n)': 5,
  'O(n)': 4,
  'O(n log n)': 3,
  'O(n²)': 2,
  'O(n³)': 1,
  'O(2ⁿ)': 0,
  Indeterminada: -1,
};
export function complexityRank(label: ComplexityClass) {
  return RANK[label];
}
export interface ComplexityEstimate {
  label: ComplexityClass;
  confidence: 'medium' | 'low';
  reason: string;
}

/** Structural upper-bound heuristic, never a formal Big-O proof. Parse real syntax
 * (including unbraced loops, comprehensions and strings containing comment signs).
 * Opaque calls/recursion stay low confidence and cannot decide a duel by Big-O. */
export function estimateCodeComplexity(
  source: string,
  language: Language,
  functionName: string
): ComplexityEstimate {
  const tree = duelSourceTree(source, language);
  // Mask comments and literals before inspecting loop bounds; floor division in
  // Python remains an operator, and strings such as "n /= 2" prove nothing.
  const masked = source.split('');
  tree.iterate({
    enter(node) {
      if (/Comment$|String$|TemplateString$|RegExp$/.test(node.name)) {
        for (let index = node.from; index < node.to; index++)
          if (masked[index] !== '\n') masked[index] = ' ';
        return false;
      }
    },
  });
  const structuralSource = masked.join('');
  let maximum = 0,
    sort = false,
    log = false,
    uncertain = false,
    recursive = 0;
  const names = new Set(
    [...structuralSource.matchAll(/\b(?:def|function)\s+(\w+)\s*\(/g)].map((match) => match[1])
  );
  if (functionName) names.add(functionName);
  const linear = new Set([
    'reverse',
    'includes',
    'indexOf',
    'join',
    'split',
    'slice',
    'some',
    'every',
    'map',
    'filter',
    'reduce',
    'forEach',
    'find',
    'findIndex',
    'repeat',
    'sum',
    'max',
    'min',
    'set',
    'list',
    'tuple',
    'Counter',
    'any',
    'all',
    'reversed',
  ]);
  const constant = new Set([
    'len',
    'range',
    'enumerate',
    'zip',
    'abs',
    'int',
    'float',
    'bool',
    'str',
    'Number',
    'String',
    'Boolean',
    'parseInt',
    'parseFloat',
    'get',
    'set',
    'has',
    'add',
    'push',
    'pop',
    'append',
    'isArray',
  ]);
  function text(node: SyntaxNode) {
    return source.slice(node.from, node.to);
  }
  function walk(node: SyntaxNode, depth: number) {
    if (node.type.isError) {
      uncertain = true;
      return;
    }
    if (/Comment$|String$|TemplateString$/.test(node.name)) return;
    const loop = [
      'ForStatement',
      'ForInStatement',
      'ForOfStatement',
      'WhileStatement',
      'DoStatement',
    ].includes(node.name);
    if (loop) {
      const body = node.getChild('Body') ?? node.getChild('Block');
      const header = structuralSource.slice(node.from, body?.from ?? node.to);
      // Literal range/bounds are constant only when the whole bound is literal.
      const fixed =
        /\brange\(\s*\d+\s*\)/.test(header) ||
        /\bfor\s*\(\s*(?:let|var|const)?\s*(\w+)\s*=\s*\d+\s*;\s*\1\s*[<]=?\s*\d+\s*;/.test(header);
      const raw = structuralSource.slice(node.from, node.to);
      const driver = header.match(/\bwhile\s*\(?\s*(\w+)\s*[><!]/)?.[1];
      const halves = Boolean(
        driver &&
        !/\bif\b/.test(raw) &&
        new RegExp(
          `\\b${driver}\\s*(?:\\/\\/|\\/|>>)=\\s*[2-9]|\\b${driver}\\s*=\\s*(?:Math\\.floor\\()?\\s*${driver}\\s*\\/\\/?\\s*[2-9]`
        ).test(raw)
      );
      const bounds = header.match(/\bwhile\s*\(?\s*(\w+)\s*<=?\s*(\w+)\s*\)?\s*(?:[:{]|$)/);
      let binarySearch = false;
      if (bounds) {
        const [, left, right] = bounds;
        const midpoint = raw.match(
          new RegExp(
            `\\b(\\w+)\\s*=\\s*(?:Math\\.floor\\s*\\()?\\s*\\(?\\s*${left}\\s*\\+\\s*${right}\\s*\\)?\\s*\\/\\/?\\s*2`
          )
        )?.[1];
        binarySearch = Boolean(
          midpoint &&
          new RegExp(`\\b${left}\\s*=\\s*${midpoint}\\s*\\+\\s*1`).test(raw) &&
          new RegExp(`\\b${right}\\s*=\\s*${midpoint}\\s*-\\s*1`).test(raw)
        );
      }
      if (halves || binarySearch) {
        if (depth === 0) log = true;
        else uncertain = true;
      } else if (!fixed) {
        depth++;
        if (
          node.name === 'WhileStatement' &&
          (!driver ||
            !new RegExp(
              `\\b${driver}\\s*(?:\\+\\+|--|[+-]=\\s*\\d+)|\\b${driver}\\s*=\\s*${driver}\\s*[+-]\\s*\\d+`
            ).test(raw))
        )
          uncertain = true;
      }
      maximum = Math.max(maximum, depth);
    }
    if (/ComprehensionExpression$/.test(node.name)) {
      let loops = 0;
      for (let child = node.firstChild; child; child = child.nextSibling)
        if (child.name === 'for') loops++;
      depth += loops;
      maximum = Math.max(maximum, depth);
    }
    if (node.name === 'CallExpression') {
      const callee = node.firstChild ? text(node.firstChild) : '';
      const name = callee.split('.').at(-1) ?? '';
      if (names.has(callee)) {
        recursive++;
        uncertain = true;
      } else if (name === 'sort' || callee === 'sorted') {
        sort = true;
        maximum = Math.max(maximum, depth + 1);
        if (depth > 0) uncertain = true;
      } else if (linear.has(name) && (!constant.has(name) || callee === 'set'))
        maximum = Math.max(maximum, depth + 1);
      else if (!constant.has(name) && !/^Math\.|^console\./.test(callee) && callee !== 'print')
        uncertain = true;
    }
    if (node.name === 'SliceExpression' && /::/.test(text(node)))
      maximum = Math.max(maximum, depth + 1);
    // Collection callback bodies execute once per item, including concise arrows.
    if (['ArrowFunction', 'FunctionExpression', 'LambdaExpression'].includes(node.name)) {
      const call = node.parent?.parent;
      const callee =
        call?.name === 'CallExpression' && call.firstChild ? text(call.firstChild) : '';
      if (/\.(?:map|filter|reduce|forEach|some|every|find|findIndex)$/.test(callee)) depth++;
    }
    for (let child = node.firstChild; child; child = child.nextSibling) walk(child, depth);
  }
  walk(tree.topNode, 0);
  if (recursive > 1)
    return {
      label: 'O(2ⁿ)',
      confidence: 'low',
      reason: 'recursão ou chamadas locais exigem análise adicional',
    };
  if (uncertain || maximum > 3)
    return {
      label: 'Indeterminada',
      confidence: 'low',
      reason: 'chamadas, recursão ou estrutura sem limite demonstrável pela análise estática',
    };
  const label: ComplexityClass =
    maximum >= 3
      ? 'O(n³)'
      : maximum === 2
        ? 'O(n²)'
        : sort
          ? 'O(n log n)'
          : maximum === 1
            ? 'O(n)'
            : log
              ? 'O(log n)'
              : 'O(1)';
  return {
    label,
    confidence: 'medium',
    reason: sort
      ? 'ordenação dominante'
      : log && maximum === 0
        ? 'variável de controle reduzida por fator constante'
        : maximum
          ? `${maximum} passagem(ns) aninhada(s), incluindo operações de coleção`
          : 'operações de custo constante reconhecidas',
  };
}
/** Legacy diagnostic field; no longer added to correctness or used as match score. */
export function scoreComplexity(estimated: ComplexityClass, expected: ComplexityClass) {
  if (estimated === 'Indeterminada') return 0;
  const gap = RANK[expected] - RANK[estimated];
  return gap <= 0 ? 200 : gap === 1 ? 140 : gap === 2 ? 70 : 20;
}
