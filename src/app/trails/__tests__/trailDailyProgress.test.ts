import { describe, expect, it } from 'vitest';
import { calculateTrailDailyProgress } from '@/app/trails/trailDailyProgress';

describe('calculateTrailDailyProgress', () => {
  it('counts curriculum responses toward all three trail missions', () => {
    const progress = calculateTrailDailyProgress(
      [],
      [
        {
          quiz_id: 'js-frontend-react-s1-u1-s1',
          is_correct: true,
          xp_earned: 15,
        },
        {
          quiz_id: 'js-frontend-react-s1-u1-s2',
          is_correct: true,
          xp_earned: 15,
        },
        {
          quiz_id: 'js-frontend-react-s1-u1-s3',
          is_correct: true,
          xp_earned: 15,
        },
      ]
    );

    expect(progress).toEqual({ xpEarned: 45, correctAnswers: 3, trailActivities: 3 });
  });

  it('ignores unrelated quiz attempts and still includes workspace submissions', () => {
    const progress = calculateTrailDailyProgress(
      [{ status: 'PASSED', xp_earned: 20 }],
      [{ quiz_id: 'daily-quiz', is_correct: true, xp_earned: 50 }]
    );

    expect(progress).toEqual({ xpEarned: 20, correctAnswers: 1, trailActivities: 1 });
  });

  it('counts an exclusive code-node submission toward trail missions', () => {
    const progress = calculateTrailDailyProgress(
      [],
      [
        {
          quiz_id: 'js-algorithms-s3-u2-code-1-s1',
          is_correct: true,
          xp_earned: 35,
        },
      ]
    );

    expect(progress).toEqual({ xpEarned: 35, correctAnswers: 1, trailActivities: 1 });
  });
});
