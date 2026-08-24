import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { POST } from './route';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    learningPath: { findUnique: vi.fn() },
    exercise: { findUnique: vi.fn() },
    exerciseSubmission: { findFirst: vi.fn() },
    quiz: { upsert: vi.fn() },
    quizAttempt: { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}));

function jumpRequest() {
  return new Request('http://localhost:3000/api/trails/jump', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pathSlug: 'frontend-react',
      language: 'JS',
      sectionNumber: 3,
      exerciseId: 'exercise-1',
    }),
  });
}

describe('POST /api/trails/jump', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthUser).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(requireAuth).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(prisma.learningPath.findUnique).mockResolvedValue({
      title: 'Frontend React',
      is_published: true,
      nodes: [{ knowledge_node_id: 'node-1' }],
    } as never);
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue({
      knowledge_node_id: 'node-1',
    } as never);
    vi.mocked(prisma.exerciseSubmission.findFirst).mockResolvedValue({
      id: 'submission-1',
    } as never);
    vi.mocked(prisma.quiz.upsert).mockResolvedValue({ id: 'quiz-1' } as never);
    vi.mocked(prisma.quizAttempt.upsert).mockResolvedValue({ id: 'attempt-1' } as never);
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never);
  });

  it('persists a jump only after a passed Hard submission in the same path', async () => {
    const response = await POST(jumpRequest(), { params: Promise.resolve({}) });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      jumpId: 'trail-jump-js-frontend-react-s3',
      sectionNumber: 3,
    });
    expect(prisma.exerciseSubmission.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ assistance_mode: 'HARD', status: 'PASSED' }),
      })
    );
    expect(prisma.quizAttempt.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          user_id_quiz_id: {
            user_id: 'user-1',
            quiz_id: 'trail-jump-js-frontend-react-s3',
          },
        },
      })
    );
  });

  it('rejects the unlock when the Hard challenge was not passed', async () => {
    vi.mocked(prisma.exerciseSubmission.findFirst).mockResolvedValue(null);

    const response = await POST(jumpRequest(), { params: Promise.resolve({}) });

    expect(response.status).toBe(400);
    expect(prisma.quizAttempt.upsert).not.toHaveBeenCalled();
  });
});
