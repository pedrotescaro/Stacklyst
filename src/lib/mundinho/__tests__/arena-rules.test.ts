import { describe, expect, it } from 'vitest';
import {
  advanceArenaTurn,
  arenaCanWalk,
  arenaMove,
  validArenaPosition,
  chooseArenaAttack,
  arenaNeedsExercise,
} from '../arena-rules';
import { equipmentStats } from '../equipment';
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
  it('shares all three NPC skills, caps healing, applies wear and locks the skill for exercises', () => {
    const stats = { a: equipmentStats([], {}), b: equipmentStats([], {}) };
    const m = { ...match(), stats, hp: { a: 90, b: 100 } };
    const now = new Date();
    expect(chooseArenaAttack(m, 0, now, 'strike').hp).toEqual({ a: 90, b: 70 });
    expect(chooseArenaAttack(m, 0, now, 'focus').hp).toEqual({ a: 100, b: 82 });
    expect(chooseArenaAttack(m, 0, now, 'burst').hp).toEqual({ a: 82, b: 55 });
    const exercise = chooseArenaAttack(m, 99, now, 'focus');
    expect(exercise.skill).toBe('focus');
    expect(chooseArenaAttack(exercise, 0, now, 'burst')).toBe(exercise);
    expect(advanceArenaTurn(exercise, true, now, 'Acertou').hp).toEqual({ a: 100, b: 82 });
    expect(advanceArenaTurn(exercise, false, now, 'Errou').hp).toEqual(m.hp);
    expect(chooseArenaAttack({ ...m, hp: { a: 5, b: 100 } }, 0, now, 'burst')).toMatchObject({
      status: 'finished',
      winnerId: 'b',
    });
  });
  it('assigns exactly 25 exercise outcomes and never rerolls an assigned exercise', () => {
    const m = { ...match(), stats: { a: equipmentStats([], {}), b: equipmentStats([], {}) } };
    const now = new Date();
    const outcomes = Array.from({ length: 100 }, (_, roll) => chooseArenaAttack(m, roll, now));
    expect(outcomes.filter(arenaNeedsExercise)).toHaveLength(25);
    expect(outcomes.filter((x) => x.turn === 1)).toHaveLength(75);
    const exercise = chooseArenaAttack(m, 99, now);
    expect(chooseArenaAttack(exercise, 0, now)).toBe(exercise);
  });
  it('applies each player’s owned title, luck, life and opposing protection', () => {
    const a = equipmentStats(['title-debugger', 'gear-heart'], {
      title: 'title-debugger',
      relic: 'gear-heart',
    });
    const b = equipmentStats(['title-debugger', 'gear-crystal', 'gear-phoenix'], {
      title: 'title-debugger',
      armor: 'gear-crystal',
      relic: 'gear-phoenix',
    });
    const m = { ...match(), stats: { a, b }, hp: { a: a.maxHp, b: b.maxHp } };
    const hit = chooseArenaAttack(m, 99, new Date());
    expect(hit.hp).toEqual({ a: 110, b: 106 });
    expect(hit.turn).toBe(1);
    expect(chooseArenaAttack(hit, 99, new Date()).hp).toEqual({ a: 80, b: 106 });
    const lucky = equipmentStats(['gear-star'], { charm: 'gear-star' });
    expect(lucky.directChance).toBe(90);
    expect(equipmentStats([], { title: 'title-debugger', charm: 'gear-star' }).directChance).toBe(
      75
    );
  });
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
    expect(() =>
      arenaActionSchema.parse({
        type: 'attack',
        roomId: crypto.randomUUID(),
        matchId: crypto.randomUUID(),
        turn: 0,
        skill: 'forged',
      })
    ).toThrow();
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
