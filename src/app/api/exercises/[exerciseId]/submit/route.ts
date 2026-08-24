import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { RATE_LIMIT_CODE_RUN } from '@/lib/config';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import { evaluateExerciseCode } from '@/lib/exercises/evaluator';
import { getExerciseForEvaluation, recordExerciseSubmission } from '@/lib/exercises/repository';
import { rateLimit } from '@/lib/ratelimit';

const submissionSchema = z.object({
  code: z.string().min(1).max(20_000),
  assistanceMode: z.enum(['GUIDED', 'STANDARD', 'HARD', 'NO_ASSIST']),
  challenge: z.enum(['SECTION_JUMP']).optional(),
});

export const POST = apiHandler(async (request, { session, params }) => {
  if (!session) throw new UnauthorizedError();

  const { exerciseId } = await params;
  const { code, assistanceMode, challenge } = submissionSchema.parse(await request.json());
  const effectiveAssistanceMode = challenge === 'SECTION_JUMP' ? 'HARD' : assistanceMode;

  await rateLimit(`exercise-submit:${session.id}`, {
    ...RATE_LIMIT_CODE_RUN,
    endpoint: '/api/exercises/:exerciseId/submit',
  });

  const exercise = await getExerciseForEvaluation(exerciseId, true);
  if (!exercise) throw new NotFoundError('EXERCISE_NOT_FOUND', 'Exercício não encontrado.');

  const evaluation = await evaluateExerciseCode({
    code,
    language: exercise.language,
    functionName: exercise.function_name,
    testCases: exercise.test_cases,
  });
  const result = await recordExerciseSubmission({
    exercise,
    userId: session.id,
    assistanceMode: effectiveAssistanceMode,
    code,
    evaluation,
  });

  return NextResponse.json(
    {
      ok: evaluation.ok,
      passed: evaluation.passed,
      passedTests: evaluation.passedTests,
      totalTests: evaluation.totalTests,
      tests: evaluation.tests,
      consoleOutput: evaluation.consoleOutput,
      error: evaluation.error,
      executionMs: evaluation.executionMs,
      submissionCount: result.submissionCount,
      firstCompletion: result.firstCompletion,
      xpEarned: result.xpEarned,
      gemsEarned: result.gemsEarned,
      totalGems: result.totalGems,
      mastery: result.mastery,
      nodeStatus: result.nodeStatus,
      totalXp: result.totalXp,
    },
    { status: evaluation.ok ? 200 : 502 }
  );
});
