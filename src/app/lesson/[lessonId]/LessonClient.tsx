'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { parseTrailLessonId } from '@/app/trails/trailCurriculum';

import {
  evaluateMultipleChoice,
  evaluateCodeCompletion,
  evaluateOrdering,
  evaluateMatching,
  evaluateTerminal,
  evaluateCodeEditor,
  evaluateBlockBuilder,
  type EvaluationOutcome,
} from '@/lib/lessons/evaluators';

interface LessonClientProps {
  lesson: Lesson;
  returnTo?: string;
  user: {
    id: string;
    username: string;
    total_xp: number;
    streak: number;
  };
}

export function LessonClient({ lesson, returnTo }: LessonClientProps) {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
  }, []);

  const { playSound } = useSoundEffects(soundEnabled);

  // Estado da Sessão da Lição
  const [sessionState, setSessionState] = useState<LessonSessionState>({
    currentStepIndex: 0,
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

  // Executa código no editor
  const handleRunCode = async () => {
    if (!currentStep || isRunningCode) return;
    setIsRunningCode(true);
    setRunOutput(null);
    setRunError(null);

    try {
      const outcome = await evaluateCodeEditor(
        editorCode,
        lesson.language,
        currentStep.checkCode,
        currentStep.expectedOutput
      );

      setRunOutput(outcome.output || (outcome.isCorrect ? '✓ Testes executados com sucesso' : ''));
      if (!outcome.isCorrect && outcome.details) {
        setRunError(outcome.details);
      }
    } catch (err: any) {
      setRunError(err.message || 'Erro ao executar o código.');
    } finally {
      setIsRunningCode(false);
    }
  };

  // Envia a pontuação de XP para a API do Stacklyst
  const persistProgress = useCallback(async () => {
    if (!currentStep) return;

    try {
      // Usa o endpoint de quiz / attempt para conceder XP e atualizar streak & trails
      const response = await fetch(`/api/quiz/${currentStep.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_index: selectedOption ?? currentStep.correctOptionIndex ?? 0,
        }),
      });
      if (!response.ok) throw new Error('Não foi possível salvar o progresso da atividade.');
    } catch (e) {
      console.warn('Could not persist attempt', e);
    }
  }, [currentStep, selectedOption]);

  // Processa a verificação da resposta
  const handleVerify = async () => {
    if (!currentStep || isVerifying) return;
    setIsVerifying(true);

    let outcome: EvaluationOutcome = { isCorrect: false };

    switch (currentStep.type) {
      case 'concept_explanation':
        outcome = { isCorrect: true, message: 'Conceito compreendido!' };
        break;

      case 'multiple_choice':
      case 'output_prediction':
        outcome = evaluateMultipleChoice(selectedOption, currentStep.correctOptionIndex ?? 0);
        break;

      case 'code_completion':
        outcome = evaluateCodeCompletion(blankValues, currentStep.blanks || []);
        break;

      case 'ordering':
        outcome = evaluateOrdering(currentOrder);
        break;

      case 'drag_drop': {
        const tokens = currentStep.blockTokens || [];
        const selectedTokens = selectedTokenIndices.map((i) => tokens[i]);
        outcome = evaluateBlockBuilder(selectedTokens, currentStep.expectedBlockTokens || []);
        break;
      }

      case 'matching':
        outcome = evaluateMatching(matchedPairs, currentStep.matchingPairs || []);
        break;

      case 'terminal':
        outcome = evaluateTerminal(terminalCommand, currentStep.terminalExpected);
        break;

      case 'code_editor':
      case 'debug':
      case 'boss_challenge':
        outcome = await evaluateCodeEditor(
          editorCode,
          lesson.language,
          currentStep.checkCode,
          currentStep.expectedOutput
        );
        break;
    }

    setAnswered(true);
    setIsCorrect(outcome.isCorrect);
    setFeedbackMessage(outcome.message || (outcome.isCorrect ? 'Resposta correta!' : 'Incorreto.'));
    setFeedbackDetails(
      outcome.details || (outcome.isCorrect ? undefined : currentStep.explanation)
    );

    if (outcome.isCorrect) {
      playSound('quiz_correct');
      const newCombo = sessionState.combo + 1;
      const bonusXp = Math.floor(newCombo * 1.5);
      const stepXp = currentStep.xp + bonusXp;

      setSessionState((prev) => ({
        ...prev,
        earnedXp: prev.earnedXp + stepXp,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        correctAnswersCount: prev.correctAnswersCount + 1,
      }));

      await persistProgress();
    } else {
      playSound('quiz_incorrect');
      setSessionState((prev) => ({
        ...prev,
        lives: Math.max(0, prev.lives - 1),
        combo: 0,
        wrongAnswersCount: prev.wrongAnswersCount + 1,
      }));

      if (currentStep.type === 'multiple_choice' || currentStep.type === 'output_prediction') {
        await persistProgress();
      }
    }

    setIsVerifying(false);
  };

  // Avança para a próxima etapa ou conclui a lição
  const handleContinue = async () => {
    if (currentStep?.type === 'concept_explanation' && !answered) {
      setIsVerifying(true);
      const newCombo = sessionState.combo + 1;
      const bonusXp = Math.floor(newCombo * 1.5);
      const stepXp = currentStep.xp + bonusXp;
      setSessionState((prev) => ({
        ...prev,
        earnedXp: prev.earnedXp + stepXp,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        correctAnswersCount: prev.correctAnswersCount + 1,
      }));
      await persistProgress();
      setIsVerifying(false);
    }

    if (sessionState.currentStepIndex + 1 < lesson.steps.length) {
      setSessionState((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
      }));
    } else {
      playSound('lesson_completed');
      try {
        const saved = JSON.parse(localStorage.getItem('stacklyst-completed-lessons') || '[]');
        if (Array.isArray(saved)) {
          if (!saved.includes(lesson.id)) saved.push(lesson.id);
          if (!parseTrailLessonId(lesson.id)) {
            if (
              lesson.levelNumber &&
              !saved.includes(`${lesson.language.toLowerCase()}-l${lesson.levelNumber}`)
            ) {
              saved.push(`${lesson.language.toLowerCase()}-l${lesson.levelNumber}`);
            }
            if (lesson.title && !saved.includes(lesson.title)) {
              saved.push(lesson.title);
            }
          }
          localStorage.setItem('stacklyst-completed-lessons', JSON.stringify(saved));
        }
      } catch {
        // ignore
      }
      setIsCompleted(true);
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
            {currentStep.type === 'concept_explanation' && (
              <ConceptStep step={currentStep} language={lesson.language} />
            )}

            {currentStep.type === 'multiple_choice' && (
              <MultipleChoiceStep
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
