import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { QuizService } from '@/services/quiz.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    quiz: { findUnique: vi.fn(), upsert: vi.fn() },
    post: { findMany: vi.fn() },
  },
}));
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const scheduledFor = new Date('2026-08-21T15:00:00.000Z');
const day = new Date('2026-08-21T00:00:00.000Z');
const technicalPost = {
  id: 'technical-post',
  title: 'Tipos no JavaScript',
  body: 'No JavaScript, o operador typeof retorna a string object quando recebe null por causa de um comportamento histórico da linguagem. Para identificar valores nulos com segurança, use a comparação estrita antes de acessar propriedades de um objeto.',
  language: 'JS',
  created_at: new Date('2026-08-20T12:00:00Z'),
};
const persistedQuiz = {
  id: 'daily-quiz',
  post_id: technicalPost.id,
  question: 'Questão revisada',
  options: ['Uma alternativa', 'Outra alternativa'],
  correct_index: 0,
  is_daily: true,
  scheduled_for: day,
  created_at: day,
};

describe('QuizService.generateDaily without AI or an external scheduler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.post.findMany).mockResolvedValue([technicalPost] as never);
    vi.mocked(prisma.quiz.upsert).mockResolvedValue(persistedQuiz);
  });

  it('publishes a reviewed question related to explanatory programming content', async () => {
    const request = vi.spyOn(globalThis, 'fetch');
    try {
      expect(await QuizService.generateDaily(scheduledFor)).toEqual(persistedQuiz);
      expect(prisma.quiz.upsert).toHaveBeenCalledWith({
        where: { scheduled_for: day },
        update: {},
        create: expect.objectContaining({
          post_id: technicalPost.id,
          question: expect.stringMatching(/typeof/i),
          options: expect.arrayContaining([expect.any(String)]),
          correct_index: expect.any(Number),
          is_daily: true,
          scheduled_for: day,
        }),
      });
      expect(request).not.toHaveBeenCalled();
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          created_at: {
            gte: new Date('2026-07-22T00:00:00Z'),
            lt: new Date('2026-08-22T00:00:00Z'),
          },
        },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        take: 100,
        select: { id: true, title: true, body: true, language: true, created_at: true },
      });
    } finally {
      request.mockRestore();
    }
  });

  it('returns no quiz when no posts exist instead of choosing a random fallback', async () => {
    vi.mocked(prisma.post.findMany).mockResolvedValue([]);
    expect(await QuizService.generateDaily(scheduledFor)).toBeNull();
    expect(prisma.quiz.upsert).not.toHaveBeenCalled();
  });

  it('does not publish a quiz for an unrelated post even when its language and title look technical', async () => {
    vi.mocked(prisma.post.findMany).mockResolvedValue([
      {
        ...technicalPost,
        title: 'JavaScript typeof null',
        body: 'Hoje aproveitei o tempo livre para passear com meus amigos e conhecer lugares diferentes na cidade. Foi um encontro muito agradável, com boas conversas e planos para as nossas próximas férias no fim do ano.',
      },
    ] as never);
    expect(await QuizService.generateDaily(scheduledFor)).toBeNull();
    expect(prisma.quiz.upsert).not.toHaveBeenCalled();
  });

  it('keeps a published daily quiz and its existing attempts stable', async () => {
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(persistedQuiz);
    expect(await QuizService.generateDaily(scheduledFor)).toBe(persistedQuiz);
    expect(prisma.post.findMany).not.toHaveBeenCalled();
    expect(prisma.quiz.upsert).not.toHaveBeenCalled();
  });

  it('normalizes dates to UTC without mutating the caller date', async () => {
    const dateWithOffset = new Date('2026-08-21T23:00:00-03:00');
    const originalTime = dateWithOffset.getTime();
    await QuizService.generateDaily(dateWithOffset);
    expect(dateWithOffset.getTime()).toBe(originalTime);
    expect(prisma.quiz.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { scheduled_for: new Date('2026-08-22T00:00:00Z') },
      })
    );
  });

  it('rejects an invalid scheduling date before querying the database', async () => {
    await expect(QuizService.generateDaily(new Date('invalid'))).rejects.toMatchObject({
      code: 'INVALID_QUIZ_DATE',
      statusCode: 400,
    });
    expect(prisma.quiz.findUnique).not.toHaveBeenCalled();
    expect(prisma.post.findMany).not.toHaveBeenCalled();
  });

  it('returns the winner when concurrent first requests hit the unique daily constraint', async () => {
    vi.mocked(prisma.quiz.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(persistedQuiz);
    vi.mocked(prisma.quiz.upsert).mockRejectedValue({ code: 'P2002' });
    expect(await QuizService.generateDaily(scheduledFor)).toBe(persistedQuiz);
    expect(prisma.quiz.findUnique).toHaveBeenLastCalledWith({ where: { scheduled_for: day } });
  });

  it('preserves a real database failure instead of pretending a quiz was created', async () => {
    const failure = new Error('Database unavailable');
    vi.mocked(prisma.quiz.upsert).mockRejectedValue(failure);
    await expect(QuizService.generateDaily(scheduledFor)).rejects.toBe(failure);
  });
});
