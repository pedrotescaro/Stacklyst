import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_AVATAR } from '../types';
import HAIRSTYLES from '../hairstyles.json';
const db = vi.hoisted(() => ({ tx: {} as Record<string, any>, execute: vi.fn(), random: vi.fn() }));
vi.mock('node:crypto', async (original) => {
  const actual = await original<typeof import('node:crypto')>();
  return { ...actual, randomInt: db.random, default: { ...actual, randomInt: db.random } };
});
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: async (fn: (tx: unknown) => unknown) => fn(db.tx),
    exerciseSubmission: { count: (...args: any[]) => db.tx.exerciseSubmission.count(...args) },
    quizAttempt: { count: (...args: any[]) => db.tx.quizAttempt.count(...args) },
    rpgBattle: { findFirst: (...args: any[]) => db.tx.rpgBattle.findFirst(...args) },
  },
}));
vi.mock('@/lib/code-execution/server', () => ({ executeCode: db.execute }));
vi.mock('@/lib/learning/catalog', () => ({ LEARNING_LESSONS: new Map() }));
vi.mock('@/lib/auth', () => ({ getAuthUser: async () => ({ id: 'user' }) }));
import { actionSchema, adventure } from '../repository';
import { POST } from '@/app/api/mundinho/route';
import { codeChallenge, codeChallenges } from '../codeChallenges';
import { QUESTIONS } from '../questions';
beforeEach(() => {
  db.random.mockReset().mockImplementation((maximum: number) => maximum - 1);
  db.execute.mockReset().mockResolvedValue({
    ok: true,
    output: 'andar\ncoletar\nandar\ncoletar\nandar\ncoletar',
    executionMs: 1,
  });
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
  const transactions: any[] = [];
  db.tx = {
    $queryRaw: vi.fn(async () => [{ now: new Date('2026-10-29T15:00:00Z') }]),
    rpgPlayer: {
      upsert: vi.fn(async () => player),
      findUniqueOrThrow: vi.fn(async () => player),
      update: vi.fn(async ({ data }: any) => {
        for (const [key, value] of Object.entries(data)) {
          (player as any)[key] =
            value && typeof value === 'object' && 'increment' in value
              ? (player as any)[key] + (value as any).increment
              : value;
        }
        return player;
      }),
    },
    exerciseSubmission: { count: vi.fn(async () => 0) },
    quizAttempt: { count: vi.fn(async () => 0) },
    rpgTransaction: {
      findUnique: vi.fn(
        async ({ where }: any) =>
          transactions.find((item) => item.key === where.userId_key.key) ?? null
      ),
      count: vi.fn(
        async ({ where }: any) =>
          transactions.filter((item) => item.key.startsWith(where.key.startsWith)).length
      ),
      findMany: vi.fn(async ({ where }: any) =>
        transactions
          .filter((item) => !where.key || item.key.startsWith(where.key.startsWith))
          .toReversed()
      ),
      create: vi.fn(async ({ data }: any) => {
        const record = {
          ...data,
          id: `transaction-${transactions.length}`,
          createdAt: new Date('2026-11-02T12:00:00Z'),
        };
        transactions.push(record);
        return record;
      }),
    },
    user: {
      findUniqueOrThrow: vi.fn(async () => ({ username: 'user', total_xp: 0 })),
      update: vi.fn(),
    },
    rpgBattle: {
      count: vi.fn(async () => 0),
      findFirst: vi.fn(async ({ where }: any) =>
        battle &&
        (!where.id || where.id === battle.id) &&
        (!where.status || where.status === battle.status)
          ? battle
          : null
      ),
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
          correct: 0,
          skill: null,
          questionId: null,
          used: [],
          ...data,
        };
        return battle;
      }),
      update: vi.fn(async ({ data }: any) => {
        battle = {
          ...battle,
          ...data,
          correct:
            data.correct?.increment !== undefined
              ? battle.correct + data.correct.increment
              : (data.correct ?? battle.correct),
        };
        return battle;
      }),
    },
  };
});
describe('Server encounter rules', () => {
  it('credits learning snapshots once and never removes coins for an older snapshot', async () => {
    db.tx.exerciseSubmission.count.mockImplementation(async ({ where }: any) =>
      where.created_at ? 0 : 3
    );
    expect((await adventure('user')).coins).toBe(15);
    expect((await adventure('user')).coins).toBe(15);
    db.tx.exerciseSubmission.count.mockResolvedValue(0);
    expect((await adventure('user')).coins).toBe(15);
    expect(db.tx.rpgTransaction.create).toHaveBeenCalledTimes(1);
    expect(db.tx.rpgTransaction.create.mock.calls[0][0].data.key).toBe('learning:15');
  });
  it('uses the same catalog level in the world, entry gate and battle, including a level 10 boss', async () => {
    await expect(
      adventure('user', { type: 'battle-start', language: 'JS', creature: 'null-titan' })
    ).rejects.toThrow('nível 10');
    db.tx.user.findUniqueOrThrow.mockResolvedValue({ username: 'user', total_xp: 1000000 });
    for (const [creature, level, hp] of [
      ['iron-beetle', 4, 120],
      ['wild-ember', 5, 140],
      ['null-titan', 10, 240],
    ] as const) {
      const result = await adventure('user', { type: 'battle-start', language: 'JS', creature });
      expect(result.battle).toMatchObject({
        creature,
        enemyLevel: level,
        enemyHp: hp,
        enemyMaxHp: hp,
      });
      await adventure('user', { type: 'battle-flee', battle: 'battle' });
    }
  });
  it('keeps the real creature level when an older deployed client inserts the default snapshot', async () => {
    db.tx.user.findUniqueOrThrow.mockResolvedValue({ username: 'user', total_xp: 1000000 });
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'null-ghost' });
    await db.tx.rpgBattle.update({ data: { enemyLevel: 1 } });
    expect((await adventure('user')).battle?.enemyLevel).toBe(3);
  });
  it('credits exactly 10 daily chest coins once and returns the saved state on reload/replay', async () => {
    expect((await adventure('user')).chest).toEqual({
      day: '2026-10-29',
      claimed: false,
      reward: 10,
    });
    const first = await adventure('user', { type: 'chest' });
    expect(first.coins).toBe(10);
    expect(first.chest).toMatchObject({ claimed: true, reward: 10, awarded: true });
    expect(first.transactions).toEqual([
      expect.objectContaining({ amount: 10, label: 'Baú diário da clareira' }),
    ]);
    const replay = await adventure('user', { type: 'chest' });
    expect(replay.coins).toBe(10);
    expect(replay.chest?.awarded).toBe(false);
    expect(replay.notice).toContain('já abriu o baú hoje');
    expect((await adventure('user')).chest).toMatchObject({ claimed: true });
    expect(db.tx.rpgTransaction.create).toHaveBeenCalledTimes(1);
  });
  it('resets at midnight in São Paulo using the database clock, independently of check-in', async () => {
    db.tx.$queryRaw.mockImplementation(async () => [{ now: new Date('2026-11-02T02:59:59Z') }]);
    const first = await adventure('user', { type: 'chest' });
    expect(first.chest?.day).toBe('2026-11-01');
    db.tx.$queryRaw.mockImplementation(async () => [{ now: new Date('2026-11-02T03:00:00Z') }]);
    expect((await adventure('user')).chest).toMatchObject({ day: '2026-11-02', claimed: false });
    const second = await adventure('user', { type: 'chest' });
    expect(second.coins).toBe(20);
    expect(second.chest).toMatchObject({ day: '2026-11-02', awarded: true });
    expect(second.checkin.claimed).toBe(false);
    expect(db.tx.rpgTransaction.create).toHaveBeenCalledTimes(2);
  });
  it('preserves a legacy chest collected today and allows a reward the following day', async () => {
    db.tx.$queryRaw.mockImplementation(async () => [{ now: new Date('2026-11-02T12:00:00Z') }]);
    await db.tx.rpgTransaction.create({
      data: { userId: 'user', key: 'chest:forest:first', label: 'Baú da clareira', amount: 10 },
    });
    await db.tx.rpgPlayer.update({ data: { coins: 10 } });
    const sameDay = await adventure('user', { type: 'chest' });
    expect(sameDay.chest).toMatchObject({ claimed: true, awarded: false });
    expect(sameDay.coins).toBe(10);
    db.tx.$queryRaw.mockImplementation(async () => [{ now: new Date('2026-11-03T12:00:00Z') }]);
    expect((await adventure('user', { type: 'chest' })).coins).toBe(20);
  });
  it('looks up the daily reward independently of the limited transaction history', async () => {
    await adventure('user', { type: 'chest' });
    db.tx.rpgTransaction.findMany.mockResolvedValue([]);
    expect((await adventure('user')).chest?.claimed).toBe(true);
  });
  it('charges the server catalog price once, stores the equipment and permits equipping it', async () => {
    await db.tx.rpgPlayer.update({ data: { coins: 100 } });
    expect(actionSchema.parse({ type: 'buy', item: 'gear-wood', price: 0 })).toEqual({
      type: 'buy',
      item: 'gear-wood',
    });
    await expect(adventure('user', { type: 'buy', item: 'gear-moon' })).rejects.toThrow(
      'Moedas insuficientes'
    );
    expect(db.tx.rpgTransaction.create).not.toHaveBeenCalled();
    const purchased = await adventure('user', { type: 'buy', item: 'gear-wood' });
    expect(purchased.coins).toBe(0);
    expect(purchased.inventory).toEqual(['gear-wood']);
    expect(purchased.transactions).toEqual([
      expect.objectContaining({ label: 'Escudo do bosque', amount: -100 }),
    ]);
    const repeated = await adventure('user', { type: 'buy', item: 'gear-wood' });
    expect(repeated.coins).toBe(0);
    expect(repeated.inventory).toEqual(['gear-wood']);
    expect(db.tx.rpgTransaction.create).toHaveBeenCalledTimes(1);
    const equipped = await adventure('user', { type: 'equip', item: 'gear-wood' });
    expect(equipped.equipped.armor).toBe('gear-wood');
    expect(equipped.combatStats?.protection).toBe(2);
  });
  it('converts an equipment drop purchased earlier to coins instead of duplicating it', async () => {
    await db.tx.rpgPlayer.update({ data: { coins: 100 } });
    await adventure('user', { type: 'buy', item: 'gear-clover' });
    db.random.mockReturnValue(0);
    await adventure('user', { type: 'battle-start', language: 'TS', creature: 'syntax-slime' });
    for (const turn of [0, 1, 2])
      await adventure('user', { type: 'battle-skill', battle: 'battle', turn, skill: 'burst' });
    const result = await adventure('user');
    expect(result.inventory).toEqual(['gear-clover']);
    expect(result.battle?.drop).toEqual({ itemId: 'gear-clover', duplicateCoins: 5 });
    expect(result.coins).toBe(20);
  });
  it.each(['PYTHON', 'JS', 'TS', 'RUST', 'GO', 'JAVA', 'HTML', 'CSS'] as const)(
    'lets the equipped Caça-bugs title attack without code in %s without granting a correct answer',
    async (language) => {
      await db.tx.rpgPlayer.update({ data: { coins: 120 } });
      await adventure('user', { type: 'buy', item: 'title-debugger' });
      const ready = await adventure('user', { type: 'equip', item: 'title-debugger' });
      expect(ready.combatStats?.directChance).toBe(100);
      await adventure('user', { type: 'battle-start', language, creature: 'syntax-slime' });
      db.random.mockClear();
      const hit = await adventure('user', {
        type: 'battle-skill',
        battle: 'battle',
        turn: 0,
        skill: 'strike',
      });
      expect(hit.battle).toMatchObject({ turn: 1, enemyHp: 70, question: null, directChance: 100 });
      expect(hit.battle?.feedback).toContain('Caça-bugs equipado!');
      expect(db.random).not.toHaveBeenCalled();
      expect(db.execute).not.toHaveBeenCalled();
      expect(db.tx.rpgBattle.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ correct: { increment: 0 } }) })
      );
    }
  );
  it('skips a previously assigned code challenge only after equipping the owned title, once per turn', async () => {
    await db.tx.rpgPlayer.update({ data: { inventory: ['title-debugger'], equipped: {} } });
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    const selected = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'focus',
    });
    const question = selected.battle!.question!.id;
    const skip = { type: 'battle-skip' as const, battle: 'battle', turn: 0, question };
    await expect(adventure('user', skip)).rejects.toThrow('Equipe o título Caça-bugs');
    await adventure('user', { type: 'equip', item: 'title-debugger' });
    const result = await adventure('user', skip);
    expect(result.battle).toMatchObject({ turn: 1, enemyHp: 82, question: null, skill: null });
    expect(result.battle?.feedback).toContain('Caça-bugs equipado!');
    expect(db.execute).not.toHaveBeenCalled();
    expect(db.tx.rpgBattle.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ correct: { increment: 0 }, used: [question] }),
      })
    );
    const repeated = await adventure('user', skip);
    expect(repeated.notice).toContain('sem repetir o golpe');
    expect(repeated.battle).toMatchObject({ turn: 1, enemyHp: 82 });
    await adventure('user', { type: 'equip', item: 'title-debugger', remove: true });
    expect((await adventure('user')).combatStats?.directChance).toBe(75);
  });
  it.each([
    ['TS', 'byte-bug'],
    ['PYTHON', 'null-ghost'],
  ] as const)(
    'uses Caça-bugs against the higher-level creature %s/%s',
    async (language, creature) => {
      db.tx.user.findUniqueOrThrow.mockResolvedValue({ username: 'user', total_xp: 2000 });
      await db.tx.rpgPlayer.update({
        data: { inventory: ['title-debugger'], equipped: { title: 'title-debugger' } },
      });
      await adventure('user', { type: 'battle-start', language, creature });
      const result = await adventure('user', {
        type: 'battle-skill',
        battle: 'battle',
        turn: 0,
        skill: 'strike',
      });
      expect(result.battle).toMatchObject({ turn: 1, question: null, enemyHp: 70 });
      expect(result.battle?.feedback).toContain('Caça-bugs');
    }
  );
  it('accepts the skip through the authenticated API and handles a repeated request safely', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    await db.tx.rpgPlayer.update({ data: { inventory: ['title-debugger'], equipped: {} } });
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    await db.tx.rpgBattle.update({ data: { id } });
    const selected = await adventure('user', {
      type: 'battle-skill',
      battle: id,
      turn: 0,
      skill: 'strike',
    });
    await adventure('user', { type: 'equip', item: 'title-debugger' });
    const payload = {
      type: 'battle-skip',
      battle: id,
      turn: 0,
      question: selected.battle!.question!.id,
    };
    const request = () =>
      new Request('https://stacklyst.vercel.app/api/mundinho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', origin: 'https://stacklyst.vercel.app' },
        body: JSON.stringify(payload),
      });
    const response = await POST(request(), { params: Promise.resolve({}) });
    expect(response.status).toBe(200);
    expect((await response.json()).battle).toMatchObject({ turn: 1, enemyHp: 70 });
    const repeated = await POST(request(), { params: Promise.resolve({}) });
    const body = await repeated.json();
    expect(repeated.status).toBe(200);
    expect(body.notice).toContain('sem repetir o golpe');
    expect(body.battle).toMatchObject({ turn: 1, enemyHp: 70 });
  });
  it('does not apply a compiler result if the same turn was already skipped from another session', async () => {
    await db.tx.rpgPlayer.update({ data: { inventory: ['title-debugger'], equipped: {} } });
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    const selected = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'strike',
    });
    const question = selected.battle!.question!.id;
    await adventure('user', { type: 'equip', item: 'title-debugger' });
    db.execute.mockImplementationOnce(async () => {
      await adventure('user', { type: 'battle-skip', battle: 'battle', turn: 0, question });
      return { ok: true, output: 'andar\ncoletar\nandar\ncoletar', executionMs: 1 };
    });
    const result = await adventure('user', {
      type: 'battle-code',
      battle: 'battle',
      turn: 0,
      question,
      code: 'mundo.andar_direita();',
      submit: true,
    });
    expect(result.notice).toContain('sem repetir o golpe');
    expect(result.battle).toMatchObject({ turn: 1, enemyHp: 70 });
    expect(result.codeRun).toBeUndefined();
  });
  it('counts a victory earned with the title, without crediting exercises that were skipped', async () => {
    await db.tx.rpgPlayer.update({
      data: { inventory: ['title-debugger'], equipped: { title: 'title-debugger' } },
    });
    db.tx.rpgBattle.findMany.mockImplementation(async ({ where }: any) => {
      if (where.id) return [];
      const current = await db.tx.rpgBattle.findFirst({ where: { userId: 'user' } });
      return current ? [current] : [];
    });
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    let result;
    for (const turn of [0, 1, 2, 3])
      result = await adventure('user', {
        type: 'battle-skill',
        battle: 'battle',
        turn,
        skill: 'strike',
      });
    expect(result!.battle?.status).toBe('won');
    expect(result!.missions.find((mission) => mission.id === 'answers')?.progress).toBe(0);
    expect(result!.missions.find((mission) => mission.id === 'battle')?.progress).toBe(1);
    expect(db.tx.user.update).toHaveBeenCalledTimes(1);
  });
  it('cannot use a forged equipped title or skip an old multiple-choice question', async () => {
    await db.tx.rpgPlayer.update({
      data: { inventory: [], equipped: { title: 'title-debugger' } },
    });
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    const selected = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'strike',
    });
    await expect(
      adventure('user', {
        type: 'battle-skip',
        battle: 'battle',
        turn: 0,
        question: selected.battle!.question!.id,
      })
    ).rejects.toThrow('Equipe o título Caça-bugs');
    const old = QUESTIONS.find((q) => q.language === 'JS')!;
    await db.tx.rpgPlayer.update({ data: { inventory: ['title-debugger'] } });
    await db.tx.rpgBattle.update({ data: { questionId: old.id, skill: 'strike' } });
    await expect(
      adventure('user', { type: 'battle-skip', battle: 'battle', turn: 0, question: old.id })
    ).rejects.toThrow('apenas exercícios de código');
    expect((await adventure('user')).battle).toMatchObject({ turn: 0, enemyHp: 100 });
  });
  it.each(['SyntaxError: comando inválido', 'Serviço indisponível'])(
    'returns HTTP 200 with in-battle feedback for execution failure: %s',
    async (message) => {
      const id = '11111111-1111-4111-8111-111111111111';
      await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
      await db.tx.rpgBattle.update({ data: { id } });
      const selected = await adventure('user', {
        type: 'battle-skill',
        battle: id,
        turn: 0,
        skill: 'strike',
      });
      db.execute.mockResolvedValue({ ok: false, error: message });
      const response = await POST(
        new Request('https://stacklyst.vercel.app/api/mundinho', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', origin: 'https://stacklyst.vercel.app' },
          body: JSON.stringify({
            type: 'battle-code',
            battle: id,
            turn: 0,
            question: selected.battle!.question!.id,
            code: 'mundo.andar_direita(;',
            submit: true,
          }),
        }),
        { params: Promise.resolve({}) }
      );
      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('private, no-store');
      const body = await response.json();
      expect(body.codeRun).toMatchObject({ passed: false, retryable: true });
      expect(body.codeRun.error).toContain(message);
      expect(body.battle).toMatchObject({ hp: 100, enemyHp: 100, turn: 0 });
    }
  );
  it('applies lucky attacks once and does not count them as completed exercises', async () => {
    db.random.mockReturnValue(0);
    await adventure('user', { type: 'battle-start', language: 'TS', creature: 'syntax-slime' });
    const hit = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'strike',
    });
    expect(hit.battle).toMatchObject({ turn: 1, hp: 89, enemyHp: 70, question: null, skill: null });
    expect(hit.battle?.feedback).toContain('sem exercício');
    expect(db.tx.rpgBattle.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ correct: { increment: 0 }, used: [] }),
      })
    );
    const rolls = db.random.mock.calls.length;
    const repeated = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'burst',
    });
    expect(repeated.notice).toContain('sem repetir o golpe');
    expect(repeated.battle).toMatchObject({ turn: 1, hp: 89, enemyHp: 70 });
    expect(db.random).toHaveBeenCalledTimes(rolls);
  });
  it('keeps an assigned exercise and its original skill when selection is repeated', async () => {
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    const selected = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'focus',
    });
    expect(selected.battle?.question).not.toBeNull();
    const rolls = db.random.mock.calls.length;
    const repeated = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'burst',
    });
    expect(repeated.battle?.question?.id).toBe(selected.battle?.question?.id);
    expect(repeated.battle?.skill).toBe('focus');
    expect(db.random).toHaveBeenCalledTimes(rolls);
  });
  it('stores a victory drop and reward exactly once even when the final request is repeated', async () => {
    db.random.mockReturnValue(0);
    await adventure('user', { type: 'battle-start', language: 'TS', creature: 'syntax-slime' });
    for (const turn of [0, 1])
      await adventure('user', { type: 'battle-skill', battle: 'battle', turn, skill: 'burst' });
    const won = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 2,
      skill: 'burst',
    });
    expect(won.battle).toMatchObject({
      status: 'won',
      reward: 15,
      drop: { itemId: 'gear-clover', duplicateCoins: 0 },
    });
    expect(won.inventory).toEqual(['gear-clover']);
    expect(won.coins).toBe(15);
    expect(
      won.transactions.some((item) => item.label === 'Sorteio de equipamento da vitória')
    ).toBe(false);
    expect(db.tx.user.update).toHaveBeenCalledTimes(1);
    const rolls = db.random.mock.calls.length;
    const repeated = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 2,
      skill: 'burst',
    });
    expect(repeated.notice).toContain('já terminou');
    expect(repeated.inventory).toEqual(['gear-clover']);
    expect(repeated.coins).toBe(15);
    expect(db.tx.user.update).toHaveBeenCalledTimes(1);
    expect(db.random).toHaveBeenCalledTimes(rolls);
    expect((await adventure('user')).battle?.drop).toEqual(won.battle?.drop);
  });
  it('converts a duplicate drop into five coins without duplicating the owned item', async () => {
    db.random.mockReturnValue(0);
    await db.tx.rpgPlayer.update({ data: { inventory: ['gear-clover'] } });
    await adventure('user', { type: 'battle-start', language: 'TS', creature: 'syntax-slime' });
    for (const turn of [0, 1, 2])
      await adventure('user', { type: 'battle-skill', battle: 'battle', turn, skill: 'burst' });
    const won = await adventure('user');
    expect(won.battle?.drop).toEqual({ itemId: 'gear-clover', duplicateCoins: 5 });
    expect(won.inventory).toEqual(['gear-clover']);
    expect(won.coins).toBe(20);
  });
  it('persists a failed loot roll so retries cannot find a different result', async () => {
    db.random.mockReturnValue(0);
    await adventure('user', { type: 'battle-start', language: 'TS', creature: 'syntax-slime' });
    for (const turn of [0, 1])
      await adventure('user', { type: 'battle-skill', battle: 'battle', turn, skill: 'burst' });
    db.random.mockReturnValueOnce(0).mockReturnValueOnce(99);
    const won = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 2,
      skill: 'burst',
    });
    expect(won.battle?.drop).toBeNull();
    expect(won.inventory).toEqual([]);
    const rolls = db.random.mock.calls.length;
    await adventure('user', { type: 'battle-skill', battle: 'battle', turn: 2, skill: 'burst' });
    expect(db.random).toHaveBeenCalledTimes(rolls);
  });
  it('equips owned gear by slot, keeps gear fixed in combat and applies its health and protection', async () => {
    await db.tx.rpgPlayer.update({
      data: { inventory: ['gear-clover', 'gear-moon', 'gear-wood', 'gear-heart'] },
    });
    await adventure('user', { type: 'equip', item: 'gear-clover' });
    await adventure('user', { type: 'equip', item: 'gear-moon' });
    // Removing a replaced charm must not remove the new one.
    await adventure('user', { type: 'equip', item: 'gear-clover', remove: true });
    await adventure('user', { type: 'equip', item: 'gear-wood' });
    const equipped = await adventure('user', { type: 'equip', item: 'gear-heart' });
    expect(equipped.equipped).toEqual({
      charm: 'gear-moon',
      armor: 'gear-wood',
      relic: 'gear-heart',
    });
    expect(equipped.combatStats).toEqual({
      maxHp: 110,
      protection: 2,
      luck: 10,
      directChance: 85,
      dropChance: 60,
    });
    const start = await adventure('user', {
      type: 'battle-start',
      language: 'TS',
      creature: 'syntax-slime',
    });
    expect(start.battle).toMatchObject({ hp: 110, maxHp: 110, protection: 2 });
    const locked = await adventure('user', { type: 'equip', item: 'gear-heart', remove: true });
    expect(locked.notice).toContain('depois de encerrar');
    expect(locked.equipped.relic).toBe('gear-heart');
    db.random.mockReturnValue(84); // Equipped luck extends the direct branch beyond the base 50%.
    const hit = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'strike',
    });
    expect(hit.battle).toMatchObject({ hp: 101, enemyHp: 70, turn: 1, question: null });
    await adventure('user', { type: 'battle-flee', battle: 'battle' });
    const removed = await adventure('user', { type: 'equip', item: 'gear-heart', remove: true });
    expect(removed.equipped.relic).toBeUndefined();
    expect(removed.combatStats?.maxHp).toBe(100);
    await expect(adventure('user', { type: 'equip', item: 'gear-star' })).rejects.toThrow(
      'ainda não está'
    );
  });
  it('discards compiler output when another request has already resolved the turn', async () => {
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    const selected = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'strike',
    });
    db.execute.mockImplementationOnce(async () => {
      await db.tx.rpgBattle.update({ data: { turn: 1, questionId: null, hp: 89, enemyHp: 70 } });
      return { ok: true, output: 'andar\ncoletar', executionMs: 1 };
    });
    const result = await adventure('user', {
      type: 'battle-code',
      battle: 'battle',
      turn: 0,
      question: selected.battle!.question!.id,
      code: 'mundo.coletar();',
      submit: true,
    });
    expect(result.notice).toContain('sem repetir o golpe');
    expect(result.battle).toMatchObject({ turn: 1, hp: 89, enemyHp: 70 });
    expect(result.codeRun).toBeUndefined();
  });
  it('persists all expanded outfits while rejecting indices outside the exported wardrobe', async () => {
    for (const outfit of [0, 5, 6, 11]) {
      const avatar = { ...DEFAULT_AVATAR, outfit };
      const parsed = actionSchema.parse({ type: 'avatar', avatar });
      if (outfit === 5) continue; // Existing premium clothing retains its purchase rule.
      await adventure('user', parsed);
      expect(db.tx.rpgPlayer.update).toHaveBeenLastCalledWith({
        where: { userId: 'user' },
        data: { avatar },
      });
    }
    expect(
      actionSchema.safeParse({ type: 'avatar', avatar: { ...DEFAULT_AVATAR, outfit: 12 } }).success
    ).toBe(false);
    expect(
      actionSchema.safeParse({ type: 'avatar', avatar: { ...DEFAULT_AVATAR, outfit: -1 } }).success
    ).toBe(false);
    await expect(
      adventure('user', { type: 'avatar', avatar: { ...DEFAULT_AVATAR, outfit: 5 } })
    ).rejects.toThrow('Adquira este cosmético');
  });
  it('persists either portrait silhouette, accepts legacy avatars and rejects invalid values', async () => {
    for (const gender of ['masculine', 'feminine'] as const) {
      const avatar = { ...DEFAULT_AVATAR, gender };
      const parsed = actionSchema.parse({ type: 'avatar', avatar });
      await adventure('user', parsed);
      expect(db.tx.rpgPlayer.update).toHaveBeenLastCalledWith({
        where: { userId: 'user' },
        data: { avatar },
      });
    }
    expect(actionSchema.safeParse({ type: 'avatar', avatar: DEFAULT_AVATAR }).success).toBe(true);
    expect(
      actionSchema.safeParse({ type: 'avatar', avatar: { ...DEFAULT_AVATAR, gender: 'invalid' } })
        .success
    ).toBe(false);
  });
  it('persists an expanded hair tint while accepting unchanged legacy avatars', async () => {
    const avatar = { ...DEFAULT_AVATAR, hairColor: 3, hairTint: '#2563eb' };
    expect(actionSchema.parse({ type: 'avatar', avatar })).toMatchObject({
      type: 'avatar',
      avatar,
    });
    await adventure('user', { type: 'avatar', avatar });
    expect(db.tx.rpgPlayer.update).toHaveBeenCalledWith({
      where: { userId: 'user' },
      data: { avatar },
    });
    expect(actionSchema.safeParse({ type: 'avatar', avatar: DEFAULT_AVATAR }).success).toBe(true);
    expect(
      actionSchema.safeParse({ type: 'avatar', avatar: { ...avatar, hairTint: 'url(script)' } })
        .success
    ).toBe(false);
  });
  it('persists all three new hairstyles in either silhouette without changing saved color slots', async () => {
    for (const gender of ['masculine', 'feminine'] as const)
      for (const hair of [0, 5, 6, 7, 8]) {
        const avatar = { ...DEFAULT_AVATAR, gender, hair, hairColor: 3, hairTint: '#2563eb' };
        const parsed = actionSchema.parse({ type: 'avatar', avatar });
        await adventure('user', parsed);
        expect(db.tx.rpgPlayer.update).toHaveBeenLastCalledWith({
          where: { userId: 'user' },
          data: { avatar },
        });
        expect((await adventure('user')).avatar).toEqual(avatar);
      }
    for (const hair of [-1, HAIRSTYLES.length])
      expect(
        actionSchema.safeParse({ type: 'avatar', avatar: { ...DEFAULT_AVATAR, hair } }).success
      ).toBe(false);
    expect(
      actionSchema.safeParse({
        type: 'avatar',
        avatar: { ...DEFAULT_AVATAR, hair: 8, hairColor: 6 },
      }).success
    ).toBe(false);
  });
  it('asks the player to choose an attack before assigning a code challenge', async () => {
    const result = await adventure('user', {
      type: 'battle-start',
      language: 'TS',
      creature: 'syntax-slime',
    });
    expect(result.battle?.question).toBeNull();
    expect(result.battle?.language).toBe('TS');
    const selected = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'focus',
    });
    expect(selected.battle?.skill).toBe('focus');
    expect(selected.battle?.feedback).toContain('Resolva o exercício');
    expect(selected.battle?.question?.code?.starter).toBeTruthy();
    expect(codeChallenges('TS').map((q) => q.id)).toContain(selected.battle?.question?.id);
  });
  it('previews real execution without damage, then consumes the turn only on submit', async () => {
    await adventure('user', {
      type: 'battle-start',
      language: 'JS',
      creature: 'syntax-slime',
    });
    // A persisted legacy crystal challenge remains playable after deployment.
    await db.tx.rpgBattle.update({
      data: { skill: 'strike', questionId: codeChallenge('JS')!.id },
    });
    db.tx.rpgBattle.update.mockClear();
    const start = await adventure('user');
    const input = {
      type: 'battle-code' as const,
      battle: 'battle',
      turn: 0,
      question: start.battle!.question!.id,
      code: 'mundo.coletar();',
      submit: false,
    };
    const preview = await adventure('user', input);
    expect(preview.codeRun?.passed).toBe(true);
    expect(preview.battle?.turn).toBe(0);
    expect(preview.battle?.enemyHp).toBe(100);
    expect(db.tx.rpgBattle.update).not.toHaveBeenCalled();
    const submitted = await adventure('user', { ...input, submit: true });
    expect(submitted.battle?.enemyHp).toBe(70);
    expect(submitted.battle?.turn).toBe(1);
    expect(db.execute).toHaveBeenCalledTimes(2);
    expect(db.tx.user.update).not.toHaveBeenCalled();
  });
  it('rejects choice answers for code challenges and keeps provider failures retryable', async () => {
    await adventure('user', {
      type: 'battle-start',
      language: 'PYTHON',
      creature: 'syntax-slime',
    });
    const start = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'strike',
    });
    db.tx.rpgBattle.update.mockClear();
    await expect(
      adventure('user', {
        type: 'battle-answer',
        battle: 'battle',
        turn: 0,
        question: start.battle!.question!.id,
        answer: 0,
      })
    ).rejects.toThrow('com código');
    db.execute.mockResolvedValue({ ok: false, error: 'Serviço indisponível' });
    const failed = await adventure('user', {
      type: 'battle-code',
      battle: 'battle',
      turn: 0,
      question: start.battle!.question!.id,
      code: 'print(1)',
      submit: true,
    });
    expect(failed.codeRun?.retryable).toBe(true);
    expect(failed.codeRun?.error).toContain('Serviço indisponível');
    expect(failed.battle?.turn).toBe(0);
    expect(db.tx.rpgBattle.update).not.toHaveBeenCalled();
  });
  it('avoids scenarios already used this battle and in recent battles', async () => {
    const challenges = codeChallenges('JS');
    expect(challenges.length).toBeGreaterThanOrEqual(20);
    db.tx.rpgBattle.findMany.mockImplementation(async ({ where }: any) =>
      where.id ? [{ questionId: null, used: challenges.slice(0, -1).map((q) => q.id) }] : []
    );
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    const first = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 0,
      skill: 'strike',
    });
    expect(first.battle?.question?.id).toBe(challenges.at(-1)!.id);
    await adventure('user', {
      type: 'battle-code',
      battle: 'battle',
      turn: 0,
      question: first.battle!.question!.id,
      code: 'mundo.andar_direita();',
      submit: true,
    });
    const second = await adventure('user', {
      type: 'battle-skill',
      battle: 'battle',
      turn: 1,
      skill: 'strike',
    });
    expect(second.battle?.question?.id).not.toBe(first.battle?.question?.id);
  });
  it.each([
    ['blue-slime', 2],
    ['null-ghost', 3],
  ] as const)(
    'assigns the learning tier of %s on the server and refuses plain sequences',
    async (creature, level) => {
      db.tx.user.findUniqueOrThrow.mockResolvedValue({ username: 'user', total_xp: 2000 });
      await adventure('user', { type: 'battle-start', language: 'TS', creature });
      const selected = await adventure('user', {
        type: 'battle-skill',
        battle: 'battle',
        turn: 0,
        skill: 'strike',
      });
      expect(selected.battle?.question?.id).toMatch(new RegExp(`^code-l${level}-`));
      expect(selected.battle?.question?.code?.requiredStructures).toEqual(
        level === 2 ? ['conditional'] : ['conditional', 'loop']
      );
      const result = await adventure('user', {
        type: 'battle-code',
        battle: 'battle',
        turn: 0,
        question: selected.battle!.question!.id,
        code: 'mundo.andar_direita();',
        submit: false,
      });
      expect(result.codeRun?.passed).toBe(false);
      expect(result.codeRun?.error).toContain('if e else');
      expect(db.execute).not.toHaveBeenCalled();
      expect(result.battle?.turn).toBe(0);
      expect(result.battle?.hp).toBe(100);
    }
  );
  it('keeps active legacy multiple-choice turns answerable', async () => {
    const question = QUESTIONS.find((q) => q.language === 'JS')!;
    await adventure('user', { type: 'battle-start', language: 'JS', creature: 'syntax-slime' });
    await db.tx.rpgBattle.update({ data: { skill: 'strike', questionId: question.id } });
    const active = await adventure('user');
    expect(active.battle?.question?.id).toBe(question.id);
    const result = await adventure('user', {
      type: 'battle-answer',
      battle: 'battle',
      turn: 0,
      question: question.id,
      answer: question.answer,
    });
    expect(result.battle?.turn).toBe(1);
    expect(result.battle?.enemyHp).toBe(70);
  });
  it.each(['HTML', 'CSS'] as const)(
    'executes %s battle challenges as JavaScript',
    async (language) => {
      await adventure('user', { type: 'battle-start', language, creature: 'syntax-slime' });
      const selected = await adventure('user', {
        type: 'battle-skill',
        battle: 'battle',
        turn: 0,
        skill: 'strike',
      });
      expect(selected.battle?.question?.code).toBeTruthy();
      await adventure('user', {
        type: 'battle-code',
        battle: 'battle',
        turn: 0,
        question: selected.battle!.question!.id,
        code: 'mundo.andar_direita();',
        submit: false,
      });
      expect(db.execute).toHaveBeenCalledWith(expect.any(String), 'JS');
    }
  );
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
