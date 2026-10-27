import type { EventStatus, Prisma } from '@prisma/client';

export function effectiveEventStatus(
  event: { status: EventStatus; start_date: Date; end_date: Date },
  now = new Date()
): EventStatus {
  if (event.status === 'COMPLETED' || event.end_date <= now) return 'COMPLETED';
  if (event.status === 'ONGOING' || event.start_date <= now) return 'ONGOING';
  return 'UPCOMING';
}

export function eventStatusWhere(
  status: EventStatus | undefined,
  now = new Date()
): Prisma.EventWhereInput | undefined {
  if (!status) return undefined;
  if (status === 'COMPLETED') return { OR: [{ status: 'COMPLETED' }, { end_date: { lte: now } }] };
  if (status === 'ONGOING')
    return {
      status: { not: 'COMPLETED' },
      end_date: { gt: now },
      OR: [{ status: 'ONGOING' }, { start_date: { lte: now } }],
    };
  return { status: 'UPCOMING', start_date: { gt: now }, end_date: { gt: now } };
}
