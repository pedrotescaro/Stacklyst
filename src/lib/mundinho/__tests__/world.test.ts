import { describe, expect, it } from 'vitest';
import { movementDirection, canWalk, movePlayer, WORLD, WORLD_OBJECTS, COLLISIONS } from '../world';
import { CREATURES } from '../types';
describe('Exploração da floresta', () => {
  it('faces the dominant touch axis even with horizontal finger drift', () => {
    expect(movementDirection(0.06, -0.9, 'right')).toBe('up');
    expect(movementDirection(-0.12, 0.8, 'left')).toBe('down');
    expect(movementDirection(0.9, -0.1, 'up')).toBe('right');
    expect(movementDirection(-0.8, 0.2, 'down')).toBe('left');
    expect(movementDirection(0, 0, 'up')).toBe('up');
  });
  it('keeps every encounter and interactive object reachable from spawn', () => {
    const queue = [WORLD.spawn],
      visited = new Set<string>();
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      for (const [dx, dy] of [
        [8, 0],
        [-8, 0],
        [0, 8],
        [0, -8],
      ]) {
        const x = p.x + dx,
          y = p.y + dy,
          key = `${x},${y}`;
        if (!visited.has(key) && canWalk(x, y)) {
          visited.add(key);
          queue.push({ x, y });
        }
      }
    }
    for (const target of [...CREATURES, ...WORLD_OBJECTS])
      expect(
        queue.some((p) => Math.hypot(p.x - target.x, p.y - target.y) < 40),
        target.id
      ).toBe(true);
    expect(visited.size).toBeGreaterThan(6000);
  });
  it('blocks water and buildings while allowing movement through a clearing', () => {
    expect(canWalk(875, 574)).toBe(false);
    expect(canWalk(680, 150)).toBe(false);
    expect(canWalk(WORLD.spawn.x, WORLD.spawn.y)).toBe(true);
    expect(movePlayer(485, 390, 4, 0)).toEqual({ x: 489, y: 390 });
    expect(COLLISIONS.length).toBeGreaterThan(20);
  });
});
