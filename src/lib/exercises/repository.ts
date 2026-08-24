import 'server-only';

import type { AssistanceMode, ExerciseSubmissionStatus, LearningEventType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ExerciseEvaluation, EvaluatorTestCase } from '@/lib/exercises/evaluator';
import {
  calculateExerciseXp,
  calculateNodeMastery,
  deriveCompletedNodeStatus,
} from '@/lib/exercises/progression';
import { calculateGemBalance, calculateGemReward } from '@/lib/gamification/gems';
import type { ExerciseWorkspaceData } from '@/lib/exercises/types';
import type { KnowledgeProgressStatus } from '@/lib/learning/types';

export async function getExerciseForEvaluation(identifier: string, includeHidden: boolean) {
  const exercise = await prisma.exercise.findFirst({
    where: {
      is_published: true,
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      test_cases: {
        where: includeHidden ? undefined : { is_hidden: false },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!exercise) return null;

  return {
    ...exercise,
    test_cases: exercise.test_cases.map(
      (testCase): EvaluatorTestCase => ({
        id: testCase.id,
        label: testCase.label,
        input: testCase.input,
        invocation_code: testCase.invocation_code,
        expected_output: testCase.expected_output,
        is_hidden: testCase.is_hidden,
        position: testCase.position,
      })
    ),
  };
}

export async function getExerciseWorkspaceForUser(
  identifier: string,
  userId: string
): Promise<ExerciseWorkspaceData | null> {
  const exercise = await prisma.exercise.findFirst({
    where: {
      is_published: true,
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      knowledge_node: {
        include: {
          user_progress: {
            where: { user_id: userId },
            take: 1,
          },
        },
      },
      test_cases: {
        select: { is_hidden: true },
      },
      _count: {
        select: {
          runs: { where: { user_id: userId } },
          submissions: { where: { user_id: userId } },
        },
      },
      submissions: {
        where: { user_id: userId, first_completion: true },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!exercise) return null;

  const progress = exercise.knowledge_node.user_progress[0];

  return {
    id: exercise.id,
    slug: exercise.slug,
    title: exercise.title,
    summary: exercise.summary,
    problem: exercise.problem,
    objective: exercise.objective,
    language: exercise.language,
    difficulty: exercise.difficulty,
    baseXp: exercise.base_xp,
    estimatedMinutes: exercise.estimated_minutes,
    starterCode: exercise.starter_code,
    constraints: exercise.constraints,
    hints: exercise.hints,
    documentationUrl: exercise.documentation_url,
    examples: Array.isArray(exercise.examples) ? exercise.examples : [],
    publicTestCount: exercise.test_cases.filter((testCase) => !testCase.is_hidden).length,
    hiddenTestCount: exercise.test_cases.filter((testCase) => testCase.is_hidden).length,
    knowledge: {
      id: exercise.knowledge_node.id,
      slug: exercise.knowledge_node.slug,
      title: exercise.knowledge_node.title,
      category: exercise.knowledge_node.category,
      mastery: progress?.mastery ?? 0,
      status: (progress?.status ?? 'AVAILABLE') as KnowledgeProgressStatus,
    },
    activity: {
      runs: exercise._count.runs,
      submissions: exercise._count.submissions,
      completed: exercise.submissions.length > 0,
    },
  };
}

export async function recordExerciseRun(input: {
  exerciseId: string;
  knowledgeNodeId: string;
  userId: string;
  assistanceMode: AssistanceMode;
  code: string;
  evaluation: ExerciseEvaluation;
}) {
  const [run] = await prisma.$transaction([
    prisma.exerciseRun.create({
      data: {
        exercise_id: input.exerciseId,
        user_id: input.userId,
        assistance_mode: input.assistanceMode,
        code: input.code,
        passed_tests: input.evaluation.passedTests,
        total_tests: input.evaluation.totalTests,
        output: input.evaluation.consoleOutput || null,
        error_message: input.evaluation.error ?? null,
        execution_ms: input.evaluation.executionMs,
      },
    }),
    prisma.learningEvent.create({
      data: {
        user_id: input.userId,
        exercise_id: input.exerciseId,
        event_type: 'EXERCISE_RUN',
        assistance_mode: input.assistanceMode,
        metadata: {
          passedTests: input.evaluation.passedTests,
          totalTests: input.evaluation.totalTests,
        },
      },
    }),
    prisma.userNodeProgress.upsert({
      where: {
        user_id_knowledge_node_id: {
          user_id: input.userId,
          knowledge_node_id: input.knowledgeNodeId,
        },
      },
      create: {
        user_id: input.userId,
        knowledge_node_id: input.knowledgeNodeId,
        status: 'IN_PROGRESS',
        started_at: new Date(),
      },
      update: { last_activity_at: new Date() },
    }),
  ]);

  return run;
}

export async function getExerciseRunCount(exerciseId: string, userId: string) {
  return prisma.exerciseRun.count({
    where: { exercise_id: exerciseId, user_id: userId },
  });
}

function getSubmissionStatus(evaluation: ExerciseEvaluation): ExerciseSubmissionStatus {
  if (!evaluation.ok) return 'ERROR';
  return evaluation.passed ? 'PASSED' : 'FAILED';
}

export async function recordExerciseSubmission(input: {
  exercise: { id: string; knowledge_node_id: string; base_xp: number };
  userId: string;
  assistanceMode: AssistanceMode;
  code: string;
  evaluation: ExerciseEvaluation;
}) {
  const lockKey = `${input.userId}:${input.exercise.id}`;

  return prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

    const previousCompletion = await transaction.exerciseSubmission.findFirst({
      where: {
        user_id: input.userId,
        exercise_id: input.exercise.id,
        first_completion: true,
      },
      select: { id: true },
    });
    const firstCompletion = input.evaluation.passed && !previousCompletion;
    const xpEarned = firstCompletion
      ? calculateExerciseXp(input.exercise.base_xp, input.assistanceMode)
      : 0;
    const publicTests = input.evaluation.tests.filter((test) => !test.hidden);
    const hiddenTests = input.evaluation.tests.filter((test) => test.hidden);

    const submission = await transaction.exerciseSubmission.create({
      data: {
        exercise_id: input.exercise.id,
        user_id: input.userId,
        assistance_mode: input.assistanceMode,
        status: getSubmissionStatus(input.evaluation),
        code: input.code,
        passed_public: publicTests.filter((test) => test.passed).length,
        total_public: publicTests.length,
        passed_hidden: hiddenTests.filter((test) => test.passed).length,
        total_hidden: hiddenTests.length,
        xp_earned: xpEarned,
        first_completion: firstCompletion,
        error_message: input.evaluation.error ?? null,
        execution_ms: input.evaluation.executionMs,
      },
    });

    let progress = await transaction.userNodeProgress.upsert({
      where: {
        user_id_knowledge_node_id: {
          user_id: input.userId,
          knowledge_node_id: input.exercise.knowledge_node_id,
        },
      },
      create: {
        user_id: input.userId,
        knowledge_node_id: input.exercise.knowledge_node_id,
        status: 'IN_PROGRESS',
        started_at: new Date(),
      },
      update: { last_activity_at: new Date() },
    });

    if (firstCompletion) {
      const [totalExercises, completedExercises] = await Promise.all([
        transaction.exercise.count({
          where: {
            knowledge_node_id: input.exercise.knowledge_node_id,
            is_published: true,
          },
        }),
        transaction.exerciseSubmission.count({
          where: {
            user_id: input.userId,
            first_completion: true,
            exercise: { knowledge_node_id: input.exercise.knowledge_node_id },
          },
        }),
      ]);
      const mastery = calculateNodeMastery({
        completedExercises,
        totalExercises,
        assistanceMode: input.assistanceMode,
      });
      const status = deriveCompletedNodeStatus({ completedExercises, totalExercises, mastery });

      progress = await transaction.userNodeProgress.update({
        where: { id: progress.id },
        data: {
          status,
          mastery,
          completed_exercises: completedExercises,
          completed_at: completedExercises >= totalExercises ? new Date() : null,
          last_activity_at: new Date(),
        },
      });

      await transaction.user.update({
        where: { id: input.userId },
        data: { total_xp: { increment: xpEarned } },
      });
    }

    const eventTypes: LearningEventType[] = [
      'EXERCISE_SUBMIT',
      input.evaluation.passed ? 'TEST_PASSED' : 'TEST_FAILED',
      ...(firstCompletion ? (['EXERCISE_COMPLETED'] as LearningEventType[]) : []),
    ];

    await transaction.learningEvent.createMany({
      data: eventTypes.map((eventType) => ({
        user_id: input.userId,
        exercise_id: input.exercise.id,
        event_type: eventType,
        assistance_mode: input.assistanceMode,
        metadata: {
          submissionId: submission.id,
          passedTests: input.evaluation.passedTests,
          totalTests: input.evaluation.totalTests,
        },
      })),
    });

    const [submissionCount, firstCompletionCount, user] = await Promise.all([
      transaction.exerciseSubmission.count({
        where: { user_id: input.userId, exercise_id: input.exercise.id },
      }),
      transaction.exerciseSubmission.count({
        where: { user_id: input.userId, first_completion: true },
      }),
      transaction.user.findUniqueOrThrow({
        where: { id: input.userId },
        select: { total_xp: true },
      }),
    ]);

    return {
      submission,
      submissionCount,
      firstCompletion,
      xpEarned,
      gemsEarned: calculateGemReward(firstCompletion),
      totalGems: calculateGemBalance(firstCompletionCount),
      mastery: progress.mastery,
      nodeStatus: progress.status,
      totalXp: user.total_xp,
    };
  });
}

export async function recordAssistanceEvent(input: {
  exerciseId: string;
  userId: string;
  assistanceMode: AssistanceMode;
  eventType: 'HINT_OPENED' | 'DOCUMENTATION_OPENED';
}) {
  await prisma.learningEvent.create({
    data: {
      user_id: input.userId,
      exercise_id: input.exerciseId,
      event_type: input.eventType,
      assistance_mode: input.assistanceMode,
    },
  });
}
