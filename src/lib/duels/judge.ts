import 'server-only';

import { randomUUID } from 'node:crypto';
import type { DuelSubmissionStatus, Language } from '@prisma/client';
import ts from 'typescript';
import { executeCode } from '@/lib/code-execution/server';
import { buildTestHarness, type DuelProblem, type DuelTestCase } from '@/lib/duel-problems';
import {
  estimateCodeComplexity,
  scoreComplexity,
  type ComplexityClass,
} from '@/lib/duels/complexity';
import {
  adaptTestsToContestantFunction,
  findContestantFunctionName,
} from '@/lib/duels/function-name';
import { getTrustedDuelProblem } from '@/lib/duels/problems';

type SupportedLanguage = 'TS' | 'JS' | 'PYTHON';

interface HiddenJudgeSpec {
  tests: DuelTestCase[];
  expectedComplexity: ComplexityClass;
}

export const SUPPORTED_DUEL_LANGUAGES = [
  'TS',
  'JS',
  'PYTHON',
] as const satisfies readonly Language[];

const hiddenSpecs: Record<string, HiddenJudgeSpec> = {
  'reverse-string': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-reverse-unicode', 'Unicode e espaços', '"Stack lyst 🚀"', '"🚀 tsyl kcatS"', {
        TS: 'reverseString("Stack lyst 🚀") === "🚀 tsyl kcatS"',
        JS: 'reverseString("Stack lyst 🚀") === "🚀 tsyl kcatS"',
        PYTHON: 'reverse_string("Stack lyst 🚀") == "🚀 tsyl kcatS"',
      }),
    ],
  },
  'two-sum': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-two-sum-negative', 'Números negativos', '[-4, -1, 0, 7], 3', '[0, 3]', {
        TS: 'JSON.stringify(twoSum([-4,-1,0,7],3).sort()) === "[0,3]"',
        JS: 'JSON.stringify(twoSum([-4,-1,0,7],3).sort()) === "[0,3]"',
        PYTHON: 'sorted(two_sum([-4,-1,0,7],3)) == [0,3]',
      }),
      test('hidden-two-sum-zero', 'Alvo zero', '[-2, 2, 8], 0', '[0, 1]', {
        TS: 'JSON.stringify(twoSum([-2,2,8],0).sort()) === "[0,1]"',
        JS: 'JSON.stringify(twoSum([-2,2,8],0).sort()) === "[0,1]"',
        PYTHON: 'sorted(two_sum([-2,2,8],0)) == [0,1]',
      }),
    ],
  },
  'palindrome-check': {
    expectedComplexity: 'O(n)',
    tests: [
      test(
        'hidden-palindrome-spaces',
        'Espaços e caixa',
        '"Socorram me subi no onibus em Marrocos"',
        'true',
        {
          TS: 'isPalindrome("Socorram me subi no onibus em Marrocos") === true',
          JS: 'isPalindrome("Socorram me subi no onibus em Marrocos") === true',
          PYTHON: 'is_palindrome("Socorram me subi no onibus em Marrocos") == True',
        }
      ),
    ],
  },
  'fizzbuzz-turbo': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-fizzbuzz-long', 'Sequência longa', '100', '100 itens', {
        TS: 'fizzBuzz(100).length === 100 && fizzBuzz(100)[89] === "FizzBuzz"',
        JS: 'fizzBuzz(100).length === 100 && fizzBuzz(100)[89] === "FizzBuzz"',
        PYTHON: 'len(fizz_buzz(100)) == 100 and fizz_buzz(100)[89] == "FizzBuzz"',
      }),
    ],
  },
  'count-vowels': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-vowels-case', 'Caixa e acentos', '"AEIOU áéíóú"', '5', {
        TS: 'countVowels("AEIOU áéíóú") === 5',
        JS: 'countVowels("AEIOU áéíóú") === 5',
        PYTHON: 'count_vowels("AEIOU áéíóú") == 5',
      }),
    ],
  },
  'is-anagram': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-anagram-case', 'Ignora caixa', '"Listen", "Silent"', 'true', {
        TS: 'isAnagram("Listen", "Silent") === true',
        JS: 'isAnagram("Listen", "Silent") === true',
        PYTHON: 'is_anagram("Listen", "Silent") == True',
      }),
      test('hidden-anagram-count', 'Respeita repetições', '"aab", "abb"', 'false', {
        TS: 'isAnagram("aab", "abb") === false',
        JS: 'isAnagram("aab", "abb") === false',
        PYTHON: 'is_anagram("aab", "abb") == False',
      }),
    ],
  },
  'factorial-calc': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-factorial-ten', 'Fatorial de 10', '10', '3628800', {
        TS: 'factorial(10) === 3628800',
        JS: 'factorial(10) === 3628800',
        PYTHON: 'factorial(10) == 3628800',
      }),
    ],
  },
  'sum-digits': {
    expectedComplexity: 'O(log n)',
    tests: [
      test('hidden-sum-digits', 'Número com seis dígitos', '987654', '39', {
        TS: 'sumDigits(987654) === 39',
        JS: 'sumDigits(987654) === 39',
        PYTHON: 'sum_digits(987654) == 39',
      }),
    ],
  },
  'find-max-number': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-find-max', 'Mistura de sinais', '[-90, 42, 0, 17]', '42', {
        TS: 'findMax([-90,42,0,17]) === 42',
        JS: 'findMax([-90,42,0,17]) === 42',
        PYTHON: 'find_max([-90,42,0,17]) == 42',
      }),
    ],
  },
  'is-prime-number': {
    expectedComplexity: 'O(log n)',
    tests: [
      test('hidden-prime', 'Primo maior', '97', 'true', {
        TS: 'isPrime(97) === true',
        JS: 'isPrime(97) === true',
        PYTHON: 'is_prime(97) == True',
      }),
      test('hidden-composite', 'Composto maior', '100', 'false', {
        TS: 'isPrime(100) === false',
        JS: 'isPrime(100) === false',
        PYTHON: 'is_prime(100) == False',
      }),
    ],
  },
  'valid-parentheses': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-parentheses-order', 'Fechamento fora de ordem', '"([)]"', 'false', {
        TS: 'isValidParentheses("([)]") === false',
        JS: 'isValidParentheses("([)]") === false',
        PYTHON: 'is_valid_parentheses("([)]") == False',
      }),
    ],
  },
  'max-subarray-kadane': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-kadane-negative', 'Todos negativos', '[-8,-3,-6,-2,-5,-4]', '-2', {
        TS: 'maxSubArray([-8,-3,-6,-2,-5,-4]) === -2',
        JS: 'maxSubArray([-8,-3,-6,-2,-5,-4]) === -2',
        PYTHON: 'max_sub_array([-8,-3,-6,-2,-5,-4]) == -2',
      }),
    ],
  },
  'binary-search-array': {
    expectedComplexity: 'O(log n)',
    tests: [
      test('hidden-binary-search', 'Busca em lista maior', '[-10,-3,0,5,9,14,22], 14', '5', {
        TS: 'binarySearch([-10,-3,0,5,9,14,22],14) === 5',
        JS: 'binarySearch([-10,-3,0,5,9,14,22],14) === 5',
        PYTHON: 'binary_search([-10,-3,0,5,9,14,22],14) == 5',
      }),
    ],
  },
  'compress-string-rle': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-rle', 'Vários blocos', '"aaaaabbbbcc"', '"a5b4c2"', {
        TS: 'compressString("aaaaabbbbcc") === "a5b4c2"',
        JS: 'compressString("aaaaabbbbcc") === "a5b4c2"',
        PYTHON: 'compress_string("aaaaabbbbcc") == "a5b4c2"',
      }),
    ],
  },
  'merge-intervals': {
    expectedComplexity: 'O(n log n)',
    tests: [
      test('hidden-merge-intervals', 'Intervalos fora de ordem', '[[1,4],[0,2],[3,5]]', '[[0,5]]', {
        TS: 'JSON.stringify(mergeIntervals([[1,4],[0,2],[3,5]])) === "[[0,5]]"',
        JS: 'JSON.stringify(mergeIntervals([[1,4],[0,2],[3,5]])) === "[[0,5]]"',
        PYTHON: 'merge_intervals([[1,4],[0,2],[3,5]]) == [[0,5]]',
      }),
    ],
  },
  'longest-substring-without-repeats': {
    expectedComplexity: 'O(n)',
    tests: [
      test('hidden-longest-substring', 'Repetição não contígua', '"dvdf"', '3', {
        TS: 'lengthOfLongestSubstring("dvdf") === 3',
        JS: 'lengthOfLongestSubstring("dvdf") === 3',
        PYTHON: 'length_of_longest_substring("dvdf") == 3',
      }),
    ],
  },
};

function test(
  id: string,
  description: string,
  inputDisplay: string,
  expectedDisplay: string,
  testExpression: DuelTestCase['testExpression']
): DuelTestCase {
  return { id, description, inputDisplay, expectedDisplay, testExpression };
}

export function isSupportedDuelLanguage(language: Language): language is SupportedLanguage {
  return (SUPPORTED_DUEL_LANGUAGES as readonly Language[]).includes(language);
}

function executionLanguage(language: SupportedLanguage): string {
  return language === 'PYTHON' ? 'python' : 'javascript';
}

function executableContestantCode(code: string, language: SupportedLanguage): string {
  if (language !== 'TS') return code;

  return ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      strict: false,
    },
    reportDiagnostics: false,
  }).outputText;
}

function parseResults(
  output: string,
  startMarker: string,
  endMarker: string
): Array<{ id: string; passed: boolean; error?: string }> {
  const start = output.lastIndexOf(startMarker);
  const end = output.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(output.slice(start + startMarker.length, end));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function failureStatus(error?: string): DuelSubmissionStatus {
  if (!error) return 'JUDGE_UNAVAILABLE';
  if (/compila/i.test(error)) return 'COMPILE_ERROR';
  if (/tempo limite/i.test(error)) return 'TIME_LIMIT_EXCEEDED';
  if (/indisponível|não suportada/i.test(error)) return 'JUDGE_UNAVAILABLE';
  return 'RUNTIME_ERROR';
}

export interface PublicDuelTestResult {
  id: string;
  passed: boolean;
  error?: string;
}

export interface JudgedSubmission {
  status: DuelSubmissionStatus;
  passedTests: number;
  totalTests: number;
  publicPassedTests: number;
  publicTotalTests: number;
  runtimeMs: number | null;
  complexity: string;
  complexityConfidence: 'medium' | 'low' | null;
  complexityReason: string | null;
  complexityScore: number;
  score: number;
  publicResult: PublicDuelTestResult[];
  error?: string;
}

export async function judgeDuelCode(input: {
  problemId: string;
  code: string;
  language: Language;
  executionLimitSeconds?: number;
  includeHiddenTests: boolean;
}): Promise<JudgedSubmission> {
  const problem = getTrustedDuelProblem(input.problemId);
  if (!problem) {
    return unavailableResult('O problema não pertence ao catálogo verificável da arena.');
  }
  if (!isSupportedDuelLanguage(input.language)) {
    return unavailableResult(`A linguagem ${input.language} ainda não possui juiz de duelos.`);
  }

  const spec = hiddenSpecs[problem.id] ?? { tests: [], expectedComplexity: 'O(n)' as const };
  const tests = input.includeHiddenTests
    ? [...problem.testCases, ...spec.tests]
    : problem.testCases;
  const contestantFunctionName = findContestantFunctionName(
    input.code,
    input.language,
    problem.functionName
  );
  const judgedProblem: DuelProblem = {
    ...problem,
    functionName: contestantFunctionName,
    testCases: adaptTestsToContestantFunction(
      tests,
      problem.functionName,
      contestantFunctionName,
      input.language
    ),
  };
  const markerId = randomUUID();
  const startMarker = `__STACKLYST_DUEL_${markerId}_START__`;
  const endMarker = `__STACKLYST_DUEL_${markerId}_END__`;
  const harnessLanguage = input.language === 'TS' ? 'JS' : input.language;
  const harness = buildTestHarness(
    executableContestantCode(input.code, input.language),
    judgedProblem,
    harnessLanguage,
    {
      start: startMarker,
      end: endMarker,
    }
  );
  const result = await executeCode(harness, executionLanguage(input.language));
  const parsed = result.ok ? parseResults(result.output, startMarker, endMarker) : [];
  const totalTests = tests.length;
  const passedTests = parsed.filter((item) => item.passed).length;
  const publicIds = new Set(problem.testCases.map((item) => item.id));
  const publicResult = parsed.filter((item) => publicIds.has(item.id));
  const publicPassedTests = publicResult.filter((item) => item.passed).length;

  if (!result.ok) {
    return {
      status: failureStatus(result.error),
      passedTests,
      totalTests,
      publicPassedTests,
      publicTotalTests: problem.testCases.length,
      runtimeMs: result.executionMs || null,
      complexity: 'Não medida',
      complexityConfidence: null,
      complexityReason: null,
      complexityScore: 0,
      score: Math.round((passedTests / Math.max(1, totalTests)) * 700),
      publicResult,
      error: result.error,
    };
  }

  if (parsed.length !== totalTests) {
    return {
      status: 'JUDGE_UNAVAILABLE',
      passedTests,
      totalTests,
      publicPassedTests,
      publicTotalTests: problem.testCases.length,
      runtimeMs: result.executionMs || null,
      complexity: 'Não medida',
      complexityConfidence: null,
      complexityReason: null,
      complexityScore: 0,
      score: Math.round((passedTests / Math.max(1, totalTests)) * 700),
      publicResult,
      error: 'O avaliador não recebeu todos os resultados esperados.',
    };
  }

  const limitMs = Math.max(1, input.executionLimitSeconds ?? 15) * 1000;
  const timedOut = result.executionMs > limitMs;
  const accepted = passedTests === totalTests && !timedOut;
  const estimate = accepted
    ? estimateCodeComplexity(input.code, input.language, contestantFunctionName)
    : null;
  const complexityScore = estimate ? scoreComplexity(estimate.label, spec.expectedComplexity) : 0;
  const runtimeScore = accepted
    ? Math.max(0, 100 - Math.min(100, Math.floor(result.executionMs / 20)))
    : 0;

  return {
    status: accepted ? 'ACCEPTED' : timedOut ? 'TIME_LIMIT_EXCEEDED' : 'WRONG_ANSWER',
    passedTests,
    totalTests,
    publicPassedTests,
    publicTotalTests: problem.testCases.length,
    runtimeMs: result.executionMs,
    complexity: estimate?.label ?? 'Não medida',
    complexityConfidence: estimate?.confidence ?? null,
    complexityReason: estimate?.reason ?? null,
    complexityScore,
    score:
      Math.round((passedTests / Math.max(1, totalTests)) * 700) + complexityScore + runtimeScore,
    publicResult,
    error: accepted
      ? undefined
      : timedOut
        ? `A execução ultrapassou o limite de ${input.executionLimitSeconds ?? 15}s.`
        : 'A solução não passou em todos os casos avaliados.',
  };
}

export function judgeDuelSubmission(input: {
  problemId: string;
  code: string;
  language: Language;
  executionLimitSeconds?: number;
}) {
  return judgeDuelCode({ ...input, includeHiddenTests: true });
}

function unavailableResult(error: string): JudgedSubmission {
  return {
    status: 'JUDGE_UNAVAILABLE',
    passedTests: 0,
    totalTests: 0,
    publicPassedTests: 0,
    publicTotalTests: 0,
    runtimeMs: null,
    complexity: 'Não medida',
    complexityConfidence: null,
    complexityReason: null,
    complexityScore: 0,
    score: 0,
    publicResult: [],
    error,
  };
}
