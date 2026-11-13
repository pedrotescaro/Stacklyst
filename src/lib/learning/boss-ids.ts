/** Unit boss ids, shared by the server (lesson building) and the trail map (links). */

const BOSS_ID_PATTERN = /^(learn-[a-z]+-[a-z0-9-]+)-boss$/;
const BOSS_STEP_PATTERN = /^(learn-[a-z]+-[a-z0-9-]+-boss)-step-([1-7])$/;
export const LEARNING_BOSS_STEPS = 7;

/** A unit boss is keyed by the unit's first lesson, so every route shares it. */
export function learningBossId(firstLessonId: string) {
  return `${firstLessonId}-boss`;
}

export function parseLearningBossId(id: string) {
  return BOSS_ID_PATTERN.exec(id)?.[1] ?? null;
}

export function isLearningBossId(id: string) {
  return BOSS_ID_PATTERN.test(id);
}

/** Bosses whose seven steps were all answered correctly. */
export function completedLearningBossIds(correctStepIds: readonly string[]) {
  const steps = new Map<string, Set<string>>();
  for (const id of correctStepIds) {
    const match = BOSS_STEP_PATTERN.exec(id);
    if (!match) continue;
    const set = steps.get(match[1]!) ?? new Set<string>();
    set.add(match[2]!);
    steps.set(match[1]!, set);
  }
  return [...steps].filter(([, set]) => set.size >= LEARNING_BOSS_STEPS).map(([id]) => id);
}
