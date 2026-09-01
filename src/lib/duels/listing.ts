import type { Prisma } from '@prisma/client';

export const RECENTLY_FINISHED_DUEL_WINDOW_MS = 2 * 60 * 1000;
export const OPEN_DUEL_STATUSES = ['PENDING', 'ACTIVE', 'REVIEW_PENDING'] as const;

type ListingDuel = {
  status: string;
  finished_at: string | Date | null;
};

export function getDuelListingWhere(now = new Date()): Prisma.DuelWhereInput {
  const recentFinishCutoff = new Date(now.getTime() - RECENTLY_FINISHED_DUEL_WINDOW_MS);

  return {
    OR: [
      { status: { in: [...OPEN_DUEL_STATUSES] } },
      { status: 'CLOSED', finished_at: { gt: recentFinishCutoff } },
    ],
  };
}

export function isDuelVisibleInListing(duel: ListingDuel, now = Date.now()): boolean {
  if (OPEN_DUEL_STATUSES.includes(duel.status as (typeof OPEN_DUEL_STATUSES)[number])) {
    return true;
  }
  if (duel.status !== 'CLOSED' || !duel.finished_at) return false;

  const finishedAt = new Date(duel.finished_at).getTime();
  return Number.isFinite(finishedAt) && finishedAt + RECENTLY_FINISHED_DUEL_WINDOW_MS > now;
}

export function getDuelListingExpiryAt(duel: ListingDuel): number | null {
  if (duel.status !== 'CLOSED' || !duel.finished_at) return null;

  const finishedAt = new Date(duel.finished_at).getTime();
  return Number.isFinite(finishedAt) ? finishedAt + RECENTLY_FINISHED_DUEL_WINDOW_MS : null;
}
