import { isTrailCourse, TRAIL_COURSE_CODES } from '@/app/trails/TrailLanguageLogo';
import type { TrailCourseCode } from '@/app/trails/TrailLanguageLogo';

export const TRAIL_COURSE_PREFERENCES_COOKIE = 'stacklyst-trail-courses';

export interface TrailCoursePreferences {
  activeLanguage: TrailCourseCode | null;
  startedLanguages: TrailCourseCode[];
}

export function parseTrailCoursePreferences(
  value: string | undefined,
  userId: string
): TrailCoursePreferences {
  if (!value) return { activeLanguage: null, startedLanguages: [] };

  const [storedUserId, startedValue = '', activeValue = ''] = value.split(':');
  if (storedUserId !== userId) return { activeLanguage: null, startedLanguages: [] };

  const startedLanguages = Array.from(new Set(startedValue.split('.').filter(isTrailCourse)));
  const activeLanguage =
    isTrailCourse(activeValue) && startedLanguages.includes(activeValue) ? activeValue : null;

  return { activeLanguage, startedLanguages };
}

export function serializeTrailCoursePreferences(
  userId: string,
  startedLanguages: TrailCourseCode[],
  activeLanguage: TrailCourseCode
) {
  const startedSet = new Set<TrailCourseCode>([...startedLanguages, activeLanguage]);
  const orderedStartedLanguages = TRAIL_COURSE_CODES.filter((language) => startedSet.has(language));

  return `${userId}:${orderedStartedLanguages.join('.')}:${activeLanguage}`;
}
