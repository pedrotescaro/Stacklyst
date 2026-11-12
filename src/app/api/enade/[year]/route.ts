import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import exams from '@/lib/enade/exams.json';
import { enadeSessionSchema } from '@/lib/enade/simulator-schema';

const schema = z.object({
  answers: z.record(z.string().max(60), z.string().max(10000)),
  marked: z.array(z.string().max(60)).max(40),
  startedAt: z.number().int().positive(),
  finishedAt: z.number().int().positive().nullable(),
  updatedAt: z.number().int().positive(),
});

export const PUT = apiHandler(async (request, { session, params }) => {
  if (!session) throw new UnauthorizedError();
  const year = Number((await params).year);
  const exam = exams.find((e) => e.year === year);
  if (!exam) throw new ValidationError('Edição do Enade inválida.');
  const body = await request.json();
  const attempt = body?.version === 1 ? enadeSessionSchema.parse(body) : schema.parse(body);
  if ('sourceYear' in attempt && attempt.sourceYear !== year)
    throw new ValidationError('Sessão de outra edição.');
  const questions = new Map(exam.questions.map((q) => [q.id, q]));
  if (
    Object.keys(attempt.answers).length > 40 ||
    Object.entries(attempt.answers).some(
      ([id, value]) =>
        !questions.has(id) || (questions.get(id)?.kind === 'objective' && !/^[A-E]$/.test(value))
    ) ||
    attempt.marked.some((id) => !questions.has(id))
  )
    throw new ValidationError('Respostas inválidas.');
  await prisma.mobileState.upsert({
    where: { user_id_key: { user_id: session.id, key: `enade-ads-${year}` } },
    create: { user_id: session.id, key: `enade-ads-${year}`, value: attempt },
    update: { value: attempt, version: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
});
