import { fireEvent, render, screen, within } from '@testing-library/react';
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
