'use client';

import Image from 'next/image';
import { Volume2, VolumeX, Sparkles, Code2 } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { DuolingoText } from '../DuolingoText';

interface CodeBlockBuilderStepProps {
  step: LessonStep;
  selectedTokenIndices: number[];
  onToggleToken: (tokenIndex: number) => void;
  disabled?: boolean;
}

export function CodeBlockBuilderStep({
  step,
  selectedTokenIndices,
  onToggleToken,
  disabled = false,
}: CodeBlockBuilderStepProps) {
  const allTokens = step.blockTokens || [];
  const { speak, isSpeaking } = useTextToSpeech();

  const handleSpeak = () => {
    const textToSpeak = step.instruction || step.title;
    speak(textToSpeak);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans select-none">
      {/* Título Principal */}
      <h2 className="text-2xl md:text-3xl font-black text-dd-text dark:text-white tracking-tight">
        Monte o código:
      </h2>

      {/* Mascote Robô com Balão de Fala estilo Duolingo */}
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-20 shrink-0">
          <Image
            src="/assets/trails/devdeck-robot-lesson.png"
            alt="Mascote Stacklyst"
            fill
            sizes="80px"
            className={`object-contain drop-shadow-md transition-transform duration-200 ${
              isSpeaking ? 'scale-105' : ''
            }`}
            priority
          />
        </div>

        <div className="relative flex-1 rounded-2xl border-2 border-dd-border bg-dd-card px-5 py-4 shadow-sm flex items-center gap-3.5">
          {/* Seta do balão */}
          <span
            aria-hidden="true"
            className="absolute -left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 border-b-2 border-l-2 border-dd-border bg-dd-card"
          />

          <button
            type="button"
            onClick={handleSpeak}
            aria-label="Ouvir enunciado da questão"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-400 active:scale-95 transition-all cursor-pointer ${
              isSpeaking ? 'ring-4 ring-blue-400/40 scale-105 animate-pulse' : ''
            }`}
          >
            <Volume2 className="h-5 w-5 fill-current" />
          </button>

          <DuolingoText
            text={step.instruction || step.title}
            className="text-sm md:text-base font-bold text-dd-text dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Área de Linhas do Caderno / Slots para os blocos colocados */}
      <div className="relative min-h-[120px] w-full rounded-2xl border-y-2 border-dd-border/80 bg-dd-surface/20 p-4">
        {/* Linhas horizontais discretas estilo Duolingo */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-evenly px-4 opacity-40">
          <div className="w-full border-b border-dd-border" />
          <div className="w-full border-b border-dd-border" />
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5 items-center">
          {selectedTokenIndices.length === 0 ? (
            <span className="text-xs font-medium text-dd-muted select-none py-3">
              Toque nos blocos abaixo para posicioná-los aqui...
            </span>
          ) : (
            selectedTokenIndices.map((tokenIdx, position) => {
              const tokenText = allTokens[tokenIdx];
              return (
                <button
                  key={`placed-${position}-${tokenIdx}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggleToken(tokenIdx)}
                  className="group flex items-center justify-center rounded-2xl border-2 border-b-4 border-blue-500/80 border-b-blue-600 bg-blue-500/15 hover:bg-blue-500/25 px-4 py-2.5 font-mono text-sm md:text-base font-bold text-blue-400 dark:text-blue-300 shadow-sm cursor-pointer active:translate-y-[2px] active:border-b-2 transition-all animate-scale-up"
                >
                  <span>{tokenText}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Banco de Blocos de Código Inferior */}
      <div className="flex flex-wrap justify-center gap-2.5 pt-2">
        {allTokens.map((tokenText, idx) => {
          const isPlaced = selectedTokenIndices.includes(idx);

          if (isPlaced) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-[46px] min-w-[70px] px-4 rounded-2xl border-2 border-dashed border-dd-border/50 bg-dd-surface/30 select-none opacity-40"
              />
            );
          }

          return (
            <button
              key={`bank-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => onToggleToken(idx)}
              className="flex items-center justify-center rounded-2xl border-2 border-b-4 border-dd-border border-b-dd-border/90 bg-dd-card hover:bg-dd-surface hover:border-dd-text/40 px-4 py-2.5 font-mono text-sm md:text-base font-bold text-dd-text dark:text-neutral-100 shadow-sm cursor-pointer active:translate-y-[2px] active:border-b-2 transition-all"
            >
              <span>{tokenText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
