import { CHECKIN_REWARDS } from './types';
export function canChallengeCreature(playerLevel: number, creatureLevel: number) {
  return playerLevel >= creatureLevel;
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
export function resolveTurn(
  hp: number,
  enemyHp: number,
  correct: boolean,
  skill: string,
  level: number
) {
  const move = SKILLS.find((s) => s.id === skill) ?? SKILLS[0];
  const nextEnemy = Math.max(0, enemyHp - (correct ? move.damage : 0));
  const nextHp = Math.max(
    0,
    Math.min(100, hp + (correct ? move.heal : 0)) -
      (nextEnemy > 0 ? (correct ? 9 : 18) + level * 2 : 0)
  );
  return {
    hp: nextHp,
    enemyHp: nextEnemy,
    status:
      nextEnemy === 0 ? ('won' as const) : nextHp === 0 ? ('lost' as const) : ('active' as const),
  };
}
