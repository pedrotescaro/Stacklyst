import type { ChallengeTemplate } from './duel-challenge-generator';

type Example = [unknown[], unknown];
function template(
  id: string,
  title: string,
  difficulty: ChallengeTemplate['difficulty'],
  topics: string[],
  description: string,
  name: string,
  pyName: string,
  args: string[],
  examples: Example[]
): ChallengeTemplate {
  return {
    id,
    title,
    difficulty,
    topics,
    description,
    functionName: name,
    starters: {
      TS: `function ${name}(${args.map((a) => `${a}: any`).join(', ')}): any {\n  // Implemente sua solução\n}`,
      JS: `function ${name}(${args.join(', ')}) {\n  // Implemente sua solução\n}`,
      PYTHON: `def ${pyName}(${args.join(', ')}):\n    pass\n`,
    },
    testCases: examples.map(([input, output], index) => {
      const values = input.map((v) => JSON.stringify(v)).join(', '),
        expected = JSON.stringify(output);
      return {
        id: `t${index + 1}`,
        description: `Exemplo ${index + 1}`,
        inputDisplay: values,
        expectedDisplay: expected,
        testExpression: {
          TS: `JSON.stringify(${name}(${values})) === JSON.stringify(${expected})`,
          JS: `JSON.stringify(${name}(${values})) === JSON.stringify(${expected})`,
          PYTHON: `${pyName}(${values}) == ${expected}`,
        },
      };
    }),
  };
}

export const EXTRA_DUEL_CHALLENGES: ChallengeTemplate[] = [
  template(
    'vowel-tally',
    'Contar vogais',
    'Fácil',
    ['strings', 'texto'],
    'Conte as vogais a, e, i, o, u da string, ignorando maiúsculas.',
    'countVowels',
    'count_vowels',
    ['text'],
    [
      [['Stacklyst'], 1],
      [['AEIOU'], 5],
      [['xyz'], 0],
      [[''], 0],
    ]
  ),
  template(
    'unique-sorted',
    'Valores únicos ordenados',
    'Fácil',
    ['arrays', 'ordenação'],
    'Retorne os números sem repetição em ordem crescente.',
    'uniqueSorted',
    'unique_sorted',
    ['numbers'],
    [
      [[[3, 1, 3, 2]], [1, 2, 3]],
      [[[]], []],
      [[[-2, 5, -2, 0]], [-2, 0, 5]],
    ]
  ),
  template(
    'rotate-array',
    'Rotacionar uma lista',
    'Fácil',
    ['arrays'],
    'Mova os últimos k elementos para o início. k é não negativo; para listas vazias retorne [].',
    'rotateArray',
    'rotate_array',
    ['numbers', 'k'],
    [
      [
        [[1, 2, 3, 4], 1],
        [4, 1, 2, 3],
      ],
      [
        [[1, 2, 3], 5],
        [2, 3, 1],
      ],
      [[[], 3], []],
    ]
  ),
  template(
    'chunk-array',
    'Dividir em blocos',
    'Médio',
    ['arrays', 'listas'],
    'Divida a lista em blocos consecutivos de tamanho size (inteiro positivo), preservando a ordem.',
    'chunkArray',
    'chunk_array',
    ['numbers', 'size'],
    [
      [
        [[1, 2, 3, 4, 5], 2],
        [[1, 2], [3, 4], [5]],
      ],
      [[[], 2], []],
      [[[1, 2], 5], [[1, 2]]],
    ]
  ),
  template(
    'prefix-sums',
    'Somas acumuladas',
    'Médio',
    ['arrays', 'matemática'],
    'Retorne uma lista em que cada posição contém a soma de todos os valores até ela, inclusive.',
    'prefixSums',
    'prefix_sums',
    ['numbers'],
    [
      [[[1, 2, 3]], [1, 3, 6]],
      [[[-1, 3, -2]], [-1, 2, 0]],
      [[[]], []],
    ]
  ),
  template(
    'matrix-transpose',
    'Transpor uma matriz',
    'Médio',
    ['matrizes', 'arrays'],
    'Troque linhas por colunas de uma matriz retangular. Para uma matriz vazia retorne [].',
    'transpose',
    'transpose',
    ['matrix'],
    [
      [
        [
          [
            [1, 2, 3],
            [4, 5, 6],
          ],
        ],
        [
          [1, 4],
          [2, 5],
          [3, 6],
        ],
      ],
      [[[[7]]], [[7]]],
      [[[]], []],
    ]
  ),
  template(
    'balanced-depth',
    'Profundidade de parênteses',
    'Médio',
    ['strings', 'pilhas'],
    'Receba uma string de parênteses já balanceados e retorne sua profundidade máxima. Uma string vazia tem profundidade zero.',
    'maxDepth',
    'max_depth',
    ['text'],
    [
      [['(()())'], 2],
      [['((()))'], 3],
      [[''], 0],
      [['()()'], 1],
    ]
  ),
  template(
    'longest-increasing',
    'Subsequência crescente',
    'Difícil',
    ['arrays', 'programação dinâmica'],
    'Retorne o tamanho da maior subsequência estritamente crescente, sem exigir posições consecutivas.',
    'lisLength',
    'lis_length',
    ['numbers'],
    [
      [[[10, 9, 2, 5, 3, 7, 101, 18]], 4],
      [[[3, 3, 3]], 1],
      [[[]], 0],
      [[[1, 2, 3, 4]], 4],
    ]
  ),
  template(
    'edit-distance',
    'Distância de edição',
    'Difícil',
    ['strings', 'programação dinâmica'],
    'Calcule o número mínimo de inserções, remoções e substituições de um caractere para transformar a primeira string na segunda.',
    'editDistance',
    'edit_distance',
    ['source', 'target'],
    [
      [['kitten', 'sitting'], 3],
      [['', 'abc'], 3],
      [['same', 'same'], 0],
      [['ab', 'ba'], 2],
    ]
  ),
  template(
    'min-coins',
    'Troco mínimo',
    'Difícil',
    ['arrays', 'programação dinâmica', 'matemática'],
    'Com moedas positivas reutilizáveis, retorne a menor quantidade que soma amount. Retorne -1 se impossível e 0 para amount zero.',
    'minCoins',
    'min_coins',
    ['coins', 'amount'],
    [
      [[[1, 2, 5], 11], 3],
      [[[2], 3], -1],
      [[[1], 0], 0],
      [[[2, 3], 7], 3],
    ]
  ),
];
