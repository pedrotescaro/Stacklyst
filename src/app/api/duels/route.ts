import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createDuelSchema } from '@/lib/validators';
import { getRandomDuelProblem } from '@/lib/duel-problems';
import { DUEL_TIME_LIMIT_SECONDS } from '@/lib/duels/constants';
import { isSupportedDuelLanguage } from '@/lib/duels/judge';
import {
  findTrustedDuelProblemByTitle,
  getTrustedDuelProblem,
  serializePublicDuelProblem,
} from '@/lib/duels/problems';

const quickMatchSchema = z.object({
  isQuickMatch: z.literal(true),
  language: z.enum(['TS', 'JS', 'PYTHON']).default('TS'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 50;
    const duels = await prisma.duel.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        challenger: { select: { id: true, username: true, avatar_url: true } },
        opponent: { select: { id: true, username: true, avatar_url: true } },
        solutions: { select: { user_id: true, vote_count: true } },
      },
    });

    return NextResponse.json(duels);
  } catch (error) {
    console.error('Error fetching duels:', error);
    return NextResponse.json({ error: 'Erro ao buscar duelos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    if (body?.isQuickMatch === true) {
      const parsed = quickMatchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Linguagem indisponível para o juiz de duelos.' },
          { status: 400 }
        );
      }
      return matchOrCreateDuel(user.id, parsed.data.language);
    }

    const parsed = createDuelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
        { status: 400 }
      );
    }
    if (!isSupportedDuelLanguage(parsed.data.language)) {
      return NextResponse.json(
        { error: 'A arena avaliada está disponível em TypeScript, JavaScript e Python.' },
        { status: 400 }
      );
    }

    const trustedProblem =
      getTrustedDuelProblem(parsed.data.problem_id) ??
      findTrustedDuelProblemByTitle(parsed.data.problem_title);
    if (!trustedProblem) {
      return NextResponse.json(
        { error: 'Escolha um desafio verificável do catálogo antes de publicar o duelo.' },
        { status: 400 }
      );
    }

    const matched = await claimPendingDuel(user.id, parsed.data.language);
    if (matched) {
      return NextResponse.json({ message: 'Você entrou no duelo!', duel: matched });
    }

    const newDuel = await prisma.duel.create({
      data: {
        challenger_id: user.id,
        problem_title: trustedProblem.title,
        problem_body: serializePublicDuelProblem(trustedProblem),
        problem_id: trustedProblem.id,
        language: parsed.data.language,
        status: 'PENDING',
        time_limit_seconds: DUEL_TIME_LIMIT_SECONDS,
        match_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: { challenger: { select: { id: true, username: true, avatar_url: true } } },
    });

    return NextResponse.json({ message: 'Duelo criado, aguardando oponente!', duel: newDuel });
  } catch (error) {
    console.error('Error matching or creating duel:', error);
    return NextResponse.json({ error: 'Erro ao processar duelo' }, { status: 500 });
  }
}

async function matchOrCreateDuel(userId: string, language: 'TS' | 'JS' | 'PYTHON') {
  const matched = await claimPendingDuel(userId, language);
  if (matched) {
    return NextResponse.json({ message: 'Oponente encontrado! Duelo iniciado.', duel: matched });
  }

  const problem = getRandomDuelProblem();
  const newDuel = await prisma.duel.create({
    data: {
      challenger_id: userId,
      problem_title: problem.title,
      problem_body: serializePublicDuelProblem(problem),
      problem_id: problem.id,
      language,
      status: 'PENDING',
      time_limit_seconds: DUEL_TIME_LIMIT_SECONDS,
      match_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    include: { challenger: { select: { id: true, username: true, avatar_url: true } } },
  });

  return NextResponse.json({ message: 'Buscando oponente na arena...', duel: newDuel });
}

async function claimPendingDuel(userId: string, language: 'TS' | 'JS' | 'PYTHON') {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = await prisma.duel.findFirst({
      where: {
        language,
        status: 'PENDING',
        opponent_id: null,
        challenger_id: { not: userId },
        OR: [{ match_deadline: null }, { match_deadline: { gt: new Date() } }],
      },
      orderBy: { created_at: 'asc' },
      select: { id: true },
    });
    if (!candidate) return null;

    const startedAt = new Date();
    const claim = await prisma.duel.updateMany({
      where: { id: candidate.id, status: 'PENDING', opponent_id: null },
      data: {
        opponent_id: userId,
        status: 'ACTIVE',
        started_at: startedAt,
        time_limit_seconds: DUEL_TIME_LIMIT_SECONDS,
      },
    });
    if (claim.count !== 1) continue;

    return prisma.duel.findUnique({
      where: { id: candidate.id },
      include: {
        challenger: { select: { id: true, username: true, avatar_url: true } },
        opponent: { select: { id: true, username: true, avatar_url: true } },
      },
    });
  }
  return null;
}
