import { parseTrailLessonStepId } from '@/app/trails/trailCurriculum';

const LEGACY_TRAIL_ACTIVITY_ID_PATTERN =
  /^(js|ts|py|python|rust|go|java)-(?:l\d+-q\d+|u\d+-checkpoint)$/i;
const TRAIL_CHEST_REWARD_ID_PATTERN =
  /^trail-chest-(js|ts|py|python|rust|go|java)-[a-z0-9-]+-s\d+$/i;

interface DailySubmission {
  status: string;
  xp_earned: number;
}

interface DailyQuizAttempt {
  quiz_id: string;
  is_correct: boolean;
  xp_earned: number;
}

export function calculateTrailDailyProgress(
  submissions: readonly DailySubmission[],
  quizAttempts: readonly DailyQuizAttempt[]
) {
  const lessonAttempts = quizAttempts.filter(
    (attempt) =>
      LEGACY_TRAIL_ACTIVITY_ID_PATTERN.test(attempt.quiz_id) ||
      Boolean(parseTrailLessonStepId(attempt.quiz_id))
  );
  const chestRewards = quizAttempts.filter((attempt) =>
    TRAIL_CHEST_REWARD_ID_PATTERN.test(attempt.quiz_id)
  );

  return {
    xpEarned:
      submissions.reduce((total, submission) => total + Math.max(0, submission.xp_earned), 0) +
      lessonAttempts.reduce((total, attempt) => total + Math.max(0, attempt.xp_earned), 0) +
      chestRewards.reduce((total, attempt) => total + Math.max(0, attempt.xp_earned), 0),
    correctAnswers:
      submissions.filter((submission) => submission.status === 'PASSED').length +
      lessonAttempts.filter((attempt) => attempt.is_correct).length,
    trailActivities: submissions.length + lessonAttempts.length,
  };
}
