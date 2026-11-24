import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { NotFoundError, UnauthorizedError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/ratelimit';
import { loadLibrary } from '@/lib/enade/library/load';
import { addDailyActivity, lockEnadeUser } from '@/lib/enade/attempts.server';
import { readEnadeJson } from '../../read-json';

const schema = z
  .object({
    slug: z.string().max(100),
    studied: z.boolean().optional(),
    // Heartbeat while the article is visible; capped so a stuck tab cannot inflate time.
    readMs: z.number().int().min(0).max(120_000).optional(),
    quiz: z
      .object({
        index: z.number().int().min(0),
        answers: z.array(z.number().int().min(0)).min(1).max(50),
      })
      .optional(),
  })
  .refine((v) => v.studied !== undefined || v.readMs !== undefined || v.quiz !== undefined);

export const PUT = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const userId: string = session.id;
  await rateLimit(`enade-reading:${userId}`, {
    limit: 90,
    window: '1 m',
    endpoint: 'enade-reading',
  });
  const input = schema.parse(await readEnadeJson(request, 4_000));
  const article = loadLibrary().bySlug.get(input.slug);
  if (!article) throw new NotFoundError('NOT_FOUND', 'Conteúdo não encontrado.');
  let result: { score: number; total: number } | undefined;
  if (input.quiz) {
    const { index, answers } = input.quiz;
    const quiz = article.blocks.filter((block) => block.type === 'quiz')[index];
    if (
      !quiz ||
      quiz.items.length !== answers.length ||
      quiz.items.some((item, i) => answers[i] >= item.options.length)
    )
      throw new ValidationError('VALIDATION_ERROR', 'Respostas do miniquestionário inválidas.');
    result = {
      score: quiz.items.filter((item, i) => item.answer === answers[i]).length,
      total: quiz.items.length,
    };
  }
  const now = new Date();
  const progress = await prisma.$transaction(async (tx) => {
    await lockEnadeUser(tx, userId);
    const previous = await tx.enadeStudyProgress.findUnique({
      where: { user_id_article_slug: { user_id: userId, article_slug: input.slug } },
    });
    const becameStudied = input.studied === true && !previous?.studied;
    const quizBest =
      result &&
      (previous?.quiz_best == null ||
        result.score * (previous.quiz_total ?? 1) > previous.quiz_best * result.total)
        ? { quiz_best: result.score, quiz_total: result.total }
        : {};
    const data = {
      last_read_at: now,
      ...(input.studied !== undefined
        ? {
            studied: input.studied,
            studied_at: input.studied ? (previous?.studied_at ?? now) : null,
          }
        : {}),
      ...quizBest,
    };
    const row = await tx.enadeStudyProgress.upsert({
      where: { user_id_article_slug: { user_id: userId, article_slug: input.slug } },
      create: { user_id: userId, article_slug: input.slug, read_ms: input.readMs ?? 0, ...data },
      update: { ...data, ...(input.readMs ? { read_ms: { increment: input.readMs } } : {}) },
    });
    await addDailyActivity(tx, userId, now, {
      reading_ms: input.readMs ?? 0,
      articles_studied: becameStudied ? 1 : 0,
    });
    return row;
  });
  return NextResponse.json({
    progress: {
      studied: progress.studied,
      readMs: progress.read_ms,
      quizBest: progress.quiz_best,
      quizTotal: progress.quiz_total,
    },
    ...(result ? { quiz: result } : {}),
  });
});
