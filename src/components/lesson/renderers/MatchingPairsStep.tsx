'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { Check, Layers, X } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface MatchingPairsStepProps {
  step: LessonStep;
  matchedPairs: Record<string, string>;
  onUpdateMatches: (matches: Record<string, string>) => void;
  disabled?: boolean;
  /** After checking: highlight right and wrong pairs. */
  answered?: boolean;
}

/** One color per link so both ends of a pair are easy to spot. */
const PAIR_COLORS = ['#60a5fa', '#f472b6', '#facc15', '#a78bfa', '#fb923c', '#2dd4bf'];

function hash(value: string) {
  let h = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic shuffle keyed by the step id: identical on the server and in
 * the browser (no hydration mismatch) and never the same order as the left side.
 */
function stableShuffle(items: string[], seed: string) {
  const ordered = [...items].sort((a, b) => hash(`${seed}:${a}`) - hash(`${seed}:${b}`));
  const same = ordered.every((item, index) => item === items[index]);
  return same && ordered.length > 1 ? [...ordered.slice(1), ordered[0]!] : ordered;
}

export function MatchingPairsStep({
  step,
  matchedPairs,
  onUpdateMatches,
  disabled = false,
  answered = false,
}: MatchingPairsStepProps) {
  const { text } = useLocalizedText();
  const pairs = useMemo(() => step.matchingPairs ?? [], [step.matchingPairs]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const shuffledRights = useMemo(
    () =>
      stableShuffle(
        pairs.map((pair) => pair.right),
        step.id
      ),
    [pairs, step.id]
  );
  const expectedFor = useMemo(() => new Map(pairs.map((pair) => [pair.left, pair.right])), [pairs]);
  // Links keep the order in which they were made, which drives color and number.
  const linkOrder = Object.keys(matchedPairs);
  const colorOf = (left: string) =>
    PAIR_COLORS[Math.max(0, linkOrder.indexOf(left)) % PAIR_COLORS.length]!;

  const link = (left: string, right: string) => {
    onUpdateMatches({ ...matchedPairs, [left]: right });
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleLeftClick = (left: string) => {
    if (disabled) return;
    if (matchedPairs[left]) {
      const next = { ...matchedPairs };
      delete next[left];
      onUpdateMatches(next);
      return;
    }
    if (selectedRight) link(left, selectedRight);
    else setSelectedLeft(left === selectedLeft ? null : left);
  };

  const handleRightClick = (right: string) => {
    if (disabled) return;
    const owner = linkOrder.find((left) => matchedPairs[left] === right);
    if (owner) {
      const next = { ...matchedPairs };
      delete next[owner];
      onUpdateMatches(next);
      return;
    }
    if (selectedLeft) link(selectedLeft, right);
    else setSelectedRight(right === selectedRight ? null : right);
  };

  const baseCard =
    'relative w-full flex items-center justify-between gap-2 rounded-2xl border-2 p-3.5 text-left font-semibold text-base transition-all duration-150 dd-focus-ring min-h-[56px] ';

  const badge = (number: number, color: string) => (
    <span
      aria-hidden="true"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-black"
      style={{ background: color }}
    >
      {number}
    </span>
  );

  const linkedStyle = (color: string): CSSProperties => ({
    borderColor: color,
    background: `color-mix(in srgb, ${color} 14%, transparent)`,
  });

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
          {!answered && (
            <p className="mt-1 text-sm text-dd-muted">
              {text(
                'Cada par ganha a mesma cor e número dos dois lados. Toque de novo para desfazer.',
                'Each pair gets the same color and number on both sides. Tap again to undo.'
              )}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-3">
          <p className="text-sm font-medium text-dd-muted px-1">
            {text('Conceito / Termo', 'Concept / Term')}
          </p>
          {pairs.map((pair) => {
            const chosen = matchedPairs[pair.left];
            const linked = Boolean(chosen);
            const isSelected = selectedLeft === pair.left;
            const right = answered && chosen === expectedFor.get(pair.left);
            const wrong = answered && linked && !right;
            const color = colorOf(pair.left);
            let classes = baseCard;
            let style: CSSProperties | undefined;
            if (answered) {
              classes += right
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 '
                : 'border-rose-500 bg-rose-500/15 text-rose-300 ';
            } else if (linked) {
              classes += 'text-dd-text cursor-pointer ';
              style = linkedStyle(color);
            } else if (isSelected) {
              classes +=
                'border-purple-500 bg-purple-500/15 text-purple-300 scale-[1.02] ring-2 ring-purple-500/30 cursor-pointer';
            } else {
              classes +=
                'border-dd-border bg-dd-bg hover:border-purple-500/40 hover:bg-dd-surface text-dd-text cursor-pointer';
            }
            return (
              <div key={pair.id}>
                <button
                  type="button"
                  disabled={disabled}
                  aria-pressed={isSelected}
                  aria-label={
                    linked
                      ? `${pair.left} ↔ ${chosen}`
                      : `${pair.left}${isSelected ? text(' (selecionado)', ' (selected)') : ''}`
                  }
                  onClick={() => handleLeftClick(pair.left)}
                  className={classes}
                  style={style}
                >
                  <span className="min-w-0 break-words font-mono">{pair.left}</span>
                  {answered ? (
                    right ? (
                      <Check className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <X className="h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
                    )
                  ) : (
                    linked && badge(linkOrder.indexOf(pair.left) + 1, color)
                  )}
                </button>
                {wrong && (
                  <p className="mt-1 px-1 text-xs text-dd-muted">
                    {text('Certo:', 'Correct:')} {expectedFor.get(pair.left)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-dd-muted px-1">
            {text('Correspondência', 'Match')}
          </p>
          {shuffledRights.map((rightText) => {
            const owner = linkOrder.find((left) => matchedPairs[left] === rightText);
            const isSelected = selectedRight === rightText;
            const color = owner ? colorOf(owner) : '';
            const right = answered && owner !== undefined && expectedFor.get(owner) === rightText;
            let classes = baseCard;
            let style: CSSProperties | undefined;
            if (answered) {
              classes += right
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 '
                : 'border-rose-500/70 bg-rose-500/10 text-rose-300 ';
            } else if (owner) {
              classes += 'text-dd-text cursor-pointer ';
              style = linkedStyle(color);
            } else if (isSelected) {
              classes +=
                'border-purple-500 bg-purple-500/15 text-purple-300 scale-[1.02] ring-2 ring-purple-500/30 cursor-pointer';
            } else {
              classes +=
                'border-dd-border bg-dd-bg hover:border-purple-500/40 hover:bg-dd-surface text-dd-text cursor-pointer';
            }
            return (
              <button
                key={rightText}
                type="button"
                disabled={disabled}
                aria-pressed={isSelected}
                onClick={() => handleRightClick(rightText)}
                className={classes}
                style={style}
              >
                <span className="min-w-0 break-words text-base font-medium leading-snug">
                  {rightText}
                </span>
                {!answered && owner && badge(linkOrder.indexOf(owner) + 1, color)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
