import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getAuthUser } from '@/lib/auth';
import { getAuthUserId } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';
import { loadLibrary } from './library/load';
import { articleMeta } from './library/catalog';
import { importLegacyProgress } from './attempts.server';
import type { AnswerRecord, AttemptRecord, DailyRecord } from './stats';
import { QUESTION_BY_ID, type EnadeSession } from './simulator';
import { primaryTopic } from './topics';

export async function requireEnadeUser() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Only the verified user ID, without loading the profile. Pages need nothing else, so
 * their queries start right away while the layout loads the full user for the sidebar.
 */
export const requireEnadeUserId = cache(async () => {
  const userId = await getAuthUserId();
  if (!userId) redirect('/login');
  return userId;
});

export function shellUser(user: Awaited<ReturnType<typeof requireEnadeUser>>) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    avatar_url: user.avatar_url,
    avatar_config: user.avatar_config,
    total_xp: user.total_xp,
    streak_days: user.streak_days,
    role: user.role,
  };
}
export type ShellUser = ReturnType<typeof shellUser>;

/** Navigation tree of the library (titles only, no article bodies). */
export function libraryOutline() {
  const library = loadLibrary();
  return {
    categories: library.categories,
    articles: library.articles.map(articleMeta),
  };
}
export type LibraryOutline = ReturnType<typeof libraryOutline>;

export function topicCategories() {
  return new Map(loadLibrary().articles.map((a) => [a.slug, a.category]));
}

export function topicTitles() {
  return new Map(loadLibrary().articles.map((a) => [a.slug, a.title]));
}

export const loadStudyState = cache(async (userId: string) => {
  const [progress, favorites] = await Promise.all([
    prisma.enadeStudyProgress.findMany({ where: { user_id: userId } }),
    prisma.enadeFavorite.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' } }),
  ]);
  return {
    studied: progress.filter((p) => p.studied).map((p) => p.article_slug),
    progress,
    favoriteArticles: favorites.filter((f) => f.kind === 'ARTICLE').map((f) => f.ref),
    favoriteQuestions: favorites.filter((f) => f.kind === 'QUESTION').map((f) => f.ref),
    favorites,
  };
});

/** The learner's complete private history, mapped to the analytics records. */
export const loadHistory = cache(async (userId: string) => {
  await importLegacyProgress(userId);
  const [attempts, answers, daily] = await Promise.all([
    prisma.enadeAttempt.findMany({
      where: { user_id: userId },
      orderBy: { started_at: 'desc' },
      select: {
        id: true,
        kind: true,
        mode: true,
        status: true,
        title: true,
        source_year: true,
        topic: true,
        question_count: true,
        answered_count: true,
        scored_count: true,
        correct_count: true,
        wrong_count: true,
        blank_count: true,
        elapsed_ms: true,
        started_at: true,
        finished_at: true,
        updated_at: true,
        state: true,
      },
    }),
    prisma.enadeAnswer.findMany({
      where: { user_id: userId },
      orderBy: { answered_at: 'asc' },
      select: {
        question_id: true,
        attempt_id: true,
        topic: true,
        section: true,
        year: true,
        selected: true,
        correct: true,
        answered_at: true,
        attempt: { select: { kind: true } },
      },
    }),
    prisma.enadeDailyActivity.findMany({ where: { user_id: userId }, orderBy: { day: 'asc' } }),
  ]);
  const attemptRecords: (AttemptRecord & { updatedAt: Date })[] = attempts.map((a) => ({
    id: a.id,
    kind: a.kind,
    mode: a.mode,
    status: a.status,
    title: a.title,
    sourceYear: a.source_year,
    topic: a.topic,
    questions: (a.state as unknown as EnadeSession).questionIds.flatMap((id) => {
      const question = QUESTION_BY_ID.get(id);
      return question && !question.annulled
        ? [{ year: question.year, topic: primaryTopic(id) }]
        : [];
    }),
    questionCount: a.question_count,
    answeredCount: a.answered_count,
    scoredCount: a.scored_count,
    correctCount: a.correct_count,
    wrongCount: a.wrong_count,
    blankCount: a.blank_count,
    elapsedMs: a.elapsed_ms,
    startedAt: a.started_at,
    finishedAt: a.finished_at,
    updatedAt: a.updated_at,
  }));
  const answerRecords: AnswerRecord[] = answers.map((a) => ({
    questionId: a.question_id,
    attemptId: a.attempt_id,
    attemptKind: a.attempt.kind,
    topic: a.topic,
    section: a.section,
    year: a.year,
    selected: a.selected,
    correct: a.correct,
    answeredAt: a.answered_at,
  }));
  const dailyRecords: DailyRecord[] = daily.map((d) => ({
    day: d.day.toISOString().slice(0, 10),
    readingMs: d.reading_ms,
    practiceMs: d.practice_ms,
    questionsAnswered: d.questions_answered,
    questionsCorrect: d.questions_correct,
    articlesStudied: d.articles_studied,
  }));
  return { attempts: attemptRecords, answers: answerRecords, daily: dailyRecords };
});

export const loadReviewItems = cache(async (userId: string) => {
  await importLegacyProgress(userId);
  return prisma.enadeReviewItem.findMany({
    where: { user_id: userId },
    orderBy: [{ status: 'asc' }, { due_at: 'asc' }],
  });
});
