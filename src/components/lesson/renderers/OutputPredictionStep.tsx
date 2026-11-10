'use client';

import { CheckCircle2, Terminal as TerminalIcon, Volume2 } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { DuolingoText } from '../DuolingoText';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface OutputPredictionStepProps {
  step: LessonStep;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  disabled?: boolean;
  answered?: boolean;
  answerCorrect?: boolean;
}

export function OutputPredictionStep({
  step,
  selectedOption,
  onSelectOption,
  disabled = false,
  answered = false,
  answerCorrect = false,
}: OutputPredictionStepProps) {
  const options = step.options || [];
  const { speak, isSpeaking } = useTextToSpeech();
  const { text } = useLocalizedText();

  const handleSpeak = () => {
    const textToSpeak =
      step.instruction ||
      step.title ||
      text('Preveja a saída do código.', 'Predict the code output.');
    speak(textToSpeak);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans select-none">
      <h2 className="text-xl font-bold leading-snug text-dd-text">
        {text('Preveja a saída:', 'Predict the output:')}
      </h2>

      {step.instruction && (
        <div className="flex items-start gap-4 rounded-2xl border border-dd-border bg-dd-bg p-5">
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
          <div className="pt-0.5 flex-1 min-w-0">
            <DuolingoText text={step.instruction} />
          </div>
        </div>
      )}

      {step.codeSnippet && (
        <div className="overflow-hidden rounded-2xl border border-dd-border bg-dd-bg">
          <div className="flex items-center gap-2 border-b border-dd-border bg-dd-surface px-4 py-2 text-xs font-mono text-dd-muted">
            <TerminalIcon className="h-3.5 w-3.5 text-teal-400" />
            <span className="font-semibold text-dd-text">
              {text('Trecho de Código', 'Code snippet')}
            </span>
          </div>
          <pre className="p-4 text-base font-mono text-dd-text overflow-x-auto leading-relaxed">
            <code>{step.codeSnippet}</code>
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = answered && isSelected && answerCorrect;
          const isWrong = answered && isSelected && !answerCorrect;

          let btnClasses =
            'group relative flex items-center justify-between rounded-2xl border p-4 text-left font-mono font-semibold text-base transition-all duration-100 dd-focus-ring cursor-pointer ';

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
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold font-sans transition-colors ${
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
