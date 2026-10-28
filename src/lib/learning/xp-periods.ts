import type { Prisma, Language } from '@prisma/client';
export type RankingPeriod = 'daily' | 'weekly' | 'monthly';
export function periodStart(period: RankingPeriod, now = new Date()) {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const date = new Date(`${day}T00:00:00Z`);
  if (period === 'weekly') date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  if (period === 'monthly') date.setUTCDate(1);
  return date.toISOString().slice(0, 10);
}
// Server-owned daily buckets. The mobile state API only permits preferences/draft keys;
// RLS on MobileState has no client write policy. Old accumulated XP is never backdated.
export async function recordPeriodXp(
  tx: Prisma.TransactionClient,
  userId: string,
  language: Language | null | undefined,
  amount: number
) {
  if (!amount) return;
  const day = periodStart('daily');
  for (const scope of language ? ['GLOBAL', language] : ['GLOBAL']) {
    const key = `server-xp:${day}:${scope}`;
    await tx.$executeRaw`INSERT INTO "MobileState" (user_id,key,value,version,updated_at) VALUES (${userId},${key},jsonb_build_object('xp',${amount}::integer),1,NOW()) ON CONFLICT (user_id,key) DO UPDATE SET value=jsonb_build_object('xp',COALESCE(("MobileState".value->>'xp')::integer,0)+${amount}::integer),version="MobileState".version+1,updated_at=NOW()`;
  }
}
