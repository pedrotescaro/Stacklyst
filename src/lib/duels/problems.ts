import 'server-only';

import { CHALLENGE_LIBRARY } from '@/lib/duel-challenge-generator';
import { DUEL_PROBLEMS, type DuelProblem } from '@/lib/duel-problems';

const trustedProblems: DuelProblem[] = [...DUEL_PROBLEMS, ...CHALLENGE_LIBRARY];

export function getTrustedDuelProblem(problemId: string | null | undefined): DuelProblem | null {
  if (!problemId) return null;

  return (
    trustedProblems.find(
      (problem) => problem.id === problemId || problemId.startsWith(`${problem.id}-`)
    ) ?? null
  );
}

export function findTrustedDuelProblemByTitle(title: string): DuelProblem | null {
  const normalized = title.trim().toLocaleLowerCase('pt-BR');
  return (
    trustedProblems.find(
      (problem) => problem.title.trim().toLocaleLowerCase('pt-BR') === normalized
    ) ?? null
  );
}

export function serializePublicDuelProblem(problem: DuelProblem): string {
  return JSON.stringify(problem);
}

export function getTrustedDuelProblemIds(): string[] {
  return trustedProblems.map((problem) => problem.id);
}
