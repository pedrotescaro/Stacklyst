import { isTrailLanguage, TRAIL_LANGUAGE_CODES } from '@/app/trails/TrailLanguageLogo';
import type { TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';

export const TRAIL_COURSE_PREFERENCES_COOKIE = 'stacklyst-trail-courses';

export interface TrailCoursePreferences {
  activeLanguage: TrailLanguageCode | null;
  startedLanguages: TrailLanguageCode[];
}

export function parseTrailCoursePreferences(
  value: string | undefined,
  userId: string
): TrailCoursePreferences {
  if (!value) return { activeLanguage: null, startedLanguages: [] };

  const [storedUserId, startedValue = '', activeValue = ''] = value.split(':');
  if (storedUserId !== userId) return { activeLanguage: null, startedLanguages: [] };

  const startedLanguages = Array.from(new Set(startedValue.split('.').filter(isTrailLanguage)));
  const activeLanguage =
    isTrailLanguage(activeValue) && startedLanguages.includes(activeValue) ? activeValue : null;

  return { activeLanguage, startedLanguages };
}

export function serializeTrailCoursePreferences(
  userId: string,
  startedLanguages: TrailLanguageCode[],
  activeLanguage: TrailLanguageCode
) {
  const startedSet = new Set<TrailLanguageCode>([...startedLanguages, activeLanguage]);
  const orderedStartedLanguages = TRAIL_LANGUAGE_CODES.filter((language) =>
    startedSet.has(language)
  );

  return `${userId}:${orderedStartedLanguages.join('.')}:${activeLanguage}`;
}
