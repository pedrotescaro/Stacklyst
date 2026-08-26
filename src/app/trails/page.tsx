import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { TRAIL_LANGUAGE_CODES } from '@/app/trails/TrailLanguageLogo';
import type { TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import {
  parseTrailCoursePreferences,
  TRAIL_COURSE_PREFERENCES_COOKIE,
} from '@/app/trails/trailCoursePreferences';
import { getCompletedTrailLessonIds } from '@/app/trails/trailCurriculum';
import { calculateTrailDailyProgress } from '@/app/trails/trailDailyProgress';
import { getAuthUser } from '@/lib/auth';
import { calculateGemBalance } from '@/lib/gamification/gems';
import { getKnowledgeMapForUser } from '@/lib/learning/repository';
import { prisma } from '@/lib/prisma';
import { TrailsContent } from '@/app/trails/TrailsContent';

export const revalidate = 0;

interface TrailsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TrailsPage({ searchParams }: TrailsPageProps) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const [cookieStore, query] = await Promise.all([cookies(), searchParams]);
  const savedCoursePreferences = parseTrailCoursePreferences(
    cookieStore.get(TRAIL_COURSE_PREFERENCES_COOKIE)?.value,
    user.id
  );

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [
    knowledgeMap,
    languageTrails,
    firstCompletions,
    usersAhead,
    totalParticipants,
    todaySubmissions,
    todayQuizAttempts,
    completedTrailStepAttempts,
    jumpAttempts,
  ] = await Promise.all([
    getKnowledgeMapForUser(user.id),
    prisma.languageTrail.findMany({
      where: { user_id: user.id },
      select: { language: true, xp: true, last_activity_at: true },
    }),
    prisma.exerciseSubmission.findMany({
      where: { user_id: user.id, first_completion: true },
      select: {
        xp_earned: true,
        exercise: { select: { language: true } },
      },
    }),
    prisma.user.count({ where: { total_xp: { gt: user.total_xp } } }),
    prisma.user.count(),
    prisma.exerciseSubmission.findMany({
      where: { user_id: user.id, created_at: { gte: todayStart } },
      select: { status: true, xp_earned: true },
    }),
    prisma.quizAttempt.findMany({
      where: { user_id: user.id, created_at: { gte: todayStart } },
      select: { quiz_id: true, is_correct: true, xp_earned: true },
    }),
    prisma.quizAttempt.findMany({
      where: { user_id: user.id, is_correct: true },
      select: { quiz_id: true },
    }),
    prisma.quizAttempt.findMany({
      where: { user_id: user.id, quiz_id: { startsWith: 'trail-jump-' }, is_correct: true },
      select: { quiz_id: true },
    }),
  ]);

  const publishedLanguages = new Set<TrailLanguageCode>();
  for (const node of knowledgeMap.nodes) {
    if (node.language && TRAIL_LANGUAGE_CODES.includes(node.language as TrailLanguageCode)) {
      publishedLanguages.add(node.language as TrailLanguageCode);
    }
  }

  const startedLanguages = new Set<TrailLanguageCode>(savedCoursePreferences.startedLanguages);
  const courseXp = new Map<TrailLanguageCode, number>();

  for (const trail of languageTrails) {
    const language = trail.language as TrailLanguageCode;
    courseXp.set(language, trail.xp);
    if (trail.xp > 0 || trail.last_activity_at) startedLanguages.add(language);
  }

  for (const completion of firstCompletions) {
    const language = completion.exercise.language as TrailLanguageCode;
    courseXp.set(language, (courseXp.get(language) ?? 0) + completion.xp_earned);
    startedLanguages.add(language);
  }

  if (startedLanguages.size === 0) {
    startedLanguages.add(
      publishedLanguages.has('JS') ? 'JS' : (publishedLanguages.values().next().value ?? 'JS')
    );
  }

  const requestedLanguage = firstSearchValue(query.language)?.toUpperCase();
  const validRequestedLanguage = TRAIL_LANGUAGE_CODES.find(
    (language) => language === requestedLanguage
  );
  const initialActiveLanguage =
    (validRequestedLanguage &&
    (startedLanguages.has(validRequestedLanguage) || publishedLanguages.has(validRequestedLanguage))
      ? validRequestedLanguage
      : savedCoursePreferences.activeLanguage &&
          (startedLanguages.has(savedCoursePreferences.activeLanguage) ||
            publishedLanguages.has(savedCoursePreferences.activeLanguage))
        ? savedCoursePreferences.activeLanguage
        : TRAIL_LANGUAGE_CODES.find((language) => startedLanguages.has(language))) ?? 'JS';

  const requestedPathSlug = firstSearchValue(query.path);
  const requestedSectionNumber = Number(firstSearchValue(query.section));
  const initialPathSlug =
    requestedPathSlug && /^[a-z0-9-]+$/.test(requestedPathSlug) ? requestedPathSlug : undefined;
  const initialSectionNumber =
    Number.isInteger(requestedSectionNumber) &&
    requestedSectionNumber >= 1 &&
    requestedSectionNumber <= 8
      ? requestedSectionNumber
      : 1;

  const courses = TRAIL_LANGUAGE_CODES.map((language) => ({
    language,
    xp: courseXp.get(language) ?? 0,
    started: startedLanguages.has(language),
  }));

  const dailyProgress = calculateTrailDailyProgress(todaySubmissions, todayQuizAttempts);
  const completedLessonIds = getCompletedTrailLessonIds(
    completedTrailStepAttempts.map((attempt) => attempt.quiz_id)
  );

  const savedViewModeCookie = cookieStore.get('stacklyst_trail_view_mode')?.value;
  const initialViewMode =
    firstSearchValue(query.view) === 'trail' || firstSearchValue(query.view) === 'map'
      ? (firstSearchValue(query.view) as 'map' | 'trail')
      : savedViewModeCookie === 'trail'
        ? 'trail'
        : 'map';

  return (
    <TrailsContent
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        total_xp: user.total_xp,
        streak: user.streak_days,
      }}
      knowledgeMap={knowledgeMap}
      initialCourses={courses}
      initialActiveLanguage={initialActiveLanguage}
      gems={calculateGemBalance(firstCompletions.length)}
      globalRank={usersAhead + 1}
      totalParticipants={totalParticipants}
      dailyProgress={dailyProgress}
      initialViewMode={initialViewMode}
      initialPathSlug={initialPathSlug}
      initialSectionNumber={initialSectionNumber}
      jumpUnlockIds={jumpAttempts.map((attempt) => attempt.quiz_id)}
      completedLessonIds={completedLessonIds}
    />
  );
}
