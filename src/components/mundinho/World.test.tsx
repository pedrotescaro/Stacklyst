import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import World from './World';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';
import {
  canWalk,
  holeMouth,
  insideZone,
  ROCKS,
  WORLD_OBJECTS,
  worldDepth,
} from '../../lib/mundinho/world';
import { ARENA_EXIT_MOUTH, arenaCanWalk as canWalkArena } from '../../lib/mundinho/arena-rules';

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
  it('renders complete rock atlas cells at the same positions and depths as their collisions', () => {
    const { container, rerender } = render(
      <World
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
      />
    );
    for (const rock of ROCKS.objects) {
      expect(container.querySelector(`[data-scenery="${rock.id}"]`)).toHaveStyle({
        left: `${rock.x}px`,
        top: `${rock.y}px`,
        width: '64px',
        height: '32px',
        zIndex: worldDepth(rock.depth),
        backgroundImage: 'url(/assets/mundinho/blue-rocks.png)',
        backgroundPosition: `${-rock.frame * ROCKS.width}px 0px`,
      });
    }
    rerender(
      <World
        area="arena"
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
      />
    );
    expect(container.querySelector('[data-scenery^="rock-"]')).toBeNull();
  });
  it('occludes the player behind tree crowns and the roof, and draws the player in front of their bases', () => {
    for (const [scenery, position, behind] of [
      ['tree-82', { x: 730, y: 520 }, true],
      ['tree-82', { x: 730, y: 558 }, false],
      ['cabin', { x: 688, y: 110 }, true],
      ['cabin', { x: 688, y: 206 }, false],
      ['rock-3', { x: 310, y: 620 }, true],
      ['rock-3', { x: 310, y: 648 }, false],
    ] as const) {
      const { container, unmount } = render(
        <World
          avatar={DEFAULT_AVATAR}
          assetBase="/assets/mundinho"
          username="Jogador"
          initialPosition={position}
          onEncounter={() => {}}
          onChest={async () => ({ awarded: false, reward: 0 })}
        />
      );
      const playerDepth = Number(
        (container.querySelector('.world-player') as HTMLElement).style.zIndex
      );
      const sceneryDepth = Number(
        (container.querySelector(`[data-scenery="${scenery}"]`) as HTMLElement).style.zIndex
      );
      expect(behind ? playerDepth < sceneryDepth : playerDepth > sceneryDepth).toBe(true);
      unmount();
    }
  });
  it('opens the world at a nearby free point when a saved position is inside the chest', () => {
    const savePosition = vi.fn();
    const { container } = render(
      <World
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        initialPosition={{ x: 350, y: 398 }}
        onPositionChange={savePosition}
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
      />
    );
    const player = container.querySelector('.world-player') as HTMLElement;
    const position = { x: parseFloat(player.style.left), y: parseFloat(player.style.top) };
    expect(canWalk(position.x, position.y)).toBe(true);
    expect(savePosition).toHaveBeenCalledWith(position);
    expect(container.querySelector('[data-prop="chest"]')).toHaveStyle({
      transform: 'translateY(2px)',
    });
    expect(container.querySelector('[data-prop="signpost"]')).toHaveStyle({
      transform: 'translateY(3px)',
    });
  });
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
  it('rustles the grass, ducks a creature into it and pops it back out', () => {
    vi.useFakeTimers();
    const { container } = render(
      <World
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
      />
    );
    // The first creature (level 1) starts its 16 s cycle out of the grass.
    const slime = () =>
      container.querySelector('[data-creature="syntax-slime"]')!.closest('.world-habitat')!;
    const grass = () => container.querySelectorAll('.world-foliage-sprite')[1] as HTMLElement;
    const tick = (count: number) => act(() => vi.advanceTimersByTime(count * 250));
    expect(slime()).toHaveClass('is-visible');
    expect(slime().querySelector('.world-creature-burrow')).not.toBeNull();
    expect(grass()).not.toHaveClass('is-rustling');
    tick(52);
    expect(slime()).toHaveClass('is-hidden');
    expect(grass()).toHaveClass('is-rustling');
    tick(2);
    expect(grass()).not.toHaveClass('is-rustling');
    tick(7);
    expect(slime()).toHaveClass('is-hidden');
    expect(grass()).toHaveClass('is-rustling');
    tick(3);
    expect(slime()).toHaveClass('is-visible');
    expect(grass()).not.toHaveClass('is-rustling');
    // Level 4+ creatures never hide and their grass stays still.
    tick(52);
    const sentinel = container
      .querySelector('[data-creature="iron-beetle"]')!
      .closest('.world-habitat')!;
    expect(sentinel).toHaveClass('is-visible');
    vi.useRealTimers();
  });
  it('leaves going back to the page header and groups the HUD into toolbars', () => {
    render(
      <World
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
        onInventory={() => {}}
      />
    );
    expect(screen.queryByRole('button', { name: 'Voltar para Trilhas' })).not.toBeInTheDocument();
    const actions = screen.getByRole('toolbar', { name: 'Ações' });
    expect(
      within(actions)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label'))
    ).toEqual(['Diálogo', 'Visualizar mapa completo']);
    const map = within(actions).getByRole('button', { name: 'Visualizar mapa completo' });
    fireEvent.click(map);
    expect(map).toHaveAttribute('aria-pressed', 'true');
    expect(map).toHaveClass('is-active');
    expect(
      within(screen.getByRole('toolbar', { name: 'Menu' })).getAllByRole('button')
    ).toHaveLength(2);
  });
  it('draws the hole and the rift on the ground, under a player standing on them', () => {
    const { container } = render(
      <World
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        initialPosition={{ x: 600, y: 392 }}
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
      />
    );
    const depth = (selector: string) =>
      Number((container.querySelector(selector) as HTMLElement).style.zIndex);
    expect(depth('.world-player')).toBeGreaterThan(depth('[data-object="portal"]'));
    expect(depth('[data-object="boss"]')).toBe(depth('[data-object="portal"]'));
  });
  it('drops the player in once when their feet reach the opening, not the rim', () => {
    const portal = WORLD_OBJECTS.find((o) => o.id === 'portal')!;
    const mouth = holeMouth(portal);
    expect(canWalk(mouth.x, mouth.y)).toBe(true);
    // The lower rim, where the old trigger sat, is still outside the opening.
    expect(insideZone(mouth, { x: portal.x, y: portal.y })).toBe(false);
    expect(insideZone(mouth, { x: portal.x + 4, y: mouth.y + 3 })).toBe(true);

    vi.useFakeTimers();
    let frame = 0;
    const frames = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++frame, callback);
      return frame;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
    const step = (time: number) => {
      const pending = [...frames.values()];
      frames.clear();
      act(() => pending.forEach((callback) => callback(time)));
    };
    const enterArena = vi.fn();
    const { container } = render(
      <World
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        initialPosition={{ x: mouth.x, y: mouth.y + 30 }}
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
        onPortal={enterArena}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar diálogo' }));
    fireEvent.keyDown(window, { key: 'w' });
    for (let t = 1; t < 40 && !enterArena.mock.calls.length; t++) step(t * 40);
    fireEvent.keyUp(window, { key: 'w' });
    expect(enterArena).toHaveBeenCalledOnce();
    const player = container.querySelector('.world-player') as HTMLElement;
    expect(player).toHaveClass('is-descending');
    expect(player).toHaveStyle({ left: `${mouth.x}px`, top: `${mouth.y}px` });
    for (let t = 40; t < 60; t++) step(t * 40);
    expect(enterArena).toHaveBeenCalledOnce();

    // Nothing took the player away: controls return, but standing still on
    // the opening does not drop them in again until they step out.
    act(() => vi.advanceTimersByTime(1700));
    step(3000);
    expect(player).not.toHaveClass('is-descending');
    expect(enterArena).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
  it('drops the player into the arena stairs the same way as the clearing hole', () => {
    expect(canWalkArena(ARENA_EXIT_MOUTH.x, ARENA_EXIT_MOUTH.y)).toBe(true);
    vi.useFakeTimers();
    let frame = 0;
    const frames = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++frame, callback);
      return frame;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
    const step = (time: number) => {
      const pending = [...frames.values()];
      frames.clear();
      act(() => pending.forEach((callback) => callback(time)));
    };
    const leave = vi.fn();
    const { container } = render(
      <World
        area="arena"
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        initialPosition={{ x: ARENA_EXIT_MOUTH.x, y: 380 }}
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
        onPortal={leave}
      />
    );
    fireEvent.keyDown(window, { key: 's' });
    for (let t = 1; t < 60 && !leave.mock.calls.length; t++) step(t * 40);
    fireEvent.keyUp(window, { key: 's' });
    expect(leave).toHaveBeenCalledOnce();
    const player = container.querySelector('.world-player') as HTMLElement;
    expect(player).toHaveClass('is-descending');
    expect(player).toHaveStyle({
      left: `${ARENA_EXIT_MOUTH.x}px`,
      top: `${ARENA_EXIT_MOUTH.y}px`,
    });
    for (let t = 60; t < 80; t++) step(t * 40);
    expect(leave).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
  it('opens the concealed rift independently of multiplayer', () => {
    const boss = vi.fn(),
      arena = vi.fn();
    expect(canWalk(126, 566)).toBe(true);
    render(
      <World
        avatar={DEFAULT_AVATAR}
        assetBase="/assets/mundinho"
        username="Jogador"
        initialPosition={{ x: 126, y: 566 }}
        onEncounter={() => {}}
        onChest={async () => ({ awarded: false, reward: 0 })}
        onPortal={arena}
        onBoss={boss}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar diálogo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fenda das Sombras' }));
    expect(boss).toHaveBeenCalledOnce();
    expect(arena).not.toHaveBeenCalled();
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
    expect(container.querySelector('.world-peer')).toHaveStyle({ translate: '448px 340px' });
    expect(container.querySelector('.world-peer .pixel-avatar')).toHaveAttribute(
      'data-silhouette',
      'feminine'
    );
    expect(
      parseFloat(
        (container.querySelector('.world-peer [data-layer="outfit"]') as HTMLElement).style
          .backgroundPositionY
      )
    ).toBeCloseTo((67 / 95) * 100, 3);
    expect(container.querySelector('.world-map')).toHaveStyle({
      backgroundImage: 'url("/assets/mundinho/blue-arena.png")',
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
