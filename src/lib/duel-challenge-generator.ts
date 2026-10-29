import type { DuelProblem } from './duel-problems';
import { EXTRA_DUEL_CHALLENGES } from './duel-extra-challenges';

export interface ChallengeTemplate {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  topics: string[];
  description: string;
  functionName: string;
  starters: {
    TS: string;
    JS: string;
    PYTHON: string;
  };
  testCases: Array<{
    id: string;
    description: string;
    inputDisplay: string;
    expectedDisplay: string;
    testExpression: {
      TS: string;
      JS: string;
      PYTHON: string;
    };
  }>;
}

export const CHALLENGE_LIBRARY: ChallengeTemplate[] = [
  ...EXTRA_DUEL_CHALLENGES,
  // --- FÁCIL ---
  {
    id: 'is-anagram',
    title: 'Verificador de Anagramas',
    difficulty: 'Fácil',
    topics: ['strings', 'anagrama', 'texto', 'hash'],
    description:
      'Escreva uma função que recebe duas strings e verifica se uma é um anagrama da outra (contém as mesmas letras na mesma quantidade, desconsiderando maiúsculas).',
    functionName: 'isAnagram',
    starters: {
      TS: 'function isAnagram(s: string, t: string): boolean {\n  // Seu código aqui\n  return false;\n}',
      JS: 'function isAnagram(s, t) {\n  // Seu código aqui\n  return false;\n}',
      PYTHON: 'def is_anagram(s: str, t: str) -> bool:\n    # Seu código aqui\n    return False\n',
    },
    testCases: [
      {
        id: 't1',
        description: '"amor" e "roma"',
        inputDisplay: '"amor", "roma"',
        expectedDisplay: 'true',
        testExpression: {
          TS: 'isAnagram("amor", "roma") === true',
          JS: 'isAnagram("amor", "roma") === true',
          PYTHON: 'is_anagram("amor", "roma") == True',
        },
      },
      {
        id: 't2',
        description: '"rato" e "torta"',
        inputDisplay: '"rato", "torta"',
        expectedDisplay: 'false',
        testExpression: {
          TS: 'isAnagram("rato", "torta") === false',
          JS: 'isAnagram("rato", "torta") === false',
          PYTHON: 'is_anagram("rato", "torta") == False',
        },
      },
      {
        id: 't3',
        description: '"listen" e "silent"',
        inputDisplay: '"listen", "silent"',
        expectedDisplay: 'true',
        testExpression: {
          TS: 'isAnagram("listen", "silent") === true',
          JS: 'isAnagram("listen", "silent") === true',
          PYTHON: 'is_anagram("listen", "silent") == True',
        },
      },
    ],
  },
  {
    id: 'factorial-calc',
    title: 'Cálculo de Fatorial',
    difficulty: 'Fácil',
    topics: ['matemática', 'recursão', 'números', 'fatorial'],
    description:
      'Crie uma função que calcula o fatorial de um número inteiro não-negativo n (n!). Considere que 0! = 1.',
    functionName: 'factorial',
    starters: {
      TS: 'function factorial(n: number): number {\n  // Seu código aqui\n  return 0;\n}',
      JS: 'function factorial(n) {\n  // Seu código aqui\n  return 0;\n}',
      PYTHON: 'def factorial(n: int) -> int:\n    # Seu código aqui\n    return 0\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Fatorial de 5 (5!)',
        inputDisplay: '5',
        expectedDisplay: '120',
        testExpression: {
          TS: 'factorial(5) === 120',
          JS: 'factorial(5) === 120',
          PYTHON: 'factorial(5) == 120',
        },
      },
      {
        id: 't2',
        description: 'Fatorial de 0 (0!)',
        inputDisplay: '0',
        expectedDisplay: '1',
        testExpression: {
          TS: 'factorial(0) === 1',
          JS: 'factorial(0) === 1',
          PYTHON: 'factorial(0) == 1',
        },
      },
      {
        id: 't3',
        description: 'Fatorial de 3 (3!)',
        inputDisplay: '3',
        expectedDisplay: '6',
        testExpression: {
          TS: 'factorial(3) === 6',
          JS: 'factorial(3) === 6',
          PYTHON: 'factorial(3) == 6',
        },
      },
    ],
  },
  {
    id: 'sum-digits',
    title: 'Soma dos Dígitos',
    difficulty: 'Fácil',
    topics: ['matemática', 'números', 'dígitos'],
    description:
      'Escreva uma função que recebe um número inteiro positivo e retorna a soma de todos os seus dígitos decimais.',
    functionName: 'sumDigits',
    starters: {
      TS: 'function sumDigits(num: number): number {\n  // Seu código aqui\n  return 0;\n}',
      JS: 'function sumDigits(num) {\n  // Seu código aqui\n  return 0;\n}',
      PYTHON: 'def sum_digits(num: int) -> int:\n    # Seu código aqui\n    return 0\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Soma dígitos de 1234',
        inputDisplay: '1234',
        expectedDisplay: '10',
        testExpression: {
          TS: 'sumDigits(1234) === 10',
          JS: 'sumDigits(1234) === 10',
          PYTHON: 'sum_digits(1234) == 10',
        },
      },
      {
        id: 't2',
        description: 'Soma dígitos de 905',
        inputDisplay: '905',
        expectedDisplay: '14',
        testExpression: {
          TS: 'sumDigits(905) === 14',
          JS: 'sumDigits(905) === 14',
          PYTHON: 'sum_digits(905) == 14',
        },
      },
      {
        id: 't3',
        description: 'Soma dígitos de 7',
        inputDisplay: '7',
        expectedDisplay: '7',
        testExpression: {
          TS: 'sumDigits(7) === 7',
          JS: 'sumDigits(7) === 7',
          PYTHON: 'sum_digits(7) == 7',
        },
      },
    ],
  },
  {
    id: 'find-max-number',
    title: 'Maior Número no Array',
    difficulty: 'Fácil',
    topics: ['arrays', 'listas', 'busca', 'máximo'],
    description:
      'Escreva a função `findMax(nums)` que encontra e retorna o maior valor dentro de uma lista de números.',
    functionName: 'findMax',
    starters: {
      TS: 'function findMax(nums: number[]): number {\n  // Seu código aqui\n  return 0;\n}',
      JS: 'function findMax(nums) {\n  // Seu código aqui\n  return 0;\n}',
      PYTHON: 'def find_max(nums: list[int]) -> int:\n    # Seu código aqui\n    return 0\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Lista [3, 7, 2, 9, 5]',
        inputDisplay: '[3, 7, 2, 9, 5]',
        expectedDisplay: '9',
        testExpression: {
          TS: 'findMax([3, 7, 2, 9, 5]) === 9',
          JS: 'findMax([3, 7, 2, 9, 5]) === 9',
          PYTHON: 'find_max([3, 7, 2, 9, 5]) == 9',
        },
      },
      {
        id: 't2',
        description: 'Lista com números negativos [-10, -5, -20]',
        inputDisplay: '[-10, -5, -20]',
        expectedDisplay: '-5',
        testExpression: {
          TS: 'findMax([-10, -5, -20]) === -5',
          JS: 'findMax([-10, -5, -20]) === -5',
          PYTHON: 'find_max([-10, -5, -20]) == -5',
        },
      },
    ],
  },
  {
    id: 'is-prime-number',
    title: 'Verificador de Número Primo',
    difficulty: 'Fácil',
    topics: ['matemática', 'primo', 'números'],
    description:
      'Crie a função `isPrime(n)` que retorna `true` se o número inteiro n (n > 1) for primo, ou `false` caso contrário.',
    functionName: 'isPrime',
    starters: {
      TS: 'function isPrime(n: number): boolean {\n  // Seu código aqui\n  return false;\n}',
      JS: 'function isPrime(n) {\n  // Seu código aqui\n  return false;\n}',
      PYTHON: 'def is_prime(n: int) -> bool:\n    # Seu código aqui\n    return False\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Número 7 é primo',
        inputDisplay: '7',
        expectedDisplay: 'true',
        testExpression: {
          TS: 'isPrime(7) === true',
          JS: 'isPrime(7) === true',
          PYTHON: 'is_prime(7) == True',
        },
      },
      {
        id: 't2',
        description: 'Número 12 não é primo',
        inputDisplay: '12',
        expectedDisplay: 'false',
        testExpression: {
          TS: 'isPrime(12) === false',
          JS: 'isPrime(12) === false',
          PYTHON: 'is_prime(12) == False',
        },
      },
      {
        id: 't3',
        description: 'Número 1 não é primo',
        inputDisplay: '1',
        expectedDisplay: 'false',
        testExpression: {
          TS: 'isPrime(1) === false',
          JS: 'isPrime(1) === false',
          PYTHON: 'is_prime(1) == False',
        },
      },
    ],
  },

  // --- MÉDIO ---
  {
    id: 'valid-parentheses',
    title: 'Validador de Parênteses Balanceados',
    difficulty: 'Médio',
    topics: ['pilhas', 'strings', 'estrutura de dados', 'parênteses'],
    description:
      'Dada uma string contendo apenas os caracteres `(`, `)`, `{`, `}`, `[` e `]`, determine se a sequência de parênteses é válida e está devidamente fechada na ordem correta.',
    functionName: 'isValidParentheses',
    starters: {
      TS: 'function isValidParentheses(s: string): boolean {\n  // Seu código aqui\n  return false;\n}',
      JS: 'function isValidParentheses(s) {\n  // Seu código aqui\n  return false;\n}',
      PYTHON:
        'def is_valid_parentheses(s: str) -> bool:\n    # Seu código aqui\n    return False\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Sequência "()[]{}"',
        inputDisplay: '"()[]{}"',
        expectedDisplay: 'true',
        testExpression: {
          TS: 'isValidParentheses("()[]{}") === true',
          JS: 'isValidParentheses("()[]{}") === true',
          PYTHON: 'is_valid_parentheses("()[]{}") == True',
        },
      },
      {
        id: 't2',
        description: 'Sequência "(]" inválida',
        inputDisplay: '"(]"',
        expectedDisplay: 'false',
        testExpression: {
          TS: 'isValidParentheses("(]") === false',
          JS: 'isValidParentheses("(]") === false',
          PYTHON: 'is_valid_parentheses("(]") == False',
        },
      },
      {
        id: 't3',
        description: 'Aninhamento "{[()]}"',
        inputDisplay: '"{[()]}"',
        expectedDisplay: 'true',
        testExpression: {
          TS: 'isValidParentheses("{[()]}") === true',
          JS: 'isValidParentheses("{[()]}") === true',
          PYTHON: 'is_valid_parentheses("{[()]}") == True',
        },
      },
    ],
  },
  {
    id: 'max-subarray-kadane',
    title: 'Maior Soma de Subarray (Kadane)',
    difficulty: 'Médio',
    topics: ['arrays', 'algoritmos', 'dinâmica', 'kadane'],
    description:
      'Dado um array de números inteiros `nums`, encontre o subarray contíguo que possui a maior soma e retorne essa soma máxima.',
    functionName: 'maxSubArray',
    starters: {
      TS: 'function maxSubArray(nums: number[]): number {\n  // Seu código aqui\n  return 0;\n}',
      JS: 'function maxSubArray(nums) {\n  // Seu código aqui\n  return 0;\n}',
      PYTHON: 'def max_sub_array(nums: list[int]) -> int:\n    # Seu código aqui\n    return 0\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Array [-2, 1, -3, 4, -1, 2, 1, -5, 4] soma máxima 6',
        inputDisplay: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        expectedDisplay: '6',
        testExpression: {
          TS: 'maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) === 6',
          JS: 'maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) === 6',
          PYTHON: 'max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6',
        },
      },
      {
        id: 't2',
        description: 'Array com valor único [1]',
        inputDisplay: '[1]',
        expectedDisplay: '1',
        testExpression: {
          TS: 'maxSubArray([1]) === 1',
          JS: 'maxSubArray([1]) === 1',
          PYTHON: 'max_sub_array([1]) == 1',
        },
      },
      {
        id: 't3',
        description: 'Array [5, 4, -1, 7, 8] soma máxima 23',
        inputDisplay: '[5, 4, -1, 7, 8]',
        expectedDisplay: '23',
        testExpression: {
          TS: 'maxSubArray([5, 4, -1, 7, 8]) === 23',
          JS: 'maxSubArray([5, 4, -1, 7, 8]) === 23',
          PYTHON: 'max_sub_array([5, 4, -1, 7, 8]) == 23',
        },
      },
    ],
  },
  {
    id: 'binary-search-array',
    title: 'Busca Binária',
    difficulty: 'Médio',
    topics: ['busca', 'binária', 'arrays', 'algoritmos'],
    description:
      'Dado um array ordenado de inteiros `nums` e um valor `target`, escreva uma função de busca binária O(log n) que retorne o índice do `target`, ou `-1` caso não exista.',
    functionName: 'binarySearch',
    starters: {
      TS: 'function binarySearch(nums: number[], target: number): number {\n  // Seu código aqui\n  return -1;\n}',
      JS: 'function binarySearch(nums, target) {\n  // Seu código aqui\n  return -1;\n}',
      PYTHON:
        'def binary_search(nums: list[int], target: int) -> int:\n    # Seu código aqui\n    return -1\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Busca 9 em [-1, 0, 3, 5, 9, 12]',
        inputDisplay: '[-1, 0, 3, 5, 9, 12], 9',
        expectedDisplay: '4',
        testExpression: {
          TS: 'binarySearch([-1, 0, 3, 5, 9, 12], 9) === 4',
          JS: 'binarySearch([-1, 0, 3, 5, 9, 12], 9) === 4',
          PYTHON: 'binary_search([-1, 0, 3, 5, 9, 12], 9) == 4',
        },
      },
      {
        id: 't2',
        description: 'Busca 2 em [-1, 0, 3, 5, 9, 12] (não existe)',
        inputDisplay: '[-1, 0, 3, 5, 9, 12], 2',
        expectedDisplay: '-1',
        testExpression: {
          TS: 'binarySearch([-1, 0, 3, 5, 9, 12], 2) === -1',
          JS: 'binarySearch([-1, 0, 3, 5, 9, 12], 2) === -1',
          PYTHON: 'binary_search([-1, 0, 3, 5, 9, 12], 2) == -1',
        },
      },
    ],
  },
  {
    id: 'compress-string-rle',
    title: 'Compressão Run-Length (RLE)',
    difficulty: 'Médio',
    topics: ['strings', 'compressão', 'algoritmos'],
    description:
      'Implemente uma função que compacta uma string substituindo caracteres consecutivos repetidos pela letra seguida da contagem (ex: "aabcccccaaa" -> "a2b1c5a3"). Se a string comprimida não for menor, retorne a original.',
    functionName: 'compressString',
    starters: {
      TS: 'function compressString(s: string): string {\n  // Seu código aqui\n  return s;\n}',
      JS: 'function compressString(s) {\n  // Seu código aqui\n  return s;\n}',
      PYTHON: 'def compress_string(s: str) -> str:\n    # Seu código aqui\n    return s\n',
    },
    testCases: [
      {
        id: 't1',
        description: '"aabcccccaaa" comprime para "a2b1c5a3"',
        inputDisplay: '"aabcccccaaa"',
        expectedDisplay: '"a2b1c5a3"',
        testExpression: {
          TS: 'compressString("aabcccccaaa") === "a2b1c5a3"',
          JS: 'compressString("aabcccccaaa") === "a2b1c5a3"',
          PYTHON: 'compress_string("aabcccccaaa") == "a2b1c5a3"',
        },
      },
      {
        id: 't2',
        description: '"abcdef" não reduz tamanho, retorna "abcdef"',
        inputDisplay: '"abcdef"',
        expectedDisplay: '"abcdef"',
        testExpression: {
          TS: 'compressString("abcdef") === "abcdef"',
          JS: 'compressString("abcdef") === "abcdef"',
          PYTHON: 'compress_string("abcdef") == "abcdef"',
        },
      },
    ],
  },

  // --- DIFÍCIL ---
  {
    id: 'merge-intervals',
    title: 'Fusão de Intervalos Sobrepostos',
    difficulty: 'Difícil',
    topics: ['arrays', 'intervalos', 'ordenação', 'matrizes'],
    description:
      'Dado um conjunto de intervalos `[[start, end], ...]`, mescle todos os intervalos que se sobrepõem e retorne uma lista de intervalos disjuntos ordenados.',
    functionName: 'mergeIntervals',
    starters: {
      TS: 'function mergeIntervals(intervals: number[][]): number[][] {\n  // Seu código aqui\n  return [];\n}',
      JS: 'function mergeIntervals(intervals) {\n  // Seu código aqui\n  return [];\n}',
      PYTHON:
        'def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    # Seu código aqui\n    return []\n',
    },
    testCases: [
      {
        id: 't1',
        description: '[[1,3],[2,6],[8,10],[15,18]] mescla para [[1,6],[8,10],[15,18]]',
        inputDisplay: '[[1,3],[2,6],[8,10],[15,18]]',
        expectedDisplay: '[[1,6],[8,10],[15,18]]',
        testExpression: {
          TS: 'JSON.stringify(mergeIntervals([[1,3],[2,6],[8,10],[15,18]])) === JSON.stringify([[1,6],[8,10],[15,18]])',
          JS: 'JSON.stringify(mergeIntervals([[1,3],[2,6],[8,10],[15,18]])) === JSON.stringify([[1,6],[8,10],[15,18]])',
          PYTHON: 'merge_intervals([[1,3],[2,6],[8,10],[15,18]]) == [[1,6],[8,10],[15,18]]',
        },
      },
      {
        id: 't2',
        description: '[[1,4],[4,5]] mescla para [[1,5]]',
        inputDisplay: '[[1,4],[4,5]]',
        expectedDisplay: '[[1,5]]',
        testExpression: {
          TS: 'JSON.stringify(mergeIntervals([[1,4],[4,5]])) === JSON.stringify([[1,5]])',
          JS: 'JSON.stringify(mergeIntervals([[1,4],[4,5]])) === JSON.stringify([[1,5]])',
          PYTHON: 'merge_intervals([[1,4],[4,5]]) == [[1,5]]',
        },
      },
    ],
  },
  {
    id: 'longest-substring-without-repeats',
    title: 'Substring Mais Longa Sem Repetições',
    difficulty: 'Difícil',
    topics: ['strings', 'two pointers', 'sliding window', 'janela deslizante'],
    description:
      'Dada uma string `s`, encontre o comprimento da substring mais longa sem caracteres repetidos (ex: "abcabcbb" tem tamanho 3 com "abc").',
    functionName: 'lengthOfLongestSubstring',
    starters: {
      TS: 'function lengthOfLongestSubstring(s: string): number {\n  // Seu código aqui\n  return 0;\n}',
      JS: 'function lengthOfLongestSubstring(s) {\n  // Seu código aqui\n  return 0;\n}',
      PYTHON:
        'def length_of_longest_substring(s: str) -> int:\n    # Seu código aqui\n    return 0\n',
    },
    testCases: [
      {
        id: 't1',
        description: '"abcabcbb" tamanho 3',
        inputDisplay: '"abcabcbb"',
        expectedDisplay: '3',
        testExpression: {
          TS: 'lengthOfLongestSubstring("abcabcbb") === 3',
          JS: 'lengthOfLongestSubstring("abcabcbb") === 3',
          PYTHON: 'length_of_longest_substring("abcabcbb") == 3',
        },
      },
      {
        id: 't2',
        description: '"bbbbb" tamanho 1',
        inputDisplay: '"bbbbb"',
        expectedDisplay: '1',
        testExpression: {
          TS: 'lengthOfLongestSubstring("bbbbb") === 1',
          JS: 'lengthOfLongestSubstring("bbbbb") === 1',
          PYTHON: 'length_of_longest_substring("bbbbb") == 1',
        },
      },
      {
        id: 't3',
        description: '"pwwkew" tamanho 3 ("wke")',
        inputDisplay: '"pwwkew"',
        expectedDisplay: '3',
        testExpression: {
          TS: 'lengthOfLongestSubstring("pwwkew") === 3',
          JS: 'lengthOfLongestSubstring("pwwkew") === 3',
          PYTHON: 'length_of_longest_substring("pwwkew") == 3',
        },
      },
    ],
  },
];

/**
 * Procedural challenge generator when no external AI provider is configured
 * or when the AI provider times out/fails.
 */
export function generateProceduralDuelProblem(
  language: string,
  difficulty: 'Fácil' | 'Médio' | 'Difícil',
  topic?: string,
  excludeIds: string[] = []
): DuelProblem {
  const normTopic = topic ? topic.toLowerCase().trim() : '';

  // 1. Filter by requested difficulty
  let candidates = CHALLENGE_LIBRARY.filter((c) => c.difficulty === difficulty);
  if (candidates.length === 0) {
    candidates = CHALLENGE_LIBRARY;
  }

  // 2. If topic requested, prioritize topic matches
  if (normTopic) {
    const topicMatches = candidates.filter(
      (c) =>
        c.topics.some((t) => t.includes(normTopic) || normTopic.includes(t)) ||
        c.title.toLowerCase().includes(normTopic) ||
        c.description.toLowerCase().includes(normTopic)
    );
    if (topicMatches.length > 0) {
      candidates = topicMatches;
    }
  }

  const unseen = candidates.filter(
    (candidate) =>
      !excludeIds.some((id) => id === candidate.id || id.startsWith(`${candidate.id}-`))
  );
  if (unseen.length > 0) candidates = unseen;
  // Pick a candidate outside the recent history when possible.
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  const uniqueSuffix = Date.now().toString(36).slice(-4);

  return {
    id: `${chosen.id}-${uniqueSuffix}`,
    title: chosen.title,
    difficulty: chosen.difficulty,
    description: chosen.description,
    functionName: chosen.functionName,
    starters: chosen.starters,
    testCases: chosen.testCases,
  };
}
