import { prisma } from '@/lib/prisma';
import { saveLessonAssessment, requireLessonAccess } from '@/lib/learning/lesson-progress';
import { LEARNING_LESSONS } from '@/lib/learning/catalog';
import { AppError } from '@/lib/errors';
import type { Lesson, LessonStep } from '@/lib/lessons/types';
import { findTrailQuestionById } from '@/lib/trailsData';
import { XP_QUIZ_CORRECT } from '@/lib/config';
import { findCurriculumLessonStepById } from '@/lib/lessons/registry';
import { generateDailyQuiz } from './daily-quiz.service';

export const QuizService = {
  generateDaily: generateDailyQuiz,

  async validateQuizAnswer(userId: string, quizId: string, selectedIndex: number) {
    const trail = findTrailQuestionById(quizId);
    const curriculum = findCurriculumLessonStepById(quizId);
    const learning = [...LEARNING_LESSONS.values()].find((l) =>
      l.steps.some((s) => s.id === quizId)
    );
    if (curriculum && !['multiple_choice', 'output_prediction'].includes(curriculum.step.type)) {
      throw new AppError(
        'ASSESSMENT_REQUIRED',
        'Envie a resposta completa pelo avaliador da lição.',
        400
      );
    }
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { post: true } });
    // Reward receipts are not answerable quizzes, even if a receipt exists in the legacy table.
    if (
      /^(trail-chest-|trail-jump-)|checkpoint/.test(quizId) ||
      (quiz?.options && Array.isArray(quiz.options) && quiz.options.length < 2)
    ) {
      throw new AppError(
        'ASSESSMENT_REQUIRED',
        'Esta recompensa depende da conclusão das atividades.',
        400
      );
    }
    if (!quiz && !trail && !curriculum && !learning)
      throw new AppError('QUIZ_NOT_FOUND', 'Quiz não encontrado.', 404);
    const learnedStep = learning?.steps.find((s) => s.id === quizId);
    const correctIndex =
      learnedStep?.correctOptionIndex ??
      trail?.question.correctIndex ??
      curriculum?.step.correctOptionIndex ??
      quiz!.correct_index;
    const step: LessonStep = learnedStep ??
      curriculum?.step ?? {
        id: quizId,
        type: 'multiple_choice',
        title: trail?.question.question ?? quiz!.question,
        question: trail?.question.question ?? quiz!.question,
        options: trail?.question.options ?? (quiz!.options as string[]),
        correctOptionIndex: correctIndex,
        xp: XP_QUIZ_CORRECT,
      };
    if (!['multiple_choice', 'output_prediction'].includes(step.type))
      throw new AppError('ASSESSMENT_REQUIRED', 'Resposta completa obrigatória.', 400);
    const lesson: Lesson = learning ??
      curriculum?.lesson ?? {
        id: quizId,
        title: step.title,
        description: 'Quiz',
        language: trail?.language ?? quiz?.post?.language ?? '',
        unitNumber: 1,
        levelNumber: 1,
        xpReward: step.xp,
        difficulty: 'iniciante',
        estimatedTime: '2 min',
        steps: [step],
      };
    if (learning) await requireLessonAccess(userId, lesson);
    const isCorrect = selectedIndex === correctIndex;
    const result = await saveLessonAssessment(userId, lesson, step, isCorrect, selectedIndex);
    const attempt = await prisma.quizAttempt.findUniqueOrThrow({
      where: { user_id_quiz_id: { user_id: userId, quiz_id: quizId } },
    });
    return { attempt, correctIndex, isCorrect, xpResult: result.xpResult };
  },
};
