import { describe, expect, it } from 'vitest';
import { effectiveEventStatus, eventStatusWhere } from '../event-status';

describe('event lifecycle', () => {
  const now = new Date('2026-10-26T12:00:00Z');
  const event = {
    status: 'UPCOMING' as const,
    start_date: new Date('2026-10-26T10:00:00Z'),
    end_date: new Date('2026-10-26T14:00:00Z'),
  };
  it('starts at the scheduled time without a maintenance worker', () =>
    expect(effectiveEventStatus(event, now)).toBe('ONGOING'));
  it('closes exactly at the deadline regardless of stale stored status', () =>
    expect(effectiveEventStatus(event, event.end_date)).toBe('COMPLETED'));
  it('preserves an explicitly completed event', () =>
    expect(effectiveEventStatus({ ...event, status: 'COMPLETED' }, now)).toBe('COMPLETED'));
  it('includes elapsed events in completed filtering and excludes them from ongoing', () => {
    expect(eventStatusWhere('COMPLETED', now)).toEqual({
      OR: [{ status: 'COMPLETED' }, { end_date: { lte: now } }],
    });
    expect(eventStatusWhere('ONGOING', now)).toMatchObject({ end_date: { gt: now } });
  });
});
