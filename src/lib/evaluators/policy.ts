import type { Language } from '@prisma/client';

export const EVALUATOR_MIN_XP = 1_000;
export const EVALUATOR_MIN_MOTIVATION_LENGTH = 80;
export const EVALUATOR_REVIEW_XP_REWARD = 10;
export const EVALUATOR_ACTIVE_REPUTATION = 80;
export const EVALUATOR_SUSPENSION_REPUTATION = 60;

const LANGUAGE_TECHS: Record<Language, string[]> = {
  TS: ['typescript'],
  JS: ['javascript', 'node.js', 'react'],
  PYTHON: ['python'],
  RUST: ['rust'],
  GO: ['go'],
  JAVA: ['java'],
  KOTLIN: ['kotlin'],
  SWIFT: ['swift'],
  CPP: ['c++', 'cpp'],
};

const REVIEWABLE_TECHS = new Set(Object.values(LANGUAGE_TECHS).flat());

function normalizedTechs(techStack: string[]) {
  return techStack.map((tech) => tech.trim().toLocaleLowerCase('pt-BR')).filter(Boolean);
}

export function hasReviewableTechnology(techStack: string[]) {
  return normalizedTechs(techStack).some((tech) => REVIEWABLE_TECHS.has(tech));
}

export function evaluatorCanReviewLanguage(techStack: string[], language: Language) {
  const selected = new Set(normalizedTechs(techStack));
  return LANGUAGE_TECHS[language].some((tech) => selected.has(tech));
}

export function getReviewableLanguages(techStack: string[]): Language[] {
  return (Object.keys(LANGUAGE_TECHS) as Language[]).filter((language) =>
    evaluatorCanReviewLanguage(techStack, language)
  );
}

export function getEvaluatorStanding(reputation: number) {
  if (reputation < EVALUATOR_SUSPENSION_REPUTATION) return 'SUSPENDED' as const;
  if (reputation < EVALUATOR_ACTIVE_REPUTATION) return 'PROBATION' as const;
  return 'ACTIVE' as const;
}

export function getEvaluatorLevel(evaluationsCount: number, reputation: number) {
  if (evaluationsCount >= 50 && reputation >= 90) return 'ESPECIALISTA' as const;
  if (evaluationsCount >= 10 && reputation >= 80) return 'CONFIÁVEL' as const;
  return 'INICIANTE' as const;
}

export function getApplicationRubric(input: {
  eligible: boolean;
  motivation: string;
  techStack: string[];
}) {
  const checks = {
    meetsExperienceRequirement: input.eligible,
    explainsMotivation: input.motivation.trim().length >= EVALUATOR_MIN_MOTIVATION_LENGTH,
    hasReviewableTechnology: hasReviewableTechnology(input.techStack),
  };

  return { checks, approved: Object.values(checks).every(Boolean) };
}
