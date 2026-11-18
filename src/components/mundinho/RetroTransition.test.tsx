import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { RETRO_COVER_MS, RetroTransition, type RetroTransitionState } from './RetroTransition';

const state = (patch: Partial<RetroTransitionState>): RetroTransitionState => ({
  id: 1,
  kind: 'descend',
  phase: 'cover',
  width: 320,
  height: 320,
  origin: { x: 16, y: 16 },
  ...patch,
});
const delays = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.retro-transition > i'), (tile) =>
    parseFloat(tile.style.animationDelay)
  );

it('closes on the hero and opens from the hero in stepped rings', () => {
  const cover = render(<RetroTransition state={state({})} />);
  const closing = delays(cover.container);
  expect(closing).toHaveLength(100);
  // The tile under the hero is covered last, the far corner first.
  expect(closing[0]).toBe(Math.max(...closing));
  expect(closing[99]).toBe(0);
  expect(new Set(closing).size).toBeLessThanOrEqual(9);
  expect(Math.max(...closing) + 150).toBeLessThanOrEqual(RETRO_COVER_MS.descend);

  const reveal = render(<RetroTransition state={state({ phase: 'reveal' })} />);
  const opening = delays(reveal.container);
  expect(opening[0]).toBe(0);
  expect(opening[99]).toBe(Math.max(...opening));
});

it('flashes before the rift wipe and leaves time for it', () => {
  const { container } = render(<RetroTransition state={state({ kind: 'boss' })} />);
  expect(container.querySelector('.retro-transition-flash')).not.toBeNull();
  const wipe = delays(container);
  expect(Math.min(...wipe)).toBeGreaterThanOrEqual(300);
  expect(Math.max(...wipe) + 150).toBeLessThanOrEqual(RETRO_COVER_MS.boss);
});

it('closes after a victory with a golden flash and a curtain falling from the top', () => {
  const { container } = render(
    <RetroTransition state={state({ kind: 'victory', width: 320, height: 320 })} />
  );
  expect(container.querySelector('.retro-transition')).toHaveAttribute('data-kind', 'victory');
  expect(container.querySelector('.retro-transition-flash')).not.toBeNull();
  const delays = Array.from(container.querySelectorAll<HTMLElement>('.retro-transition > i'), (i) =>
    parseFloat(i.style.animationDelay)
  );
  const at = (row: number, col: number) => delays[row * 10 + col];
  // The top row falls first, the bottom row last; odd columns trail the even ones.
  expect(at(0, 0)).toBeLessThan(at(9, 0));
  expect(at(0, 0)).toBeLessThanOrEqual(at(0, 1));
  expect(Math.min(...delays)).toBeGreaterThanOrEqual(300);
  expect(Math.max(...delays) + 150).toBeLessThanOrEqual(RETRO_COVER_MS.victory);
});
