'use client';

import { useState, useMemo } from 'react';
import { Layers, Check } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface MatchingPairsStepProps {
  step: LessonStep;
  matchedPairs: Record<string, string>;
  onUpdateMatches: (matches: Record<string, string>) => void;
  disabled?: boolean;
}

export function MatchingPairsStep({
  step,
  matchedPairs,
  onUpdateMatches,
  disabled = false,
}: MatchingPairsStepProps) {
  const { text } = useLocalizedText();
  const pairs = step.matchingPairs || [];
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Embaralha o lado direito apenas uma vez por etapa
  const shuffledRights = useMemo(() => {
    return [...pairs].map((p) => p.right).sort(() => Math.random() - 0.5);
  }, [pairs]);

  const handleLeftClick = (left: string) => {
    if (disabled || matchedPairs[left]) return;

    if (selectedRight) {
      // Conecta o par
      const next = { ...matchedPairs, [left]: selectedRight };
      onUpdateMatches(next);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedLeft(left === selectedLeft ? null : left);
    }
  };

  const handleRightClick = (right: string) => {
    if (disabled) return;

    // Se esse right já está pareado com algum left, não faz nada
    const alreadyMatchedLeft = Object.keys(matchedPairs).find((k) => matchedPairs[k] === right);
    if (alreadyMatchedLeft) return;

    if (selectedLeft) {
      // Conecta o par
      const next = { ...matchedPairs, [selectedLeft]: right };
      onUpdateMatches(next);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedRight(right === selectedRight ? null : right);
    }
  };

  const handleRemoveMatch = (left: string) => {
    if (disabled) return;
    const next = { ...matchedPairs };
    delete next[left];
    onUpdateMatches(next);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold leading-snug text-dd-text">
            {step.title || text('Combine os Pares', 'Match the Pairs')}
          </h2>
          <p className="text-base text-dd-muted leading-relaxed">
            {step.instruction ||
              text(
                'Toque em um item da esquerda e depois no seu par correspondente à direita',
                'Tap an item on the left and then its matching pair on the right'
              )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        {/* Coluna da Esquerda */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-dd-muted px-1">
            {text('Conceito / Termo', 'Concept / Term')}
          </p>
          {pairs.map((pair) => {
            const isMatched = Boolean(matchedPairs[pair.left]);
            const isSelected = selectedLeft === pair.left;

            let cardClasses =
              'w-full flex items-center justify-between rounded-2xl border p-3.5 text-left font-semibold text-base transition-all duration-150 dd-focus-ring cursor-pointer min-h-[56px] ';

            if (isMatched) {
              cardClasses +=
                'border-emerald-500/80 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ';
            } else if (isSelected) {
              cardClasses +=
                'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-300  scale-[1.02] ring-2 ring-purple-500/30';
            } else {
              cardClasses +=
                'border-dd-border bg-dd-bg hover:border-purple-500/40 hover:bg-dd-surface text-dd-text';
            }

            return (
              <button
                key={pair.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  isMatched ? handleRemoveMatch(pair.left) : handleLeftClick(pair.left)
                }
                className={cardClasses}
              >
                <span className="truncate">{pair.left}</span>
                {isMatched && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Coluna da Direita */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-dd-muted px-1">
            {text('Correspondência', 'Match')}
          </p>
          {shuffledRights.map((rightText, idx) => {
            const matchedLeft = Object.keys(matchedPairs).find(
              (k) => matchedPairs[k] === rightText
            );
            const isMatched = Boolean(matchedLeft);
            const isSelected = selectedRight === rightText;

            let cardClasses =
              'w-full flex items-center justify-between rounded-2xl border p-3.5 text-left font-semibold text-base transition-all duration-150 dd-focus-ring cursor-pointer min-h-[56px] ';

            if (isMatched) {
              cardClasses +=
                'border-emerald-500/80 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ';
            } else if (isSelected) {
              cardClasses +=
                'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-300  scale-[1.02] ring-2 ring-purple-500/30';
            } else {
              cardClasses +=
                'border-dd-border bg-dd-bg hover:border-purple-500/40 hover:bg-dd-surface text-dd-text';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() =>
                  isMatched && matchedLeft
                    ? handleRemoveMatch(matchedLeft)
                    : handleRightClick(rightText)
                }
                className={cardClasses}
              >
                <span className="text-base font-medium leading-snug">{rightText}</span>
                {isMatched && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
