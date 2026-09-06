import { describe, expect, it } from 'vitest';
import {
  calculateExerciseXp,
  calculateNodeMastery,
  deriveCompletedNodeStatus,
} from '@/lib/exercises/progression';

describe('exercise progression', () => {
  it('grants the same reward regardless of self-reported assistance', () => {
    expect(calculateExerciseXp(100, 'GUIDED')).toBe(100);
    expect(calculateExerciseXp(100, 'STANDARD')).toBe(100);
    expect(calculateExerciseXp(100, 'HARD')).toBe(100);
    expect(calculateExerciseXp(100, 'NO_ASSIST')).toBe(100);
  });

  it('derives mastery from shared node exercise completion', () => {
    expect(
      calculateNodeMastery({
        completedExercises: 1,
        totalExercises: 2,
        assistanceMode: 'STANDARD',
      })
    ).toBe(50);

    expect(
      deriveCompletedNodeStatus({ completedExercises: 1, totalExercises: 2, mastery: 50 })
    ).toBe('IN_PROGRESS');
    expect(
      deriveCompletedNodeStatus({ completedExercises: 2, totalExercises: 2, mastery: 100 })
    ).toBe('COMPLETED');
  });
});
