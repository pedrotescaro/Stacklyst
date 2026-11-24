import insights from './question-insights.json';

/**
 * Versioned editorial commentary for official questions. The answer key always
 * comes from the official Inep gabarito
 * (exams.json); a commentary never changes it. Letters are the canonical ones
 * printed in the official booklet, mapped to the shuffled order on screen.
 */
export type QuestionInsight = {
  interpretation: string;
  steps: string[];
  items?: { label: string; correct: boolean; text: string }[];
  options: Partial<Record<'A' | 'B' | 'C' | 'D' | 'E', string>>;
  concepts: string[];
  traps: string[];
  mnemonic?: string;
  reviewed: string;
};

export type QuestionStudyAids = {
  insight: QuestionInsight | null;
  topics: { slug: string; title: string }[];
  similar: { id: string; label: string }[];
};

const ALL = insights as Record<string, QuestionInsight>;

export function insightFor(questionId: string): QuestionInsight | null {
  return ALL[questionId] ?? null;
}

export function insightIds() {
  return Object.keys(ALL);
}
