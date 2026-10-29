import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_AVATAR } from '../types';
const db = vi.hoisted(() => ({ tx: {} as Record<string, any> }));
vi.mock('@/lib/prisma', () => ({
  prisma: { $transaction: async (fn: (tx: unknown) => unknown) => fn(db.tx) },
}));
vi.mock('@/lib/learning/catalog', () => ({ LEARNING_LESSONS: new Map() }));
import { adventure } from '../repository';
beforeEach(() => {
  const player = {
    userId: 'user',
    coins: 0,
    sourceCoins: 0,
    avatar: DEFAULT_AVATAR,
    inventory: [],
    equipped: {},
    lastCheckin: null,
    checkinStreak: 0,
  };
  let battle: any = null;
  db.tx = {
    $queryRaw: vi.fn(async () => [{ now: new Date('2026-10-29T15:00:00Z') }]),
    rpgPlayer: {
      upsert: vi.fn(async () => player),
      findUniqueOrThrow: vi.fn(async () => player),
      update: vi.fn(),
    },
    exerciseSubmission: { count: vi.fn(async () => 0) },
    quizAttempt: { count: vi.fn(async () => 0) },
    rpgTransaction: { findMany: vi.fn(async () => []), create: vi.fn() },
    user: {
      findUniqueOrThrow: vi.fn(async () => ({ username: 'user', total_xp: 0 })),
      update: vi.fn(),
    },
    rpgBattle: {
      findFirst: vi.fn(async () => battle),
      findMany: vi.fn(async () => []),
      create: vi.fn(async ({ data }: any) => {
        battle = {
          ...data,
          id: 'battle',
          status: 'active',
          hp: 100,
          enemyHp: 100,
          turn: 0,
          reward: 0,
          skill: null,
        };
        return battle;
      }),
      update: vi.fn(async ({ data }: any) => {
        battle = { ...battle, ...data };
        return battle;
      }),
    },
  };
});
describe('Server encounter rules', () => {
  it('refuses an encounter above the verified player level', async () => {
    await expect(
      adventure('user', { type: 'battle-start', language: 'PYTHON', creature: 'blue-slime' })
    ).rejects.toThrow('requer nível 2');
    expect(db.tx.rpgBattle.create).not.toHaveBeenCalled();
  });
  it('persists retreat outside the battle-start branch without awarding rewards', async () => {
    await adventure('user', { type: 'battle-start', language: 'PYTHON', creature: 'syntax-slime' });
    const result = await adventure('user', { type: 'battle-flee', battle: 'battle' });
    expect(result.battle?.status).toBe('fled');
    expect(
      (await adventure('user', { type: 'battle-flee', battle: 'battle' })).battle?.status
    ).toBe('fled');
    expect(db.tx.rpgBattle.update).toHaveBeenCalledTimes(1);
    expect(db.tx.rpgBattle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'fled', questionId: null }),
      })
    );
    expect(db.tx.user.update).not.toHaveBeenCalled();
    expect(db.tx.rpgTransaction.create).not.toHaveBeenCalled();
  });
});
