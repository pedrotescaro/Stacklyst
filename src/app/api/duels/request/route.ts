import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { DuelService } from '@/services/duel.service';
import { z } from 'zod';

const requestSchema = z.object({
  receiver_id: z.string().optional(),
  language: z.enum(['TS', 'JS', 'PYTHON']).default('TS'),
  auto_match: z.boolean().default(false),
});

export const POST = apiHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  const parsed = requestSchema.parse(body);

  let targetUserId = parsed.receiver_id;

  if (parsed.auto_match || !targetUserId) {
    const opponent = await DuelService.findMatchmakingOpponent(user.id, parsed.language);
    if (!opponent) {
      return NextResponse.json(
        { error: 'Nenhum oponente disponível na arena no momento. Tente novamente em instantes.' },
        { status: 404 }
      );
    }
    targetUserId = opponent.id;
  }

  const duelRequest = await DuelService.createDuelRequest(user.id, targetUserId, parsed.language);

  return NextResponse.json({
    success: true,
    message: 'Desafio enviado! O oponente tem 30 segundos para aceitar.',
    request: duelRequest,
  });
});
