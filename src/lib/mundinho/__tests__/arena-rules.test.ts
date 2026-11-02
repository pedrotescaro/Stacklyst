import { describe, expect, it } from 'vitest';
import { advanceArenaTurn, arenaCanWalk, arenaMove, validArenaPosition } from '../arena-rules';
import { arenaActionSchema } from '../arena';
import type { ArenaMatch } from '../arena-types';
import { creatureStats, resolveTurn } from '../rules';
import { CREATURES } from '../types';
import { vi } from 'vitest';
vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: vi.fn() }));

const match = (): ArenaMatch => ({
  id: 'match',
  status: 'active',
  ready: ['a', 'b'],
  hp: { a: 100, b: 100 },
  actorId: 'a',
  turn: 0,
  scenario: 0,
  level: 2,
  deadline: '',
  winnerId: null,
  log: [],
});
describe('Arena movement and combat', () => {
  it('keeps players on the ring and permits reaching the exit', () => {
    expect(arenaCanWalk(320, 340)).toBe(true);
    expect(arenaCanWalk(384, 440)).toBe(true);
    expect(arenaCanWalk(80, 80)).toBe(false);
    expect(arenaCanWalk(Number.NaN, 200)).toBe(false);
    expect(arenaMove({ x: 110, y: 296, direction: 'left', walking: true }, -40, 0).x).toBe(110);
    expect(
      validArenaPosition(
        { x: 320, y: 340, direction: 'down', walking: false },
        { x: 340, y: 340, direction: 'right', walking: true },
        100
      )
    ).toBe(true);
    expect(
      validArenaPosition(
        { x: 320, y: 340, direction: 'down', walking: false },
        { x: 650, y: 340, direction: 'right', walking: true },
        100
      )
    ).toBe(false);
  });
  it('alternates turns, applies only verified damage and finishes at zero life', () => {
    const now = new Date('2026-11-02T18:00:00Z');
    const hit = advanceArenaTurn(match(), true, now, 'Acertou');
    expect(hit).toMatchObject({
      hp: { a: 100, b: 70 },
      actorId: 'b',
      turn: 1,
      deadline: '2026-11-02T18:02:00.000Z',
    });
    const miss = advanceArenaTurn(hit, false, now, 'Errou');
    expect(miss.hp).toEqual(hit.hp);
    expect(miss.actorId).toBe('a');
    const win = advanceArenaTurn({ ...match(), hp: { a: 70, b: 10 } }, true, now, 'Vitória');
    expect(win).toMatchObject({ status: 'finished', winnerId: 'a', hp: { a: 70, b: 0 } });
  });
  it('resolves the turn limit without an arbitrary winner on equal life', () => {
    expect(advanceArenaTurn({ ...match(), turn: 19 }, false, new Date(), 'Tempo')).toMatchObject({
      status: 'finished',
      winnerId: null,
    });
  });
  it('ignores forged identity/damage/outfits and rejects invalid coordinates or languages', () => {
    expect(
      arenaActionSchema.parse({ type: 'enter', language: 'JS', userId: 'other', damage: 999 })
    ).toEqual({ type: 'enter', language: 'JS' });
    expect(() => arenaActionSchema.parse({ type: 'enter', language: 'FAKE' })).toThrow();
    expect(() =>
      arenaActionSchema.parse({
        type: 'sync',
        roomId: crypto.randomUUID(),
        position: { x: Infinity, y: 1, direction: 'down', walking: true },
      })
    ).toThrow();
  });
});
describe('Authoritative forest difficulty', () => {
  it('includes levels 1 through 5 and a genuinely stronger level 10 boss', () => {
    expect(new Set(CREATURES.map((c) => c.level))).toEqual(new Set([1, 2, 3, 4, 5, 10]));
    expect(creatureStats(10).maxHp).toBe(240);
    expect(creatureStats(10).turnLimit).toBeGreaterThan(creatureStats(3).turnLimit);
    expect(resolveTurn(100, 240, true, 'strike', 10).hp).toBeLessThan(
      resolveTurn(100, 100, true, 'strike', 3).hp
    );
  });
});
