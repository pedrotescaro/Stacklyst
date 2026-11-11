import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TRAIL_COURSE_CODES } from '../TrailLanguageLogo';
import {
  parseTrailCoursePreferences,
  TRAIL_COURSE_PREFERENCES_COOKIE,
} from '../trailCoursePreferences';
import { EnadeCourse } from './EnadeCourse';
import type { EnadeAttempt } from '@/lib/enade/types';

export default async function EnadePage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  const store = await cookies();
  const preferences = parseTrailCoursePreferences(
    store.get(TRAIL_COURSE_PREFERENCES_COOKIE)?.value,
    user.id
  );
  const [progress, trails] = await Promise.all([
    prisma.mobileState.findMany({
      where: { user_id: user.id, key: { startsWith: 'enade-ads-' } },
      select: { key: true, value: true },
    }),
    prisma.languageTrail.findMany({
      where: { user_id: user.id },
      select: { language: true, xp: true },
    }),
  ]);
  return (
    <EnadeCourse
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        total_xp: user.total_xp,
      }}
      courses={TRAIL_COURSE_CODES.map((language) => ({
        language,
        xp: trails.find((t) => (t.language as string) === language)?.xp ?? 0,
        started:
          language === 'ENADE' ||
          preferences.startedLanguages.includes(language) ||
          trails.some((t) => (t.language as string) === language),
      }))}
      initialAttempts={Object.fromEntries(
        progress.map((p) => [p.key.replace('enade-ads-', ''), p.value as unknown as EnadeAttempt])
      )}
    />
  );
}
