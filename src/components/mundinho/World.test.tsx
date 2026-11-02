import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import World from './World';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
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
  it('shows the high-level encounters and lets a nearby player enter the portal', () => {
    const enterArena = vi.fn();
    render(
      <World
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        initialPosition={{ x: 600, y: 460 }}
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
        onPortal={enterArena}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar diálogo' }));
    expect(screen.getByText('Nv. 4')).toBeInTheDocument();
    expect(screen.getByText('Nv. 5')).toBeInTheDocument();
    expect(screen.getByText('Nv. 10')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Descer para a arena multiplayer' }));
    expect(enterArena).toHaveBeenCalledTimes(1);
  });
  it('renders a remote player with their name, position and saved outfit in the arena', () => {
    const { container } = render(
      <World
        area="arena"
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Anfitrião"
        initialPosition={{ x: 320, y: 340 }}
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
        peers={[
          {
            id: 'friend',
            name: 'Killua',
            username: 'killua',
            language: 'PYTHON',
            level: 4,
            online: true,
            avatar: { ...DEFAULT_AVATAR, outfit: 4, gender: 'feminine', hairTint: '#b4a2eb' },
            position: { x: 448, y: 340, direction: 'left', walking: true },
          },
        ]}
      />
    );
    expect(screen.getByText('Killua')).toBeInTheDocument();
    expect(screen.getByText('Anfitrião')).toBeInTheDocument();
    expect(container.querySelector('.world-peer')).toHaveStyle({ left: '448px', top: '340px' });
    expect(container.querySelector('.world-peer .pixel-avatar')).toHaveAttribute(
      'data-silhouette',
      'feminine'
    );
    expect(
      parseFloat(
        (container.querySelector('.world-peer [data-layer="outfit"]') as HTMLElement).style
          .backgroundPositionY
      )
    ).toBeCloseTo(40.4255, 3);
    expect(container.querySelector('.world-map')).toHaveStyle({
      backgroundImage: 'url("/assets/mundinho/arena.png")',
    });
    expect(container.querySelector('.world-habitat')).not.toBeInTheDocument();
  });
  it('opens Ada only within reach, pauses the map during dialogue and restores focus on exit', () => {
    const { container } = render(
      <div className="adventure">
        <World
          avatar={DEFAULT_AVATAR}
          assetBase="/assets/mundinho"
          username="Jogador"
          initialPosition={{ x: 680, y: 260 }}
          onEncounter={() => {}}
          onChest={async () => ({ awarded: true, reward: 10 })}
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
          onChest={async () => ({ awarded: true, reward: 10 })}
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
            onChest={async () => ({ awarded: true, reward: 10 })}
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

describe('Daily clearing chest', () => {
  const props = {
    avatar: DEFAULT_AVATAR,
    assetBase: '/assets/mundinho',
    username: 'Jogador',
    initialPosition: { x: 350, y: 435 },
    onEncounter: () => {},
    chestDay: '2026-11-02',
  };
  const chestSprite = (container: HTMLElement) => container.querySelector('[data-prop="chest"]');
  const enter = () => fireEvent.click(screen.getByRole('button', { name: 'Fechar diálogo' }));
  it('keeps the chest closed until the server confirms, blocks repeat requests and animates once', async () => {
    let resolve!: (value: { awarded: boolean; reward: number }) => void;
    const claim = vi.fn(
      () =>
        new Promise<{ awarded: boolean; reward: number }>((done) => {
          resolve = done;
        })
    );
    const { container } = render(<World {...props} onChest={claim} />);
    enter();
    const chest = screen.getByRole('button', { name: /Baú da clareira/ });
    fireEvent.click(chest);
    fireEvent.click(chest);
    expect(claim).toHaveBeenCalledTimes(1);
    expect(chestSprite(container)).toHaveAttribute('data-chest-state', 'closed');
    expect(screen.queryByText(/moedas creditadas/)).not.toBeInTheDocument();
    await act(async () => resolve({ awarded: true, reward: 10 }));
    expect(chestSprite(container)).toHaveAttribute('data-chest-state', 'opening');
    await screen.findByText(/10 moedas creditadas no seu saldo/);
    expect(chestSprite(container)).toHaveAttribute('data-chest-state', 'open');
    enter();
    fireEvent.click(screen.getByRole('button', { name: /Baú da clareira/ }));
    expect(screen.getByText(/já abriu o baú hoje/)).toBeInTheDocument();
    expect(claim).toHaveBeenCalledTimes(1);
  });
  it('does not show a reward or open sprite on failure and permits retry', async () => {
    const claim = vi.fn().mockRejectedValue(new Error('offline'));
    const { container } = render(<World {...props} onChest={claim} />);
    enter();
    fireEvent.click(screen.getByRole('button', { name: /Baú da clareira/ }));
    await screen.findByText(/Não foi possível abrir o baú/);
    expect(chestSprite(container)).toHaveAttribute('data-chest-state', 'closed');
    enter();
    fireEvent.click(screen.getByRole('button', { name: /Baú da clareira/ }));
    await waitFor(() => expect(claim).toHaveBeenCalledTimes(2));
  });
  it('shows an existing claim as open after reload and a new day as closed', () => {
    const claim = vi.fn();
    const { container, rerender } = render(<World {...props} chestClaimed onChest={claim} />);
    enter();
    expect(chestSprite(container)).toHaveAttribute('data-chest-state', 'open');
    fireEvent.click(screen.getByRole('button', { name: /Baú da clareira/ }));
    expect(claim).not.toHaveBeenCalled();
    rerender(<World {...props} chestDay="2026-11-03" chestClaimed={false} onChest={claim} />);
    expect(chestSprite(container)).toHaveAttribute('data-chest-state', 'closed');
  });
  it('handles a claim made in another session without announcing another credit', async () => {
    const { container } = render(
      <World {...props} onChest={async () => ({ awarded: false, reward: 10 })} />
    );
    enter();
    fireEvent.click(screen.getByRole('button', { name: /Baú da clareira/ }));
    await screen.findByText(/já abriu o baú hoje/);
    expect(chestSprite(container)).toHaveAttribute('data-chest-state', 'open');
    expect(screen.queryByText('+10 moedas')).not.toBeInTheDocument();
  });
  it('confirms the reward without waiting for animation under reduced motion', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const { container } = render(
      <World {...props} onChest={async () => ({ awarded: true, reward: 10 })} />
    );
    enter();
    fireEvent.keyDown(document.body, { key: 'e' });
    await screen.findByText(/10 moedas creditadas no seu saldo/);
    expect(chestSprite(container)).toHaveAttribute('data-chest-state', 'open');
  });
});
