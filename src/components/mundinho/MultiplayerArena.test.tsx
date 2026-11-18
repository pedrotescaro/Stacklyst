import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MultiplayerArena } from './MultiplayerArena';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';
import type { ArenaState } from '../../lib/mundinho/arena-types';

describe('PvP presentation and Portuguese text', () => {
  it.each(['host', 'guest'])(
    'faces the opponent forward for the %s viewer and preserves accents',
    (selfId) => {
      const data: ArenaState = {
        selfId,
        serverTime: new Date().toISOString(),
        friends: [],
        invitations: [],
        room: {
          id: 'room',
          hostId: 'host',
          version: 1,
          invitedName: null,
          question: null,
          players: ['host', 'guest'].map((id, i) => ({
            id,
            name: i ? 'João' : 'Anfitrião',
            username: id,
            avatar: DEFAULT_AVATAR,
            language: i ? 'TS' : 'JS',
            level: 1,
            online: true,
            position: { x: 320 + i * 128, y: 340, direction: 'left', walking: false },
          })),
          match: {
            id: 'match',
            status: 'active',
            ready: ['host', 'guest'],
            hp: { host: 100, guest: 70 },
            actorId: selfId === 'host' ? 'guest' : 'host',
            turn: 1,
            scenario: 0,
            level: 1,
            deadline: new Date().toISOString(),
            winnerId: null,
            log: ['Código correto! 30 de dano no adversário.'],
          },
        },
      };
      const { container } = render(
        <MultiplayerArena
          initialState={data}
          language="JS"
          assetBase="/assets/mundinho"
          onLeave={() => {}}
          transport={vi.fn().mockResolvedValue(data)}
        />
      );
      const opponent = container.querySelector('[data-pvp-side="opponent"]') as HTMLElement;
      const self = container.querySelector('[data-pvp-side="self"]') as HTMLElement;
      expect(
        within(opponent).getByRole('img', { name: 'Avatar olhando para down' })
      ).toBeInTheDocument();
      expect(
        within(self).getByRole('img', { name: 'Avatar olhando para right' })
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Arena subterrânea' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Voltar à clareira' })).toBeInTheDocument();
      expect(screen.getByText('Código correto! 30 de dano no adversário.')).toBeInTheDocument();
      expect(self).toHaveTextContent('(você)');
      expect(container.textContent).toContain('programação');
      expect(container.textContent).not.toMatch(/Ã[\u0080-\u00bf]|Â·|â€¦|\ufffd/);
    }
  );
});

function lobbyState(): ArenaState {
  return {
    selfId: 'a',
    serverTime: new Date().toISOString(),
    friends: [],
    invitations: [],
    room: {
      id: 'room',
      hostId: 'a',
      version: 1,
      invitedName: null,
      question: null,
      match: null,
      players: ['a', 'b'].map((id) => ({
        id,
        name: id === 'a' ? 'Você' : 'Amigo',
        username: id,
        avatar: DEFAULT_AVATAR,
        language: 'JS',
        level: 4,
        online: true,
        position: { x: 320, y: 340, direction: 'down', walking: false },
      })),
    },
  };
}
it('opens player details in a dismissible modal without a side panel', () => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
  const data = lobbyState();
  render(
    <MultiplayerArena
      initialState={data}
      language="JS"
      assetBase="/assets/mundinho"
      onLeave={() => {}}
      transport={vi.fn().mockResolvedValue(data)}
    />
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Adversário e batalha' }));
  const dialog = screen.getByRole('dialog', { name: 'Seu adversário' });
  expect(within(dialog).getByText('Amigo')).toBeInTheDocument();
  expect(within(dialog).getByText(/Nível 4/)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar jogadores' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it.each([
  ['Aplicar conceito', 'strike'],
  ['Depurar', 'focus'],
  ['Refatorar', 'burst'],
])('submits the selected %s skill', (name, skill) => {
  const data = lobbyState();
  data.room!.match = {
    id: 'battle',
    status: 'active',
    ready: ['a', 'b'],
    hp: { a: 100, b: 100 },
    actorId: 'a',
    turn: 0,
    scenario: 0,
    level: 1,
    deadline: new Date().toISOString(),
    winnerId: null,
    log: [],
  };
  const transport = vi.fn().mockResolvedValue(data);
  render(
    <MultiplayerArena
      initialState={data}
      language="JS"
      assetBase="/assets/mundinho"
      onLeave={() => {}}
      transport={transport}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));
  expect(transport).toHaveBeenCalledWith({
    type: 'attack',
    roomId: 'room',
    matchId: 'battle',
    turn: 0,
    skill,
  });
});

it('keeps the arena on screen while the player drops into the exit stairs', async () => {
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
  const data = lobbyState();
  const transport = vi.fn(async (action: { type: string }) =>
    action.type === 'leave' ? { ...data, room: null } : data
  );
  const onLeave = vi.fn();
  const { container } = render(
    <MultiplayerArena
      initialState={data}
      language="JS"
      assetBase="/assets/mundinho"
      onLeave={onLeave}
      transport={transport as never}
    />
  );
  await screen.findByRole('button', { name: 'Voltar para a clareira' });
  const player = () => container.querySelector('.world-player') as HTMLElement;
  let time = 0;
  const walk = (key: string, done: () => boolean) => {
    fireEvent.keyDown(window, { key });
    for (let i = 0; i < 80 && !done(); i++) step((time += 40));
    fireEvent.keyUp(window, { key });
  };
  walk('d', () => parseFloat(player().style.left) >= 384);
  walk('s', () => onLeave.mock.calls.length > 0);
  expect(onLeave).toHaveBeenCalledWith('portal');
  expect(transport).toHaveBeenCalledWith({ type: 'leave', roomId: 'room' });
  // The server's empty room must not replace the scene mid-animation.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(container.querySelector('.world-player.is-descending')).not.toBeNull();
  vi.unstubAllGlobals();
});

it('flashes the duelist who takes a blow, pops the damage and lunges the attacker', async () => {
  const data = lobbyState();
  data.room!.match = {
    id: 'match',
    status: 'active',
    ready: ['a', 'b'],
    hp: { a: 100, b: 100 },
    actorId: 'a',
    turn: 0,
    scenario: 0,
    level: 1,
    deadline: new Date(Date.now() + 120_000).toISOString(),
    winnerId: null,
    log: [],
  } as never;
  const struck = structuredClone(data);
  struck.room!.version = 2;
  struck.room!.match!.hp = { a: 100, b: 70 };
  const transport = vi.fn(async (action: { type: string }) =>
    action.type === 'sync' ? struck : data
  );
  const { container } = render(
    <MultiplayerArena
      initialState={data}
      language="JS"
      assetBase="/assets/mundinho"
      onLeave={() => {}}
      transport={transport as never}
    />
  );
  const opponent = () => container.querySelector('[data-pvp-side="opponent"]') as HTMLElement;
  const self = () => container.querySelector('[data-pvp-side="self"]') as HTMLElement;
  expect(opponent()).not.toHaveClass('is-hit');
  await waitFor(() => expect(opponent()).toHaveClass('is-hit'), { timeout: 3000 });
  expect(within(opponent()).getByText('−30')).toBeInTheDocument();
  expect(opponent().querySelector('.battle-hit-spark')).not.toBeNull();
  expect(self()).toHaveClass('is-attacking');
  expect(self()).not.toHaveClass('is-hit');
  expect(container.querySelector('.ad-pvp-scene')).not.toHaveClass('is-shaking');
});

it('answers a concept quiz turn instead of opening the code editor', async () => {
  const data = lobbyState();
  data.room!.match = {
    id: 'match',
    status: 'active',
    ready: ['a', 'b'],
    hp: { a: 100, b: 100 },
    actorId: 'a',
    turn: 0,
    scenario: 0,
    level: 1,
    deadline: new Date(Date.now() + 120_000).toISOString(),
    winnerId: null,
    log: [],
    exerciseTurn: 0,
    skill: 'strike',
  } as never;
  data.room!.question = {
    id: 'gen-1-JS',
    kind: 'concept',
    concept: 'Funções',
    difficulty: 'Fácil',
    prompt: 'Por que dividir um programa em funções?',
    options: ['Lento', 'Memória', 'Reutilizar e organizar', 'Obrigatório'],
  };
  const transport = vi.fn(async () => data);
  render(
    <MultiplayerArena
      initialState={data}
      language="JS"
      assetBase="/assets/mundinho"
      onLeave={() => {}}
      transport={transport as never}
    />
  );
  expect(screen.getByText('Quiz de conceito')).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: /Desafio de código/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^C/ }));
  await waitFor(() =>
    expect(transport).toHaveBeenCalledWith({
      type: 'answer',
      roomId: 'room',
      matchId: 'match',
      turn: 0,
      questionId: 'gen-1-JS',
      answer: 2,
    })
  );
});
