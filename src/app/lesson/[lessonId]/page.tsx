import { notFound, redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getExerciseWorkspaceForUser } from '@/lib/exercises/repository';
import { getLessonById } from '@/lib/lessons/registry';
import { ExerciseWorkspace } from './ExerciseWorkspace';
import { LessonClient } from './LessonClient';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSafeTrailReturnHref(value: string | undefined) {
  if (!value) return undefined;

  try {
    const url = new URL(value, 'https://stacklyst.local');
    if (url.origin !== 'https://stacklyst.local' || url.pathname !== '/trails') return undefined;

    const params = new URLSearchParams();
    const view = url.searchParams.get('view');
    const path = url.searchParams.get('path');
    const section = url.searchParams.get('section');
    const language = url.searchParams.get('language');

    if (view === 'trail' || view === 'map') params.set('view', view);
    if (path && /^[a-z0-9-]+$/.test(path)) params.set('path', path);
    if (section && /^[1-8]$/.test(section)) params.set('section', section);
    if (language && /^(JS|TS|PYTHON|RUST|GO|JAVA)$/.test(language)) {
      params.set('language', language);
    }

    const query = params.toString();
    return query ? `/trails?${query}` : '/trails';
  } catch {
    return undefined;
  }
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { lessonId } = await params;
  const query = await searchParams;
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const isExplicitWorkspace = firstSearchValue(query.mode) === 'workspace';
  const returnTo = getSafeTrailReturnHref(firstSearchValue(query.returnTo));

  if (!isExplicitWorkspace) {
    const lesson = getLessonById(lessonId);
    if (lesson) {
      return (
        <LessonClient
          lesson={lesson}
          returnTo={returnTo}
          user={{
            id: user.id,
            username: user.username,
            total_xp: user.total_xp,
            streak: user.streak_days,
          }}
        />
      );
    }
  }

  const exercise = await getExerciseWorkspaceForUser(lessonId, user.id);
  if (exercise) {
    const sectionNumber = Number(firstSearchValue(query.section));
    const pathSlug = firstSearchValue(query.path) ?? '';
    const language = firstSearchValue(query.language) ?? '';
    const jumpChallenge =
      firstSearchValue(query.challenge) === 'jump' &&
      Number.isInteger(sectionNumber) &&
      sectionNumber >= 2 &&
      sectionNumber <= 8 &&
      /^[a-z0-9-]+$/.test(pathSlug) &&
      ['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA'].includes(language)
        ? { sectionNumber, pathSlug, language }
        : undefined;

    return <ExerciseWorkspace exercise={exercise} jumpChallenge={jumpChallenge} />;
  }

  const lessonFallback = getLessonById(lessonId);
  if (lessonFallback) {
    return (
      <LessonClient
        lesson={lessonFallback}
        returnTo={returnTo}
        user={{
          id: user.id,
          username: user.username,
          total_xp: user.total_xp,
          streak: user.streak_days,
        }}
      />
    );
  }

  notFound();
}
