const TRAIL_LANGUAGES = ['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA'] as const;

export type ContinueStudyingTrail = {
  language: string;
  xp?: number | null;
  level?: number | null;
  streak?: number | null;
};

function isStarted(trail: ContinueStudyingTrail) {
  return (trail.xp ?? 0) > 0 || (trail.level ?? 1) > 1 || (trail.streak ?? 0) > 0;
}

/** The trail the learner has invested the most in, or null when none is started. */
export function pickContinueTrail<T extends ContinueStudyingTrail>(trails: readonly T[]) {
  return (
    trails
      .filter(
        (trail) =>
          isStarted(trail) &&
          (TRAIL_LANGUAGES as readonly string[]).includes(trail.language.toUpperCase())
      )
      .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))[0] ?? null
  );
}

/**
 * Link from the feed back into studying. `resume=1` skips the course dashboard and opens
 * the learner's course in their saved view (trail or map), one tap from the next lesson.
 */
export function continueStudyingHref(trails: readonly ContinueStudyingTrail[]) {
  const trail = pickContinueTrail(trails);
  if (!trail) return '/trails';
  return `/trails?resume=1&language=${encodeURIComponent(trail.language.toUpperCase())}`;
}
