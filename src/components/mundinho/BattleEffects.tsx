import type { CSSProperties } from 'react';

export const CREATURE_ELEMENTS: Record<string, { element: string; label: string }> = {
  'syntax-slime': { element: 'slime', label: 'Gosma' },
  'blue-slime': { element: 'ice', label: 'Gelo' },
  ember: { element: 'fire', label: 'Fogo' },
  'byte-bug': { element: 'electric', label: 'Eletricidade' },
  forest: { element: 'plant', label: 'Planta' },
  'null-ghost': { element: 'shadow', label: 'Sombra' },
};

export function BattleEffects({
  kind,
  stage,
}: {
  kind: string;
  stage: 'cast' | 'impact' | 'heal';
}) {
  return (
    <span
      className={`battle-fx fx-${kind} fx-${stage}`}
      aria-hidden="true"
      data-effect={`${kind}-${stage}`}
    >
      <svg viewBox="0 0 100 100" className="battle-fx-mark" fill="none">
        {kind === 'strike' ? (
          <>
            <path d="M12 80 76 12 48 58Z" />
            <path d="m35 86 52-52-24 42Z" />
          </>
        ) : kind === 'burst' || kind === 'electric' ? (
          <>
            <path d="m60 4-32 51 22-4-10 45 35-58-25 6Z" />
            <path d="m13 25 12 14-9 10M82 53l9 14-13 12" />
          </>
        ) : kind === 'ice' ? (
          <>
            <path d="M50 5v90M11 27l78 46M11 73l78-46M37 15l13 12 13-12M37 85l13-12 13 12M16 43l17-3-4-17M71 77l-4-17 17-3" />
            <path d="m20 90 5-27 10 26m33 0 9-27 7 28" />
          </>
        ) : kind === 'fire' ? (
          <>
            <path d="M49 94C9 91 17 59 32 43c-1 16 7 17 9 6 2-16 16-24 11-44 33 23 16 39 26 48 2-8 6-11 8-12 12 34-2 52-37 53Z" />
            <path d="M49 85c-15-6-10-20 2-37-1 17 17 24-2 37Z" />
          </>
        ) : kind === 'plant' ? (
          <>
            <path d="M18 92c5-42 58-6 60-70M28 70C4 67 10 44 10 44c24-1 25 14 18 26ZM64 52c-4-26 23-31 23-31s7 26-23 31ZM43 78c7-22 27-14 27-14s-4 22-27 14Z" />
          </>
        ) : kind === 'shadow' ? (
          <>
            <path d="M74 14a38 38 0 1 0 12 65A34 34 0 0 1 74 14Z" />
            <path d="m22 17 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" />
          </>
        ) : kind === 'focus' ? (
          <>
            <path d="M34 10h32l24 40-24 40H34L10 50Z" />
            <path d="M50 27v46M27 50h46" />
            <circle cx="50" cy="50" r="30" />
          </>
        ) : (
          <>
            <path d="M19 69c-10-13 3-25 10-32 6-7 11-15 16-25 1 16 12 18 20 25 9 8 26 13 23 30-4 26-57 28-69 2Z" />
            <path d="M32 59c0-7 4-12 8-14M55 73h13" />
          </>
        )}
      </svg>
      {Array.from({ length: 8 }, (_, index) => (
        <i
          key={index}
          className="battle-fx-particle"
          style={
            { '--ray': `${index * 45}deg`, '--delay': `${(index % 3) * 24}ms` } as CSSProperties
          }
        />
      ))}
      <span className="battle-fx-ring" />
    </span>
  );
}
