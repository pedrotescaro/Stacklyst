'use client';

import { LessonSessionHeader } from '@/app/lesson/[lessonId]/LessonSessionHeader';
import { LessonFooter } from '@/components/lesson/LessonFooter';
import { OutputPredictionStep } from '@/components/lesson/renderers/OutputPredictionStep';
import type { LessonStep } from '@/lib/lessons/types';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import lessonStyles from '@/app/lesson/[lessonId]/LessonClient.module.css';
import { Cascade, CascadeItem } from '../../demo-motion';
import { DEMO_USER, demoCopy } from '../../demo-data';

const noop = () => {};

export type LessonStage = 'reading' | 'selected' | 'verifying' | 'correct';

/**
 * The real lesson surface (`LessonClient`) for the second step of a
 * foundations lesson: toolbar, output-prediction exercise and footer.
 */
export function LessonBeat({ stage }: { stage: LessonStage }) {
  const { text } = useLocalizedText();
  const { lesson } = demoCopy(text).trails;
  const step: LessonStep = {
    id: 'learn-js-variables-step-2',
    type: 'output_prediction',
    title: text('Leia antes de executar', 'Read before running'),
    instruction: lesson.instruction,
    codeSnippet: lesson.code,
    options: lesson.options,
    correctOptionIndex: 0,
    explanation: lesson.explanation,
    xp: DEMO_USER.lesson_xp,
  };
  const answered = stage === 'correct';
  const earnedXp = answered ? DEMO_USER.lesson_xp : 0;

  return (
    <Cascade className={lessonStyles.surface} data-testid="demo-lesson">
      <CascadeItem>
        <LessonSessionHeader
          title={lesson.title}
          language={lesson.language}
          estimatedTime={lesson.estimatedTime}
          combo={answered ? 1 : 0}
          earnedXp={earnedXp}
          lives={5}
          maxLives={5}
          currentStepIndex={1}
          totalSteps={3}
          onExit={noop}
        />
      </CascadeItem>
      <CascadeItem as="main" className={lessonStyles.lessonBody}>
        <div className={lessonStyles.stepContent}>
          <OutputPredictionStep
            step={step}
            selectedOption={stage === 'reading' ? null : 0}
            onSelectOption={noop}
            disabled={answered}
            answered={answered}
            answerCorrect={answered}
          />
        </div>
      </CascadeItem>
      <CascadeItem className="mt-auto">
        <LessonFooter
          answered={answered}
          isCorrect={answered}
          feedbackMessage={answered ? lesson.explanation : undefined}
          earnedXp={earnedXp}
          combo={answered ? 1 : 0}
          canVerify={stage !== 'reading'}
          isVerifying={stage === 'verifying'}
          onVerify={noop}
          onContinue={noop}
          onRetry={noop}
        />
      </CascadeItem>
    </Cascade>
  );
}
