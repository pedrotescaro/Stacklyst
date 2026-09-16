import { describe, expect, it } from 'vitest';
import { MASCOT_IDLE_FRAMES, MASCOT_SPRITE_FRAMES } from '@/app/trails/mascotSprites';
import { getTrailMascotProgressKey } from '@/app/trails/trailMascotProgress';
import { createSmoothTrailPath } from '@/app/trails/trailPath';
import { chooseMascotDirection, resolveMascotMovementRange } from '@/app/trails/useTrailMascot';

describe('trail mascot animation primitives', () => {
  it('keeps the direction-specific sprite frame counts', () => {
    expect(MASCOT_SPRITE_FRAMES.direita).toHaveLength(3);
    expect(MASCOT_SPRITE_FRAMES.esquerda).toHaveLength(3);
    expect(MASCOT_SPRITE_FRAMES.cima).toHaveLength(4);
    expect(MASCOT_SPRITE_FRAMES.baixo).toHaveLength(4);
  });

  it('keeps four transparent idle frames for every direction', () => {
    for (const frames of Object.values(MASCOT_IDLE_FRAMES)) {
      expect(frames).toHaveLength(4);
      expect(frames.every((source) => source.includes('/sprites/robot/idle/'))).toBe(true);
    }
  });

  it('ensures walking sprite frames match the 320x320 canvas dimensions of the idle frames', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const allFrames = [
      ...Object.values(MASCOT_SPRITE_FRAMES).flat(),
      ...Object.values(MASCOT_IDLE_FRAMES).flat(),
    ];
    for (const frame of allFrames) {
      const filePath = path.join(process.cwd(), 'public', frame);
      const buf = fs.readFileSync(filePath);
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      expect(width).toBe(320);
      expect(height).toBe(320);
    }
  });

  it('builds a distance-addressable smooth path through the trail waypoints', () => {
    const path = createSmoothTrailPath([
      { x: 100, y: 50 },
      { x: 30, y: 170 },
      { x: 170, y: 290 },
      { x: 100, y: 410 },
    ]);

    expect(path.totalLength).toBeGreaterThan(360);
    expect(path.getPointAtLength(0)).toEqual({ x: 100, y: 50 });
    expect(path.getPointAtLength(path.totalLength)).toEqual({ x: 100, y: 410 });

    const middle = path.getPointAtLength(path.totalLength / 2);
    expect(middle.y).toBeGreaterThan(170);
    expect(middle.y).toBeLessThan(290);
  });

  it('uses hysteresis before changing between horizontal and vertical sprites', () => {
    expect(chooseMascotDirection(10, 11, 'direita')).toBe('direita');
    expect(chooseMascotDirection(10, 13, 'direita')).toBe('baixo');
    expect(chooseMascotDirection(-13, 10, 'baixo')).toBe('esquerda');
    expect(chooseMascotDirection(0, -8, 'baixo')).toBe('cima');
  });

  it('derives the same progress key when returning from a lesson', () => {
    expect(
      getTrailMascotProgressKey('/trails?view=trail&path=frontend-react&section=2&language=JS')
    ).toBe('js:frontend-react');
    expect(getTrailMascotProgressKey('/feed?path=frontend-react&language=JS')).toBeNull();
  });

  it('replays the approach to the current node when returning without new progress', () => {
    expect(resolveMascotMovementRange(['node-1', 'node-2'], 'node-2', 'node-2', true)).toEqual({
      fromIndex: 0,
      targetIndex: 1,
    });
  });
});
