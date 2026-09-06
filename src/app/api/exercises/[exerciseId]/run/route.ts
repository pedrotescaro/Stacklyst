import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { RATE_LIMIT_CODE_RUN } from '@/lib/config';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import { evaluateExerciseCode } from '@/lib/exercises/evaluator';
import {
  getExerciseForEvaluation,
  getExerciseRunCount,
  recordExerciseRun,
  requireExerciseAccess,
} from '@/lib/exercises/repository';
import { rateLimit } from '@/lib/ratelimit';

const attemptSchema = z.object({
  code: z.string().min(1).max(20_000),
  assistanceMode: z.enum(['GUIDED', 'STANDARD', 'HARD', 'NO_ASSIST']),
});

export const POST = apiHandler(async (request, { session, params }) => {
  if (!session) throw new UnauthorizedError();

  const { exerciseId } = await params;
  const { code, assistanceMode } = attemptSchema.parse(await request.json());

  await rateLimit(`exercise-run:${session.id}`, {
    ...RATE_LIMIT_CODE_RUN,
    endpoint: '/api/exercises/:exerciseId/run',
  });

  const exercise = await getExerciseForEvaluation(exerciseId, false);
  if (!exercise) throw new NotFoundError('EXERCISE_NOT_FOUND', 'Exercício não encontrado.');
  await requireExerciseAccess(session.id, exercise.knowledge_node_id);

  const evaluation = await evaluateExerciseCode({
    code,
    language: exercise.language,
    functionName: exercise.function_name,
    testCases: exercise.test_cases,
  });
  const run = await recordExerciseRun({
    exerciseId: exercise.id,
    knowledgeNodeId: exercise.knowledge_node_id,
    userId: session.id,
    assistanceMode,
    code,
    evaluation,
  });

  const runCount = await getExerciseRunCount(exercise.id, session.id);

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
      runId: run.id,
      runCount,
    },
    { status: evaluation.ok ? 200 : 502 }
  );
});
