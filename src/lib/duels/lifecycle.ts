import 'server-only';

import { prisma } from '@/lib/prisma';
import { resolveDuelAtDeadline } from '@/lib/duels/resolution';

const ACTIVE_CANDIDATE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const MAINTENANCE_BATCH_SIZE = 100;

export interface DuelMaintenanceResult {
  matched: number;
  expired: number;
  resolved: number;
}

export async function runDuelMaintenance(now = new Date()): Promise<DuelMaintenanceResult> {
  const result: DuelMaintenanceResult = { matched: 0, expired: 0, resolved: 0 };
  const pendingResult = await prisma.$transaction(async (tx) => {
    // One maintenance worker at a time may choose opponents. This keeps the
    // candidate check and duel claim in the same serialized critical section.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('stacklyst-duel-maintenance'))`;

    const pendingCounts = { matched: 0, expired: 0 };
    const duePending = await tx.duel.findMany({
      where: {
        status: 'PENDING',
        opponent_id: null,
        OR: [
          { match_deadline: { lte: now } },
          {
            match_deadline: null,
            created_at: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
        ],
      },
      orderBy: { created_at: 'asc' },
      take: MAINTENANCE_BATCH_SIZE,
      select: { id: true, challenger_id: true },
    });

    for (const duel of duePending) {
      const candidate = await tx.user.findFirst({
        where: {
          id: { not: duel.challenger_id },
          last_active_at: { gte: new Date(now.getTime() - ACTIVE_CANDIDATE_WINDOW_MS) },
          duels_as_challenger: { none: { status: 'ACTIVE' } },
          duels_as_opponent: { none: { status: 'ACTIVE' } },
        },
        orderBy: [{ last_active_at: 'desc' }, { total_xp: 'desc' }],
        select: { id: true },
      });

      if (candidate) {
        const matched = await tx.duel.updateMany({
          where: { id: duel.id, status: 'PENDING', opponent_id: null },
          data: {
            opponent_id: candidate.id,
            status: 'ACTIVE',
            started_at: now,
            closed_reason: null,
          },
        });
        pendingCounts.matched += matched.count;
        continue;
      }

      const expired = await tx.duel.updateMany({
        where: { id: duel.id, status: 'PENDING', opponent_id: null },
        data: {
          status: 'EXPIRED',
          finished_at: now,
          closed_reason: 'matchmaking_timeout',
        },
      });
      pendingCounts.expired += expired.count;
    }

    return pendingCounts;
  });
  result.matched = pendingResult.matched;
  result.expired = pendingResult.expired;

  const activeDuels = await prisma.duel.findMany({
    where: { status: 'ACTIVE', started_at: { not: null } },
    orderBy: { started_at: 'asc' },
    take: MAINTENANCE_BATCH_SIZE,
    select: { id: true, started_at: true, time_limit_seconds: true },
  });

  for (const duel of activeDuels) {
    if (!duel.started_at) continue;
    const deadline = duel.started_at.getTime() + duel.time_limit_seconds * 1000;
    if (deadline > now.getTime()) continue;
    const resolved = await resolveDuelAtDeadline(duel.id);
    if (resolved) result.resolved += 1;
  }

  return result;
}
