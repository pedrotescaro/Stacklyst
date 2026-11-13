import type { CSSProperties } from 'react';
import effects from '../../lib/mundinho/combat-effects.json';
import { adventureAsset } from './assets';
import './battle-effects.css';

export const CREATURE_ELEMENTS: Record<string, { element: string; label: string }> = {
  'syntax-slime': { element: 'slime', label: 'Gosma' },
  'blue-slime': { element: 'ice', label: 'Gelo' },
  ember: { element: 'fire', label: 'Fogo' },
  'byte-bug': { element: 'electric', label: 'Eletricidade' },
  forest: { element: 'plant', label: 'Planta' },
  'null-ghost': { element: 'shadow', label: 'Sombra' },
  'iron-beetle': { element: 'electric', label: 'Eletricidade' },
  'wild-ember': { element: 'fire', label: 'Fogo' },
  'null-titan': { element: 'shadow', label: 'Sombra' },
};

/** Six-frame pixel sequences follow the cast/contact/recovery battle timing. */
export function BattleEffects({
  kind,
  stage,
  assetBase = '/assets/mundinho',
}: {
  kind: string;
  stage: 'cast' | 'impact' | 'heal';
  assetBase?: string;
}) {
  const kindIndex = Math.max(0, effects.kinds.indexOf(kind));
  const row = kindIndex * effects.stages.length + effects.stages.indexOf(stage);
  return (
    <span
      className={`battle-fx battle-fx-sprites fx-${kind} fx-${stage}`}
      aria-hidden="true"
      data-effect={`${kind}-${stage}`}
    >
      <span
        key={`${kind}-${stage}`}
        className="battle-fx-spritesheet"
        data-sprite-sequence={row}
        style={
          {
            backgroundImage: `url(${adventureAsset(effects.file, assetBase)})`,
            backgroundSize: `${effects.frames * 100}% ${effects.rows * 100}%`,
            backgroundPositionY: `${(row / (effects.rows - 1)) * 100}%`,
            '--fx-duration': `${effects.durations[stage]}ms`,
          } as CSSProperties
        }
      />
    </span>
  );
}
