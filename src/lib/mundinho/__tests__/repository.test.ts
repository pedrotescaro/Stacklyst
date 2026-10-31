import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_AVATAR } from '../types';
const db = vi.hoisted(() => ({ tx: {} as Record<string, any>, execute: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: async (fn: (tx: unknown) => unknown) => fn(db.tx),
    rpgBattle: { findFirst: (...args: any[]) => db.tx.rpgBattle.findFirst(...args) },
  },
}));
vi.mock('@/lib/code-execution/server', () => ({ executeCode: db.execute }));
vi.mock('@/lib/learning/catalog', () => ({ LEARNING_LESSONS: new Map() }));
import { actionSchema, adventure } from '../repository';
import { codeChallenge, codeChallenges } from '../codeChallenges';
import { QUESTIONS } from '../questions';
beforeEach(() => {
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
      count: vi.fn(async () => 0),
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
          questionId: null,
          used: [],
          ...data,
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
    expect(selected.battle?.feedback).toBe('Resolva o desafio de código e confirme seu ataque.');
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
    await expect(
      adventure('user', {
        type: 'battle-code',
        battle: 'battle',
        turn: 0,
        question: start.battle!.question!.id,
        code: 'print(1)',
        submit: true,
      })
    ).rejects.toThrow('Serviço indisponível');
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
