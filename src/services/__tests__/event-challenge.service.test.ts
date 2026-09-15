import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  eventFindUnique: vi.fn(),
  challengeFindMany: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    event: { findUnique: mocks.eventFindUnique },
    eventChallenge: { findMany: mocks.challengeFindMany },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn() },
}));

import { EventChallengeService } from '../event-challenge.service';

const event = {
  id: 'event-1',
  creator_id: 'creator-1',
  status: 'ONGOING',
  start_date: new Date('2026-09-14T12:00:00.000Z'),
  end_date: new Date('2099-09-15T12:00:00.000Z'),
};

const challenge = {
  id: 'challenge-1',
  event_id: 'event-1',
  position: 1,
  title: 'Soma eficiente',
  statement: 'Some dois números com eficiência.',
  language: 'TS',
  expected_answer: 'return a + b;',
  examples: [{ input: '2 3', output: '5' }],
  created_at: new Date('2026-09-14T12:00:00.000Z'),
  updated_at: new Date('2026-09-14T12:00:00.000Z'),
};

describe('EventChallengeService.list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.eventFindUnique.mockResolvedValue(event);
    mocks.challengeFindMany.mockResolvedValue([challenge]);
  });

  it('does not expose expected answers to participants', async () => {
    const result = await EventChallengeService.list('event-1', {
      id: 'participant-1',
      isAdmin: false,
    });

    expect(result.challenges[0]).not.toHaveProperty('expected_answer');
    expect(result.can_manage).toBe(false);
    expect(result.can_edit).toBe(false);
  });

  it('exposes expected answers to the event creator', async () => {
    const result = await EventChallengeService.list('event-1', {
      id: 'creator-1',
      isAdmin: false,
    });

    expect(result.challenges[0]).toHaveProperty('expected_answer', 'return a + b;');
    expect(result.can_manage).toBe(true);
    expect(result.can_edit).toBe(true);
  });
});
