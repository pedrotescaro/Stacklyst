'use client';

import { BookOpen, Sparkles, Lightbulb, Volume2 } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { DuolingoText } from '../DuolingoText';

interface ConceptStepProps {
  step: LessonStep;
  language: string;
}

export function ConceptStep({ step, language }: ConceptStepProps) {
  const { speak, isSpeaking } = useTextToSpeech();

  const handleSpeak = () => {
    const textToSpeak = `${step.title}. ${step.conceptText || ''}`;
    speak(textToSpeak);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans select-none">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-black text-dd-text dark:text-white tracking-tight">
          Aprenda o conceito:
        </h2>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
          {language} • {step.title}
        </p>
      </div>

      {step.conceptText && (
        <div className="flex items-start gap-4 rounded-3xl border-2 border-dd-border bg-dd-card/80 p-5 md:p-6 shadow-sm">
          <button
            type="button"
            onClick={handleSpeak}
            aria-label="Ouvir explicação do conceito"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/20 hover:bg-blue-400 active:scale-95 transition-all cursor-pointer ${
              isSpeaking ? 'ring-4 ring-blue-400/40 scale-105 animate-pulse' : ''
            }`}
          >
            <Volume2 className="h-5 w-5 fill-current" />
          </button>

          <div className="space-y-2 pt-0.5 flex-1 min-w-0">
            <DuolingoText text={step.conceptText} />
          </div>
        </div>
      )}

      {step.codeSnippet && (
        <div className="overflow-hidden rounded-2xl border-2 border-dd-border bg-[#0d1117] shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-800 bg-[#161b22] px-4 py-2 text-xs font-mono text-neutral-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-semibold text-neutral-300">
                exemplo.{language.toLowerCase()}
              </span>
            </span>
            <span className="text-[11px] uppercase tracking-wider text-blue-400 font-bold">
              {language}
            </span>
          </div>
          <pre className="p-4 text-sm font-mono text-blue-100 overflow-x-auto leading-relaxed">
            <code>{step.codeSnippet}</code>
          </pre>
        </div>
      )}

      {step.tip && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 p-4 text-amber-900 dark:text-amber-200">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Dica: </span>
            <span className="font-medium opacity-90">{step.tip}</span>
          </div>
        </div>
      )}
    </div>
  );
}
