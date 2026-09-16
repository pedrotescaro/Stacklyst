import type { Lesson } from '@/lib/lessons/types';

/** Allowlist, so future server-only answer keys cannot accidentally enter a bundle. */
export function publicLesson(lesson: Lesson) {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    language: lesson.language,
    estimatedTime: lesson.estimatedTime,
    difficulty: lesson.difficulty,
    unitNumber: lesson.unitNumber,
    levelNumber: lesson.levelNumber,
    xpReward: lesson.xpReward,
    project: lesson.project
      ? {
          objective: lesson.project.objective,
          requirements: lesson.project.requirements,
          stages: lesson.project.stages,
          completion: lesson.project.completion,
        }
      : undefined,
    steps: lesson.steps.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      question: s.question,
      instruction: s.instruction,
      conceptText: s.conceptText,
      codeSnippet: s.codeSnippet,
      codeTemplate: s.codeTemplate,
      options: s.options,
      hints: s.hints,
      tip: s.tip,
      completionPrefix: s.completionPrefix,
      completionSuffix: s.completionSuffix,
      blanks: s.blanks?.map((b) => ({ id: b.id, placeholder: b.placeholder })),
      orderItems: s.orderItems
        ?.map((i) => ({ id: i.id, text: i.text }))
        .sort((a, b) => a.text.localeCompare(b.text)),
      matchingLeft: s.matchingPairs?.map((p) => p.left),
      matchingRight: s.matchingPairs?.map((p) => p.right).sort(),
      blockTokens: s.blockTokens,
      terminalPrompt: s.terminalPrompt,
    })),
  };
}
export type PublicLesson = ReturnType<typeof publicLesson>;
