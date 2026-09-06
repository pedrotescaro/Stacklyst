import 'server-only';

import { randomUUID } from 'node:crypto';
import { executeCode } from '@/lib/code-execution/server';

export interface EvaluatorTestCase {
  id: string;
  label: string;
  input: unknown;
  invocation_code: string | null;
  expected_output: unknown;
  is_hidden: boolean;
  position: number;
}

export interface ExerciseTestResult {
  id: string;
  label: string;
  hidden: boolean;
  passed: boolean;
  actual?: unknown;
  expected?: unknown;
  error?: string;
}

export interface ExerciseEvaluation {
  ok: boolean;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  tests: ExerciseTestResult[];
  consoleOutput: string;
  error?: string;
  executionMs: number;
}

interface HarnessResult {
  id: string;
  passed: boolean;
  actual?: unknown;
  expected?: unknown;
  error?: string;
}

function buildInvocation(testCase: EvaluatorTestCase, functionName: string) {
  if (testCase.invocation_code) return testCase.invocation_code;
  const input = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
  return `${functionName}(...${JSON.stringify(input)})`;
}

export function buildExerciseHarness(
  userCode: string,
  functionName: string,
  testCases: EvaluatorTestCase[],
  marker = `__STACKLYST_RESULT_${randomUUID()}__`
) {
  const testBlocks = testCases
    .map((testCase) => {
      const invocation = buildInvocation(testCase, functionName);
      const expected = JSON.stringify(testCase.expected_output);

      return `
  try {
    const __actual_${testCase.position} = await (${invocation});
    const __expected_${testCase.position} = ${expected};
    __stacklystResults.push({
      id: ${JSON.stringify(testCase.id)},
      passed: __stacklystDeepEqual(__actual_${testCase.position}, __expected_${testCase.position}),
      actual: __actual_${testCase.position},
      expected: __expected_${testCase.position}
    });
  } catch (__error_${testCase.position}) {
    __stacklystResults.push({
      id: ${JSON.stringify(testCase.id)},
      passed: false,
      error: __error_${testCase.position} instanceof Error
        ? __error_${testCase.position}.message
        : String(__error_${testCase.position})
    });
  }`;
    })
    .join('\n');

  const code = `${userCode}

const __stacklystDeepEqual = (left, right) => {
  if (Object.is(left, right)) return true;
  if (typeof left !== typeof right || left === null || right === null) return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => __stacklystDeepEqual(value, right[index]));
  }
  if (typeof left === 'object') {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length &&
      leftKeys.every((key, index) => key === rightKeys[index] &&
        __stacklystDeepEqual(left[key], right[key]));
  }
  return false;
};

const __stacklystEvaluate = async () => {
  const __stacklystResults = [];
  ${testBlocks}
  console.log(${JSON.stringify(marker)} + JSON.stringify(__stacklystResults));
};

__stacklystEvaluate().catch((error) => {
  console.log(${JSON.stringify(marker)} + JSON.stringify({ fatal: error instanceof Error ? error.message : String(error) }));
});`;

  return { code, marker };
}

function parseHarnessOutput(output: string, marker: string): HarnessResult[] | null {
  const markerLine = output
    .split('\n')
    .reverse()
    .find((line) => line.startsWith(marker));

  if (!markerLine) return null;

  try {
    const parsed = JSON.parse(markerLine.slice(marker.length));
    return Array.isArray(parsed) ? (parsed as HarnessResult[]) : null;
  } catch {
    return null;
  }
}

function stripHarnessOutput(output: string, marker: string) {
  const visibleLines = output.split('\n').filter((line) => !line.startsWith(marker));
  return visibleLines.join('\n').trim();
}

export async function evaluateExerciseCode(input: {
  code: string;
  language: string;
  functionName: string;
  testCases: EvaluatorTestCase[];
}): Promise<ExerciseEvaluation> {
  const { code, marker } = buildExerciseHarness(input.code, input.functionName, input.testCases);
  const execution = await executeCode(code, input.language);
  const parsedResults = execution.ok ? parseHarnessOutput(execution.output, marker) : null;

  if (!execution.ok || !parsedResults) {
    let hiddenCounter = 0;
    return {
      ok: false,
      passed: false,
      passedTests: 0,
      totalTests: input.testCases.length,
      tests: input.testCases.map((testCase) => ({
        id: testCase.id,
        label: testCase.is_hidden ? `Caso oculto ${++hiddenCounter}` : testCase.label,
        hidden: testCase.is_hidden,
        passed: false,
      })),
      consoleOutput: stripHarnessOutput(execution.output, marker),
      error: execution.error ?? 'A execução não produziu resultados de teste válidos.',
      executionMs: execution.executionMs,
    };
  }

  const resultsById = new Map(parsedResults.map((result) => [result.id, result]));
  let hiddenCounter = 0;
  const tests = input.testCases.map((testCase) => {
    const result = resultsById.get(testCase.id);
    const label = testCase.is_hidden ? `Caso oculto ${++hiddenCounter}` : testCase.label;

    return {
      id: testCase.id,
      label,
      hidden: testCase.is_hidden,
      passed: result?.passed ?? false,
      actual: testCase.is_hidden ? undefined : result?.actual,
      expected: testCase.is_hidden ? undefined : result?.expected,
      error: result?.error,
    };
  });
  const passedTests = tests.filter((test) => test.passed).length;

  return {
    ok: true,
    passed: tests.length > 0 && passedTests === tests.length,
    passedTests,
    totalTests: tests.length,
    tests,
    consoleOutput: stripHarnessOutput(execution.output, marker),
    executionMs: execution.executionMs,
  };
}
