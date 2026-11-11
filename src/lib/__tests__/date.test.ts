// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatAbsoluteDate, formatRelativeTime } from '@/lib/date';

const ORIGINAL_TIME_ZONE = process.env.TZ;

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();

    if (ORIGINAL_TIME_ZONE === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = ORIGINAL_TIME_ZONE;
    }
  });

  it('preserves the existing relative-time labels', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T12:00:00.000Z'));

    expect(formatRelativeTime('2026-08-12T11:59:30.000Z')).toBe('agora');
    expect(formatRelativeTime('2026-08-12T11:15:00.000Z')).toBe('45m atrás');
    expect(formatRelativeTime('2026-08-12T07:00:00.000Z')).toBe('5h atrás');
    expect(formatRelativeTime('2026-08-04T12:00:00.000Z')).toBe('8d atrás');
  });

  it('writes relative times in English when asked', () => {
    const reference = new Date('2026-08-12T12:00:00.000Z');

    expect(formatRelativeTime('2026-08-12T11:59:30.000Z', reference, 'en')).toBe('just now');
    expect(formatRelativeTime('2026-08-12T11:59:00.000Z', reference, 'en')).toBe('1 minute ago');
    expect(formatRelativeTime('2026-08-12T10:00:00.000Z', reference, 'en')).toBe('2 hours ago');
    expect(formatRelativeTime('2026-08-10T12:00:00.000Z', reference, 'en')).toBe('2 days ago');
  });

  it('uses one explicit reference instant across relative-time boundaries', () => {
    const createdAt = '2026-08-12T12:00:00.000Z';

    const cases = [
      ['2026-08-12T12:00:59.999Z', 'agora'],
      ['2026-08-12T12:01:00.000Z', '1m atrás'],
      ['2026-08-12T12:59:59.999Z', '59m atrás'],
      ['2026-08-12T13:00:00.000Z', '1h atrás'],
      ['2026-08-13T11:59:59.999Z', '23h atrás'],
      ['2026-08-13T12:00:00.000Z', '1d atrás'],
      ['2026-09-11T11:59:59.999Z', '29d atrás'],
      ['2026-09-11T12:00:00.000Z', '12/08/2026'],
    ] as const;

    for (const [referenceDate, expected] of cases) {
      expect(formatRelativeTime(createdAt, referenceDate)).toBe(expected);
    }
  });

  it('formats absolute dates identically in UTC and Sao Paulo runtimes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T12:00:00.000Z'));

    const labels = ['UTC', 'America/Sao_Paulo'].map((runtimeTimeZone) => {
      process.env.TZ = runtimeTimeZone;
      return formatRelativeTime('2026-06-25T00:42:49.083Z');
    });

    expect(labels).toEqual(['24/06/2026', '24/06/2026']);
  });

  it('formats the deterministic hydration fallback in the application timezone', () => {
    expect(formatAbsoluteDate('2026-06-25T00:42:49.083Z')).toBe('24/06/2026');
  });
});
