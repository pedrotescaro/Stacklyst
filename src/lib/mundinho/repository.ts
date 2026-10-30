import { randomInt } from 'node:crypto';
import { Prisma, type RpgBattle } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { LEARNING_LESSONS } from '@/lib/learning/catalog';
import {
  DEFAULT_AVATAR,
  ITEMS,
  LANGUAGES,
  CREATURES,
  levelProgress,
  type AdventureState,
  type Avatar,
  type BattleLanguage,
} from './types';
import { canChallengeCreature, checkinStatus, dayKey, resolveTurn, SKILLS } from './rules';
import { QUESTIONS, publicQuestion } from './questions';
import { challengeProgram, codeChallenge, evaluateTrace } from './codeChallenges';
import { executeCode } from '@/lib/code-execution/server';
import type { CodeRun } from './types';

const avatarSchema = z.object({
  gender: z.enum(['masculine', 'feminine']).optional(),
  skin: z.number().int().min(0).max(8),
  eyes: z.number().int().min(0).max(4),
  hair: z.number().int().min(0).max(5),
  hairColor: z.number().int().min(0).max(5),
  hairTint: z
    .string()
    .regex(/^#[\da-f]{6}$/i)
    .optional(),
  outfit: z.number().int().min(0).max(5),
  accessory: z.number().int().min(0).max(5),
});
export const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('checkin') }),
  z.object({ type: z.literal('chest') }),
  z.object({ type: z.literal('avatar'), avatar: avatarSchema }),
  z.object({ type: z.literal('buy'), item: z.string().max(60) }),
  z.object({ type: z.literal('equip'), item: z.string().max(60), remove: z.boolean().optional() }),
  z.object({ type: z.literal('mission'), mission: z.enum(['activity', 'answers', 'battle']) }),
  z.object({
    type: z.literal('battle-start'),
    language: z.enum(LANGUAGES),
    creature: z.string().max(60),
  }),
  z.object({
    type: z.literal('battle-skill'),
    battle: z.string().uuid(),
    turn: z.number().int().min(0),
    skill: z.enum(['strike', 'focus', 'burst']),
  }),
  z.object({
    type: z.literal('battle-answer'),
    battle: z.string().uuid(),
    turn: z.number().int().min(0),
    question: z.string().max(60),
    answer: z.number().int().min(0).max(3),
  }),
  z.object({ type: z.literal('battle-flee'), battle: z.string().uuid() }),
  z.object({
    type: z.literal('battle-code'),
    battle: z.string().uuid(),
    turn: z.number().int().min(0),
    question: z.string().max(60),
    code: z.string().min(1).max(8000),
    submit: z.boolean(),
  }),
]);
type Action = z.infer<typeof actionSchema>;
type Tx = Prisma.TransactionClient;
const authoredIds = [...LEARNING_LESSONS.values()].flatMap((lesson) =>
  lesson.steps.filter((s) => s.type !== 'concept_explanation').map((s) => s.id)
);
function fail(message: string): never {
  throw new ValidationError('MUNDINHO_RULE', message);
}
function battleView(b: RpgBattle | null): AdventureState['battle'] {
  if (!b) return null;
  const q = QUESTIONS.find((q) => q.id === b.questionId);
  const challenge = codeChallenge(b.language as BattleLanguage);
  return {
    id: b.id,
    language: b.language as BattleLanguage,
    creature: b.creature,
    hp: b.hp,
    enemyHp: b.enemyHp,
    turn: b.turn,
    status: b.status as NonNullable<AdventureState['battle']>['status'],
    question:
      b.status === 'active'
        ? q
          ? publicQuestion(q)
          : challenge?.id === b.questionId
            ? challenge
            : null
        : null,
    feedback: b.feedback,
    reward: b.reward,
    skill: b.skill,
  };
}
async function credit(tx: Tx, userId: string, key: string, label: string, amount: number) {
  if (await tx.rpgTransaction.findUnique({ where: { userId_key: { userId, key } } })) return false;
  await tx.rpgTransaction.create({ data: { userId, key, label, amount } });
  await tx.rpgPlayer.update({ where: { userId }, data: { coins: { increment: amount } } });
  return true;
}
async function missions(tx: Tx, userId: string, now: Date) {
  const day = dayKey(now);
  const start = new Date(`${day}T00:00:00-03:00`);
  const [quiz, exercises, battles, claimed] = await Promise.all([
    tx.quizAttempt.count({
      where: { user_id: userId, is_correct: true, created_at: { gte: start } },
    }),
    tx.exerciseSubmission.count({
      where: { user_id: userId, first_completion: true, created_at: { gte: start } },
    }),
    tx.rpgBattle.findMany({
      where: { userId, updatedAt: { gte: start } },
      select: { status: true, correct: true },
    }),
    tx.rpgTransaction.findMany({
      where: { userId, key: { startsWith: `mission:${day}:` } },
      select: { key: true },
    }),
  ]);
  return [
    {
      id: 'activity',
      name: 'Concluir uma atividade de aprendizagem',
      progress: quiz + exercises,
      target: 1,
      reward: 20,
    },
    {
      id: 'answers',
      name: 'Acertar cinco questões',
      progress: quiz + battles.reduce((sum, b) => sum + b.correct, 0),
      target: 5,
      reward: 15,
    },
    {
      id: 'battle',
      name: 'Vencer uma batalha de conceitos',
      progress: battles.filter((b) => b.status === 'won').length,
      target: 1,
      reward: 20,
    },
  ].map((m) => ({
    ...m,
    progress: Math.min(m.target, m.progress),
    claimed: claimed.some((c) => c.key === `mission:${day}:${m.id}`),
  }));
}

/** All mutations for one player serialize on a database row, across servers/devices. */
export async function adventure(userId: string, action?: Action): Promise<AdventureState> {
  let codeRun: CodeRun | undefined;
  // Execute outside the transaction: an external compiler must not hold the player row lock.
  if (action?.type === 'battle-code') {
    const battle = await prisma.rpgBattle.findFirst({ where: { id: action.battle, userId } });
    if (
      !battle ||
      battle.status !== 'active' ||
      battle.turn !== action.turn ||
      battle.questionId !== action.question
    )
      fail('Este desafio não está ativo. Atualize a batalha.');
    const challenge = codeChallenge(battle.language as BattleLanguage);
    if (!challenge || challenge.id !== battle.questionId)
      fail('Este turno não é um desafio de código.');
    const execution = await executeCode(
      challengeProgram(battle.language as BattleLanguage, action.code),
      battle.language
    );
    if (!execution.ok)
      fail(execution.error ?? 'Não foi possível executar o código. Tente novamente.');
    codeRun = evaluateTrace(execution.output);
  }
  return prisma.$transaction(
    async (tx) => {
      // The database clock is authoritative; clients never supply dates, prices, damage or rewards.
      const [clock] = await tx.$queryRaw<{ now: Date }[]>`SELECT CURRENT_TIMESTAMP AS now`;
      const now = clock.now;
      await tx.rpgPlayer.upsert({
        where: { userId },
        create: { userId, avatar: DEFAULT_AVATAR },
        update: {},
      });
      await tx.$queryRaw`SELECT "userId" FROM rpg_players WHERE "userId" = ${userId} FOR UPDATE`;
      let player = await tx.rpgPlayer.findUniqueOrThrow({ where: { userId } });
      const inventory = player.inventory as string[];
      const equipped = player.equipped as Record<string, string>;
      const [exercises, quizzes] = await Promise.all([
        tx.exerciseSubmission.count({ where: { user_id: userId, first_completion: true } }),
        tx.quizAttempt.count({
          where: { user_id: userId, is_correct: true, quiz_id: { in: authoredIds } },
        }),
      ]);
      const sourceCoins = (exercises + quizzes) * 5;
      if (sourceCoins > player.sourceCoins) {
        await credit(
          tx,
          userId,
          `learning:${sourceCoins}`,
          player.sourceCoins === 0
            ? 'Moedas das atividades concluídas'
            : 'Novas atividades concluídas',
          sourceCoins - player.sourceCoins
        );
        player = await tx.rpgPlayer.update({ where: { userId }, data: { sourceCoins } });
      }
      const checkin = checkinStatus(player.lastCheckin, player.checkinStreak, now);
      if (action?.type === 'checkin' && !checkin.claimed) {
        await credit(
          tx,
          userId,
          `checkin:${checkin.day}`,
          `Check-in · dia ${checkin.streak + 1}`,
          checkin.reward
        );
        await tx.rpgPlayer.update({
          where: { userId },
          data: { lastCheckin: checkin.day, checkinStreak: checkin.streak + 1 },
        });
      }
      if (action?.type === 'chest')
        await credit(tx, userId, 'chest:forest:first', 'Baú da clareira', 10);
      if (action?.type === 'buy') {
        const item = ITEMS.find((i) => i.id === action.item);
        if (!item) fail('Este item não está disponível.');
        if (!inventory.includes(item.id)) {
          if (player.coins < item.price)
            fail('Moedas insuficientes. Complete atividades e faça check-in para ganhar mais.');
          await credit(tx, userId, `purchase:${item.id}`, item.name, -item.price);
          await tx.rpgPlayer.update({
            where: { userId },
            data: { inventory: [...inventory, item.id] },
          });
        }
      }
      if (action?.type === 'avatar') {
        for (const item of ITEMS.filter((i) =>
          ['outfit', 'hair', 'accessory'].includes(i.category)
        )) {
          if (
            action.avatar[item.category as keyof Avatar] === item.value &&
            !inventory.includes(item.id)
          )
            fail('Adquira este cosmético na loja antes de equipar.');
        }
        await tx.rpgPlayer.update({ where: { userId }, data: { avatar: action.avatar } });
      }
      if (action?.type === 'equip') {
        const item = ITEMS.find((i) => i.id === action.item);
        if (!item || !inventory.includes(item.id))
          fail('Este item ainda não está no seu inventário.');
        const next = { ...equipped };
        if (action.remove) delete next[item.category];
        else next[item.category] = item.id;
        const avatar = { ...DEFAULT_AVATAR, ...(player.avatar as Partial<Avatar>) };
        if (['outfit', 'hair', 'accessory'].includes(item.category))
          avatar[item.category as 'outfit' | 'hair' | 'accessory'] = action.remove ? 0 : item.value;
        await tx.rpgPlayer.update({ where: { userId }, data: { equipped: next, avatar } });
      }
      if (action?.type === 'mission') {
        const m = (await missions(tx, userId, now)).find((m) => m.id === action.mission)!;
        if (m.progress < m.target) fail('Conclua a missão antes de resgatar.');
        if (await credit(tx, userId, `mission:${checkin.day}:${m.id}`, m.name, m.reward))
          await tx.user.update({ where: { id: userId }, data: { total_xp: { increment: 10 } } });
      }
      if (action?.type === 'battle-start') {
        const creature = CREATURES.find((c) => c.id === action.creature);
        if (!creature) fail('Criatura desconhecida.');
        const active = await tx.rpgBattle.findFirst({ where: { userId, status: 'active' } });
        if (!active) {
          const user = await tx.user.findUniqueOrThrow({
            where: { id: userId },
            select: { total_xp: true },
          });
          if (!canChallengeCreature(levelProgress(user.total_xp).level, creature.level))
            fail(
              `Esta criatura requer nível ${creature.level}. Continue aprendendo para enfrentá-la.`
            );
          const completed = await tx.rpgBattle.count({
            where: { userId, status: { in: ['won', 'lost'] } },
          });
          const challenge = completed % 2 === 1 ? codeChallenge(action.language) : null;
          await tx.rpgBattle.create({
            data: {
              userId,
              language: action.language,
              creature: action.creature,
              ...(challenge ? { questionId: challenge.id, skill: 'strike' } : {}),
              feedback: challenge
                ? 'Desafio de código! Colete os cristais e confirme seu ataque.'
                : 'Escolha uma habilidade. Seu conhecimento dá força ao ataque.',
            },
          });
        }
      }
      if (
        action &&
        ['battle-skill', 'battle-answer', 'battle-code', 'battle-flee'].includes(action.type)
      ) {
        const a = action as Extract<Action, { battle: string }>;
        const b = await tx.rpgBattle.findFirst({ where: { id: a.battle, userId } });
        if (!b || (b.status !== 'active' && !(a.type === 'battle-flee' && b.status === 'fled')))
          fail('Esta batalha terminou. Atualize para ver o resultado.');
        if (a.type === 'battle-flee') {
          if (b.status === 'active')
            await tx.rpgBattle.update({
              where: { id: b.id },
              data: {
                status: 'fled',
                questionId: null,
                feedback: 'Você voltou à clareira. Seu progresso de aprendizagem está salvo.',
              },
            });
        } else {
          if (a.turn !== b.turn) fail('Este turno já foi respondido. Atualize a batalha.');
          if (a.type === 'battle-skill') {
            if (!b.questionId) {
              const used = b.used as string[];
              const pool = QUESTIONS.filter(
                (q) => q.language === b.language && !used.includes(q.id)
              );
              const available = pool.length
                ? pool
                : QUESTIONS.filter((q) => q.language === b.language);
              const q = available[randomInt(available.length)];
              await tx.rpgBattle.update({
                where: { id: b.id },
                data: { skill: a.skill, questionId: q.id },
              });
            }
          } else {
            if (!b.questionId || b.questionId !== a.question || !b.skill)
              fail('Selecione uma habilidade antes de responder.');
            const q = QUESTIONS.find((q) => q.id === b.questionId);
            const challenge = codeChallenge(b.language as BattleLanguage);
            if (a.type === 'battle-answer' && (!q || a.question !== q.id))
              fail('Responda este desafio com código.');
            if (
              a.type === 'battle-code' &&
              (!challenge || challenge.id !== b.questionId || !codeRun)
            )
              fail('Este desafio de código não está ativo.');
            // A preview never consumes a turn or grants a reward.
            if (a.type !== 'battle-code' || a.submit) {
              const correct = a.type === 'battle-code' ? codeRun!.passed : q!.answer === a.answer;
              const creature = CREATURES.find((c) => c.id === b.creature)!;
              const result = resolveTurn(b.hp, b.enemyHp, correct, b.skill, creature.level);
              if (b.turn >= 11 && result.status === 'active') {
                result.status = 'lost';
                result.hp = 0;
              }
              let reward = 0;
              if (result.status === 'won') {
                const rewarded = await tx.rpgTransaction.count({
                  where: { userId, key: { startsWith: `battle:${checkin.day}:` } },
                });
                if (rewarded < 3) {
                  reward = 15;
                  await credit(
                    tx,
                    userId,
                    `battle:${checkin.day}:${b.id}`,
                    `Vitória · ${creature.name}`,
                    reward
                  );
                  await tx.user.update({
                    where: { id: userId },
                    data: { total_xp: { increment: 30 } },
                  });
                }
              }
              const move = SKILLS.find((s) => s.id === b.skill)!;
              await tx.rpgBattle.update({
                where: { id: b.id },
                data: {
                  ...result,
                  reward,
                  turn: b.turn + 1,
                  correct: { increment: correct ? 1 : 0 },
                  questionId: null,
                  skill: null,
                  used: [...(b.used as string[]), b.questionId],
                  feedback: `${correct ? `Correto! ${move.name} causou ${move.damage} de dano.` : 'Ainda não. O inimigo aproveitou a abertura.'} ${a.type === 'battle-code' ? (correct ? 'Seu laço coletou todos os cristais.' : (codeRun!.error ?? 'Revise a sequência dos comandos.')) : q!.explanation}`,
                },
              });
            }
          }
        }
      }
      const [current, user, transactions, battle, dailyMissions] = await Promise.all([
        tx.rpgPlayer.findUniqueOrThrow({ where: { userId } }),
        tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { username: true, total_xp: true },
        }),
        tx.rpgTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 100,
        }),
        tx.rpgBattle.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        missions(tx, userId, now),
      ]);
      return {
        ...(codeRun ? { codeRun } : {}),
        username: user.username,
        coins: current.coins,
        totalXp: user.total_xp,
        avatar: { ...DEFAULT_AVATAR, ...(current.avatar as Partial<Avatar>) },
        inventory: current.inventory as string[],
        equipped: current.equipped as Record<string, string>,
        checkin: checkinStatus(current.lastCheckin, current.checkinStreak, now),
        transactions: transactions.map((t) => ({
          id: t.id,
          label: t.label,
          amount: t.amount,
          createdAt: t.createdAt.toISOString(),
        })),
        battle: battleView(battle),
        missions: dailyMissions,
      };
    },
    { maxWait: 10000, timeout: 20000 }
  );
}
