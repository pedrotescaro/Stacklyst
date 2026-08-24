import { describe, expect, it } from 'vitest';
import { buildTrailJumpId, getHighestJumpedSection } from '@/lib/trails/jump';

describe('trail jump progress', () => {
  it('builds stable reward identifiers and restores the highest unlocked section', () => {
    const section3 = buildTrailJumpId('JS', 'frontend-react', 3);
    const section6 = buildTrailJumpId('JS', 'frontend-react', 6);

    expect(section3).toBe('trail-jump-js-frontend-react-s3');
    expect(getHighestJumpedSection([section3, section6], 'JS', 'frontend-react')).toBe(6);
    expect(getHighestJumpedSection([section6], 'TS', 'frontend-react')).toBe(1);
  });
});
