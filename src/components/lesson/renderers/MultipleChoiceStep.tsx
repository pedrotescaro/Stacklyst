'use client';

import { CheckCircle2, Volume2 } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { DuolingoText } from '../DuolingoText';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface MultipleChoiceStepProps {
  step: LessonStep;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  disabled?: boolean;
  answered?: boolean;
  answerCorrect?: boolean;
}

export function MultipleChoiceStep({
  step,
  selectedOption,
  onSelectOption,
  disabled = false,
  answered = false,
  answerCorrect = false,
}: MultipleChoiceStepProps) {
  const { text } = useLocalizedText();
  const options = step.options || [];
  const { speak, isSpeaking } = useTextToSpeech();

  const handleSpeak = () => {
    const textToSpeak = `${step.instruction || step.title}. ${step.question || ''}`;
    speak(textToSpeak);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans select-none">
      {/* Título Principal Estilo Duolingo */}
      <h2 className="text-xl font-bold leading-snug text-dd-text">
        {text('Leia e responda:', 'Read and answer:')}
      </h2>

      {/* Balão de Contexto com Ícone */}
      <div className="flex items-start gap-4 rounded-2xl border border-dd-border bg-dd-bg p-5 md:p-6">
        <button
          type="button"
          onClick={handleSpeak}
          aria-label={text('Ouvir enunciado da questão', 'Listen to the question')}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white  hover:bg-blue-700 active:scale-95 transition-all dd-focus-ring cursor-pointer ${
            isSpeaking ? 'ring-4 ring-blue-400/40 scale-105 animate-pulse' : ''
          }`}
        >
          <Volume2 className="h-5 w-5 fill-current" />
        </button>

        <div className="space-y-2 pt-0.5 flex-1 min-w-0">
          <DuolingoText
            text={step.instruction || step.conceptText || step.title}
            className="text-base font-medium text-dd-text"
          />
        </div>
      </div>

      {/* Snippet de Código se houver */}
      {step.codeSnippet && (
        <div className="overflow-hidden rounded-2xl border border-dd-border bg-dd-bg">
          <pre className="p-4 text-base font-mono text-dd-text overflow-x-auto leading-relaxed">
            <code>{step.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Pergunta Específica */}
      {step.question && (
        <div className="pt-1">
          <h3 className="text-base font-semibold text-dd-text">{step.question}</h3>
        </div>
      )}

      {/* Cards de Alternativas com estilo Duolingo (3D bottom border) */}
      <div className="grid grid-cols-1 gap-3.5 pt-1">
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = answered && isSelected && answerCorrect;
          const isWrong = answered && isSelected && !answerCorrect;

          let btnClasses =
            'group relative flex items-center justify-between rounded-2xl border p-4 text-left font-semibold text-base transition-all duration-100 dd-focus-ring cursor-pointer ';

          if (answered) {
            if (isCorrect) {
              btnClasses +=
                'border-emerald-500 border-b-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ';
            } else if (isWrong) {
              btnClasses +=
                'border-rose-500 border-b-rose-600 bg-rose-500/15 text-rose-700 dark:text-rose-300 ';
            } else {
              btnClasses += 'border-dd-border border-b-dd-border opacity-40 bg-dd-surface/30';
            }
          } else if (isSelected) {
            btnClasses +=
              'border-blue-500 border-b-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-300  ring-2 ring-blue-500/20';
          } else {
            btnClasses +=
              'border-dd-border border-b-dd-border/90 bg-dd-bg hover:bg-dd-surface hover:border-dd-text/30 text-dd-text';
          }

          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onSelectOption(index)}
              className={btnClasses}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-dd-border bg-dd-surface text-dd-muted group-hover:text-dd-text'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="whitespace-pre-wrap break-words">{option}</span>
              </div>

              {isSelected && (
                <CheckCircle2
                  className={`h-5 w-5 shrink-0 transition-transform duration-150 ${
                    answered ? (isCorrect ? 'text-emerald-500' : 'text-rose-500') : 'text-blue-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
