import type { BankExercise, BankGenerator, GeneratorContext, Rng } from './types';
import { numericOptions } from './types';
import type { Dialect } from './dialect';

const code = (lines: string[]) => lines.join('\n');
const TRUE = 'Verdadeiro';
const FALSE = 'Falso';

function trueFalse(
  rng: Rng,
  statement: string,
  holds: boolean,
  explanation: string,
  codeText?: string
): BankExercise {
  return {
    kind: 'truefalse',
    title: 'Verdadeiro ou falso?',
    question: statement,
    code: codeText,
    options: [TRUE, FALSE],
    answer: holds ? TRUE : FALSE,
    explanation,
  };
}

/** "Find the bug": every option is a numbered line of the snippet. */
function findBug(
  lines: string[],
  buggyLine: number,
  candidateLines: number[],
  question: string,
  explanation: string,
  rng: Rng
): BankExercise {
  const label = (index: number) => `Linha ${index + 1}: ${lines[index]!.trim()}`;
  const unique = [...new Set([buggyLine, ...candidateLines])].filter((i) => lines[i]?.trim());
  return {
    kind: 'bug',
    title: 'Ache o bug',
    question,
    code: code(lines.map((line, index) => `${String(index + 1).padStart(2, ' ')} │ ${line}`)),
    options: rng.shuffle(unique.slice(0, 4).map(label)),
    answer: label(buggyLine),
    explanation,
  };
}

const lineIndex = (lines: string[], needle: string) =>
  lines.findIndex((line) => line.includes(needle));

function printCompletion(d: Dialect): { prefix: string; suffix: string } {
  const literal = '"Olá, Stacklyst"';
  const end = ['PYTHON', 'GO'].includes(d.language) ? '' : ';';
  return { prefix: '', suffix: `(${literal})${end}` };
}

function loopHeaderCompletion(d: Dialect) {
  switch (d.language) {
    case 'PYTHON':
      return { prefix: 'for i in ', suffix: '(3):', expected: ['range'], placeholder: 'função' };
    case 'GO':
      return {
        prefix: 'for i := 0; i < 3; ',
        suffix: ' {',
        expected: ['i++', 'i += 1', 'i = i + 1'],
        placeholder: 'incremento',
      };
    case 'RUST':
      return { prefix: 'for i in 0', suffix: '3 {', expected: ['..'], placeholder: 'intervalo' };
    case 'JAVA':
      return {
        prefix: 'for (int i = 0; i < 3; ',
        suffix: ') {',
        expected: ['i++', '++i', 'i += 1', 'i = i + 1'],
        placeholder: 'incremento',
      };
    default:
      return {
        prefix: 'for (let i = 0; i < 3; ',
        suffix: ') {',
        expected: ['i++', '++i', 'i += 1', 'i = i + 1'],
        placeholder: 'incremento',
      };
  }
}

export const SHARED_GENERATORS: BankGenerator[] = [
  // ── Variáveis e tipos ──
  {
    id: 'basics-arith',
    topic: 'basics',
    kind: 'output',
    make: ({ d, rng }: GeneratorContext) => {
      const a = rng.int(2, 9);
      const b = rng.int(1, 6);
      const c = rng.int(2, 4);
      const result = (a + b) * c;
      return {
        kind: 'output',
        title: 'Qual é a saída?',
        instruction: 'Acompanhe o valor de x a cada linha.',
        code: code([
          d.declare('x', String(a), 'int'),
          d.assign('x', `x + ${b}`),
          d.assign('x', `x * ${c}`),
          d.print('x'),
        ]),
        ...numericOptions(result, [a + b * c, result + c, a * c + b], rng),
        explanation: `x começa em ${a}, vira ${a + b} e depois ${a + b} × ${c} = ${result}.`,
      };
    },
  },
  {
    id: 'basics-reassign',
    topic: 'basics',
    kind: 'output',
    make: ({ d, rng }) => {
      const p = rng.int(1, 9);
      const q = rng.int(10, 20);
      const k = rng.int(1, 5);
      const result = q + (q + k);
      return {
        kind: 'output',
        title: 'Rastreie as variáveis',
        instruction: 'Reatribuir copia o valor do momento; não liga as variáveis para sempre.',
        code: code([
          d.declare('a', String(p), 'int'),
          d.declare('b', String(q), 'int'),
          d.assign('a', 'b'),
          d.assign('b', `a + ${k}`),
          d.print('a + b'),
        ]),
        ...numericOptions(result, [p + q + k, q + k, 2 * q], rng),
        explanation: `Depois de a = b, a vale ${q}; então b = ${q} + ${k} = ${q + k} e a + b = ${result}.`,
      };
    },
  },
  {
    id: 'basics-print-token',
    topic: 'basics',
    kind: 'complete',
    make: ({ d }) => {
      const { prefix, suffix } = printCompletion(d);
      return {
        kind: 'complete',
        title: 'Complete o código',
        instruction: `Escreva o comando que mostra um texto na saída em ${d.label}.`,
        prefix,
        suffix,
        placeholder: 'comando de saída',
        expected: [d.printToken],
        explanation: `Em ${d.label}, a saída padrão é escrita com ${d.printToken}.`,
      };
    },
  },
  {
    id: 'basics-compare',
    topic: 'basics',
    kind: 'output',
    make: ({ d, rng }) => {
      const x = rng.int(2, 9);
      let y = rng.int(2, 9);
      if (y === x) y += 1;
      const value = x > y;
      const options = rng.shuffle([d.boolOut(true), d.boolOut(false), '1', 'Erro de tipo']);
      return {
        kind: 'output',
        title: 'Comparação',
        instruction: 'Comparações produzem um valor booleano.',
        code: code([
          d.declare('x', String(x), 'int', false),
          d.declare('y', String(y), 'int', false),
          d.print('x > y'),
        ]),
        options,
        answer: d.boolOut(value),
        explanation: `${x} > ${y} é ${value ? 'verdadeiro' : 'falso'}, então imprime ${d.boolOut(value)}.`,
      };
    },
  },

  // ── Condicionais ──
  {
    id: 'cond-if-else',
    topic: 'conditionals',
    kind: 'output',
    make: ({ d, rng }) => {
      const x = rng.int(1, 20);
      const t = rng.int(5, 15);
      const answer = x > t ? 'maior' : 'menor ou igual';
      return {
        kind: 'output',
        title: 'Qual caminho o código segue?',
        instruction: 'Só um dos blocos roda.',
        code: code([
          d.declare('x', String(x), 'int', false),
          ...d.ifChain([[`x > ${t}`, [d.printText('maior')]]], [d.printText('menor ou igual')]),
        ]),
        options: rng.shuffle([
          'maior',
          'menor ou igual',
          'maior e menor ou igual',
          'Nada é impresso',
        ]),
        answer,
        explanation: `${x} ${x > t ? '>' : '≤'} ${t}, então o bloco que imprime "${answer}" roda.`,
      };
    },
  },
  {
    id: 'cond-grade',
    topic: 'conditionals',
    kind: 'output',
    make: ({ d, rng }) => {
      const s = rng.int(45, 100);
      const answer = s >= 90 ? 'A' : s >= 70 ? 'B' : 'C';
      return {
        kind: 'output',
        title: 'Corrente de condições',
        instruction: 'A primeira condição verdadeira vence; as outras nem são testadas.',
        code: code([
          d.declare('nota', String(s), 'int', false),
          ...d.ifChain(
            [
              ['nota >= 90', [d.printText('A')]],
              ['nota >= 70', [d.printText('B')]],
            ],
            [d.printText('C')]
          ),
        ]),
        options: rng.shuffle(['A', 'B', 'C', 'A e B']),
        answer,
        explanation: `Com nota ${s}, o primeiro teste verdadeiro imprime "${answer}".`,
      };
    },
  },
  {
    id: 'cond-bug-even',
    topic: 'conditionals',
    kind: 'bug',
    make: ({ d, rng }) => {
      const n = rng.int(2, 20) * 2;
      const lines = [
        d.declare('n', String(n), 'int', false),
        ...d.ifChain([[`n % 2 ${d.eq} 1`, [d.printText('par')]]], [d.printText('ímpar')]),
      ];
      return findBug(
        lines,
        lineIndex(lines, '% 2'),
        [0, lineIndex(lines, '"par"'), lineIndex(lines, '"ímpar"')],
        'Este código deveria imprimir "par" para números pares. Em qual linha está o bug?',
        'Um número par deixa resto 0 na divisão por 2; a condição deveria comparar com 0.',
        rng
      );
    },
  },
  {
    id: 'cond-order-max',
    topic: 'conditionals',
    kind: 'order',
    make: ({ d, rng }) => {
      const a = rng.int(3, 30);
      const b = rng.int(3, 30);
      return {
        kind: 'order',
        title: 'Ordene as linhas',
        instruction: 'Monte o programa que imprime o maior entre a e b.',
        lines: [
          d.declare('a', String(a), 'int', false),
          d.declare('b', String(b), 'int', false),
          ...d.ifChain([['a > b', [d.print('a')]]], [d.print('b')]),
        ],
        explanation: 'Primeiro as variáveis existem, depois a condição decide qual delas imprimir.',
      };
    },
  },
  {
    id: 'cond-tf-logic',
    topic: 'conditionals',
    kind: 'truefalse',
    make: ({ d, rng }) => {
      const p = rng.next() < 0.5;
      const q = rng.next() < 0.5;
      const useAnd = rng.next() < 0.5;
      const actual = useAnd ? p && q : p || q;
      const claimed = rng.next() < 0.5 ? actual : !actual;
      return trueFalse(
        rng,
        `Este código imprime ${d.boolOut(claimed)}.`,
        claimed === actual,
        `${d.boolOut(p)} ${useAnd ? d.and : d.or} ${d.boolOut(q)} resulta em ${d.boolOut(actual)}.`,
        code([
          d.declare('p', d.bool(p), 'bool', false),
          d.declare('q', d.bool(q), 'bool', false),
          d.print(`p ${useAnd ? d.and : d.or} q`),
        ])
      );
    },
  },

  // ── Laços ──
  {
    id: 'loop-sum-range',
    topic: 'loops',
    kind: 'output',
    make: ({ d, rng }) => {
      const s = rng.int(0, 3);
      const e = s + rng.int(3, 6);
      let sum = 0;
      for (let i = s; i < e; i += 1) sum += i;
      return {
        kind: 'output',
        title: 'Some as voltas',
        instruction: 'Atenção: o fim do intervalo não entra.',
        code: code([
          d.declare('total', '0', 'int'),
          ...d.forRange('i', s, e, [d.addAssign('total', 'i')]),
          d.print('total'),
        ]),
        ...numericOptions(sum, [sum + e, sum - s, sum - (e - 1)], rng),
        explanation: `O laço soma de ${s} até ${e - 1}: total = ${sum}.`,
      };
    },
  },
  {
    id: 'loop-while-double',
    topic: 'loops',
    kind: 'output',
    make: ({ d, rng }) => {
      const start = rng.int(1, 3);
      const limit = rng.int(20, 90);
      let x = start;
      let count = 0;
      while (x < limit) {
        x *= 2;
        count += 1;
      }
      return {
        kind: 'output',
        title: 'Quantas voltas?',
        instruction: 'Conte quantas vezes o corpo do laço executa.',
        code: code([
          d.declare('x', String(start), 'int'),
          d.declare('voltas', '0', 'int'),
          ...d.whileLoop(`x < ${limit}`, [d.assign('x', 'x * 2'), d.addAssign('voltas', '1')]),
          d.print('voltas'),
        ]),
        ...numericOptions(count, [count + 1, count - 1, x], rng),
        explanation: `x dobra até alcançar ${x} (≥ ${limit}), o que leva ${count} voltas.`,
      };
    },
  },
  {
    id: 'loop-header',
    topic: 'loops',
    kind: 'complete',
    make: ({ d }) => {
      const parts = loopHeaderCompletion(d);
      return {
        kind: 'complete',
        title: 'Complete o laço',
        instruction: 'Faça o laço repetir exatamente 3 vezes (i = 0, 1, 2).',
        prefix: parts.prefix,
        suffix: parts.suffix,
        placeholder: parts.placeholder,
        expected: parts.expected,
        explanation: `Em ${d.label}: ${parts.prefix}${parts.expected[0]}${parts.suffix}`,
      };
    },
  },
  {
    id: 'loop-tf-count',
    topic: 'loops',
    kind: 'truefalse',
    make: ({ d, rng }) => {
      const k = rng.int(3, 7);
      const claim = rng.next() < 0.5 ? k : k + 1;
      return trueFalse(
        rng,
        `Este laço imprime ${claim} números.`,
        claim === k,
        `O intervalo começa em 0 e para antes de ${k}: são ${k} números (0 a ${k - 1}).`,
        code(d.forRange('i', 0, k, [d.print('i')]))
      );
    },
  },
  {
    id: 'loop-bug-off-by-one',
    topic: 'loops',
    kind: 'bug',
    make: ({ d, rng }) => {
      const n = rng.int(4, 9);
      const lines = [
        d.declare('n', String(n), 'int', false),
        ...d.forRange('i', 1, 'n', [d.print('i')]),
      ];
      const header = lines.findIndex((line) => /for/.test(line));
      return findBug(
        lines,
        header,
        [0, lineIndex(lines, d.printToken)],
        `Este código deveria imprimir de 1 até ${n} (incluindo ${n}). Em qual linha está o bug?`,
        `O fim do intervalo é exclusivo: o laço para em ${n - 1}. O limite deveria ser n + 1.`,
        rng
      );
    },
  },

  // ── Funções ──
  {
    id: 'func-call',
    topic: 'functions',
    kind: 'output',
    make: ({ d, rng }) => {
      const m = rng.int(2, 5);
      const c = rng.int(1, 9);
      const a = rng.int(2, 9);
      const result = a * m + c;
      return {
        kind: 'output',
        title: 'Chamando uma função',
        instruction: 'Substitua o argumento no corpo da função.',
        code: code([
          ...d.func('calcular', [['x', 'int']], 'int', [d.ret(`x * ${m} + ${c}`)]),
          '',
          d.print(d.call('calcular', [String(a)])),
        ]),
        ...numericOptions(result, [(a + c) * m, a * m, a + m + c], rng),
        explanation: `calcular(${a}) = ${a} × ${m} + ${c} = ${result}.`,
      };
    },
  },
  {
    id: 'func-compose',
    topic: 'functions',
    kind: 'output',
    make: ({ d, rng }) => {
      const p = rng.int(1, 9);
      const q = rng.int(2, 4);
      const a = rng.int(2, 8);
      const result = a * q + p;
      return {
        kind: 'output',
        title: 'Funções encadeadas',
        instruction: 'A função de dentro roda primeiro.',
        code: code([
          ...d.func('somar', [['x', 'int']], 'int', [d.ret(`x + ${p}`)]),
          ...d.func('vezes', [['x', 'int']], 'int', [d.ret(`x * ${q}`)]),
          '',
          d.print(d.call('somar', [d.call('vezes', [String(a)])])),
        ]),
        ...numericOptions(result, [(a + p) * q, a * q, a + p], rng),
        explanation: `vezes(${a}) = ${a * q}; somar(${a * q}) = ${result}.`,
      };
    },
  },
  {
    id: 'func-order',
    topic: 'functions',
    kind: 'order',
    make: ({ d, rng }) => {
      const n = rng.int(11, 40);
      return {
        kind: 'order',
        title: 'Monte a função',
        instruction: 'Ordene as linhas: defina a função e depois use o resultado.',
        lines: [
          ...d.func('dobro', [['n', 'int']], 'int', [d.ret('n * 2')]),
          d.declare('resultado', d.call('dobro', [String(n)]), 'int', false),
          d.print('resultado'),
        ],
        explanation: 'A função precisa ser declarada antes de o resultado ser guardado e impresso.',
      };
    },
  },
  {
    id: 'func-bug-early-return',
    topic: 'functions',
    kind: 'bug',
    make: ({ d, rng }) => {
      const lines = d.func('somarAte', [['n', 'int']], 'int', [
        d.declare('total', '0', 'int'),
        ...d.forRange('i', 1, 'n + 1', [d.addAssign('total', 'i'), d.ret('total')]),
      ]);
      const ret = lineIndex(lines, 'return');
      return findBug(
        lines,
        ret,
        [0, 1, lineIndex(lines, '+=')],
        'somarAte(4) deveria devolver 10 (1+2+3+4), mas devolve 1. Em qual linha está o bug?',
        'O return está dentro do laço: a função termina na primeira volta. Ele deveria vir depois do laço.',
        rng
      );
    },
  },
  {
    id: 'func-tf-return',
    topic: 'functions',
    kind: 'truefalse',
    make: ({ d, rng }) => {
      const b = rng.int(3, 12);
      const real = b * 3;
      const claim = rng.next() < 0.5 ? real : real + 3;
      return trueFalse(
        rng,
        `O programa imprime ${claim}.`,
        claim === real,
        `triplo(${b}) devolve ${b} × 3 = ${real}.`,
        code([
          ...d.func('triplo', [['x', 'int']], 'int', [d.ret('x * 3')]),
          d.print(d.call('triplo', [String(b)])),
        ])
      );
    },
  },

  // ── Coleções ──
  {
    id: 'col-index',
    topic: 'collections',
    kind: 'output',
    make: ({ d, rng }) => {
      const items = rng.shuffle([3, 5, 8, 12, 15, 21, 27, 30, 42]).slice(0, 5);
      const i = rng.int(1, items.length - 2);
      return {
        kind: 'output',
        title: 'Índices começam em zero',
        instruction: `Qual valor está na posição ${i}?`,
        code: code([d.list('nums', items), d.print(`nums[${i}]`)]),
        ...numericOptions(items[i]!, [items[i - 1]!, items[i + 1]!, items[0]!], rng),
        explanation: `A posição 0 é ${items[0]}; contando a partir dela, a posição ${i} é ${items[i]}.`,
      };
    },
  },
  {
    id: 'col-last',
    topic: 'collections',
    kind: 'output',
    make: ({ d, rng }) => {
      const items = rng.shuffle([2, 4, 7, 9, 13, 16, 19, 25]).slice(0, rng.int(3, 6));
      const last = items[items.length - 1]!;
      return {
        kind: 'output',
        title: 'Último elemento',
        instruction: 'Que valor sai?',
        code: code([d.list('nums', items), d.print(d.last('nums'))]),
        ...numericOptions(last, [items[0]!, items[items.length - 2]!, items.length], rng),
        explanation: `A lista tem ${items.length} itens; o último índice é ${items.length - 1}, que guarda ${last}.`,
      };
    },
  },
  {
    id: 'col-sum-evens',
    topic: 'collections',
    kind: 'output',
    make: ({ d, rng }) => {
      const items = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]).slice(0, 5);
      const evens = items.filter((n) => n % 2 === 0);
      const sum = evens.reduce((acc, n) => acc + n, 0);
      const all = items.reduce((acc, n) => acc + n, 0);
      return {
        kind: 'output',
        title: 'Filtrar e somar',
        instruction: 'Só os pares entram na soma.',
        code: code([
          d.list('nums', items),
          d.declare('total', '0', 'int'),
          ...d.forEach('n', 'nums', d.ifChain([[`n % 2 ${d.eq} 0`, [d.addAssign('total', 'n')]]])),
          d.print('total'),
        ]),
        ...numericOptions(sum, [all, all - sum, evens.length], rng),
        explanation: `Pares: ${evens.join(', ') || 'nenhum'} → soma ${sum}.`,
      };
    },
  },
  {
    id: 'col-match',
    topic: 'collections',
    kind: 'match',
    make: ({ d }) => ({
      kind: 'match',
      title: 'Ligue os pares',
      instruction: `Associe cada intenção ao código em ${d.label}.`,
      pairs: [
        ['Tamanho da lista', d.len('nums')],
        ['Primeiro elemento', 'nums[0]'],
        ['Último elemento', d.last('nums')],
        ['Percorrer cada item', d.forEach('n', 'nums', ['…'])[0]!],
      ],
      explanation: 'Estas são as operações mais usadas com listas no dia a dia.',
    }),
  },
  {
    id: 'col-tf-zero-index',
    topic: 'collections',
    kind: 'truefalse',
    make: ({ d, rng }) => {
      const first = rng.next() < 0.5;
      return trueFalse(
        rng,
        first
          ? `Em ${d.label}, nums[0] devolve o primeiro elemento da lista.`
          : `Em ${d.label}, nums[1] devolve o primeiro elemento da lista.`,
        first,
        'Os índices começam em 0: o primeiro elemento fica em nums[0].'
      );
    },
  },
  // ── Reforço para iniciantes: todos os formatos nos primeiros tópicos ──
  {
    id: 'basics-tf-text-vs-number',
    topic: 'basics',
    kind: 'truefalse',
    make: ({ d, rng }) => {
      const a = rng.int(2, 6);
      const b = rng.int(2, 6);
      const claimsSum = rng.next() < 0.5;
      return trueFalse(
        rng,
        claimsSum ? `Este código imprime ${a + b}.` : `Este código imprime o texto ${a} + ${b}.`,
        !claimsSum,
        `O que está entre aspas é texto: sai exatamente ${a} + ${b}, sem calcular.`,
        d.printText(`${a} + ${b}`)
      );
    },
  },
  {
    id: 'basics-output-text',
    topic: 'basics',
    kind: 'output',
    make: ({ d, rng }) => {
      const a = rng.int(2, 6);
      const b = rng.int(2, 6);
      const answer = `Total\n${a + b}`;
      return {
        kind: 'output',
        title: 'Texto ou número?',
        instruction: 'Cada comando de saída escreve uma linha.',
        code: code([d.printText('Total'), d.print(`${a} + ${b}`)]),
        options: rng.shuffle([answer, `Total\n${a} + ${b}`, `Total ${a + b}`, `${a + b}\nTotal`]),
        answer,
        explanation: `A primeira linha é o texto "Total"; a segunda é o resultado de ${a} + ${b}.`,
      };
    },
  },
  {
    id: 'basics-order-sum',
    topic: 'basics',
    kind: 'order',
    make: ({ d, rng }) => {
      const a = rng.int(3, 20);
      const b = rng.int(21, 40);
      return {
        kind: 'order',
        title: 'Ordene as linhas',
        instruction: 'Monte o programa que guarda dois valores, soma e imprime o total.',
        lines: [
          d.declare('caixas', String(a), 'int', false),
          d.declare('soltos', String(b), 'int', false),
          d.declare('total', 'caixas + soltos', 'int', false),
          d.print('total'),
        ],
        explanation:
          'Um valor precisa existir antes de ser usado: primeiro as parcelas, depois o total.',
      };
    },
  },
  {
    id: 'basics-bug-operator',
    topic: 'basics',
    kind: 'bug',
    make: ({ d, rng }) => {
      const a = rng.int(10, 30);
      const b = rng.int(2, 9);
      const lines = [
        d.declare('caixas', String(a), 'int', false),
        d.declare('soltos', String(b), 'int', false),
        d.declare('total', 'caixas - soltos', 'int', false),
        d.print('total'),
      ];
      return findBug(
        lines,
        2,
        [0, 1, 3],
        `O programa deveria imprimir ${a + b} (caixas mais soltos), mas imprime ${a - b}. Onde está o bug?`,
        'A linha do total subtrai em vez de somar.',
        rng
      );
    },
  },
  {
    id: 'basics-match-values',
    topic: 'basics',
    kind: 'match',
    make: ({ d }) => ({
      kind: 'match',
      title: 'Ligue os pares',
      instruction: `Associe cada ideia ao exemplo em ${d.label}.`,
      pairs: [
        ['Texto', d.str('Olá')],
        ['Número inteiro', '42'],
        ['Booleano', d.bool(true)],
        ['Comando de saída', d.printToken],
      ],
      explanation: 'Texto vai entre aspas, números não, e booleanos só têm dois valores.',
    }),
  },
  {
    id: 'cond-complete-else',
    topic: 'conditionals',
    kind: 'complete',
    make: ({ d, rng }) => {
      const x = rng.int(1, 9);
      const python = d.language === 'PYTHON';
      const head = d.ifChain([['pontos >= 5', [d.printText('passou')]]]);
      return {
        kind: 'complete',
        title: 'Complete o código',
        instruction: 'Escreva a palavra que abre o caminho alternativo.',
        context: code([
          d.declare('pontos', String(x), 'int', false),
          ...(python ? head : head.slice(0, -1)),
        ]),
        prefix: python ? '' : '} ',
        suffix: python ? ':' : ' {',
        placeholder: 'palavra-chave',
        expected: ['else'],
        explanation: 'O bloco que roda quando a condição é falsa começa com else.',
      };
    },
  },
  {
    id: 'loop-order-count',
    topic: 'loops',
    kind: 'order',
    make: ({ d, rng }) => {
      const step = rng.int(2, 5);
      return {
        kind: 'order',
        title: 'Ordene as linhas',
        instruction: `Monte o programa que soma ${step} três vezes e imprime o total.`,
        lines: [
          d.declare('total', '0', 'int'),
          ...d.forRange('i', 0, 3, [d.addAssign('total', String(step))]),
          d.print('total'),
        ],
        explanation:
          'O acumulador começa em 0, o laço soma a cada volta e a saída vem depois do laço.',
      };
    },
  },
  {
    id: 'func-complete-return',
    topic: 'functions',
    kind: 'complete',
    make: ({ d }) => {
      const lines = d.func('dobro', [['x', 'int']], 'int', [d.ret('x * 2')]);
      const body = lines[1]!;
      const at = body.indexOf('return');
      return {
        kind: 'complete',
        title: 'Complete a função',
        instruction: 'Escreva a palavra que devolve o resultado para quem chamou.',
        context: lines[0],
        prefix: body.slice(0, at),
        suffix: body.slice(at + 'return'.length),
        placeholder: 'palavra-chave',
        expected: ['return'],
        explanation: 'return encerra a função e entrega o valor calculado.',
      };
    },
  },
  {
    id: 'col-complete-first',
    topic: 'collections',
    kind: 'complete',
    make: ({ d, rng }) => {
      const items = rng.shuffle([4, 8, 15, 16, 23, 42]).slice(0, 4);
      const [prefix, suffix] = d.print('nums[§]').split('§') as [string, string];
      return {
        kind: 'complete',
        title: 'Complete o código',
        instruction: `Imprima o primeiro elemento da lista (${items[0]}).`,
        context: d.list('nums', items),
        prefix,
        suffix,
        placeholder: 'índice',
        expected: ['0'],
        explanation: 'O primeiro elemento fica no índice 0.',
      };
    },
  },
  {
    id: 'col-order-sum',
    topic: 'collections',
    kind: 'order',
    make: ({ d, rng }) => {
      const items = rng.shuffle([2, 3, 5, 7, 11, 13]).slice(0, 3);
      return {
        kind: 'order',
        title: 'Ordene as linhas',
        instruction: 'Monte o programa que soma todos os itens da lista.',
        lines: [
          d.list('nums', items),
          d.declare('total', '0', 'int'),
          ...d.forEach('n', 'nums', [d.addAssign('total', 'n')]),
          d.print('total'),
        ],
        explanation:
          'Lista e acumulador primeiro; o laço soma item por item; a saída fica por último.',
      };
    },
  },
  {
    id: 'col-bug-last-index',
    topic: 'collections',
    kind: 'bug',
    make: ({ d, rng }) => {
      const items = rng.shuffle([6, 9, 12, 18, 24, 30]).slice(0, 4);
      const lines = [
        d.list('nums', items),
        d.declare('ultimo', `nums[${items.length}]`, 'int', false),
        d.print('ultimo'),
      ];
      return findBug(
        lines,
        1,
        [0, 2],
        `O programa deveria imprimir o último elemento (${items[items.length - 1]}), mas falha. Onde está o bug?`,
        `A lista tem ${items.length} itens, então o último índice é ${items.length - 1}, não ${items.length}.`,
        rng
      );
    },
  },
];
