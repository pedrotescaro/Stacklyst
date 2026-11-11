'use client';

import { Lightbulb, Volume2 } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { DuolingoText } from '../DuolingoText';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface ConceptStepProps {
  step: LessonStep;
  language: string;
}

export function ConceptStep({ step, language }: ConceptStepProps) {
  const { text } = useLocalizedText();
  const { speak, isSpeaking } = useTextToSpeech();

  const handleSpeak = () => {
    const textToSpeak = `${step.title}. ${step.conceptText || ''}`;
    speak(textToSpeak);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans select-none">
      <div className="space-y-1">
        <h2 className="text-xl font-bold leading-snug text-dd-text">
          {text('Aprenda o conceito:', 'Learn the concept:')}
        </h2>
        <p className="text-sm font-medium text-dd-muted">
          {language} • {step.title}
        </p>
      </div>

      {step.conceptText && (
        <div className="flex items-start gap-4 rounded-2xl border border-dd-border bg-dd-bg p-5 md:p-6">
          <button
            type="button"
            onClick={handleSpeak}
            aria-label={text('Ouvir explicação do conceito', 'Listen to the concept explanation')}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white  hover:bg-blue-700 active:scale-95 transition-all dd-focus-ring cursor-pointer ${
              isSpeaking ? 'ring-4 ring-blue-400/40 scale-105 animate-pulse' : ''
            }`}
          >
            <Volume2 className="h-5 w-5 fill-current" />
          </button>

          <div className="space-y-2 pt-0.5 flex-1 min-w-0">
            <DuolingoText text={step.conceptText} className="text-base font-medium" />
          </div>
        </div>
      )}

      {step.codeSnippet && (
        <div className="overflow-hidden rounded-2xl border border-dd-border bg-dd-bg">
          <div className="flex items-center justify-between border-b border-dd-border bg-dd-surface px-4 py-2 text-xs font-mono text-dd-muted">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-semibold text-dd-text">
                {text('exemplo', 'example')}.{language.toLowerCase()}
              </span>
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{language}</span>
          </div>
          <pre className="p-4 text-base font-mono text-dd-text overflow-x-auto leading-relaxed">
            <code>{step.codeSnippet}</code>
          </pre>
        </div>
      )}

      {step.tip && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-900 dark:text-amber-200">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="text-base">
            <span className="font-bold">{text('Dica:', 'Tip:')} </span>
            <span className="font-medium opacity-90">{step.tip}</span>
          </div>
        </div>
      )}
    </div>
  );
}
