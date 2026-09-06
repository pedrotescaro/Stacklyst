import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../[id]/attempt/route';
import { prisma } from '@/lib/prisma';
import { awardXPInTransaction } from '@/lib/xp';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(async () => ({ id: 'user-123', total_xp: 100 })),
  requireAuth: vi.fn(async () => ({ id: 'user-123', total_xp: 100 })),
}));
vi.mock('@/lib/prisma', () => {
  const db = {
    $executeRaw: vi.fn(async () => 1),
    $transaction: vi.fn(async (work) => work(db)),
    quiz: { findUnique: vi.fn(), upsert: vi.fn() },
    quizAttempt: {
      findMany: vi.fn(async () => []),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(async () => ({ total_xp: 115 })),
      findUniqueOrThrow: vi.fn(async () => ({ total_xp: 115 })),
    },
  };
  return { prisma: db };
});
vi.mock('@/lib/xp', () => ({
  awardXPInTransaction: vi.fn(async () => ({
    xpEarned: 15,
    newXp: 150,
    newLevel: 2,
    totalXp: 115,
  })),
}));
async function submit(id: string, selected_index = 1) {
  return POST(
    new Request(`http://localhost:3000/api/quiz/${id}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ selected_index }),
    }),
    { params: Promise.resolve({ id }) }
  );
}
describe('quiz attempts use transactional assessment persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue({
      id: 'quiz-123',
      question: 'Question',
      options: ['wrong', 'right'],
      correct_index: 1,
      post: { language: 'TS' },
    } as never);
    vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue([]);
    vi.mocked(prisma.quizAttempt.findUniqueOrThrow).mockResolvedValue({
      id: 'attempt-123',
      selected_index: 1,
      is_correct: true,
      xp_earned: 15,
    } as never);
  });
  it('records a correct answer and awards XP inside the same transaction', async () => {
    const response = await submit('quiz-123');
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.is_correct).toBe(true);
    expect(json.xpResult.newTotalXp).toBe(115);
    expect(prisma.quizAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ quiz_id: 'quiz-123', is_correct: true, xp_earned: 15 }),
      })
    );
    expect(awardXPInTransaction).toHaveBeenCalledWith(prisma, 'user-123', 'TS', 15);
  });
  it('promotes an incorrect attempt on a successful retry', async () => {
    vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue([
      { quiz_id: 'quiz-123', is_correct: false },
    ] as never);
    expect((await submit('quiz-123')).status).toBe(200);
    expect(prisma.quizAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ is_correct: true, xp_earned: 15 }),
      })
    );
    expect(awardXPInTransaction).toHaveBeenCalledTimes(1);
  });
  it('does not award XP again for a completed answer', async () => {
    vi.mocked(prisma.quizAttempt.findMany).mockResolvedValue([
      { quiz_id: 'quiz-123', is_correct: true },
    ] as never);
    expect((await submit('quiz-123')).status).toBe(200);
    expect(awardXPInTransaction).not.toHaveBeenCalled();
    expect(prisma.quizAttempt.update).not.toHaveBeenCalled();
  });
  it('provisions a legacy curriculum choice using its original identity', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);
    expect((await submit('js-backend-data-s4-u2-s2', 0)).status).toBe(200);
    expect(prisma.quiz.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ id: 'js-backend-data-s4-u2-s2' }),
      })
    );
    expect(awardXPInTransaction).toHaveBeenCalledWith(prisma, 'user-123', 'JS', 20);
  });
  it('rejects code completion claimed as a multiple-choice answer', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);
    const response = await submit('js-algorithms-s3-u2-code-1-s1', 0);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('ASSESSMENT_REQUIRED');
    expect(awardXPInTransaction).not.toHaveBeenCalled();
    expect(prisma.quizAttempt.create).not.toHaveBeenCalled();
  });
});
