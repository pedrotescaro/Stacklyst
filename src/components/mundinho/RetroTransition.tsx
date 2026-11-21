import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';

/**
 * - `descend`: the tiles close in on the hero as they drop into the hole.
 * - `boss`: two hard flashes, then a diagonal sweep, like a classic encounter.
 * - `encounter`: two flashes, then blinds closing row by row from alternate
 *   sides, when a creature is met in the grass.
 * - `victory`: a golden flash, then a curtain of tiles falling from the top,
 *   staggered column by column, on the way back after winning a battle.
 * - `defeat`: the same curtain after a red flash.
 * - `return`: a plain iris back to the clearing.
 * Every reveal opens outward from `origin`, normally where the hero stands.
 */
export type RetroTransitionKind =
  | 'descend'
  | 'boss'
  | 'encounter'
  | 'victory'
  | 'defeat'
  | 'return';
export type RetroTransitionState = {
  id: number;
  kind: RetroTransitionKind;
  phase: 'cover' | 'reveal';
  width: number;
  height: number;
  origin: { x: number; y: number };
};

const TILE_MS = 150;
const FLASH_MS = 300;
const SPREAD_MS = {
  descend: 420,
  boss: 380,
  encounter: 380,
  victory: 420,
  defeat: 420,
  return: 320,
} as const;
const REVEAL_SPREAD_MS = 320;
/** Distinct rings or diagonals, so the wipe reads as stepped rather than smooth. */
const BANDS = 9;

export const RETRO_COVER_MS = {
  descend: SPREAD_MS.descend + TILE_MS,
  boss: FLASH_MS + SPREAD_MS.boss + TILE_MS,
  encounter: FLASH_MS + SPREAD_MS.encounter + TILE_MS,
  victory: FLASH_MS + SPREAD_MS.victory + TILE_MS,
  defeat: FLASH_MS + SPREAD_MS.defeat + TILE_MS,
  return: SPREAD_MS.return + TILE_MS,
} as const;
export const RETRO_REVEAL_MS = REVEAL_SPREAD_MS + TILE_MS;

export function useRetroTransition(root: RefObject<HTMLElement | null>) {
  const [transition, setTransition] = useState<RetroTransitionState | null>(null);
  const serial = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
    },
    []
  );

  const play = useCallback(
    (kind: RetroTransitionKind, swap: () => void) => {
      if (timer.current !== null) return;
      const element = root.current;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? true;
      if (!element || reduced) {
        swap();
        return;
      }

      const id = ++serial.current;
      setTransition(measureRetroTransition(element, kind, 'cover', id));
      timer.current = setTimeout(() => {
        flushSync(swap);
        if (!root.current) return;
        setTransition(measureRetroTransition(root.current, kind, 'reveal', id));
        timer.current = setTimeout(() => {
          timer.current = null;
          setTransition(null);
        }, RETRO_REVEAL_MS);
      }, RETRO_COVER_MS[kind]);
    },
    [root]
  );

  return { transition, play };
}

/** Measures the transition area and the hero's feet inside `root`. */
export function measureRetroTransition(
  root: HTMLElement,
  kind: RetroTransitionKind,
  phase: RetroTransitionState['phase'],
  id: number
): RetroTransitionState {
  const box = root.getBoundingClientRect();
  const width = Math.max(1, box.width);
  const height = Math.max(1, box.height);
  const hero = root.querySelector('.world-player .sprite-avatar')?.getBoundingClientRect();
  // Without a hero, open from the middle of the part of the page on screen.
  const top = Math.max(0, -box.top);
  const bottom = Math.min(height, window.innerHeight - box.top);
  const origin =
    hero && hero.width > 0
      ? { x: hero.left + hero.width / 2 - box.left, y: hero.bottom - hero.height * 0.25 - box.top }
      : { x: width / 2, y: bottom > top ? (top + bottom) / 2 : height / 2 };
  return { id, kind, phase, width, height, origin };
}

export function RetroTransition({ state }: { state: RetroTransitionState }) {
  const { kind, phase, width, height, origin } = state;
  // Keep the grid to about 40 tiles on the long side, whatever the page height.
  const tile = Math.max(32, Math.ceil(Math.max(width, height) / 40));
  const cols = Math.ceil(width / tile);
  const rows = Math.ceil(height / tile);
  const corners = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ].map(([x, y]) => Math.hypot(x - origin.x, y - origin.y));
  const reach = Math.max(1, ...corners);
  const cover = phase === 'cover';
  const outcome = kind === 'victory' || kind === 'defeat';
  const flashes = cover && (kind === 'boss' || kind === 'encounter' || outcome);
  const offset = flashes ? FLASH_MS : 0;
  const spread = cover ? SPREAD_MS[kind] : REVEAL_SPREAD_MS;

  const tiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const distance =
        Math.hypot((col + 0.5) * tile - origin.x, (row + 0.5) * tile - origin.y) / reach;
      const order = !cover
        ? distance
        : kind === 'boss'
          ? (col + row) / Math.max(1, cols + rows - 2)
          : kind === 'encounter'
            ? // Each row sweeps from the opposite side of the one above it.
              (row % 2 ? col : cols - 1 - col) / Math.max(1, cols - 1)
            : outcome
              ? // A curtain drops from the top; odd columns trail half a step behind.
                (row + (col % 2) * 0.5) / Math.max(1, rows - 0.5)
              : 1 - distance;
      const band = Math.round(Math.min(1, Math.max(0, order)) * (BANDS - 1)) / (BANDS - 1);
      tiles.push(
        <i key={row * cols + col} style={{ animationDelay: `${offset + band * spread}ms` }} />
      );
    }
  }

  return (
    <div
      className="retro-transition"
      data-kind={kind}
      data-phase={phase}
      aria-hidden="true"
      style={
        {
          '--retro-tile': `${tile}px`,
          gridTemplateColumns: `repeat(${cols}, ${tile}px)`,
        } as CSSProperties
      }
    >
      {flashes && <span className="retro-transition-flash" />}
      {tiles}
    </div>
  );
}
