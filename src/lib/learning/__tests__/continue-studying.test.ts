import { describe, expect, it } from 'vitest';
import { continueStudyingHref, pickContinueTrail } from '@/lib/learning/continue-studying';

describe('continueStudyingHref', () => {
  it('resumes the course with the most XP, skipping the dashboard', () => {
    expect(
      continueStudyingHref([
        { language: 'JS', xp: 120 },
        { language: 'PYTHON', xp: 640 },
      ])
    ).toBe('/trails?resume=1&language=PYTHON');
  });

  it('falls back to the trails hub when nothing is started', () => {
    expect(continueStudyingHref([])).toBe('/trails');
    expect(continueStudyingHref([{ language: 'JS', xp: 0, level: 1, streak: 0 }])).toBe('/trails');
  });

  it('ignores languages that have no trail course', () => {
    expect(pickContinueTrail([{ language: 'CSHARP', xp: 900 }])).toBeNull();
  });
});
