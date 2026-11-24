/**
 * Propositional logic for the truth-table simulator.
 * Accepts ¬ ~ !  ∧ & ^  ∨ |  ⊕ xor  → ->  ↔ <->  and parentheses.
 * Variables are single lowercase letters (except v, reserved for "ou").
 */
export type LogicNode =
  | { kind: 'var'; name: string }
  | { kind: 'not'; value: LogicNode }
  | { kind: 'and' | 'or' | 'xor' | 'implies' | 'iff'; left: LogicNode; right: LogicNode };

type Token = { type: 'var' | 'op' | '(' | ')'; value: string };

const OPS: [RegExp, string][] = [
  [/^(<->|↔|<=>)/, 'iff'],
  [/^(->|→|=>)/, 'implies'],
  [/^(⊕|xor|\^\^|⊻)/i, 'xor'],
  [/^(∧|&&?|\^)/, 'and'],
  [/^(∨|\|\|?|v\b|ou\b)/, 'or'],
  [/^(¬|~|!|não\b|nao\b)/i, 'not'],
];

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let rest = source.trim();
  while (rest.length) {
    rest = rest.replace(/^\s+/, '');
    if (!rest) break;
    if (rest[0] === '(' || rest[0] === ')') {
      tokens.push({ type: rest[0] as '(' | ')', value: rest[0] });
      rest = rest.slice(1);
      continue;
    }
    const op = OPS.find(([pattern]) => pattern.test(rest));
    if (op) {
      tokens.push({ type: 'op', value: op[1] });
      rest = rest.replace(op[0], '');
      continue;
    }
    const variable = /^[a-uw-z]/.exec(rest);
    if (variable) {
      tokens.push({ type: 'var', value: variable[0] });
      rest = rest.slice(1);
      continue;
    }
    throw new Error(`Símbolo não reconhecido: "${rest[0]}"`);
  }
  return tokens;
}

// Precedence, lowest first: ↔, →, ∨/⊕, ∧, ¬. → is right-associative.
export function parseLogic(source: string): LogicNode {
  const tokens = tokenize(source);
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const binary = (next: () => LogicNode, kinds: string[], right = false): (() => LogicNode) => {
    const parse = (): LogicNode => {
      let left = next();
      while (peek()?.type === 'op' && kinds.includes(peek()!.value)) {
        const kind = take().value as 'and';
        const rhs = right ? parse() : next();
        left = { kind, left, right: rhs };
        if (right) break;
      }
      return left;
    };
    return parse;
  };
  const unary = (): LogicNode => {
    const token = peek();
    if (!token) throw new Error('Expressão incompleta.');
    if (token.type === 'op' && token.value === 'not') {
      take();
      return { kind: 'not', value: unary() };
    }
    if (token.type === 'var') {
      take();
      return { kind: 'var', name: token.value };
    }
    if (token.type === '(') {
      take();
      const inner = iff();
      if (take()?.type !== ')') throw new Error('Parêntese sem fechamento.');
      return inner;
    }
    throw new Error('Expressão mal formada.');
  };
  const and = binary(unary, ['and']);
  const or = binary(and, ['or', 'xor']);
  const implies = binary(or, ['implies'], true);
  const iff = binary(implies, ['iff']);
  const tree = iff();
  if (position < tokens.length) throw new Error('Há símbolos sobrando na expressão.');
  return tree;
}

export function variables(node: LogicNode, found = new Set<string>()): string[] {
  if (node.kind === 'var') found.add(node.name);
  else if (node.kind === 'not') variables(node.value, found);
  else {
    variables(node.left, found);
    variables(node.right, found);
  }
  return [...found].sort();
}

export function evaluate(node: LogicNode, values: Record<string, boolean>): boolean {
  switch (node.kind) {
    case 'var':
      return values[node.name];
    case 'not':
      return !evaluate(node.value, values);
    case 'and':
      return evaluate(node.left, values) && evaluate(node.right, values);
    case 'or':
      return evaluate(node.left, values) || evaluate(node.right, values);
    case 'xor':
      return evaluate(node.left, values) !== evaluate(node.right, values);
    case 'implies':
      return !evaluate(node.left, values) || evaluate(node.right, values);
    case 'iff':
      return evaluate(node.left, values) === evaluate(node.right, values);
  }
}

const SYMBOL = { and: '∧', or: '∨', xor: '⊕', implies: '→', iff: '↔' } as const;

export function format(node: LogicNode, top = true): string {
  if (node.kind === 'var') return node.name;
  if (node.kind === 'not') return `¬${format(node.value, false)}`;
  const text = `${format(node.left, false)} ${SYMBOL[node.kind]} ${format(node.right, false)}`;
  return top ? text : `(${text})`;
}

/** Sub-formulas in evaluation order (innermost first), without the bare variables. */
export function subformulas(node: LogicNode): LogicNode[] {
  const list: LogicNode[] = [];
  const visit = (n: LogicNode) => {
    if (n.kind === 'var') return;
    if (n.kind === 'not') visit(n.value);
    else {
      visit(n.left);
      visit(n.right);
    }
    if (!list.some((existing) => format(existing) === format(n))) list.push(n);
  };
  visit(node);
  return list;
}

export function truthTable(source: string) {
  const tree = parseLogic(source);
  const names = variables(tree);
  if (names.length > 5) throw new Error('Use no máximo 5 proposições.');
  const columns = subformulas(tree);
  const rows = Array.from({ length: 2 ** names.length }, (_, index) => {
    // Classic textbook order: first row all true.
    const values = Object.fromEntries(
      names.map((name, i) => [name, !((index >> (names.length - 1 - i)) & 1)])
    );
    return { values, results: columns.map((c) => evaluate(c, values)) };
  });
  const final = rows.map((r) => r.results[r.results.length - 1] ?? r.values[names[0]]);
  const classification = final.every(Boolean)
    ? 'tautologia'
    : final.every((v) => !v)
      ? 'contradição'
      : 'contingência';
  return { tree, names, columns: columns.map((c) => format(c)), rows, classification } as const;
}
