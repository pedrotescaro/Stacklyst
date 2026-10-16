// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { generateDailyQuiz } from '@/services/daily-quiz.service';
import { GET } from './route';

vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn(), requireAuth: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({ prisma: { quizAttempt: { findUnique: vi.fn() } } }));
vi.mock('@/services/daily-quiz.service', () => ({ generateDailyQuiz: vi.fn() }));
vi.mock('@/lib/cache', () => ({
  withCache: vi.fn(async (_key: string, _ttl: number, load: () => Promise<unknown>) => load()),
}));

const quiz = {
  id: 'daily-quiz',
  post_id: 'programming-post',
  question: 'Qual comportamento é explicado na postagem?',
  options: ['Primeira alternativa', 'Segunda alternativa', 'Terceira alternativa'],
  correct_index: 1,
  is_daily: true,
  scheduled_for: new Date('2026-10-16T00:00:00.000Z'),
  created_at: new Date('2026-10-16T13:45:00.000Z'),
};

function fetchDailyQuiz() {
  return GET(new Request('https://stacklyst.test/api/quiz/daily'), {
    params: Promise.resolve({}),
  });
}

describe('daily quiz HTTP contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-16T13:45:00.000Z'));
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'viewer' } as never);
    vi.mocked(requireAuth).mockResolvedValue({ id: 'viewer' } as never);
    vi.mocked(generateDailyQuiz).mockResolvedValue(quiz as never);
    vi.mocked(prisma.quizAttempt.findUnique).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('authenticates before generating the quiz for the current UTC date', async () => {
    const response = await fetchDailyQuiz();

    expect(response.status).toBe(200);
    expect(generateDailyQuiz).toHaveBeenCalledExactlyOnceWith(new Date('2026-10-16T00:00:00.000Z'));
    expect(vi.mocked(requireAuth).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(generateDailyQuiz).mock.invocationCallOrder[0]
    );
  });

  it('returns no challenge when generation has no eligible post, without loading an attempt or an older quiz', async () => {
    vi.mocked(generateDailyQuiz).mockResolvedValue(null);

    const response = await fetchDailyQuiz();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ quiz: null, attempt: null });
    expect(prisma.quizAttempt.findUnique).not.toHaveBeenCalled();
  });

  it('keeps the source and choices while hiding the answer before the viewer attempts it', async () => {
    const response = await fetchDailyQuiz();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.quiz).toMatchObject({
      id: quiz.id,
      post_id: quiz.post_id,
      question: quiz.question,
      options: quiz.options,
      is_daily: true,
      scheduled_for: '2026-10-16T00:00:00.000Z',
    });
    expect(payload.quiz).not.toHaveProperty('correct_index');
    expect(payload.attempt).toBeNull();
    expect(prisma.quizAttempt.findUnique).toHaveBeenCalledExactlyOnceWith({
      where: { user_id_quiz_id: { user_id: 'viewer', quiz_id: quiz.id } },
    });
  });

  it('reveals the answer only with the authenticated viewer attempt', async () => {
    const attempt = {
      id: 'viewer-attempt',
      user_id: 'viewer',
      quiz_id: quiz.id,
      selected_index: 1,
      is_correct: true,
      xp_earned: 15,
    };
    vi.mocked(prisma.quizAttempt.findUnique).mockResolvedValue(attempt as never);

    const response = await fetchDailyQuiz();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.quiz.correct_index).toBe(quiz.correct_index);
    expect(payload.attempt).toEqual(attempt);
    expect(prisma.quizAttempt.findUnique).toHaveBeenCalledExactlyOnceWith({
      where: { user_id_quiz_id: { user_id: 'viewer', quiz_id: quiz.id } },
    });
  });

  it('returns 401 without generating a quiz when authentication fails', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    vi.mocked(requireAuth).mockRejectedValue(new UnauthorizedError());

    const response = await fetchDailyQuiz();

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: 'UNAUTHORIZED' });
    expect(generateDailyQuiz).not.toHaveBeenCalled();
    expect(prisma.quizAttempt.findUnique).not.toHaveBeenCalled();
  });

  it('generates the authenticated daily quiz without a CRON_SECRET', async () => {
    vi.stubEnv('CRON_SECRET', '');

    const response = await fetchDailyQuiz();

    expect(response.status).toBe(200);
    expect(generateDailyQuiz).toHaveBeenCalledTimes(1);
    expect((await response.json()).quiz.id).toBe(quiz.id);
  });
});
