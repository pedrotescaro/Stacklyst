import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { HIT_MS, useHits } from './BattleHit';

afterEach(() => vi.useRealTimers());

it('turns a drop in hit points into a short hit with the damage taken', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ hp, id }) => useHits(hp, id), {
    initialProps: { hp: { a: 100, b: 100 } as Record<string, number>, id: 'match' },
  });
  // The first totals are a baseline, never a hit.
  expect(result.current).toEqual({});
  rerender({ hp: { a: 100, b: 70 }, id: 'match' });
  expect(result.current.b?.amount).toBe(30);
  expect(result.current.a).toBeUndefined();
  // Newer polls with the same totals keep the hit until it has played.
  rerender({ hp: { a: 100, b: 70 }, id: 'match' });
  act(() => vi.advanceTimersByTime(HIT_MS));
  expect(result.current.b).toBeDefined();
  act(() => vi.advanceTimersByTime(400));
  expect(result.current).toEqual({});
  // Healing is not a hit, and a new match starts from a fresh baseline.
  rerender({ hp: { a: 100, b: 90 }, id: 'match' });
  expect(result.current).toEqual({});
  rerender({ hp: { a: 40, b: 40 }, id: 'rematch' });
  expect(result.current).toEqual({});
});
