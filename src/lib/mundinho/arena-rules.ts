import type { ArenaMatch, ArenaPosition } from './arena-types';

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
  const hp = { ...match.hp, [opponent]: Math.max(0, match.hp[opponent] - (correct ? 30 : 0)) };
  const finished = hp[opponent] === 0 || match.turn >= 19;
  const ids = Object.keys(hp);
  const winnerId = hp[ids[0]] === hp[ids[1]] ? null : hp[ids[0]] > hp[ids[1]] ? ids[0] : ids[1];
  return {
    ...match,
    hp,
    status: finished ? 'finished' : 'active',
    winnerId: finished ? winnerId : null,
    actorId: opponent,
    turn: match.turn + 1,
    deadline: new Date(now.getTime() + ARENA_TURN_MS).toISOString(),
    log: [...match.log, message].slice(-8),
  };
}
