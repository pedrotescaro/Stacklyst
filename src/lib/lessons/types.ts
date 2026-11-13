export type ExerciseType =
  | 'concept_explanation'
  | 'multiple_choice'
  | 'code_completion'
  | 'code_editor'
  | 'debug'
  | 'output_prediction'
  | 'ordering'
  | 'matching'
  | 'drag_drop'
  | 'terminal'
  | 'boss_challenge';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface OrderItem {
  id: string;
  text: string;
  correctIndex: number;
}

export interface BlankSlot {
  id: string;
  placeholder: string;
  expected: string[];
}

export interface TestCase {
  id: string;
  description: string;
  testCode: string;
  expectedOutput?: string;
}

/** Presentation-only flavours of an existing step type; assessment does not change. */
export type StepVariant = 'true_false' | 'find_bug' | 'quiz';

export interface LessonStep {
  id: string;
  type: ExerciseType;
  title: string;
  variant?: StepVariant;
  /** Extra practice: earns XP and stars but never gates lesson completion. */
  practice?: boolean;
  /** Seconds to answer before the attempt counts as a miss (timed challenges). */
  timeLimitSeconds?: number;
  question?: string;
  instruction?: string;
  conceptText?: string;
  codeSnippet?: string;
  tip?: string;
  hints?: string[];
  explanation?: string;
  xp: number;

  // For multiple_choice & output_prediction
  options?: string[];
  correctOptionIndex?: number;

  // For code_editor & debug & boss_challenge
  codeTemplate?: string;
  solutionCode?: string;
  testCases?: TestCase[];
  checkCode?: string;
  expectedOutput?: string;
  // Server-only assessment contract. Removed before serializing a lesson to the browser.
  evaluation?: {
    functionName: string;
    cases: { input: unknown[]; expected: unknown; hidden?: boolean; invocation?: string }[];
  };

  // For code_completion
  blanks?: BlankSlot[];
  completionPrefix?: string;
  completionSuffix?: string;

  // For ordering
  orderItems?: OrderItem[];

  // For matching
  matchingPairs?: MatchingPair[];

  // For terminal
  terminalPrompt?: string;
  terminalExpected?: string;
  terminalHint?: string;

  // For drag_drop / block builder
  blockTokens?: string[];
  expectedBlockTokens?: string[];
}

export interface Lesson {
  project?: { objective: string; requirements: string[]; stages: string[]; completion: string[] };
  id: string;
  title: string;
  description: string;
  language: string;
  unitNumber: number;
  levelNumber: number;
  xpReward: number;
  difficulty: 'iniciante' | 'intermediario' | 'avancado' | 'boss';
  estimatedTime: string;
  steps: LessonStep[];
  /** Game rules for the session. Lessons without it keep the classic behaviour. */
  mode?: {
    lives: number;
    kind: 'lesson' | 'challenge' | 'boss';
    /** Plain-language summary of what makes this lesson different, shown at the start. */
    tagline?: string;
  };
}

export interface LessonSessionState {
  currentStepIndex: number;
  lives: number;
  maxLives: number;
  earnedXp: number;
  combo: number;
  maxCombo: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  hintsUsedCount: number;
  startedAt: number;
}
