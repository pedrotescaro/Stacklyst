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

export interface LessonStep {
  id: string;
  type: ExerciseType;
  title: string;
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
