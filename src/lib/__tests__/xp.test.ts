import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateLevel, awardXP } from '../xp';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    $executeRaw: vi.fn(async () => 1),
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    languageTrail: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    userBadge: {
      create: vi.fn(),
      findMany: vi.fn(() => []),
    },
    badge: {
      findUnique: vi.fn(),
    },
    answer: {
      count: vi.fn(() => 0),
    },
    quizAttempt: {
      count: vi.fn(() => 0),
    },
    $transaction: vi.fn((callback) => callback(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

describe('calculateLevel', () => {
  it('should calculate correct level thresholds', () => {
    expect(calculateLevel(100)).toEqual({ level: 1, nextLevelXp: 500, prevLevelXp: 0 });
    expect(calculateLevel(600)).toEqual({ level: 2, nextLevelXp: 800, prevLevelXp: 500 });
    expect(calculateLevel(2500)).toEqual({ level: 6, nextLevelXp: 2600, prevLevelXp: 2000 });
  });
});

describe('awardXP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      total_xp: 100,
      streak_days: 5,
      last_active_at: new Date(2026, 5, 17, 18, 0, 0),
    } as any);
  });

  it('should award general XP (without language) correctly', async () => {
    const updatedUserMock = { id: 'user-1', total_xp: 100 };
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUserMock as any);

    const result = await awardXP('user-1', null, 100);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        total_xp: { increment: 100 },
        streak_days: expect.any(Number),
        last_active_at: expect.any(Date),
      },
    });
    expect(result.newXp).toBe(100);
    expect(result.newLevel).toBe(1);
    expect(result.language).toBeNull();
  });

  it('should award language trail XP correctly', async () => {
    const updatedUserMock = { id: 'user-1', total_xp: 250 };
    const trailMock = null; // simulate creating new trail

    vi.mocked(prisma.user.update).mockResolvedValue(updatedUserMock as any);
    vi.mocked(prisma.languageTrail.findUnique).mockResolvedValue(trailMock);
    vi.mocked(prisma.languageTrail.create).mockResolvedValue({
      id: 'trail-1',
      xp: 150,
      level: 1,
      streak: 1,
    } as any);

    const result = await awardXP('user-1', 'TS', 150);

    expect(prisma.languageTrail.create).toHaveBeenCalled();
    expect(result.xpEarned).toBe(150);
    expect(result.newStreak).toBe(1);
  });

  describe('Streak calculations', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 18, 12, 0, 0)); // June 18, 2026 12:00:00
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should maintain streak when activity is on the same day', async () => {
      const updatedUserMock = { id: 'user-1', total_xp: 200 };
      const trailMock = {
        id: 'trail-123',
        xp: 100,
        level: 1,
        streak: 5,
        last_activity_at: new Date(2026, 5, 18, 8, 0, 0), // Same day, earlier
      };

      vi.mocked(prisma.user.update).mockResolvedValue(updatedUserMock as any);
      vi.mocked(prisma.languageTrail.findUnique).mockResolvedValue(trailMock as any);
      vi.mocked(prisma.languageTrail.update).mockResolvedValue({} as any);

      const result = await awardXP('user-1', 'TS', 50);

      expect(prisma.languageTrail.update).toHaveBeenCalledWith({
        where: { id: 'trail-123' },
        data: expect.objectContaining({
          xp: 150,
          streak: 5, // maintained
        }),
      });
      expect(result.newStreak).toBe(5);
      expect(result.newXp).toBe(150);
    });

    it('should increment streak when activity is on the next day', async () => {
      const updatedUserMock = { id: 'user-1', total_xp: 200 };
      const trailMock = {
        id: 'trail-123',
        xp: 100,
        level: 1,
        streak: 5,
        last_activity_at: new Date(2026, 5, 17, 18, 0, 0), // Yesterday
      };

      vi.mocked(prisma.user.update).mockResolvedValue(updatedUserMock as any);
      vi.mocked(prisma.languageTrail.findUnique).mockResolvedValue(trailMock as any);
      vi.mocked(prisma.languageTrail.update).mockResolvedValue({} as any);

      const result = await awardXP('user-1', 'TS', 50);

      expect(prisma.languageTrail.update).toHaveBeenCalledWith({
        where: { id: 'trail-123' },
        data: expect.objectContaining({
          xp: 150,
          streak: 6, // incremented
        }),
      });
      expect(result.newStreak).toBe(6);
      expect(result.newXp).toBe(150);
    });

    it('should reset streak when activity is after a gap of two days or more', async () => {
      const updatedUserMock = { id: 'user-1', total_xp: 200 };
      const trailMock = {
        id: 'trail-123',
        xp: 100,
        level: 1,
        streak: 5,
        last_activity_at: new Date(2026, 5, 16, 12, 0, 0), // Two days ago
      };

      vi.mocked(prisma.user.update).mockResolvedValue(updatedUserMock as any);
      vi.mocked(prisma.languageTrail.findUnique).mockResolvedValue(trailMock as any);
      vi.mocked(prisma.languageTrail.update).mockResolvedValue({} as any);

      const result = await awardXP('user-1', 'TS', 50);

      expect(prisma.languageTrail.update).toHaveBeenCalledWith({
        where: { id: 'trail-123' },
        data: expect.objectContaining({
          xp: 150,
          streak: 1, // reset
        }),
      });
      expect(result.newStreak).toBe(1);
      expect(result.newXp).toBe(150);
    });
  });
});
