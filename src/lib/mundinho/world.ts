import geometry from './geometry.json';
export const WORLD = { width: geometry.width, height: geometry.height, spawn: geometry.spawn };
export const COLLISIONS = geometry.obstacles;
export const SCENERY = geometry.scenery;
export const worldDepth = (feetY: number) => Math.round(feetY * 10);
export function movementDirection(dx: number, dy: number, previous: string) {
  if (Math.hypot(dx, dy) < 0.08) return previous;
  return Math.abs(dy) >= Math.abs(dx) ? (dy > 0 ? 'down' : 'up') : dx > 0 ? 'right' : 'left';
}
export function canWalk(x: number, y: number) {
  return (
    x >= 28 &&
    y >= 24 &&
    x <= WORLD.width - 20 &&
    y <= WORLD.height - 24 &&
    !COLLISIONS.some((r) => x + 8 > r.x && x - 8 < r.x + r.w && y + 6 > r.y && y - 4 < r.y + r.h)
  );
}

export function movePlayer(x: number, y: number, dx: number, dy: number) {
  const nx = canWalk(x + dx, y) ? x + dx : x;
  const ny = canWalk(nx, y + dy) ? y + dy : y;
  return { x: nx, y: ny };
}

export const WORLD_OBJECTS = [
  { id: 'guide', name: 'Ada (Guia)', x: 680, y: 230 },
  { id: 'sign', name: 'Placa de dicas', x: 470, y: 330 },
  { id: 'chest', name: 'Baú da clareira', x: 350, y: 405 },
];
