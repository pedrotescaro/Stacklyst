'use client';

import { useLocalizedText } from '@/i18n/useLocalizedText';

const LEVEL_STYLES = [
  { min: 30, background: '#ff4b4b', shadow: '#b83232', text: '#ffffff' },
  { min: 20, background: '#ffc800', shadow: '#c79700', text: '#5a4100' },
  { min: 10, background: '#ce82ff', shadow: '#9656bf', text: '#ffffff' },
  { min: 5, background: '#58cc02', shadow: '#368f00', text: '#153a00' },
  { min: 1, background: '#1cb0f6', shadow: '#087db5', text: '#ffffff' },
];

export function getLevelFromTotalXp(totalXp: number) {
  return Math.max(1, Math.floor(Math.max(0, totalXp) / 1000) + 1);
}

export function LevelBadge({ totalXp, className = '' }: { totalXp: number; className?: string }) {
  const { text } = useLocalizedText();
  const level = getLevelFromTotalXp(totalXp);
  const style = LEVEL_STYLES.find((item) => level >= item.min) ?? LEVEL_STYLES.at(-1)!;

  return (
    <span
      aria-label={`${text('Nível', 'Level')} ${level}`}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-[9px] font-black uppercase leading-none tracking-tight select-none ${className}`}
      style={{
        backgroundColor: style.background,
        color: style.text,
        boxShadow: `0 3px 0 ${style.shadow}`,
      }}
    >
      Lvl {level}
    </span>
  );
}
