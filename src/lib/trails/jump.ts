export const TRAIL_SECTION_COUNT = 8;

function safeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export function buildTrailJumpId(language: string, pathSlug: string, sectionNumber: number) {
  return `trail-jump-${safeSegment(language)}-${safeSegment(pathSlug)}-s${sectionNumber}`;
}

export function getHighestJumpedSection(
  jumpIds: readonly string[],
  language: string,
  pathSlug: string
) {
  let highest = 1;

  for (let sectionNumber = 2; sectionNumber <= TRAIL_SECTION_COUNT; sectionNumber += 1) {
    if (jumpIds.includes(buildTrailJumpId(language, pathSlug, sectionNumber))) {
      highest = Math.max(highest, sectionNumber);
    }
  }

  return highest;
}
