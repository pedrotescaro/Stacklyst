import type { Lesson, LessonStep } from '@/lib/lessons/types';
import { LEARNING_XP } from './rewards';

export interface LearningLesson extends Lesson {
  unitTitle: string;
  kind: 'lesson' | 'review' | 'project';
  prerequisites: string[];
  skills: string[];
  legacyStepIds?: string[];
  project?: { objective: string; requirements: string[]; stages: string[]; completion: string[] };
}
export interface LearningCourse {
  id: string;
  title: string;
  description: string;
  language: string;
  lessons: LearningLesson[];
}
export type StepDraft = Omit<LessonStep, 'id' | 'xp'> & { xp?: number };
export function defineLesson(
  input: Omit<LearningLesson, 'steps' | 'xpReward' | 'estimatedTime'> & { steps: StepDraft[] }
): LearningLesson {
  const steps = input.steps.map((step, index) => ({
    ...step,
    id: `${input.id}-step-${index + 1}`,
    xp:
      step.xp ??
      (step.type === 'concept_explanation'
        ? LEARNING_XP.concept
        : step.type === 'boss_challenge'
          ? LEARNING_XP.project
          : ['code_editor', 'debug'].includes(step.type)
            ? LEARNING_XP.code
            : LEARNING_XP.recall),
  }));
  return {
    ...input,
    steps,
    xpReward: steps.reduce((sum, step) => sum + step.xp, 0),
    estimatedTime: `${Math.max(4, steps.length * 3)} min`,
  };
}
