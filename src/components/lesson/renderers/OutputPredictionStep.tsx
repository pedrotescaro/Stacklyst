'use client';

import { Eye, CheckCircle2, Terminal as TerminalIcon, Volume2 } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { DuolingoText } from '../DuolingoText';

interface OutputPredictionStepProps {
  step: LessonStep;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  disabled?: boolean;
  answered?: boolean;
}

export function OutputPredictionStep({
  step,
  selectedOption,
  onSelectOption,
  disabled = false,
  answered = false,
}: OutputPredictionStepProps) {
  const options = step.options || [];
  const { speak, isSpeaking } = useTextToSpeech();

  const handleSpeak = () => {
    const textToSpeak = step.instruction || step.title || 'Preveja a saída do código.';
    speak(textToSpeak);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans select-none">
      <h2 className="text-2xl md:text-3xl font-black text-dd-text dark:text-white tracking-tight">
        Preveja a saída:
      </h2>

      {step.instruction && (
        <div className="flex items-start gap-4 rounded-3xl border-2 border-dd-border bg-dd-card/80 p-5 shadow-sm">
          <button
            type="button"
            onClick={handleSpeak}
            aria-label="Ouvir enunciado da questão"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/20 hover:bg-blue-400 active:scale-95 transition-all cursor-pointer ${
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
        <div className="overflow-hidden rounded-2xl border-2 border-dd-border bg-[#0d1117] shadow-lg">
          <div className="flex items-center gap-2 border-b border-neutral-800 bg-[#161b22] px-4 py-2 text-xs font-mono text-neutral-400">
            <TerminalIcon className="h-3.5 w-3.5 text-teal-400" />
            <span className="font-semibold text-neutral-300">Trecho de Código</span>
          </div>
          <pre className="p-4 text-sm font-mono text-teal-100 overflow-x-auto leading-relaxed">
            <code>{step.codeSnippet}</code>
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = answered && index === step.correctOptionIndex;
          const isWrong = answered && isSelected && index !== step.correctOptionIndex;

          let btnClasses =
            'group relative flex items-center justify-between rounded-2xl border-2 border-b-4 p-4 text-left font-mono font-bold text-sm md:text-base transition-all duration-100 cursor-pointer active:translate-y-[2px] active:border-b-2 ';

          if (answered) {
            if (isCorrect) {
              btnClasses +=
                'border-emerald-500 border-b-emerald-600 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-md';
            } else if (isWrong) {
              btnClasses +=
                'border-rose-500 border-b-rose-600 bg-rose-500/15 text-rose-600 dark:text-rose-300 shadow-md';
            } else {
              btnClasses += 'border-dd-border border-b-dd-border opacity-40 bg-dd-surface/30';
            }
          } else if (isSelected) {
            btnClasses +=
              'border-blue-500 border-b-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-300 shadow-md ring-2 ring-blue-500/20';
          } else {
            btnClasses +=
              'border-dd-border border-b-dd-border/90 bg-dd-card hover:bg-dd-surface hover:border-dd-text/30 text-dd-text dark:text-neutral-200';
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
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs font-black font-sans transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-dd-border bg-dd-surface text-dd-muted group-hover:text-dd-text'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate">{option}</span>
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
