import { describe, expect, it } from 'vitest';
import {
  movementDirection,
  canWalk,
  movePlayer,
  walkablePosition,
  SCENERY,
  worldDepth,
  WORLD,
  WORLD_OBJECTS,
  COLLISIONS,
} from '../world';
import { CREATURES } from '../types';
describe('Exploração da floresta', () => {
  it('places solid scenery between characters behind and in front of its feet', () => {
    for (const object of SCENERY.objects) {
      expect(worldDepth(object.depth - 1)).toBeLessThan(worldDepth(object.depth));
      expect(worldDepth(object.depth + 1)).toBeGreaterThan(worldDepth(object.depth));
      expect(object.frame).toBeLessThan(SCENERY.columns * SCENERY.rows);
    }
    expect(SCENERY.objects.find((object) => object.id === 'cabin')?.depth).toBe(200);
  });
  it('allows walking behind crowns and the roof while blocking trunks and cabin walls', () => {
    // Tree 82's painted root is at (730, 552), not ten pixels to its right.
    expect(canWalk(730, 520)).toBe(true);
    expect(canWalk(730, 550)).toBe(false);
    expect(canWalk(712, 550)).toBe(true);
    expect(canWalk(748, 550)).toBe(true);
    expect(canWalk(730, 558)).toBe(true);
    expect(movePlayer(730, 558, 0, -5)).toEqual({ x: 730, y: 558 });

    // The roof overhang is walkable; the walls and foundation are solid.
    expect(canWalk(688, 110)).toBe(true);
    expect(canWalk(688, 128)).toBe(true);
    expect(canWalk(688, 134)).toBe(false);
    expect(canWalk(688, 198)).toBe(false);
    expect(canWalk(688, 206)).toBe(true);
    expect(movePlayer(688, 128, 0, 5)).toEqual({ x: 688, y: 128 });
    expect(movePlayer(688, 206, 0, -5)).toEqual({ x: 688, y: 206 });
  });
  it('blocks the chest and sign bases while leaving nearby interaction space and the portal open', () => {
    expect(canWalk(350, 398)).toBe(false);
    expect(canWalk(350, 405)).toBe(false);
    expect(canWalk(350, 386)).toBe(true);
    expect(canWalk(350, 409)).toBe(true);
    expect(canWalk(323, 398)).toBe(true);
    expect(canWalk(378, 398)).toBe(true);
    expect(movePlayer(350, 409, 0, -5)).toEqual({ x: 350, y: 409 });

    expect(canWalk(470, 325)).toBe(false);
    expect(canWalk(470, 330)).toBe(false);
    expect(canWalk(470, 313)).toBe(true);
    expect(canWalk(470, 334)).toBe(true);
    expect(movePlayer(470, 334, 0, -5)).toEqual({ x: 470, y: 334 });
    expect(canWalk(600, 430)).toBe(true);
  });
  it('does not tunnel through small props or walls during a large move and slides along walls', () => {
    expect(movePlayer(350, 430, 0, -100)).toEqual({ x: 350, y: 410 });
    expect(movePlayer(300, 398, 100, 0)).toEqual({ x: 320, y: 398 });
    expect(movePlayer(470, 350, 0, -80)).toEqual({ x: 470, y: 334 });
    expect(movePlayer(688, 230, 0, -160)).toEqual({ x: 688, y: 206 });
    expect(movePlayer(614, 170, 20, 20)).toEqual({ x: 614, y: 190 });
  });
  it('recovers saved positions covered by corrected solid footprints', () => {
    for (const position of [
      { x: 350, y: 398 },
      { x: 470, y: 325 },
      { x: 730, y: 550 },
    ]) {
      const safe = walkablePosition(position);
      expect(canWalk(safe.x, safe.y)).toBe(true);
      expect(Math.hypot(safe.x - position.x, safe.y - position.y)).toBeLessThan(32);
    }
    expect(walkablePosition(WORLD.spawn)).toBe(WORLD.spawn);
    expect(walkablePosition({ x: NaN, y: Infinity })).toEqual(WORLD.spawn);
  });
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
