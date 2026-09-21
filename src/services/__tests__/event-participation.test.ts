import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventService } from '../event.service';
const mocks = vi.hoisted(() => ({
  tx: {
    $executeRaw: vi.fn(),
    user: { findUnique: vi.fn() },
    event: { findUnique: vi.fn() },
    eventParticipant: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({
  prisma: { $transaction: (fn: (tx: unknown) => unknown) => fn(mocks.tx) },
}));
describe('event participation rules', () => {
  const event = {
    id: 'e',
    status: 'UPCOMING',
    end_date: new Date('2099-01-01'),
    min_level: 2,
    max_participants: 1,
    _count: { participants: 0 },
  };
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tx.user.findUnique.mockResolvedValue({ id: 'u', total_xp: 500 });
    mocks.tx.event.findUnique.mockResolvedValue(event);
    mocks.tx.eventParticipant.findUnique.mockResolvedValue(null);
    mocks.tx.eventParticipant.upsert.mockResolvedValue({ id: 'entry' });
  });
  it('locks capacity before reading and creating participation', async () => {
    expect(await EventService.participate('u', 'e')).toEqual({ id: 'entry' });
    expect(mocks.tx.$executeRaw).toHaveBeenCalled();
    expect(mocks.tx.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.tx.event.findUnique.mock.invocationCallOrder[0]
    );
  });
  it('uses the same level thresholds as the rest of the application', async () => {
    mocks.tx.user.findUnique.mockResolvedValue({ id: 'u', total_xp: 300 });
    await expect(EventService.participate('u', 'e')).rejects.toMatchObject({
      code: 'EVENT_LEVEL_REQUIRED',
    });
    expect(mocks.tx.eventParticipant.upsert).not.toHaveBeenCalled();
  });
  it('rejects new participation when full', async () => {
    mocks.tx.event.findUnique.mockResolvedValue({ ...event, _count: { participants: 1 } });
    await expect(EventService.participate('u', 'e')).rejects.toMatchObject({ code: 'EVENT_FULL' });
    expect(mocks.tx.eventParticipant.upsert).not.toHaveBeenCalled();
  });
  it('returns an existing participation even when the event is full', async () => {
    mocks.tx.event.findUnique.mockResolvedValue({ ...event, _count: { participants: 1 } });
    mocks.tx.eventParticipant.findUnique.mockResolvedValue({ id: 'existing' });
    expect(await EventService.participate('u', 'e')).toEqual({ id: 'existing' });
    expect(mocks.tx.eventParticipant.upsert).not.toHaveBeenCalled();
  });
  it('rejects elapsed events even if their status was not updated', async () => {
    mocks.tx.event.findUnique.mockResolvedValue({ ...event, end_date: new Date('2020-01-01') });
    await expect(EventService.participate('u', 'e')).rejects.toMatchObject({
      code: 'EVENT_CLOSED',
    });
    expect(mocks.tx.eventParticipant.upsert).not.toHaveBeenCalled();
  });
});
