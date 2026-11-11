export interface EnadeQuestion {
  id: string;
  number: number;
  kind: 'objective' | 'discursive';
  page: number;
  answer: string | null;
  annulled: boolean;
  section: 'general' | 'specific';
}
export interface EnadeExam {
  year: number;
  durationMinutes: number;
  questions: EnadeQuestion[];
  pageCount: number;
  sources: { label: string; url: string }[];
}
export interface EnadeAttempt {
  answers: Record<string, string>;
  marked: string[];
  startedAt: number;
  finishedAt: number | null;
  updatedAt: number;
}

export interface EnadeQuestionImage {
  src: string;
  page: number;
}
export interface EnadeQuestionContent {
  id: string;
  images: EnadeQuestionImage[];
  statement: string;
  transcript: string;
  options: {
    letter: string;
    text: string;
    code: boolean;
    image?: EnadeQuestionImage;
  }[];
}

export function gradeEnade(exam: EnadeExam, answers: Record<string, string>) {
  const scored = exam.questions.filter((q) => q.kind === 'objective' && !q.annulled && q.answer);
  const correct = scored.filter((q) => answers[q.id] === q.answer).length;
  return {
    correct,
    total: scored.length,
    percent: scored.length ? Math.round((correct / scored.length) * 100) : 0,
    unanswered: scored.filter((q) => !answers[q.id]).length,
  };
}
