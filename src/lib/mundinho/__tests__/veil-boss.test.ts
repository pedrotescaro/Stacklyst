import { describe, expect, it } from 'vitest';
import {
  advanceShots,
  DODGE_SECONDS,
  FIELD,
  FIRST_VOLLEY,
  freshSoul,
  volley,
  VOLLEY_INTERVAL,
  type Shot,
} from '../veil-boss';

describe('Guardian projectile patterns', () => {
  it.each([1, 2, 7, 8])(
    'leaves a continuous escape route through the complete wall pattern on turn %i',
    (turn) => {
      // A time-expanded grid checks the entire overlapping pattern, not just each wall.
      // Move four pixels per 40ms, slightly slower than the real heart (105px/s).
      const columns = 59,
        rows = 28,
        dt = 0.04;
      let reachable = new Uint8Array(columns * rows);
      reachable[21 * columns + 29] = 1; // The actual spawn at (120, 88).
      let shots: Shot[] = [],
        beat = 0;
      for (let frame = 1; frame * dt < DODGE_SECONDS; frame++) {
        if (frame * dt >= FIRST_VOLLEY + beat * VOLLEY_INTERVAL)
          shots.push(...volley(turn, beat++, freshSoul()));
        shots = advanceShots(shots, dt, freshSoul()).shots;
        const next = new Uint8Array(reachable.length);
        for (let y = 0; y < rows; y++)
          for (let x = 0; x < columns; x++) {
            const i = y * columns + x;
            if (
              !(
                reachable[i] ||
                (x > 0 && reachable[i - 1]) ||
                (x < columns - 1 && reachable[i + 1]) ||
                (y > 0 && reachable[i - columns]) ||
                (y < rows - 1 && reachable[i + columns])
              )
            )
              continue;
            if (shots.every((s) => Math.hypot(s.x - (4 + x * 4), s.y - (4 + y * 4)) >= 7))
              next[i] = 1;
          }
        expect(next.some(Boolean), `No escape at ${frame * dt}s`).toBe(true);
        reachable = next;
      }
    }
  );

  it('fires a wider aimed fan from outside the box and caps escalation in long fights', () => {
    for (const soul of [freshSoul(), { x: 4, y: 4 }, { x: FIELD.width - 4, y: FIELD.height - 4 }]) {
      const fan = volley(3, 0, soul);
      expect(fan.length).toBeGreaterThan(3);
      expect(fan.every((s) => s.y < 0)).toBe(true);
      const aimed = fan[Math.floor(fan.length / 2)];
      const toSoul = { x: soul.x - aimed.x, y: soul.y - aimed.y };
      expect(aimed.vx * toSoul.y - aimed.vy * toSoul.x).toBeCloseTo(0);
      expect(aimed.vx * toSoul.x + aimed.vy * toSoul.y).toBeGreaterThan(0);
    }
    for (const turn of [7, 8, 9]) {
      expect(volley(turn + 300, 3, freshSoul())).toEqual(volley(turn, 3, freshSoul()));
    }
  });
});
