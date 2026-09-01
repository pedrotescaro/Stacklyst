import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { RATE_LIMIT_CODE_RUN } from '@/lib/config';
import { rateLimit } from '@/lib/ratelimit';
import { judgeDuelSubmission } from '@/lib/duels/judge';
import { resolveDuelAtDeadline, resolveDuelIfReady } from '@/lib/duels/resolution';
import { findTrustedDuelProblemByTitle } from '@/lib/duels/problems';

const submissionSchema = z.object({ code: z.string().trim().min(1).max(20_000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { id: duelId } = await params;
    const parsed = submissionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Envie uma solução entre 1 e 20.000 caracteres.' },
        { status: 400 }
      );
    }

    await rateLimit(`duel-submit:${duelId}:${user.id}`, {
      ...RATE_LIMIT_CODE_RUN,
      endpoint: '/api/duels/:id/solution',
    });

    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel) return NextResponse.json({ error: 'Duelo não encontrado' }, { status: 404 });
    if (duel.challenger_id !== user.id && duel.opponent_id !== user.id) {
      return NextResponse.json({ error: 'Você não é participante deste duelo' }, { status: 403 });
    }
    if (duel.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Este duelo não aceita novas submissões.', duel },
        { status: 409 }
      );
    }

    if (
      duel.started_at &&
      duel.started_at.getTime() + duel.time_limit_seconds * 1000 <= Date.now()
    ) {
      const resolution = await resolveDuelAtDeadline(duelId);
      return NextResponse.json(
        { error: 'O tempo do duelo terminou.', duel: resolution ?? duel },
        { status: 409 }
      );
    }

    const problemId = duel.problem_id ?? findTrustedDuelProblemByTitle(duel.problem_title)?.id;
    if (!problemId) {
      return NextResponse.json(
        { error: 'Este duelo legado não possui um problema verificável.' },
        { status: 422 }
      );
    }

    const judged = await judgeDuelSubmission({
      problemId,
      code: parsed.data.code,
      language: duel.language,
      executionLimitSeconds: 15,
    });
    const submission = await prisma.duelSubmission.create({
      data: {
        duel_id: duelId,
        user_id: user.id,
        code: parsed.data.code,
        status: judged.status,
        passed_tests: judged.passedTests,
        total_tests: judged.totalTests,
        runtime_ms: judged.runtimeMs,
        complexity: judged.complexity,
        complexity_score: judged.complexityScore,
        score: judged.score,
        public_result: judged.publicResult as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        status: true,
        passed_tests: true,
        total_tests: true,
        runtime_ms: true,
        complexity: true,
        complexity_score: true,
        score: true,
        public_result: true,
        created_at: true,
      },
    });
    const resolution = judged.status === 'ACCEPTED' ? await resolveDuelIfReady(duelId) : null;

    return NextResponse.json({ submission, judgment: judged, duel: resolution, success: true });
  } catch (error) {
    console.error('Error submitting duel solution:', error);
    return NextResponse.json({ error: 'Erro ao enviar solução' }, { status: 500 });
  }
}
