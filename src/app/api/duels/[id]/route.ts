import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveDuelAtDeadline } from '@/lib/duels/resolution';

const actionSchema = z.object({ action: z.literal('join') });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { id } = await params;

  const active = await prisma.duel.findUnique({
    where: { id },
    select: { status: true, started_at: true, time_limit_seconds: true },
  });
  if (
    active?.status === 'ACTIVE' &&
    active.started_at &&
    active.started_at.getTime() + active.time_limit_seconds * 1000 <= Date.now()
  ) {
    await resolveDuelAtDeadline(id);
  }

  const duel = await prisma.duel.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      challenger_id: true,
      opponent_id: true,
      winner_id: true,
      closed_reason: true,
      match_deadline: true,
      started_at: true,
      finished_at: true,
      time_limit_seconds: true,
      opponent: { select: { id: true, username: true, avatar_url: true } },
      winner: { select: { id: true, username: true } },
      submissions: {
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        take: 20,
        select: {
          id: true,
          status: true,
          passed_tests: true,
          total_tests: true,
          runtime_ms: true,
          complexity: true,
          score: true,
          created_at: true,
        },
      },
      evaluations: {
        orderBy: { created_at: 'desc' },
        take: 1,
        select: {
          type: true,
          score_player1: true,
          score_player2: true,
          human_feedback: true,
          created_at: true,
        },
      },
    },
  });
  if (!duel) return NextResponse.json({ error: 'Duelo não encontrado' }, { status: 404 });
  if (
    duel.status === 'ACTIVE' &&
    duel.challenger_id !== user.id &&
    duel.opponent_id !== user.id &&
    user.role !== 'EVALUATOR' &&
    user.role !== 'ADMIN'
  ) {
    return NextResponse.json({ error: 'Você não é participante deste duelo' }, { status: 403 });
  }

  return NextResponse.json(duel);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const parsed = actionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  const { id } = await params;

  const existing = await prisma.duel.findUnique({
    where: { id },
    select: { challenger_id: true, status: true, match_deadline: true },
  });
  if (!existing) return NextResponse.json({ error: 'Duelo não encontrado' }, { status: 404 });
  if (existing.challenger_id === user.id) {
    return NextResponse.json({ error: 'Você não pode enfrentar a si mesmo.' }, { status: 409 });
  }
  if (
    existing.status !== 'PENDING' ||
    (existing.match_deadline && existing.match_deadline.getTime() <= Date.now())
  ) {
    return NextResponse.json({ error: 'Este duelo não está mais disponível.' }, { status: 409 });
  }

  const startedAt = new Date();
  const claim = await prisma.duel.updateMany({
    where: { id, status: 'PENDING', opponent_id: null },
    data: { opponent_id: user.id, status: 'ACTIVE', started_at: startedAt },
  });
  if (claim.count !== 1) {
    return NextResponse.json(
      { error: 'Outro oponente entrou primeiro neste duelo.' },
      { status: 409 }
    );
  }

  const duel = await prisma.duel.findUnique({
    where: { id },
    include: {
      challenger: { select: { id: true, username: true, avatar_url: true } },
      opponent: { select: { id: true, username: true, avatar_url: true } },
    },
  });
  return NextResponse.json({ success: true, duel });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { id } = await params;
  const duel = await prisma.duel.findUnique({
    where: { id },
    select: { challenger_id: true, status: true },
  });
  if (!duel) return NextResponse.json({ error: 'Duelo não encontrado' }, { status: 404 });
  if (duel.challenger_id !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Somente o criador pode excluir este duelo.' },
      { status: 403 }
    );
  }
  if (!['PENDING', 'EXPIRED', 'CLOSED'].includes(duel.status)) {
    return NextResponse.json(
      { error: 'Duelos ativos ou em revisão não podem ser excluídos.' },
      { status: 409 }
    );
  }

  await prisma.duel.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
