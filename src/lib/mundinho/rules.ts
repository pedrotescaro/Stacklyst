import { CHECKIN_REWARDS } from './types';
export function canChallengeCreature(playerLevel: number, creatureLevel: number) {
  return playerLevel >= creatureLevel;
}
export function creatureStats(level: number) {
  return {
    level,
    maxHp: 100 + Math.max(0, level - 3) * 20,
    turnLimit: Math.max(12, level * 2 + 4),
  };
}
export function dayKey(now: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function checkinStatus(lastDay: string | null, streak: number, now: Date) {
  const day = dayKey(now);
  const yesterday = dayKey(new Date(now.getTime() - 86400000));
  const claimed = lastDay === day;
  const effective = claimed || lastDay === yesterday ? streak : 0;
  const cycle = claimed ? (Math.max(1, effective) - 1) % 7 : effective % 7;
  return { day, claimed, streak: effective, cycle, reward: CHECKIN_REWARDS[cycle] };
}
export const SKILLS = [
  { id: 'strike', name: 'Aplicar conceito', description: '30 de dano', damage: 30, heal: 0 },
  {
    id: 'focus',
    name: 'Depurar',
    description: '18 de dano · recupera 20 de vida',
    damage: 18,
    heal: 20,
  },
  {
    id: 'burst',
    name: 'Refatorar',
    description: '45 de dano · recebe 8 de desgaste',
    damage: 45,
    heal: -8,
  },
] as const;
/**
 * Each skill is guarded by a different kind of challenge when the blow is not
 * direct: a concept quiz, finding a bug, or a code exercise.
 */
export const SKILL_CHALLENGE: Record<string, 'concept' | 'bug' | 'code'> = {
  strike: 'concept',
  focus: 'bug',
  burst: 'code',
};
/**
 * What the creature deals back at the end of a turn: a full hit after a missed
 * blow, a lighter one otherwise (a landed blow or drinking a potion).
 */
export function enemyCounterDamage(level: number, protection: number, missed = false) {
  return Math.max(1, (missed ? 18 : 9) + level * 2 - protection);
}
export function resolveTurn(
  hp: number,
  enemyHp: number,
  correct: boolean,
  skill: string,
  level: number,
  equipment: { maxHp: number; protection: number } = { maxHp: 100, protection: 0 },
  /** Extra damage on a landed blow, e.g. from a strength potion. */
  bonusDamage = 0
) {
  const move = SKILLS.find((s) => s.id === skill) ?? SKILLS[0];
  const nextEnemy = Math.max(0, enemyHp - (correct ? move.damage + bonusDamage : 0));
  const nextHp = Math.max(
    0,
    Math.min(equipment.maxHp, hp + (correct ? move.heal : 0)) -
      (nextEnemy > 0 ? enemyCounterDamage(level, equipment.protection, !correct) : 0)
  );
  return {
    hp: nextHp,
    enemyHp: nextEnemy,
    status:
      nextEnemy === 0 ? ('won' as const) : nextHp === 0 ? ('lost' as const) : ('active' as const),
  };
}
