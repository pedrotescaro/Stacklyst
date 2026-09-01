export interface DuelTestCase {
  id: string;
  description: string;
  inputDisplay: string;
  expectedDisplay: string;
  testExpression: {
    TS: string;
    JS: string;
    PYTHON: string;
  };
}

export interface DuelProblem {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  description: string;
  functionName: string;
  constraints?: string[];
  starters: {
    TS: string;
    JS: string;
    PYTHON: string;
    [key: string]: string;
  };
  testCases: DuelTestCase[];
}

export const DUEL_PROBLEMS: DuelProblem[] = [
  {
    id: 'reverse-string',
    title: 'Inverter String',
    difficulty: 'Fácil',
    description:
      'Crie uma função `reverseString(str)` que recebe uma string e retorna a mesma invertida.',
    functionName: 'reverseString',
    starters: {
      TS: 'function reverseString(str: string): string {\n  // Seu código aqui\n  return "";\n}',
      JS: 'function reverseString(str) {\n  // Seu código aqui\n  return "";\n}',
      PYTHON: 'def reverse_string(s: str) -> str:\n    # Seu código aqui\n    return ""\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Inverte "stacklyst"',
        inputDisplay: '"stacklyst"',
        expectedDisplay: '"tsylkcats"',
        testExpression: {
          TS: 'reverseString("stacklyst") === "tsylkcats"',
          JS: 'reverseString("stacklyst") === "tsylkcats"',
          PYTHON: 'reverse_string("stacklyst") == "tsylkcats"',
        },
      },
      {
        id: 't2',
        description: 'Inverte "hello"',
        inputDisplay: '"hello"',
        expectedDisplay: '"olleh"',
        testExpression: {
          TS: 'reverseString("hello") === "olleh"',
          JS: 'reverseString("hello") === "olleh"',
          PYTHON: 'reverse_string("hello") == "olleh"',
        },
      },
      {
        id: 't3',
        description: 'Inverte string vazia ""',
        inputDisplay: '""',
        expectedDisplay: '""',
        testExpression: {
          TS: 'reverseString("") === ""',
          JS: 'reverseString("") === ""',
          PYTHON: 'reverse_string("") == ""',
        },
      },
    ],
  },
  {
    id: 'two-sum',
    title: 'Soma de Dois Números (Two Sum)',
    difficulty: 'Médio',
    description:
      'Escreva a função `twoSum(nums, target)` que retorna os índices `[i, j]` dos dois números que somam `target`.',
    functionName: 'twoSum',
    starters: {
      TS: 'function twoSum(nums: number[], target: number): [number, number] | [] {\n  // Seu código aqui\n  return [];\n}',
      JS: 'function twoSum(nums, target) {\n  // Seu código aqui\n  return [];\n}',
      PYTHON:
        'def two_sum(nums: list[int], target: int) -> list[int]:\n    # Seu código aqui\n    return []\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Array [2, 7, 11, 15] e alvo 9',
        inputDisplay: '[2, 7, 11, 15], 9',
        expectedDisplay: '[0, 1]',
        testExpression: {
          TS: 'JSON.stringify(twoSum([2, 7, 11, 15], 9)) === "[0,1]" || JSON.stringify(twoSum([2, 7, 11, 15], 9)) === "[1,0]"',
          JS: 'JSON.stringify(twoSum([2, 7, 11, 15], 9)) === "[0,1]" || JSON.stringify(twoSum([2, 7, 11, 15], 9)) === "[1,0]"',
          PYTHON: 'sorted(two_sum([2, 7, 11, 15], 9)) == [0, 1]',
        },
      },
      {
        id: 't2',
        description: 'Array [3, 2, 4] e alvo 6',
        inputDisplay: '[3, 2, 4], 6',
        expectedDisplay: '[1, 2]',
        testExpression: {
          TS: 'JSON.stringify(twoSum([3, 2, 4], 6)) === "[1,2]" || JSON.stringify(twoSum([3, 2, 4], 6)) === "[2,1]"',
          JS: 'JSON.stringify(twoSum([3, 2, 4], 6)) === "[1,2]" || JSON.stringify(twoSum([3, 2, 4], 6)) === "[2,1]"',
          PYTHON: 'sorted(two_sum([3, 2, 4], 6)) == [1, 2]',
        },
      },
      {
        id: 't3',
        description: 'Array [3, 3] e alvo 6',
        inputDisplay: '[3, 3], 6',
        expectedDisplay: '[0, 1]',
        testExpression: {
          TS: 'JSON.stringify(twoSum([3, 3], 6)) === "[0,1]"',
          JS: 'JSON.stringify(twoSum([3, 3], 6)) === "[0,1]"',
          PYTHON: 'sorted(two_sum([3, 3], 6)) == [0, 1]',
        },
      },
    ],
  },
  {
    id: 'palindrome-check',
    title: 'Verificador de Palíndromo',
    difficulty: 'Fácil',
    description:
      'Crie a função `isPalindrome(str)` que retorna `true` se a string (ignorando maiúsculas e espaços) for um palíndromo.',
    functionName: 'isPalindrome',
    starters: {
      TS: 'function isPalindrome(str: string): boolean {\n  // Seu código aqui\n  return false;\n}',
      JS: 'function isPalindrome(str) {\n  // Seu código aqui\n  return false;\n}',
      PYTHON: 'def is_palindrome(s: str) -> bool:\n    # Seu código aqui\n    return False\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Verifica "radar"',
        inputDisplay: '"radar"',
        expectedDisplay: 'true',
        testExpression: {
          TS: 'isPalindrome("radar") === true',
          JS: 'isPalindrome("radar") === true',
          PYTHON: 'is_palindrome("radar") == True',
        },
      },
      {
        id: 't2',
        description: 'Verifica "Ame a ema"',
        inputDisplay: '"Ame a ema"',
        expectedDisplay: 'true',
        testExpression: {
          TS: 'isPalindrome("Ame a ema") === true',
          JS: 'isPalindrome("Ame a ema") === true',
          PYTHON: 'is_palindrome("Ame a ema") == True',
        },
      },
      {
        id: 't3',
        description: 'Verifica "devdeck"',
        inputDisplay: '"devdeck"',
        expectedDisplay: 'false',
        testExpression: {
          TS: 'isPalindrome("devdeck") === false',
          JS: 'isPalindrome("devdeck") === false',
          PYTHON: 'is_palindrome("devdeck") == False',
        },
      },
    ],
  },
  {
    id: 'fizzbuzz-turbo',
    title: 'FizzBuzz Turbo',
    difficulty: 'Fácil',
    description:
      'Escreva `fizzBuzz(n)` que retorna um array de 1 a n onde múltiplos de 3 são "Fizz", de 5 são "Buzz" e de ambos são "FizzBuzz".',
    functionName: 'fizzBuzz',
    starters: {
      TS: 'function fizzBuzz(n: number): string[] {\n  // Seu código aqui\n  return [];\n}',
      JS: 'function fizzBuzz(n) {\n  // Seu código aqui\n  return [];\n}',
      PYTHON: 'def fizz_buzz(n: int) -> list[str]:\n    # Seu código aqui\n    return []\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Caso n = 5',
        inputDisplay: '5',
        expectedDisplay: '["1","2","Fizz","4","Buzz"]',
        testExpression: {
          TS: 'JSON.stringify(fizzBuzz(5)) === JSON.stringify(["1","2","Fizz","4","Buzz"])',
          JS: 'JSON.stringify(fizzBuzz(5)) === JSON.stringify(["1","2","Fizz","4","Buzz"])',
          PYTHON: 'fizz_buzz(5) == ["1", "2", "Fizz", "4", "Buzz"]',
        },
      },
      {
        id: 't2',
        description: 'Caso n = 15 termina com FizzBuzz',
        inputDisplay: '15',
        expectedDisplay: 'fizzBuzz(15)[14] === "FizzBuzz"',
        testExpression: {
          TS: 'fizzBuzz(15)[14] === "FizzBuzz" && fizzBuzz(15).length === 15',
          JS: 'fizzBuzz(15)[14] === "FizzBuzz" && fizzBuzz(15).length === 15',
          PYTHON: 'fizz_buzz(15)[14] == "FizzBuzz" and len(fizz_buzz(15)) == 15',
        },
      },
    ],
  },
  {
    id: 'count-vowels',
    title: 'Contador de Vogais',
    difficulty: 'Fácil',
    description:
      'Crie a função `countVowels(str)` que conta a quantidade de vogais (a, e, i, o, u) presentes na string.',
    functionName: 'countVowels',
    starters: {
      TS: 'function countVowels(str: string): number {\n  // Seu código aqui\n  return 0;\n}',
      JS: 'function countVowels(str) {\n  // Seu código aqui\n  return 0;\n}',
      PYTHON: 'def count_vowels(s: str) -> int:\n    # Seu código aqui\n    return 0\n',
    },
    testCases: [
      {
        id: 't1',
        description: 'Conta em "TypeScript"',
        inputDisplay: '"TypeScript"',
        expectedDisplay: '2',
        testExpression: {
          TS: 'countVowels("TypeScript") === 2',
          JS: 'countVowels("TypeScript") === 2',
          PYTHON: 'count_vowels("TypeScript") == 2',
        },
      },
      {
        id: 't2',
        description: 'Conta em "Stacklyst Arena"',
        inputDisplay: '"Stacklyst Arena"',
        expectedDisplay: '4',
        testExpression: {
          TS: 'countVowels("Stacklyst Arena") === 4',
          JS: 'countVowels("Stacklyst Arena") === 4',
          PYTHON: 'count_vowels("Stacklyst Arena") == 4',
        },
      },
      {
        id: 't3',
        description: 'Conta em "Rhythm"',
        inputDisplay: '"Rhythm"',
        expectedDisplay: '0',
        testExpression: {
          TS: 'countVowels("Rhythm") === 0',
          JS: 'countVowels("Rhythm") === 0',
          PYTHON: 'count_vowels("Rhythm") == 0',
        },
      },
    ],
  },
];

export function getDuelProblemById(id: string): DuelProblem {
  return DUEL_PROBLEMS.find((p) => p.id === id) ?? DUEL_PROBLEMS[0];
}

export function getRandomDuelProblem(): DuelProblem {
  const index = Math.floor(Math.random() * DUEL_PROBLEMS.length);
  return DUEL_PROBLEMS[index];
}

export interface DuelHarnessMarkers {
  start: string;
  end: string;
}

const DEFAULT_HARNESS_MARKERS: DuelHarnessMarkers = {
  start: '###TEST_RESULTS_START###',
  end: '###TEST_RESULTS_END###',
};

export function buildTestHarness(
  userCode: string,
  problem: DuelProblem,
  language: string,
  markers: DuelHarnessMarkers = DEFAULT_HARNESS_MARKERS
): string {
  const langKey =
    language.toUpperCase() === 'PYTHON' ? 'PYTHON' : language.toUpperCase() === 'JS' ? 'JS' : 'TS';
  const isolationId = markers.start.replace(/[^a-zA-Z0-9]/g, '').slice(-32) || 'stacklyst';

  if (langKey === 'PYTHON') {
    const pythonFunctionName = problem.functionName.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    const checks = problem.testCases
      .map((tc) => {
        const expr = tc.testExpression.PYTHON;
        return `
try:
    if bool(__safe_eval_${isolationId}(${JSON.stringify(expr)}, __test_globals_${isolationId})):
        __test_results_${isolationId}.append({"id": ${JSON.stringify(tc.id)}, "passed": True, "desc": ${JSON.stringify(tc.description)}})
    else:
        __test_results_${isolationId}.append({"id": ${JSON.stringify(tc.id)}, "passed": False, "desc": ${JSON.stringify(tc.description)}})
except BaseException as __test_error_${isolationId}:
    __test_results_${isolationId}.append({"id": ${JSON.stringify(tc.id)}, "passed": False, "desc": ${JSON.stringify(tc.description)}, "error": __safe_str_${isolationId}(__test_error_${isolationId})})
`;
      })
      .join('\n');

    return `
import json as __json_${isolationId}

__safe_eval_${isolationId} = eval
__safe_exec_${isolationId} = exec
__safe_str_${isolationId} = str
__safe_write_${isolationId} = __import__('sys').stdout.write
__safe_dumps_${isolationId} = __json_${isolationId}.dumps
__contestant_builtins_${isolationId} = {
    "abs": abs, "all": all, "any": any, "bool": bool, "dict": dict,
    "enumerate": enumerate, "filter": filter, "float": float, "int": int,
    "len": len, "list": list, "map": map, "max": max, "min": min,
    "range": range, "reversed": reversed, "round": round, "set": set,
    "sorted": sorted, "str": str, "sum": sum, "tuple": tuple, "zip": zip,
    "Exception": Exception, "ValueError": ValueError, "TypeError": TypeError,
}
__contestant_globals_${isolationId} = {"__builtins__": __contestant_builtins_${isolationId}}
__safe_exec_${isolationId}(${JSON.stringify(userCode)}, __contestant_globals_${isolationId})
__solution_${isolationId} = __contestant_globals_${isolationId}.get(${JSON.stringify(pythonFunctionName)})
__test_globals_${isolationId} = {
    "__builtins__": __contestant_builtins_${isolationId}.copy(),
    ${JSON.stringify(pythonFunctionName)}: __solution_${isolationId},
}
__test_results_${isolationId} = []
${checks}

__safe_write_${isolationId}(${JSON.stringify(markers.start)} + __safe_dumps_${isolationId}(__test_results_${isolationId}) + ${JSON.stringify(markers.end)})
`;
  }

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const functionPattern = new RegExp(`\\b${escapeRegExp(problem.functionName)}\\b`, 'g');
  const solutionName = `__solution_${isolationId}`;
  const safeJsonName = `__safe_json_${isolationId}`;

  // JavaScript executes contestant code in a capability-free VM context. The
  // trusted reporter and random result markers stay in the parent context.
  const checks = problem.testCases
    .map((tc) => {
      const rawExpression = tc.testExpression[langKey] || tc.testExpression.TS;
      const expr = rawExpression
        .replace(functionPattern, solutionName)
        .replace(/\bJSON\.stringify\b/g, safeJsonName);
      return `
try {
  const __passed = Boolean(__vm_${isolationId}.runInContext(${JSON.stringify(
    `Boolean(${expr})`
  )}, __context_${isolationId}, { timeout: 3000 }));
  __testResults_${isolationId}.push({ id: ${JSON.stringify(tc.id)}, passed: __passed, desc: ${JSON.stringify(tc.description)} });
} catch (err) {
  __testResults_${isolationId}.push({ id: ${JSON.stringify(tc.id)}, passed: false, desc: ${JSON.stringify(tc.description)}, error: String(err) });
}
`;
    })
    .join('\n');

  return `
const __vm_${isolationId} = eval('require')('node:vm');
const __context_${isolationId} = __vm_${isolationId}.createContext(Object.create(null), {
  codeGeneration: { strings: false, wasm: false },
});
const __contestant_source_${isolationId} = ${JSON.stringify(userCode)};
const __bootstrap_${isolationId} = [
  '"use strict";',
  'const ${safeJsonName} = JSON.stringify.bind(JSON);',
  'for (const ctor of [Object, Array, String, Number, Boolean, RegExp, Map, Set]) { Object.freeze(ctor.prototype); Object.freeze(ctor); }',
  'Object.freeze(JSON);',
  __contestant_source_${isolationId},
  'const ${solutionName} = typeof ${problem.functionName} === "function" ? ${problem.functionName} : null;',
].join('\\n');
__vm_${isolationId}.runInContext(__bootstrap_${isolationId}, __context_${isolationId}, { timeout: 3000 });

const __testResults_${isolationId} = [];
${checks}

process.stdout.write(${JSON.stringify(markers.start)} + JSON.stringify(__testResults_${isolationId}) + ${JSON.stringify(markers.end)});
`;
}

// ---------------------------------------------------------------------------
// JSON prefix used to detect AI-generated problems stored in problem_body
// ---------------------------------------------------------------------------
const AI_PROBLEM_JSON_PREFIX = '{"id":';

/**
 * Try to parse a `problem_body` string as a serialised DuelProblem.
 * Returns `null` when the string is not valid JSON or doesn't match the shape.
 */
export function parseProblemFromJson(raw: string | null | undefined): DuelProblem | null {
  if (!raw || !raw.trimStart().startsWith(AI_PROBLEM_JSON_PREFIX)) return null;

  try {
    const parsed = JSON.parse(raw);

    // Minimal structural validation
    if (
      typeof parsed.id !== 'string' ||
      typeof parsed.title !== 'string' ||
      typeof parsed.description !== 'string' ||
      typeof parsed.functionName !== 'string' ||
      !parsed.starters ||
      !Array.isArray(parsed.testCases) ||
      parsed.testCases.length === 0
    ) {
      return null;
    }

    // Ensure starters have at least TS/JS/PYTHON
    const starters = parsed.starters;
    if (!starters.TS && !starters.JS && !starters.PYTHON) return null;

    // Fill any missing starter languages with a copy
    const fallbackStarter = starters.TS || starters.JS || starters.PYTHON;
    if (!starters.TS) starters.TS = fallbackStarter;
    if (!starters.JS) starters.JS = fallbackStarter;
    if (!starters.PYTHON) starters.PYTHON = fallbackStarter;

    // Validate test cases have testExpression with at least one language
    for (const tc of parsed.testCases) {
      if (!tc.testExpression) return null;
      const te = tc.testExpression;
      const fallbackExpr = te.TS || te.JS || te.PYTHON;
      if (!fallbackExpr) return null;
      if (!te.TS) te.TS = fallbackExpr;
      if (!te.JS) te.JS = fallbackExpr;
      if (!te.PYTHON) te.PYTHON = fallbackExpr;
    }

    // Normalise difficulty
    const validDifficulties = ['Fácil', 'Médio', 'Difícil'];
    if (!validDifficulties.includes(parsed.difficulty)) {
      parsed.difficulty = 'Médio';
    }

    return parsed as DuelProblem;
  } catch {
    return null;
  }
}
