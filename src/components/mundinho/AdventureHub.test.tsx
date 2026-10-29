import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdventureHub } from './AdventureHub';
import { BattleAudio } from '../../lib/mundinho/battleAudio';
import {
  DEFAULT_AVATAR,
  type AdventureState,
  type AdventureTransport,
} from '../../lib/mundinho/types';
vi.mock('./World', () => ({
  default: ({
    initialPosition,
    onPositionChange,
  }: {
    initialPosition: { x: number; y: number };
    onPositionChange: (p: { x: number; y: number }) => void;
  }) => (
    <section aria-label="Clareira">
      <p>
        Posição: {initialPosition.x}, {initialPosition.y}
      </p>
      <button onClick={() => onPositionChange({ x: 310, y: 330 })}>Mover</button>
    </section>
  ),
}));
const state = (status: 'active' | 'won' | 'fled' | null): AdventureState => ({
  username: 'Jogador',
  coins: 0,
  totalXp: 0,
  avatar: DEFAULT_AVATAR,
  inventory: [],
  equipped: {},
  transactions: [],
  missions: [],
  checkin: { day: '2026-10-29', claimed: false, cycle: 0, reward: 10, streak: 0 },
  battle: status
    ? {
        id: 'battle-id',
        language: 'PYTHON',
        creature: 'syntax-slime',
        hp: 100,
        enemyHp: 100,
        turn: 0,
        status,
        question: null,
        feedback: 'Escolha uma habilidade.',
        reward: 0,
        skill: null,
      }
    : null,
});
beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
const openBattle = async (transport: AdventureTransport) => {
  render(<AdventureHub transport={transport} courses={[]} onCourse={() => {}} />);
  await screen.findByText('Nível 1');
  fireEvent.click(screen.getByRole('button', { name: /Batalhas de Conceitos/ }));
};
describe('Mundinho battle navigation', () => {
  it('keeps a native sound toggle applied while the preference bridge responds', async () => {
    const preference = vi.fn();
    const { rerender } = render(
      <AdventureHub
        transport={async () => state('active')}
        courses={[]}
        onCourse={() => {}}
        soundPreference={false}
        onSoundPreferenceChange={preference}
      />
    );
    await screen.findByText('Nível 1');
    fireEvent.click(screen.getByRole('button', { name: /Batalhas de Conceitos/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ativar sons do jogo' }));
    expect(screen.getByRole('button', { name: 'Silenciar sons do jogo' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(preference).toHaveBeenCalledWith(true);
    rerender(
      <AdventureHub
        transport={async () => state('active')}
        courses={[]}
        onCourse={() => {}}
        soundPreference={true}
        onSoundPreferenceChange={preference}
      />
    );
    expect(screen.getByRole('button', { name: 'Silenciar sons do jogo' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
  it('plays confirmed victory cues and automatically returns to the world with rewards', async () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const active = state('active');
    active.battle!.question = {
      id: 'question',
      concept: 'Listas',
      prompt: 'Qual é o último elemento?',
      options: ['1', '2', '3', '4'],
      difficulty: 'Fácil',
    };
    const won = state('won');
    won.battle!.enemyHp = 0;
    won.battle!.reward = 15;
    const sound = vi.spyOn(BattleAudio.prototype, 'play');
    await openBattle(async (action) => (action?.type === 'battle-answer' ? won : active));
    fireEvent.click(screen.getByRole('button', { name: 'A1' }));
    await screen.findByText('Voltando ao Mundinho em instantes…');
    await waitFor(
      () => expect(screen.getByRole('region', { name: 'Clareira' })).toBeInTheDocument(),
      { timeout: 4000 }
    );
    expect(
      screen.getByText('Vitória! +15 moedas e +30 XP. Recompensa registrada.')
    ).toBeInTheDocument();
    expect(sound).toHaveBeenCalledWith('attack');
    expect(sound).toHaveBeenCalledWith('hit');
    expect(sound).toHaveBeenCalledWith('victory');
    sound.mockRestore();
  });
  it('animates fleeing only after success and returns directly to the world', async () => {
    const transport = vi
      .fn<AdventureTransport>()
      .mockImplementation(async (action) =>
        state(action?.type === 'battle-flee' ? 'fled' : 'active')
      );
    const { container } = render(
      <AdventureHub transport={transport} courses={[]} onCourse={() => {}} />
    );
    await screen.findByText('Nível 1');
    fireEvent.click(screen.getByRole('button', { name: 'Entrar no Mundinho' }));
    await screen.findByRole('region', { name: 'Clareira' });
    fireEvent.click(screen.getByRole('button', { name: 'Mover' }));
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a tela inicial' }));
    fireEvent.click(screen.getByRole('button', { name: /Batalhas de Conceitos/ }));
    const retreat = screen.getByRole('button', { name: 'Recuar para a clareira' });
    fireEvent.click(retreat);
    fireEvent.click(retreat);
    await waitFor(() => expect(container.querySelector('.combat-flee')).toBeInTheDocument());
    expect(screen.queryByText('Prepare sua aventura')).not.toBeInTheDocument();
    await screen.findByRole('region', { name: 'Clareira' });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Meu Mundinho');
    expect(screen.getByText('Posição: 310, 330')).toBeInTheDocument();
    expect(transport.mock.calls.filter(([action]) => action?.type === 'battle-flee')).toHaveLength(
      1
    );
  });
  it('keeps the arena usable if retreat cannot be saved', async () => {
    const transport: AdventureTransport = async (action) => {
      if (action) throw new Error('Sem conexão');
      return state('active');
    };
    await openBattle(transport);
    fireEvent.click(screen.getByRole('button', { name: 'Recuar para a clareira' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão');
    expect(screen.getByRole('button', { name: 'Recuar para a clareira' })).toBeEnabled();
    expect(screen.queryByRole('region', { name: 'Clareira' })).not.toBeInTheDocument();
  });
  it('offers language only, with readable level requirements instead of creature selection', async () => {
    await openBattle(async () => state(null));
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Linguagem do Combate');
    expect(screen.getAllByText(/Nível 2 · Requer nível 2/)).toHaveLength(2);
    expect(screen.queryByText('Criatura Oponente')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Explorar o Mundinho' }));
    await screen.findByRole('region', { name: 'Clareira' });
  });
  it('shows the result without a duplicated preparation panel', async () => {
    await openBattle(async () => state('won'));
    expect(screen.queryByText('Prepare sua aventura')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Voltar ao Mundinho' })[0]);
    await screen.findByRole('region', { name: 'Clareira' });
  });
});
