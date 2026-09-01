import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { RATE_LIMIT_CODE_RUN } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import { judgeDuelCode } from '@/lib/duels/judge';
import { findTrustedDuelProblemByTitle } from '@/lib/duels/problems';
import { rateLimit } from '@/lib/ratelimit';

const runSchema = z.object({ code: z.string().trim().min(1).max(20_000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id: duelId } = await params;
  const parsed = runSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Envie um código válido para executar.' }, { status: 400 });
  }

  await rateLimit(`duel-run:${duelId}:${user.id}`, {
    ...RATE_LIMIT_CODE_RUN,
    endpoint: '/api/duels/:id/run',
  });

  const duel = await prisma.duel.findUnique({ where: { id: duelId } });
  if (!duel) return NextResponse.json({ error: 'Duelo não encontrado' }, { status: 404 });
  if (duel.challenger_id !== user.id && duel.opponent_id !== user.id) {
    return NextResponse.json({ error: 'Você não é participante deste duelo' }, { status: 403 });
  }
  if (duel.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'O duelo não está em andamento.' }, { status: 409 });
  }

  const problemId = duel.problem_id ?? findTrustedDuelProblemByTitle(duel.problem_title)?.id;
  if (!problemId) {
    return NextResponse.json(
      { error: 'Este duelo não possui um problema verificável.' },
      { status: 422 }
    );
  }

  const judgment = await judgeDuelCode({
    problemId,
    code: parsed.data.code,
    language: duel.language,
    executionLimitSeconds: 15,
    includeHiddenTests: false,
  });

  return NextResponse.json({ success: true, judgment });
}
