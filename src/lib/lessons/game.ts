/** Stars for a finished lesson: 3 without mistakes, 2 with up to two, 1 otherwise. */
export function starsForMistakes(mistakes: number): 1 | 2 | 3 {
  if (mistakes <= 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

/** Combo milestones that deserve a celebration on screen. */
export const COMBO_MILESTONES = [3, 5, 8, 12] as const;

export const TRAIL_STARS_STATE_KEY = 'trail-lesson-stars';

/** Ids that can earn stars: catalog lessons and unit bosses. */
export const STAR_LESSON_ID_PATTERN = /^learn-[a-z]+-[a-z0-9-]+$/;

export function parseStoredStars(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, number] =>
        STAR_LESSON_ID_PATTERN.test(entry[0]) &&
        typeof entry[1] === 'number' &&
        entry[1] >= 1 &&
        entry[1] <= 3
    )
  );
}
