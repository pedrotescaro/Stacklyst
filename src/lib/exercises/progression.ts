import type { AssistanceMode, KnowledgeProgressStatus } from '@prisma/client';

const XP_MULTIPLIER: Record<AssistanceMode, number> = {
  GUIDED: 1,
  STANDARD: 1,
  HARD: 1,
  NO_ASSIST: 1,
};

const MASTERY_BONUS: Record<AssistanceMode, number> = {
  GUIDED: 0,
  STANDARD: 0,
  HARD: 0,
  NO_ASSIST: 0,
};

export function calculateExerciseXp(baseXp: number, mode: AssistanceMode) {
  return Math.round(Math.max(0, baseXp) * XP_MULTIPLIER[mode]);
}

export function calculateNodeMastery(input: {
  completedExercises: number;
  totalExercises: number;
  assistanceMode: AssistanceMode;
}) {
  if (input.totalExercises <= 0) return 0;
  const completionScore = Math.round(
    (Math.min(input.completedExercises, input.totalExercises) / input.totalExercises) * 100
  );
  return Math.min(100, completionScore + MASTERY_BONUS[input.assistanceMode]);
}

export function deriveCompletedNodeStatus(input: {
  completedExercises: number;
  totalExercises: number;
  mastery: number;
}): KnowledgeProgressStatus {
  if (input.totalExercises <= 0 || input.completedExercises < input.totalExercises)
    return 'IN_PROGRESS';
  // Completion is not independently measured mastery. Assistance is self-reported.
  return 'COMPLETED';
}
