import type { ArenaMatch, ArenaPosition, ArenaSkill } from './arena-types';
import { directAttack } from './equipment';
import { SKILLS } from './rules';

export const ARENA = {
  width: 768,
  height: 512,
  spawn: { x: 320, y: 340 },
  exit: { x: 384, y: 440 },
};
export const ARENA_TURN_MS = 120_000;
export const ARENA_ONLINE_MS = 30_000;
export const ARENA_INVITE_MS = 300_000;

export function arenaCanWalk(x: number, y: number) {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    (((x - 384) / 280) ** 2 + ((y - 296) / 144) ** 2 <= 1 ||
      (x >= 360 && x <= 408 && y >= 420 && y <= 450))
  );
}
export function arenaMove(position: ArenaPosition, dx: number, dy: number): ArenaPosition {
  const x = position.x + dx,
    y = position.y + dy;
  return {
    ...position,
    x: arenaCanWalk(x, position.y) ? x : position.x,
    y: arenaCanWalk(position.x, y) ? y : position.y,
  };
}
export function validArenaPosition(previous: ArenaPosition, next: ArenaPosition, elapsed: number) {
  // Network jitter gets a small allowance; a client cannot jump across the room.
  const distance = Math.hypot(next.x - previous.x, next.y - previous.y);
  return (
    arenaCanWalk(next.x, next.y) &&
    distance <= Math.min(600, (Math.max(0, elapsed) / 1000) * 180 + 48)
  );
}
export function arenaOpponent(match: ArenaMatch, userId: string) {
  return Object.keys(match.hp).find((id) => id !== userId)!;
}
export function advanceArenaTurn(
  match: ArenaMatch,
  correct: boolean,
  now: Date,
  message: string
): ArenaMatch {
  const opponent = arenaOpponent(match, match.actorId);
  const move = SKILLS.find((s) => s.id === match.skill) ?? SKILLS[0];
  const damage = arenaAttackDamage(match);
  const hp = {
    ...match.hp,
    [opponent]: Math.max(0, match.hp[opponent] - (correct ? damage : 0)),
    [match.actorId]: Math.max(
      0,
      Math.min(
        match.stats?.[match.actorId]?.maxHp ?? 100,
        match.hp[match.actorId] + (correct ? move.heal : 0)
      )
    ),
  };
  const finished = hp[opponent] === 0 || hp[match.actorId] === 0 || match.turn >= 19;
  const ids = Object.keys(hp);
  const winnerId = hp[ids[0]] === hp[ids[1]] ? null : hp[ids[0]] > hp[ids[1]] ? ids[0] : ids[1];
  return {
    ...match,
    hp,
    status: finished ? 'finished' : 'active',
    winnerId: finished ? winnerId : null,
    actorId: opponent,
    turn: match.turn + 1,
    exerciseTurn: -1,
    skill: undefined,
    deadline: new Date(now.getTime() + ARENA_TURN_MS).toISOString(),
    log: [...match.log, message].slice(-8),
  };
}
export function arenaNeedsExercise(match: ArenaMatch) {
  return !match.stats || match.exerciseTurn === match.turn;
}
export function arenaAttackDamage(match: ArenaMatch) {
  const move = SKILLS.find((s) => s.id === match.skill) ?? SKILLS[0];
  return Math.max(
    1,
    move.damage - (match.stats?.[arenaOpponent(match, match.actorId)]?.protection ?? 0)
  );
}
export function chooseArenaAttack(
  match: ArenaMatch,
  roll: number,
  now: Date,
  skill: ArenaSkill = 'strike'
): ArenaMatch {
  if (arenaNeedsExercise(match)) return match;
  match = { ...match, skill };
  const stats = match.stats![match.actorId];
  if (!directAttack(stats, roll))
    return {
      ...match,
      exerciseTurn: match.turn,
      log: [...match.log, 'Resolva o exercício para confirmar este golpe.'].slice(-8),
    };
  const damage = arenaAttackDamage(match);
  const move = SKILLS.find((s) => s.id === skill)!;
  return advanceArenaTurn(
    match,
    true,
    now,
    `${move.name}: ${stats.directChance === 100 ? 'Caça-bugs / sorte máxima!' : 'Golpe direto!'} ${damage} de dano no adversário.${move.heal > 0 ? ' Recupera até 20 de vida.' : move.heal < 0 ? ' Recebe 8 de desgaste.' : ''}`
  );
}
