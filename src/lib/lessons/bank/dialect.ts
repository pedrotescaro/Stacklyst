/**
 * Tiny code writer that renders the same small program in each trail language.
 * Exercise generators describe intent once (declare, loop, print…) and get
 * idiomatic, syntactically valid snippets for JS, TS, Python, Go, Rust and Java.
 */

export type BankLanguage = 'JS' | 'TS' | 'PYTHON' | 'GO' | 'RUST' | 'JAVA';
export type ValueKind = 'int' | 'str' | 'bool';

export interface Dialect {
  language: BankLanguage;
  label: string;
  indent: string;
  comment(text: string): string;
  declare(name: string, value: string, kind: ValueKind, mutable?: boolean): string;
  assign(name: string, expr: string): string;
  addAssign(name: string, expr: string): string;
  print(expr: string): string;
  printText(text: string): string;
  str(text: string): string;
  bool(value: boolean): string;
  /** How a boolean looks when printed. */
  boolOut(value: boolean): string;
  and: string;
  or: string;
  eq: string;
  not(expr: string): string;
  ifChain(branches: Array<[cond: string, body: string[]]>, elseBody?: string[]): string[];
  forRange(
    variable: string,
    start: number | string,
    end: number | string,
    body: string[]
  ): string[];
  whileLoop(cond: string, body: string[]): string[];
  func(
    name: string,
    params: Array<[name: string, kind: ValueKind]>,
    returns: ValueKind,
    body: string[]
  ): string[];
  ret(expr: string): string;
  call(name: string, args: string[]): string;
  list(name: string, items: number[]): string;
  len(name: string): string;
  last(name: string): string;
  forEach(variable: string, list: string, body: string[]): string[];
  /** The exact token used to print, used by "complete the code" exercises. */
  printToken: string;
}

const indentLines = (lines: string[], indent: string) => lines.map((line) => indent + line);

function braceBlock(head: string, body: string[], indent: string): string[] {
  return [`${head} {`, ...indentLines(body, indent), '}'];
}

function braceIfChain(
  branches: Array<[string, string[]]>,
  elseBody: string[] | undefined,
  indent: string,
  wrap: (cond: string) => string
) {
  const out: string[] = [];
  branches.forEach(([cond, body], index) => {
    const head = index === 0 ? `if ${wrap(cond)} {` : `} else if ${wrap(cond)} {`;
    out.push(head, ...indentLines(body, indent));
  });
  if (elseBody) out.push('} else {', ...indentLines(elseBody, indent));
  out.push('}');
  return out;
}

const quote = (text: string) => `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const JS: Dialect = {
  language: 'JS',
  label: 'JavaScript',
  indent: '  ',
  comment: (t) => `// ${t}`,
  declare: (n, v, _k, mutable = true) => `${mutable ? 'let' : 'const'} ${n} = ${v};`,
  assign: (n, e) => `${n} = ${e};`,
  addAssign: (n, e) => `${n} += ${e};`,
  print: (e) => `console.log(${e});`,
  printText: (t) => `console.log(${quote(t)});`,
  str: quote,
  bool: (b) => String(b),
  boolOut: (b) => String(b),
  and: '&&',
  or: '||',
  eq: '===',
  not: (e) => `!${e}`,
  ifChain: (b, e) => braceIfChain(b, e, '  ', (c) => `(${c})`),
  forRange: (v, s, e, body) => braceBlock(`for (let ${v} = ${s}; ${v} < ${e}; ${v}++)`, body, '  '),
  whileLoop: (c, body) => braceBlock(`while (${c})`, body, '  '),
  func: (n, p, _r, body) =>
    braceBlock(`function ${n}(${p.map(([name]) => name).join(', ')})`, body, '  '),
  ret: (e) => `return ${e};`,
  call: (n, a) => `${n}(${a.join(', ')})`,
  list: (n, items) => `const ${n} = [${items.join(', ')}];`,
  len: (n) => `${n}.length`,
  last: (n) => `${n}[${n}.length - 1]`,
  forEach: (v, l, body) => braceBlock(`for (const ${v} of ${l})`, body, '  '),
  printToken: 'console.log',
};

const tsType = (k: ValueKind) => (k === 'int' ? 'number' : k === 'str' ? 'string' : 'boolean');

const TS: Dialect = {
  ...JS,
  language: 'TS',
  label: 'TypeScript',
  declare: (n, v, k, mutable = true) => `${mutable ? 'let' : 'const'} ${n}: ${tsType(k)} = ${v};`,
  func: (n, p, r, body) =>
    braceBlock(
      `function ${n}(${p.map(([name, k]) => `${name}: ${tsType(k)}`).join(', ')}): ${tsType(r)}`,
      body,
      '  '
    ),
  list: (n, items) => `const ${n}: number[] = [${items.join(', ')}];`,
};

const pyBlock = (head: string, body: string[]) => [`${head}:`, ...indentLines(body, '    ')];

const PYTHON: Dialect = {
  language: 'PYTHON',
  label: 'Python',
  indent: '    ',
  comment: (t) => `# ${t}`,
  declare: (n, v) => `${n} = ${v}`,
  assign: (n, e) => `${n} = ${e}`,
  addAssign: (n, e) => `${n} += ${e}`,
  print: (e) => `print(${e})`,
  printText: (t) => `print(${quote(t)})`,
  str: quote,
  bool: (b) => (b ? 'True' : 'False'),
  boolOut: (b) => (b ? 'True' : 'False'),
  and: 'and',
  or: 'or',
  eq: '==',
  not: (e) => `not ${e}`,
  ifChain: (branches, elseBody) => {
    const out: string[] = [];
    branches.forEach(([cond, body], index) =>
      out.push(...pyBlock(`${index === 0 ? 'if' : 'elif'} ${cond}`, body))
    );
    if (elseBody) out.push(...pyBlock('else', elseBody));
    return out;
  },
  forRange: (v, s, e, body) =>
    pyBlock(`for ${v} in range(${String(s) === '0' ? '' : `${s}, `}${e})`, body),
  whileLoop: (c, body) => pyBlock(`while ${c}`, body),
  func: (n, p, _r, body) => pyBlock(`def ${n}(${p.map(([name]) => name).join(', ')})`, body),
  ret: (e) => `return ${e}`,
  call: (n, a) => `${n}(${a.join(', ')})`,
  list: (n, items) => `${n} = [${items.join(', ')}]`,
  len: (n) => `len(${n})`,
  last: (n) => `${n}[-1]`,
  forEach: (v, l, body) => pyBlock(`for ${v} in ${l}`, body),
  printToken: 'print',
};

const goType = (k: ValueKind) => (k === 'int' ? 'int' : k === 'str' ? 'string' : 'bool');

const GO: Dialect = {
  language: 'GO',
  label: 'Go',
  indent: '    ',
  comment: (t) => `// ${t}`,
  declare: (n, v, _k, mutable = true) => (mutable ? `${n} := ${v}` : `const ${n} = ${v}`),
  assign: (n, e) => `${n} = ${e}`,
  addAssign: (n, e) => `${n} += ${e}`,
  print: (e) => `fmt.Println(${e})`,
  printText: (t) => `fmt.Println(${quote(t)})`,
  str: quote,
  bool: (b) => String(b),
  boolOut: (b) => String(b),
  and: '&&',
  or: '||',
  eq: '==',
  not: (e) => `!${e}`,
  ifChain: (b, e) => braceIfChain(b, e, '    ', (c) => c),
  forRange: (v, s, e, body) => braceBlock(`for ${v} := ${s}; ${v} < ${e}; ${v}++`, body, '    '),
  whileLoop: (c, body) => braceBlock(`for ${c}`, body, '    '),
  func: (n, p, r, body) =>
    braceBlock(
      `func ${n}(${p.map(([name, k]) => `${name} ${goType(k)}`).join(', ')}) ${goType(r)}`,
      body,
      '    '
    ),
  ret: (e) => `return ${e}`,
  call: (n, a) => `${n}(${a.join(', ')})`,
  list: (n, items) => `${n} := []int{${items.join(', ')}}`,
  len: (n) => `len(${n})`,
  last: (n) => `${n}[len(${n})-1]`,
  forEach: (v, l, body) => braceBlock(`for _, ${v} := range ${l}`, body, '    '),
  printToken: 'fmt.Println',
};

const rsType = (k: ValueKind) => (k === 'int' ? 'i32' : k === 'str' ? '&str' : 'bool');

const RUST: Dialect = {
  language: 'RUST',
  label: 'Rust',
  indent: '    ',
  comment: (t) => `// ${t}`,
  declare: (n, v, _k, mutable = true) => `let ${mutable ? 'mut ' : ''}${n} = ${v};`,
  assign: (n, e) => `${n} = ${e};`,
  addAssign: (n, e) => `${n} += ${e};`,
  print: (e) => `println!("{}", ${e});`,
  printText: (t) => `println!(${quote(t)});`,
  str: quote,
  bool: (b) => String(b),
  boolOut: (b) => String(b),
  and: '&&',
  or: '||',
  eq: '==',
  not: (e) => `!${e}`,
  ifChain: (b, e) => braceIfChain(b, e, '    ', (c) => c),
  forRange: (v, s, e, body) => braceBlock(`for ${v} in ${s}..${e}`, body, '    '),
  whileLoop: (c, body) => braceBlock(`while ${c}`, body, '    '),
  func: (n, p, r, body) =>
    braceBlock(
      `fn ${n}(${p.map(([name, k]) => `${name}: ${rsType(k)}`).join(', ')}) -> ${rsType(r)}`,
      body,
      '    '
    ),
  ret: (e) => `return ${e};`,
  call: (n, a) => `${n}(${a.join(', ')})`,
  list: (n, items) => `let ${n} = vec![${items.join(', ')}];`,
  len: (n) => `${n}.len()`,
  last: (n) => `${n}[${n}.len() - 1]`,
  forEach: (v, l, body) => braceBlock(`for ${v} in &${l}`, body, '    '),
  printToken: 'println!',
};

const javaType = (k: ValueKind) => (k === 'int' ? 'int' : k === 'str' ? 'String' : 'boolean');

const JAVA: Dialect = {
  language: 'JAVA',
  label: 'Java',
  indent: '    ',
  comment: (t) => `// ${t}`,
  declare: (n, v, k, mutable = true) => `${mutable ? '' : 'final '}${javaType(k)} ${n} = ${v};`,
  assign: (n, e) => `${n} = ${e};`,
  addAssign: (n, e) => `${n} += ${e};`,
  print: (e) => `System.out.println(${e});`,
  printText: (t) => `System.out.println(${quote(t)});`,
  str: quote,
  bool: (b) => String(b),
  boolOut: (b) => String(b),
  and: '&&',
  or: '||',
  eq: '==',
  not: (e) => `!${e}`,
  ifChain: (b, e) => braceIfChain(b, e, '    ', (c) => `(${c})`),
  forRange: (v, s, e, body) =>
    braceBlock(`for (int ${v} = ${s}; ${v} < ${e}; ${v}++)`, body, '    '),
  whileLoop: (c, body) => braceBlock(`while (${c})`, body, '    '),
  func: (n, p, r, body) =>
    braceBlock(
      `static ${javaType(r)} ${n}(${p.map(([name, k]) => `${javaType(k)} ${name}`).join(', ')})`,
      body,
      '    '
    ),
  ret: (e) => `return ${e};`,
  call: (n, a) => `${n}(${a.join(', ')})`,
  list: (n, items) => `int[] ${n} = {${items.join(', ')}};`,
  len: (n) => `${n}.length`,
  last: (n) => `${n}[${n}.length - 1]`,
  forEach: (v, l, body) => braceBlock(`for (int ${v} : ${l})`, body, '    '),
  printToken: 'System.out.println',
};

export const DIALECTS: Record<BankLanguage, Dialect> = { JS, TS, PYTHON, GO, RUST, JAVA };

export function dialectFor(language: string): Dialect {
  const key = language.toUpperCase() === 'PY' ? 'PYTHON' : language.toUpperCase();
  return DIALECTS[key as BankLanguage] ?? JS;
}
