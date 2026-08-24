import { describe, expect, it } from 'vitest';
import {
  calculateGemBalance,
  calculateGemReward,
  GEMS_PER_EXERCISE_COMPLETION,
} from '@/lib/gamification/gems';

describe('gem rewards', () => {
  it('awards gems only for a first exercise completion', () => {
    expect(calculateGemReward(true)).toBe(GEMS_PER_EXERCISE_COMPLETION);
    expect(calculateGemReward(false)).toBe(0);
  });

  it('derives the persistent balance from idempotent first completions', () => {
    expect(calculateGemBalance(9)).toBe(45);
    expect(calculateGemBalance(-2)).toBe(0);
    expect(calculateGemBalance(2.9)).toBe(10);
  });
});
