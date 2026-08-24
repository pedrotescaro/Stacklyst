export const GEMS_PER_EXERCISE_COMPLETION = 5;

export function calculateGemBalance(firstCompletionCount: number) {
  return Math.max(0, Math.trunc(firstCompletionCount)) * GEMS_PER_EXERCISE_COMPLETION;
}

export function calculateGemReward(firstCompletion: boolean) {
  return firstCompletion ? GEMS_PER_EXERCISE_COMPLETION : 0;
}
