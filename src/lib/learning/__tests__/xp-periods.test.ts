import { describe, it, expect, vi } from 'vitest';
import { periodStart, recordPeriodXp } from '../xp-periods';
describe('period XP', () => {
  it('uses Sao Paulo days and Monday weeks across month boundaries', () => {
    const now = new Date('2026-11-01T02:30:00Z');
    expect(periodStart('daily', now)).toBe('2026-10-31');
    expect(periodStart('weekly', now)).toBe('2026-10-26');
    expect(periodStart('monthly', now)).toBe('2026-10-01');
  });
  it('records net rewards in global and language buckets atomically', async () => {
    const tx = { $executeRaw: vi.fn().mockResolvedValue(1) };
    await recordPeriodXp(tx as never, 'user', 'JS', 10);
    expect(tx.$executeRaw).toHaveBeenCalledTimes(2);
    expect(tx.$executeRaw.mock.calls[0]).toContainEqual(expect.stringContaining(':GLOBAL'));
    await recordPeriodXp(tx as never, 'user', null, -2);
    expect(tx.$executeRaw).toHaveBeenCalledTimes(3);
    expect(tx.$executeRaw.mock.calls[2]).toContain(-2);
  });
});
