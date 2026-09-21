import 'server-only';
import { z } from 'zod';
import { executeCode } from '@/lib/code-execution/server';
import { evaluateExerciseCode } from '@/lib/exercises/evaluator';
import type { Lesson, LessonStep } from '@/lib/lessons/types';

export const lessonAnswerSchema = z.object({
  stepId: z.string().min(1).max(200),
  action: z.enum(['run', 'submit']).default('submit'),
  selectedOption: z.number().int().min(0).max(30).nullable().optional(),
  code: z.string().max(20000).optional(),
  blanks: z.record(z.string(), z.string().max(1000)).optional(),
  tokens: z.array(z.string().max(1000)).max(100).optional(),
  order: z.array(z.string().max(200)).max(100).optional(),
  pairs: z.record(z.string(), z.string().max(1000)).optional(),
  command: z.string().max(2000).optional(),
});
export type LessonAnswer = z.infer<typeof lessonAnswerSchema>;
export async function assessLessonStep(lesson: Lesson, step: LessonStep, answer: LessonAnswer) {
  const outcome = (isCorrect: boolean, details?: string) => ({
    isCorrect,
    details,
    output: '',
    message: isCorrect ? 'Resposta validada.' : 'Revise a resposta e tente novamente.',
  });
  switch (step.type) {
    case 'concept_explanation':
      return outcome(true);
    case 'multiple_choice':
    case 'output_prediction':
      return outcome(answer.selectedOption === step.correctOptionIndex);
    case 'code_completion':
      return outcome(
        Boolean(step.blanks?.length) &&
          step.blanks!.every((b) =>
            b.expected.some((e) => e.trim() === (answer.blanks?.[b.id] ?? '').trim())
          )
      );
    case 'drag_drop':
      return outcome(
        Boolean(step.expectedBlockTokens?.length) &&
          JSON.stringify(answer.tokens) === JSON.stringify(step.expectedBlockTokens)
      );
    case 'ordering':
      return outcome(
        Boolean(step.orderItems?.length) &&
          JSON.stringify(answer.order) ===
            JSON.stringify(
              [...step.orderItems!].sort((a, b) => a.correctIndex - b.correctIndex).map((x) => x.id)
            )
      );
    case 'matching':
      return outcome(
        Boolean(step.matchingPairs?.length) &&
          step.matchingPairs!.every((p) => answer.pairs?.[p.left] === p.right)
      );
    case 'terminal':
      return outcome(
        Boolean(step.terminalExpected) && answer.command?.trim() === step.terminalExpected?.trim()
      );
    case 'code_editor':
    case 'debug':
    case 'boss_challenge': {
      if (!answer.code?.trim()) return outcome(false, 'Escreva seu código antes de executar.');
      if (step.evaluation) {
        const cases = step.evaluation.cases.filter((c) => answer.action === 'submit' || !c.hidden);
        if (!cases.length)
          return outcome(false, 'Esta atividade ainda não possui testes de avaliação.');
        const result = await evaluateExerciseCode({
          code: answer.code,
          language: lesson.language,
          functionName: step.evaluation.functionName,
          testCases: cases.map((c, i) => ({
            id: `case-${i}`,
            label: `Caso ${i + 1}`,
            input: c.input,
            invocation_code: c.invocation ?? null,
            expected_output: c.expected,
            is_hidden: Boolean(c.hidden),
            position: i,
          })),
        });
        return {
          ...outcome(
            result.passed,
            result.error ?? `${result.passedTests}/${result.totalTests} testes passaram.`
          ),
          output: result.consoleOutput,
          unavailable: result.unavailable === true,
        };
      }
      const result = await executeCode(
        [answer.code, step.checkCode].filter(Boolean).join('\n'),
        lesson.language
      );
      const normalize = (s: string) => s.replace(/\r/g, '').trim();
      return {
        ...outcome(
          result.ok &&
            step.expectedOutput !== undefined &&
            normalize(result.output) === normalize(step.expectedOutput),
          result.error ??
            (result.ok
              ? `Saída esperada:\n${step.expectedOutput ?? '(avaliação não configurada)'}`
              : undefined)
        ),
        output: result.output,
        unavailable: result.unavailable === true,
      };
    }
  }
}

// Solutions and hidden tests must never be serialized into the learner's page.
export function publicLesson(lesson: Lesson): Lesson {
  return {
    ...lesson,
    steps: lesson.steps.map((step) => {
      const {
        solutionCode: _solution,
        checkCode: _check,
        evaluation: _evaluation,
        correctOptionIndex: _answer,
        expectedBlockTokens: _tokens,
        terminalExpected: _terminal,
        ...safe
      } = step;
      return {
        ...safe,
        blanks: step.blanks?.map((b) => ({ ...b, expected: [] })),
        orderItems: step.orderItems?.map((item) => ({ ...item, correctIndex: -1 })),
      };
    }),
  };
}
