import { NextResponse } from 'next/server';
import { runDuelMaintenance } from '@/lib/duels/lifecycle';
import { EvaluatorService } from '@/services/evaluator.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET não configurado no servidor' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Chave de cron inválida' }, { status: 403 });
  }

  const result = await runDuelMaintenance();
  const notifications = await EvaluatorService.recoverPendingNotifications();
  return NextResponse.json({ success: true, ...result, notifications });
}
