import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { NotFoundError, UnauthorizedError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/ratelimit';
import { enadeConfigSchema } from '@/lib/enade/simulator-schema';
import {
  configErrors,
  ENADE_YEARS,
  gradeSession,
  QUESTION_BY_ID,
  shuffle,
  type EnadeSession,
} from '@/lib/enade/simulator';
import { questionsForTopic } from '@/lib/enade/topics';
import {
  attemptDto,
  createAttempt,
  getOwnedAttempt,
  importLegacyProgress,
  type CreateAttemptInput,
} from '@/lib/enade/attempts.server';
import { loadLibrary } from '@/lib/enade/library/load';
import { readEnadeJson } from '../read-json';

const mode = z.enum(['exam', 'training']).default('training');
const schema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('STANDARD'), year: z.number().int(), fresh: z.boolean().optional() }),
  z.object({ kind: z.literal('CUSTOM'), config: enadeConfigSchema }),
  z.object({ kind: z.literal('REPEAT'), parentId: z.string().uuid() }),
  z.object({ kind: z.literal('WRONG_ONLY'), parentId: z.string().uuid() }),
  z.object({
    kind: z.literal('REVIEW'),
    topic: z.string().max(80).nullable().optional(),
    scope: z.enum(['due', 'open', 'all']).default('due'),
    limit: z.number().int().min(1).max(40).default(10),
  }),
  z.object({
    kind: z.literal('TOPIC'),
    topic: z.string().max(80),
    limit: z.number().int().min(1).max(40).default(10),
    mode,
  }),
  z.object({ kind: z.literal('PRACTICE'), questionId: z.string().max(60), mode }),
]);

export const POST = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const userId: string = session.id;
  await rateLimit(`enade-attempt:${userId}`, {
    limit: 40,
    window: '1 m',
    endpoint: 'enade-attempts',
  });
  const input = schema.parse(await readEnadeJson(request, 4_000));
  await importLegacyProgress(userId);
  const reply = ({ row, created }: Awaited<ReturnType<typeof createAttempt>>) =>
    NextResponse.json({ attempt: attemptDto(row) }, { status: created ? 201 : 200 });

  if (input.kind === 'STANDARD') {
    if (!ENADE_YEARS.includes(input.year))
      throw new ValidationError('VALIDATION_ERROR', 'Edição do Enade inválida.');
    return reply(
      await createAttempt(userId, { kind: 'STANDARD', year: input.year }, { resume: !input.fresh })
    );
  }
  if (input.kind === 'CUSTOM') {
    const errors = configErrors(input.config);
    if (errors.length) throw new ValidationError('VALIDATION_ERROR', errors[0]);
    return reply(await createAttempt(userId, { kind: 'CUSTOM', config: input.config }));
  }
  if (input.kind === 'REPEAT' || input.kind === 'WRONG_ONLY') {
    const parent = await getOwnedAttempt(userId, input.parentId);
    const state = parent.state as unknown as EnadeSession;
    if (input.kind === 'WRONG_ONLY') {
      const wrong = gradeSession(state).wrongIds;
      if (!state.finishedAt || !wrong.length)
        throw new ValidationError('VALIDATION_ERROR', 'Não há questões erradas para refazer.');
      return reply(
        await createAttempt(
          userId,
          { kind: 'WRONG_ONLY', questionIds: wrong, mode: state.config.mode },
          { parentId: parent.id }
        )
      );
    }
    const repeat: CreateAttemptInput =
      parent.kind === 'STANDARD' && state.sourceYear
        ? { kind: 'STANDARD', year: state.sourceYear }
        : parent.kind === 'CUSTOM'
          ? { kind: 'CUSTOM', config: state.config }
          : {
              kind: parent.kind === 'STANDARD' ? 'PRACTICE' : parent.kind,
              questionIds: state.questionIds,
              mode: state.config.mode === 'exam' ? 'exam' : 'training',
              topic: parent.topic,
              topicTitle: parent.topic ? loadLibrary().bySlug.get(parent.topic)?.title : null,
            };
    return reply(await createAttempt(userId, repeat, { parentId: parent.id, replay: state }));
  }
  if (input.kind === 'REVIEW') {
    const now = new Date();
    const items = await prisma.enadeReviewItem.findMany({
      where: {
        user_id: userId,
        ...(input.topic ? { topic: input.topic } : {}),
        ...(input.scope === 'due'
          ? { due_at: { lte: now } }
          : input.scope === 'open'
            ? { status: 'OPEN' }
            : {}),
      },
      // Open misses first, then the most overdue, then recurring ones.
      orderBy: [{ status: 'asc' }, { due_at: 'asc' }, { wrong_count: 'desc' }],
      take: input.limit,
      select: { question_id: true },
    });
    const ids = items.map((i) => i.question_id).filter((id) => QUESTION_BY_ID.has(id));
    if (!ids.length)
      throw new ValidationError('VALIDATION_ERROR', 'Nenhuma questão para revisar agora.');
    return reply(
      await createAttempt(userId, {
        kind: 'REVIEW',
        questionIds: ids,
        mode: 'training',
        topic: input.topic ?? null,
      })
    );
  }
  if (input.kind === 'TOPIC') {
    const article = loadLibrary().bySlug.get(input.topic);
    if (!article) throw new NotFoundError('NOT_FOUND', 'Assunto não encontrado.');
    const pool = questionsForTopic(input.topic);
    if (!pool.length)
      throw new ValidationError(
        'VALIDATION_ERROR',
        'Ainda não há questões oficiais deste assunto.'
      );
    // Prefer questions never answered correctly, so practice targets real gaps.
    const answered = await prisma.enadeAnswer.findMany({
      where: { user_id: userId, question_id: { in: pool.map((q) => q.id) }, correct: true },
      select: { question_id: true },
    });
    const mastered = new Set(answered.map((a) => a.question_id));
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const ordered = [
      ...shuffle(
        pool.filter((q) => !mastered.has(q.id)),
        seed
      ),
      ...shuffle(
        pool.filter((q) => mastered.has(q.id)),
        seed ^ 0x9e3779b9
      ),
    ].slice(0, input.limit);
    return reply(
      await createAttempt(userId, {
        kind: 'TOPIC',
        questionIds: ordered.map((q) => q.id),
        mode: input.mode,
        topic: input.topic,
        topicTitle: article.title,
      })
    );
  }
  const question = QUESTION_BY_ID.get(input.questionId);
  if (!question || question.annulled)
    throw new NotFoundError('NOT_FOUND', 'Questão não encontrada.');
  return reply(
    await createAttempt(
      userId,
      { kind: 'PRACTICE', questionIds: [question.id], mode: input.mode },
      { resume: true }
    )
  );
});
