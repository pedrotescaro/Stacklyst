import { z } from 'zod';
import { availableQuestions, configErrors, ENADE_YEARS, QUESTION_BY_ID } from './simulator';

export const enadeConfigSchema = z
  .object({
    version: z.literal(1),
    years: z
      .array(
        z
          .number()
          .int()
          .refine((v) => ENADE_YEARS.includes(v))
      )
      .min(1)
      .max(5),
    questionCount: z.number().int().min(1).max(200),
    order: z.enum(['sequential', 'random']),
    durationMinutes: z.number().min(1).max(300).nullable(),
    mode: z.enum(['exam', 'training']),
    includeDiscursive: z.boolean(),
  })
  .refine((value) => new Set(value.years).size === value.years.length, 'Edições repetidas.');
export const enadeSessionSchema = z
  .object({
    version: z.literal(1),
    id: z.string().min(1).max(100),
    config: enadeConfigSchema,
    seed: z.number().int().min(0).max(4294967295),
    questionIds: z.array(z.string().max(60)).min(1).max(200),
    optionOrder: z.record(z.string().max(60), z.array(z.string().regex(/^[A-E]$/)).length(5)),
    answers: z.record(z.string().max(60), z.string().max(10000)),
    marked: z.array(z.string().max(60)).max(200),
    checked: z.array(z.string().max(60)).max(200),
    currentIndex: z.number().int().min(0).max(199),
    elapsedMs: z
      .number()
      .min(0)
      .max(365 * 24 * 60 * 60000),
    runningSince: z.number().positive().nullable(),
    paused: z.boolean(),
    startedAt: z.number().positive(),
    finishedAt: z.number().positive().nullable(),
    updatedAt: z.number().positive(),
    sourceYear: z.number().int().optional(),
    finishReason: z.enum(['manual', 'timeout']).nullable(),
  })
  .superRefine((session, ctx) => {
    const ids = new Set(session.questionIds);
    const pool = new Set(availableQuestions(session.config).map((q) => q.id));
    const invalid =
      ids.size !== session.questionIds.length ||
      ids.size !== session.config.questionCount ||
      session.currentIndex >= ids.size ||
      session.questionIds.some((id) => {
        const q = QUESTION_BY_ID.get(id);
        return (
          !q ||
          !session.config.years.includes(q.year) ||
          (session.sourceYear === undefined ? !pool.has(id) : q.year !== session.sourceYear)
        );
      }) ||
      (session.sourceYear !== undefined &&
        (!ENADE_YEARS.includes(session.sourceYear) || session.config.years.length !== 1)) ||
      Object.entries(session.answers).some(
        ([id, answer]) =>
          !ids.has(id) || (QUESTION_BY_ID.get(id)?.kind === 'objective' && !/^[A-E]$/.test(answer))
      ) ||
      [...session.marked, ...session.checked].some((id) => !ids.has(id)) ||
      Object.keys(session.optionOrder).some(
        (id) => !ids.has(id) || QUESTION_BY_ID.get(id)?.kind !== 'objective'
      ) ||
      session.questionIds.some(
        (id) =>
          QUESTION_BY_ID.get(id)?.kind === 'objective' &&
          new Set(session.optionOrder[id]).size !== 5
      ) ||
      (session.paused || session.finishedAt !== null
        ? session.runningSince !== null
        : session.runningSince === null) ||
      (session.config.durationMinutes !== null &&
        session.elapsedMs > session.config.durationMinutes * 60000);
    if (invalid) ctx.addIssue({ code: 'custom', message: 'Sessão do simulado inválida.' });
  });
export const enadeWorkspaceSchema = z
  .object({
    version: z.literal(1),
    config: enadeConfigSchema
      .refine((v) => !configErrors(v).length, 'Configuração inválida.')
      .nullable(),
    session: enadeSessionSchema.nullable(),
    updatedAt: z.number().min(0),
  })
  .refine((v) => v.session?.sourceYear === undefined, 'Use a rota da edição para provas padrão.');
