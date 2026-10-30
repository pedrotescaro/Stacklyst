import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import World from './World';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('World keyboard ownership', () => {
  it('opens Ada only within reach, pauses the map during dialogue and restores focus on exit', () => {
    const { container } = render(
      <div className="adventure">
        <World
          avatar={DEFAULT_AVATAR}
          assetBase="/assets/mundinho"
          username="Jogador"
          initialPosition={{ x: 680, y: 260 }}
          onEncounter={() => {}}
          onChest={async () => {}}
        />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar diálogo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Conversar com Ada' }));
    expect(screen.getByRole('dialog', { name: 'Ada' })).toBeInTheDocument();
    expect(container.querySelector('.world-map')).toHaveAttribute('inert');
    expect(container.querySelector('.world-controls')).toHaveAttribute('hidden');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('.world-map')).not.toHaveAttribute('inert');
    expect(screen.getByLabelText(/^Mundinho RPG/)).toHaveFocus();
  });
  it('prevents arrow scrolling after focus moves to a game control or the page', () => {
    const { unmount } = render(
      <div className="adventure">
        <World
          avatar={DEFAULT_AVATAR}
          assetBase="/assets/mundinho"
          username="Jogador"
          onEncounter={() => {}}
          onChest={async () => {}}
        />
      </div>
    );
    const control = screen.getByRole('button', { name: 'Visualizar mapa completo' });
    control.focus();
    expect(fireEvent.keyDown(control, { key: 'ArrowDown' })).toBe(false);
    expect(fireEvent.keyDown(document.body, { key: 'ArrowUp' })).toBe(false);
    expect(fireEvent.keyDown(control, { key: ' ' })).toBe(true);
    unmount();
    expect(fireEvent.keyDown(document.body, { key: 'ArrowDown' })).toBe(true);
  });
  it('leaves text fields and navigation outside the game usable', () => {
    render(
      <>
        <button>Fora do jogo</button>
        <div className="adventure">
          <input aria-label="Texto" />
          <World
            avatar={DEFAULT_AVATAR}
            assetBase="/assets/mundinho"
            username="Jogador"
            onEncounter={() => {}}
            onChest={async () => {}}
          />
        </div>
      </>
    );
    expect(fireEvent.keyDown(screen.getByLabelText('Texto'), { key: 'ArrowDown' })).toBe(true);
    expect(
      fireEvent.keyDown(screen.getByRole('button', { name: 'Fora do jogo' }), { key: 'ArrowDown' })
    ).toBe(true);
  });
});
