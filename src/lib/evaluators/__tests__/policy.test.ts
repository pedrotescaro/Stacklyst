import { describe, expect, it } from 'vitest';
import {
  evaluatorCanReviewLanguage,
  getApplicationRubric,
  getEvaluatorLevel,
  getEvaluatorStanding,
} from '@/lib/evaluators/policy';

describe('evaluator policy', () => {
  it('applies the objective application rubric', () => {
    expect(
      getApplicationRubric({
        eligible: true,
        motivation:
          'Quero contribuir com revisões claras e fundamentadas para a comunidade. '.repeat(2),
        techStack: ['TypeScript'],
      }).approved
    ).toBe(true);
    expect(
      getApplicationRubric({ eligible: true, motivation: 'Pouco texto', techStack: ['Figma'] })
        .approved
    ).toBe(false);
  });

  it('limits the queue to declared technologies', () => {
    expect(evaluatorCanReviewLanguage(['TypeScript'], 'TS')).toBe(true);
    expect(evaluatorCanReviewLanguage(['TypeScript'], 'PYTHON')).toBe(false);
    expect(evaluatorCanReviewLanguage(['React'], 'JS')).toBe(true);
  });

  it('derives levels and consequences from activity and reputation', () => {
    expect(getEvaluatorLevel(0, 100)).toBe('INICIANTE');
    expect(getEvaluatorLevel(10, 80)).toBe('CONFIÁVEL');
    expect(getEvaluatorLevel(50, 90)).toBe('ESPECIALISTA');
    expect(getEvaluatorStanding(79)).toBe('PROBATION');
    expect(getEvaluatorStanding(59)).toBe('SUSPENDED');
  });
});
