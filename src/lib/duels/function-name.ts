import ts from 'typescript';
import type { DuelTestCase } from '@/lib/duel-problems';

export type DuelJudgeLanguage = 'TS' | 'JS' | 'PYTHON';

function toPythonFunctionName(name: string) {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findContestantFunctionName(
  code: string,
  language: DuelJudgeLanguage,
  expectedName: string
) {
  if (language === 'PYTHON') {
    const expectedPythonName = toPythonFunctionName(expectedName);
    const names = [...code.matchAll(/^def\s+([A-Za-z_]\w*)\s*\(/gm)].map((match) => match[1]);
    if (names.includes(expectedPythonName)) return expectedPythonName;
    return names.length === 1 ? names[0] : expectedPythonName;
  }

  const source = ts.createSourceFile(
    'duel-submission.ts',
    code,
    ts.ScriptTarget.Latest,
    false,
    language === 'TS' ? ts.ScriptKind.TS : ts.ScriptKind.JS
  );
  const names = source.statements
    .filter(ts.isFunctionDeclaration)
    .map((statement) => statement.name?.text)
    .filter((name): name is string => Boolean(name));
  if (names.includes(expectedName)) return expectedName;
  return names.length === 1 ? names[0] : expectedName;
}

export function adaptTestsToContestantFunction(
  tests: DuelTestCase[],
  expectedName: string,
  contestantName: string,
  language: DuelJudgeLanguage
) {
  if (language === 'PYTHON') {
    const expectedPythonName = toPythonFunctionName(expectedName);
    const pattern = new RegExp(`\\b${escapeRegExp(expectedPythonName)}\\b`, 'g');
    return tests.map((testCase) => ({
      ...testCase,
      testExpression: {
        ...testCase.testExpression,
        PYTHON: testCase.testExpression.PYTHON.replace(pattern, contestantName),
      },
    }));
  }

  const pattern = new RegExp(`\\b${escapeRegExp(expectedName)}\\b`, 'g');
  return tests.map((testCase) => ({
    ...testCase,
    testExpression: {
      ...testCase.testExpression,
      [language]: testCase.testExpression[language].replace(pattern, contestantName),
    },
  }));
}
