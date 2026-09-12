'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import type { Lesson, LessonSessionState, OrderItem } from '@/lib/lessons/types';
import { LessonHeader } from '@/components/lesson/LessonHeader';
import { LessonFooter } from '@/components/lesson/LessonFooter';
import { LessonSummary } from '@/components/lesson/LessonSummary';
import { ExitConfirmModal } from '@/components/lesson/ExitConfirmModal';

import { ConceptStep } from '@/components/lesson/renderers/ConceptStep';
import { MultipleChoiceStep } from '@/components/lesson/renderers/MultipleChoiceStep';
import { MatchingPairsStep } from '@/components/lesson/renderers/MatchingPairsStep';
import { OrderingStep } from '@/components/lesson/renderers/OrderingStep';
import { CodeCompletionStep } from '@/components/lesson/renderers/CodeCompletionStep';
import { CodeEditorStep } from '@/components/lesson/renderers/CodeEditorStep';
import { DebugStep } from '@/components/lesson/renderers/DebugStep';
import { OutputPredictionStep } from '@/components/lesson/renderers/OutputPredictionStep';
import { TerminalStep } from '@/components/lesson/renderers/TerminalStep';
import { CodeBlockBuilderStep } from '@/components/lesson/renderers/CodeBlockBuilderStep';
import { rememberTrailMascotReturn } from '@/app/trails/trailMascotProgress';

interface LessonClientProps {
  lesson: Lesson;
  returnTo?: string;
  completedStepIds?: string[];
  user: {
    id: string;
    username: string;
    total_xp: number;
    streak: number;
  };
}

export function LessonClient({ lesson, returnTo, completedStepIds = [] }: LessonClientProps) {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
  }, []);

  const { playSound } = useSoundEffects(soundEnabled);

  // Estado da Sessão da Lição
  const [sessionState, setSessionState] = useState<LessonSessionState>({
    currentStepIndex: Math.max(
      0,
      lesson.steps.findIndex((step) => !completedStepIds.includes(step.id))
    ),
    lives: 5,
    maxLives: 5,
    earnedXp: 0,
    combo: 0,
    maxCombo: 0,
    correctAnswersCount: 0,
    wrongAnswersCount: 0,
    hintsUsedCount: 0,
    startedAt: Date.now(),
  });

  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Estados dos Exercícios
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [blankValues, setBlankValues] = useState<Record<string, string>>({});
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [editorCode, setEditorCode] = useState('');
  const [terminalCommand, setTerminalCommand] = useState('');
  const [selectedTokenIndices, setSelectedTokenIndices] = useState<number[]>([]);

  const handleToggleToken = (tokenIndex: number) => {
    if (answered) return;
    setSelectedTokenIndices((prev) =>
      prev.includes(tokenIndex) ? prev.filter((i) => i !== tokenIndex) : [...prev, tokenIndex]
    );
  };

  // Estados de Execução de Código
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Estados de Feedback da Verificação
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackDetails, setFeedbackDetails] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);

  const currentStep = lesson.steps[sessionState.currentStepIndex];

  // Inicializa o estado do step ao avançar
  useEffect(() => {
    if (!currentStep) return;

    setSelectedOption(null);
    setBlankValues({});
    setMatchedPairs({});
    setSelectedTokenIndices([]);
    setRunOutput(null);
    setRunError(null);
    setAnswered(false);
    setIsCorrect(false);
    setFeedbackMessage('');
    setFeedbackDetails(undefined);
    setTerminalCommand('');

    if (currentStep.orderItems) {
      // Embaralha para o usuário ordenar
      const shuffled = [...currentStep.orderItems].sort(() => Math.random() - 0.5);
      setCurrentOrder(shuffled);
    } else {
      setCurrentOrder([]);
    }

    if (currentStep.codeTemplate) {
      setEditorCode(currentStep.codeTemplate);
    } else {
      setEditorCode('');
    }
  }, [sessionState.currentStepIndex, currentStep]);

  // Checa se o usuário preencheu a resposta necessária para habilitar "Verificar"
  const canVerify = useMemo(() => {
    if (!currentStep) return false;
    if (answered) return true;

    switch (currentStep.type) {
      case 'concept_explanation':
        return true;
      case 'multiple_choice':
      case 'output_prediction':
        return selectedOption !== null;
      case 'code_completion':
        if (!currentStep.blanks || currentStep.blanks.length === 0) return true;
        return currentStep.blanks.every((b) => Boolean((blankValues[b.id] || '').trim()));
      case 'ordering':
        return currentOrder.length > 0;
      case 'drag_drop':
        return selectedTokenIndices.length > 0;
      case 'matching':
        if (!currentStep.matchingPairs) return true;
        return Object.keys(matchedPairs).length === currentStep.matchingPairs.length;
      case 'terminal':
        return Boolean(terminalCommand.trim());
      case 'code_editor':
      case 'debug':
      case 'boss_challenge':
        return Boolean(editorCode.trim());
      default:
        return true;
    }
  }, [
    currentStep,
    answered,
    selectedOption,
    blankValues,
    currentOrder,
    matchedPairs,
    terminalCommand,
    editorCode,
    selectedTokenIndices,
  ]);

  const [savedComplete, setSavedComplete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function sendAnswer(action: 'run' | 'submit') {
    const response = await fetch(`/api/lessons/${encodeURIComponent(lesson.id)}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stepId: currentStep.id,
        action,
        selectedOption,
        code: editorCode,
        blanks: blankValues,
        order: currentOrder.map((item) => item.id),
        pairs: matchedPairs,
        command: terminalCommand,
        tokens: selectedTokenIndices.map((i) => currentStep.blockTokens?.[i] ?? ''),
      }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : (data.error?.message ?? 'Não foi possível salvar. Tente novamente.')
      );
    return data as {
      isCorrect: boolean;
      message: string;
      details?: string;
      output?: string;
      xpEarned: number;
      lessonCompleted?: boolean;
    };
  }

  const handleRunCode = async () => {
    if (!currentStep || isRunningCode) return;
    setIsRunningCode(true);
    setRunError(null);
    try {
      const result = await sendAnswer('run');
      setRunOutput(result.output ?? '');
      if (!result.isCorrect) setRunError(result.details ?? result.message);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Falha na execução.');
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleVerify = async () => {
    if (!currentStep || isVerifying || currentStep.type === 'concept_explanation') return;
    setIsVerifying(true);
    setSaveError(null);
    try {
      const result = await sendAnswer('submit');
      setAnswered(true);
      setIsCorrect(result.isCorrect);
      setFeedbackMessage(result.message);
      setFeedbackDetails(result.details);
      setSavedComplete(Boolean(result.lessonCompleted));
      if (result.isCorrect) {
        playSound('quiz_correct');
        setSessionState((prev) => ({
          ...prev,
          earnedXp: prev.earnedXp + result.xpEarned,
          combo: prev.combo + 1,
          maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
          correctAnswersCount: prev.correctAnswersCount + 1,
        }));
      } else {
        playSound('quiz_incorrect');
        setSessionState((prev) => ({
          ...prev,
          combo: 0,
          wrongAnswersCount: prev.wrongAnswersCount + 1,
        }));
      }
      return result;
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.'
      );
      return undefined;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = async () => {
    if (currentStep?.type === 'concept_explanation') {
      if (isVerifying) return;
      setIsVerifying(true);
      setSaveError(null);
      try {
        const result = await sendAnswer('submit');
        setSavedComplete(Boolean(result.lessonCompleted));
        setAnswered(false);
        setIsCorrect(false);
        setFeedbackMessage('');
        setFeedbackDetails(undefined);
        if (sessionState.currentStepIndex + 1 < lesson.steps.length) {
          setSessionState((prev) => ({ ...prev, currentStepIndex: prev.currentStepIndex + 1 }));
        } else if (result.lessonCompleted) {
          playSound('lesson_completed');
          setIsCompleted(true);
          router.refresh();
        } else {
          setSaveError('Há exercícios pendentes nesta lição. Reabra a lição para retomá-los.');
        }
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.'
        );
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    if (!isCorrect) return;

    setAnswered(false);
    setIsCorrect(false);
    setFeedbackMessage('');
    setFeedbackDetails(undefined);

    if (sessionState.currentStepIndex + 1 < lesson.steps.length) {
      setSessionState((prev) => ({ ...prev, currentStepIndex: prev.currentStepIndex + 1 }));
    } else if (savedComplete) {
      playSound('lesson_completed');
      setIsCompleted(true);
      router.refresh();
    } else {
      setSaveError('Há exercícios pendentes nesta lição. Reabra a lição para retomá-los.');
    }
  };

  // Tentar novamente a etapa atual
  const handleRetry = () => {
    setAnswered(false);
    setIsCorrect(false);
  };

  // Retorna para a trilha respeitando a preferência de visualização do usuário (Trilha ou Mapa)
  const handleReturnToTrails = () => {
    if (returnTo) {
      rememberTrailMascotReturn(returnTo, lesson.id);
      router.push(returnTo);
      return;
    }
    try {
      const savedMode = localStorage.getItem('stacklyst-trail-view-mode');
      if (savedMode === 'trail') {
        router.push('/trails?view=trail');
        return;
      }
    } catch {
      // ignore
    }
    router.push('/trails');
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-dd-bg flex flex-col justify-center items-center p-4">
        <LessonSummary
          lesson={lesson}
          sessionState={sessionState}
          onFinish={handleReturnToTrails}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dd-bg text-dd-text flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-500">
      {/* Header Gamificado */}
      <LessonHeader
        currentStepIndex={sessionState.currentStepIndex}
        totalSteps={lesson.steps.length}
        lives={sessionState.lives}
        maxLives={sessionState.maxLives}
        combo={sessionState.combo}
        earnedXp={sessionState.earnedXp}
        onExitClick={() => setExitModalOpen(true)}
      />

      {/* Área Central Interativa */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 w-full max-w-4xl mx-auto">
        {currentStep && (
          <div className="w-full">
            {lesson.project && currentStep.type === 'concept_explanation' && (
              <section
                className="mx-auto mb-8 max-w-2xl border-b border-dd-border pb-6"
                aria-label="Plano do projeto"
              >
                <h2 className="text-xl font-bold text-dd-text">Seu projeto</h2>
                <p className="mt-2 text-dd-muted">{lesson.project.objective}</p>
                <h3 className="mt-4 font-semibold text-dd-text">Requisitos</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-dd-muted">
                  {lesson.project.requirements.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
                <h3 className="mt-4 font-semibold text-dd-text">Etapas</h3>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-dd-muted">
                  {lesson.project.stages.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ol>
                <h3 className="mt-4 font-semibold text-dd-text">Critérios de conclusão</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-dd-muted">
                  {lesson.project.completion.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </section>
            )}
            {currentStep.type === 'concept_explanation' && (
              <ConceptStep step={currentStep} language={lesson.language} />
            )}

            {currentStep.type === 'multiple_choice' && (
              <MultipleChoiceStep
                answerCorrect={isCorrect}
                step={currentStep}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                disabled={answered}
                answered={answered}
              />
            )}

            {currentStep.type === 'matching' && (
              <MatchingPairsStep
                step={currentStep}
                matchedPairs={matchedPairs}
                onUpdateMatches={setMatchedPairs}
                disabled={answered}
              />
            )}

            {currentStep.type === 'ordering' && (
              <OrderingStep
                step={currentStep}
                currentOrder={currentOrder}
                onReorder={setCurrentOrder}
                disabled={answered}
              />
            )}

            {currentStep.type === 'drag_drop' && (
              <CodeBlockBuilderStep
                step={currentStep}
                selectedTokenIndices={selectedTokenIndices}
                onToggleToken={handleToggleToken}
                disabled={answered}
              />
            )}

            {currentStep.type === 'code_completion' && (
              <CodeCompletionStep
                step={currentStep}
                blankValues={blankValues}
                onUpdateBlank={(id, val) => setBlankValues((prev) => ({ ...prev, [id]: val }))}
                disabled={answered}
              />
            )}

            {currentStep.type === 'output_prediction' && (
              <OutputPredictionStep
                answerCorrect={isCorrect}
                step={currentStep}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                disabled={answered}
                answered={answered}
              />
            )}

            {currentStep.type === 'terminal' && (
              <TerminalStep
                step={currentStep}
                command={terminalCommand}
                onChangeCommand={setTerminalCommand}
                onSubmitCommand={handleVerify}
                disabled={answered}
              />
            )}

            {(currentStep.type === 'code_editor' || currentStep.type === 'boss_challenge') && (
              <CodeEditorStep
                step={currentStep}
                code={editorCode}
                onChangeCode={setEditorCode}
                language={lesson.language}
                onRunCode={handleRunCode}
                isRunning={isRunningCode}
                runOutput={runOutput}
                runError={runError}
                disabled={answered}
              />
            )}

            {currentStep.type === 'debug' && (
              <DebugStep
                step={currentStep}
                code={editorCode}
                onChangeCode={setEditorCode}
                language={lesson.language}
                onRunCode={handleRunCode}
                isRunning={isRunningCode}
                runOutput={runOutput}
                runError={runError}
                disabled={answered}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer de Ação & Feedback */}
      {saveError && (
        <p
          role="alert"
          className="fixed bottom-32 left-1/2 z-50 w-[min(90vw,40rem)] -translate-x-1/2 rounded-xl border border-red-500 bg-dd-bg p-4 text-sm text-red-400"
        >
          {saveError}
        </p>
      )}
      <LessonFooter
        isConceptOnly={currentStep?.type === 'concept_explanation'}
        answered={answered}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        feedbackDetails={feedbackDetails}
        earnedXp={sessionState.earnedXp}
        combo={sessionState.combo}
        hints={currentStep?.hints}
        canVerify={canVerify}
        isVerifying={isVerifying}
        onVerify={handleVerify}
        onContinue={handleContinue}
        onRetry={handleRetry}
      />

      {/* Modal de Confirmação de Saída */}
      <ExitConfirmModal
        isOpen={exitModalOpen}
        onConfirm={handleReturnToTrails}
        onCancel={() => setExitModalOpen(false)}
      />
    </div>
  );
}
