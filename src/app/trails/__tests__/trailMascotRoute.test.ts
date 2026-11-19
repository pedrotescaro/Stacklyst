import { describe, expect, it } from 'vitest';
import {
  buildMascotRoute,
  mascotStandPoint,
  type MascotNodeBox,
} from '@/app/trails/trailMascotRoute';

const sprite = { width: 56, height: 56, gap: 8 };
const node = (cx: number, cy: number, side: MascotNodeBox['side']): MascotNodeBox => ({
  cx,
  cy,
  halfWidth: 42,
  halfHeight: 40,
  side,
});

describe('trail mascot route', () => {
  it('stands beside map nodes on the outer side, away from the label', () => {
    expect(mascotStandPoint(node(100, 100, 'left'), sprite)).toEqual({ x: 34, y: 134 });
    expect(mascotStandPoint(node(300, 100, 'right'), sprite)).toEqual({ x: 366, y: 134 });
  });

  it('keeps standing on top of nodes in layouts without sides', () => {
    // Feet anchor at 88% of the sprite, just above the node.
    expect(mascotStandPoint(node(100, 100, null), sprite)).toEqual({
      x: 100,
      y: 100 - 40 - 8 + 56 * 0.88,
    });
  });

  it('starts and ends beside the nodes and stays clear of the labels while walking', () => {
    const from = node(100, 100, 'left');
    const to = node(300, 260, 'right');
    const route = buildMascotRoute([from, to], sprite);

    expect(route.getPointAtLength(0)).toEqual(mascotStandPoint(from, sprite));
    expect(route.getPointAtLength(route.totalLength)).toEqual(mascotStandPoint(to, sprite));

    // Labels sit on the inner side of each node, within the node's row.
    for (let step = 0; step <= 100; step += 1) {
      const point = route.getPointAtLength((route.totalLength * step) / 100);
      const inFromLabel = point.x > from.cx + from.halfWidth && Math.abs(point.y - from.cy) < 30;
      const inToLabel = point.x < to.cx - to.halfWidth && Math.abs(point.y - to.cy) < 30;
      expect(inFromLabel || inToLabel).toBe(false);
    }
  });

  it('passes through every waypoint between the two nodes', () => {
    const boss = node(100, 260, 'left');
    const route = buildMascotRoute([node(300, 100, 'right'), boss, node(100, 480, 'left')], sprite);
    let closest = Infinity;
    for (let step = 0; step <= 400; step += 1) {
      const point = route.getPointAtLength((route.totalLength * step) / 400);
      closest = Math.min(closest, Math.hypot(point.x - boss.cx, point.y - boss.cy));
    }
    expect(closest).toBeLessThan(3);
  });
});
