import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdventureHub } from './AdventureHub';
import { BattleAudio } from '../../lib/mundinho/battleAudio';
import {
  DEFAULT_AVATAR,
  type AdventureState,
  type Avatar,
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
  it('previews and saves the portrait silhouette with the existing wardrobe', async () => {
    let saved = state(null);
    const transport = vi.fn<AdventureTransport>().mockImplementation(async (action) => {
      if (action?.type === 'avatar') saved = { ...saved, avatar: action.avatar as Avatar };
      return saved;
    });
    render(<AdventureHub transport={transport} courses={[]} onCourse={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Personalizar avatar' }));
    const portrait = screen.getByRole('img', { name: 'Retrato de Jogador' });
    expect(portrait).toHaveAttribute('data-silhouette', 'masculine');
    fireEvent.click(screen.getByRole('radio', { name: 'Feminino' }));
    expect(portrait).toHaveAttribute('data-silhouette', 'feminine');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(transport).toHaveBeenCalledWith({
        type: 'avatar',
        avatar: { ...DEFAULT_AVATAR, gender: 'feminine' },
      })
    );
    expect(saved.avatar).toEqual({ ...DEFAULT_AVATAR, gender: 'feminine' });
  });
  it('moves the action cursor with WASD/arrows and submits only on confirmation', async () => {
    const active = state('active');
    let finish: (next: AdventureState) => void = () => {};
    const transport = vi.fn<AdventureTransport>().mockImplementation((action) =>
      action
        ? new Promise((resolve) => {
            finish = resolve;
          })
        : Promise.resolve(active)
    );
    await openBattle(transport);
    const apply = screen.getByRole('button', { name: /^Aplicar conceito/ });
    const debug = screen.getByRole('button', { name: /^Depurar/ });
    const refactor = screen.getByRole('button', { name: /^Refatorar/ });
    const heading = screen.getByRole('heading', { level: 1 });
    fireEvent.keyDown(heading, { key: 'ArrowLeft' });
    expect(refactor).toHaveFocus();
    expect(refactor).toHaveAttribute('data-selected', 'true');
    fireEvent.keyDown(refactor, { key: 'w' });
    expect(debug).toHaveFocus();
    fireEvent.keyDown(debug, { key: 'ArrowDown' });
    expect(refactor).toHaveFocus();
    fireEvent.keyDown(refactor, { key: 'd' });
    expect(apply).toHaveFocus();
    fireEvent.keyDown(apply, { key: 'd' });
    expect(debug).toHaveFocus();
    expect(transport.mock.calls.filter(([action]) => action)).toHaveLength(0);
    fireEvent.keyDown(debug, { key: 'Enter' });
    fireEvent.keyDown(debug, { key: 'Enter', repeat: true });
    fireEvent.keyDown(debug, { key: 'ArrowRight' });
    expect(debug).toBeDisabled();
    expect(transport.mock.calls.filter(([action]) => action)).toHaveLength(1);
    expect(transport).toHaveBeenCalledWith({
      type: 'battle-skill',
      battle: 'battle-id',
      turn: 0,
      skill: 'focus',
    });
    const question = structuredClone(active);
    question.battle!.question = {
      id: 'question',
      concept: 'Laços',
      prompt: 'Qual resultado?',
      options: ['1', '2'],
      difficulty: 'Fácil',
    };
    finish(question);
    await screen.findByText('Qual resultado?');
    fireEvent.keyDown(screen.getByText('Qual resultado?'), { key: 'd' });
    expect(transport.mock.calls.filter(([action]) => action)).toHaveLength(1);
    transport.mockResolvedValueOnce(active);
    fireEvent.click(screen.getByRole('button', { name: 'A1' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /^Depurar/ })).toHaveFocus());
  });
  it('supports direct touch/click and leaves other controls outside command navigation', async () => {
    const transport = vi.fn<AdventureTransport>().mockResolvedValue(state('active'));
    await openBattle(transport);
    const sound = screen.getByRole('button', { name: 'Silenciar sons do jogo' });
    sound.focus();
    expect(fireEvent.keyDown(sound, { key: 'ArrowRight' })).toBe(true);
    expect(sound).toHaveFocus();
    expect(screen.getByRole('button', { name: /^Aplicar conceito/ })).toHaveAttribute(
      'data-selected',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: /^Refatorar/ }));
    await waitFor(() =>
      expect(transport).toHaveBeenCalledWith({
        type: 'battle-skill',
        battle: 'battle-id',
        turn: 0,
        skill: 'burst',
      })
    );
    expect(transport.mock.calls.filter(([action]) => action)).toHaveLength(1);
  });
  it('exposes both health values to assistive technology and keeps their numeric labels', async () => {
    const active = state('active');
    active.battle!.hp = 47;
    active.battle!.enemyHp = 12;
    await openBattle(async () => active);
    expect(screen.getByRole('progressbar', { name: 'Vida de Jogador' })).toHaveAttribute(
      'aria-valuenow',
      '47'
    );
    expect(screen.getByRole('progressbar', { name: 'Vida de Gosma de sintaxe' })).toHaveAttribute(
      'aria-valuenow',
      '12'
    );
    expect(screen.getByText('47 / 100 PV')).toBeInTheDocument();
    expect(screen.getByText('12 / 100 PV')).toBeInTheDocument();
  });
  it('saves and reloads an expanded hair color without changing the hairstyle', async () => {
    let saved = state(null);
    saved = { ...saved, avatar: { ...DEFAULT_AVATAR, hair: 1 } };
    const transport = vi.fn<AdventureTransport>().mockImplementation(async (action) => {
      if (action?.type === 'avatar')
        saved = { ...saved, avatar: action.avatar as typeof saved.avatar };
      return saved;
    });
    const { unmount } = render(
      <AdventureHub transport={transport} courses={[]} onCourse={() => {}} />
    );
    await screen.findByText('Nível 1');
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar avatar' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Cabelo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cor do cabelo: #2563eb' }));
    expect(screen.getByRole('button', { name: 'Cor do cabelo: #2563eb' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(transport).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'avatar',
          avatar: expect.objectContaining({ hair: 1, hairColor: 3, hairTint: '#2563eb' }),
        })
      )
    );
    unmount();
    render(<AdventureHub transport={transport} courses={[]} onCourse={() => {}} />);
    await screen.findByText('Nível 1');
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar avatar' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Cabelo' }));
    expect(screen.getByRole('button', { name: 'Cor do cabelo: #2563eb' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cor do cabelo: Preto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(saved.avatar.hairColor).toBe(0));
    expect(saved.avatar.hairTint).toBeUndefined();
  });
  it('previews and saves a selected hair color, including black', async () => {
    const initial = state(null);
    initial.avatar.hairColor = 1;
    const transport = vi
      .fn<AdventureTransport>()
      .mockImplementation(async (action) =>
        action?.type === 'avatar'
          ? { ...initial, avatar: action.avatar as typeof initial.avatar }
          : initial
      );
    render(<AdventureHub transport={transport} courses={[]} onCourse={() => {}} />);
    await screen.findByText('Nível 1');
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar avatar' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Cabelo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cor do cabelo: Roxo' }));
    expect(screen.getByRole('button', { name: 'Cor do cabelo: Roxo' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cor do cabelo: Preto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(transport).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'avatar',
          avatar: expect.objectContaining({ hairColor: 0 }),
        })
      )
    );
  });
  it('shows healing and the elemental counter even when net health increases', async () => {
    const active = state('active');
    active.battle!.hp = 30;
    active.battle!.skill = 'focus';
    active.battle!.creature = 'ember';
    active.battle!.question = {
      id: 'question',
      concept: 'Laços',
      prompt: 'Qual resultado?',
      options: ['1', '2', '3', '4'],
      difficulty: 'Fácil',
    };
    const next = structuredClone(active);
    next.battle!.hp = 39;
    next.battle!.enemyHp = 82;
    next.battle!.question = null;
    const sound = vi.spyOn(BattleAudio.prototype, 'play');
    await openBattle(async (action) => (action?.type === 'battle-answer' ? next : active));
    fireEvent.click(screen.getByRole('button', { name: 'A1' }));
    await waitFor(() =>
      expect(document.querySelector('[data-effect="focus-impact"]')).toBeInTheDocument()
    );
    expect(screen.getByText('+20')).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector('[data-effect="fire-impact"]')).toBeInTheDocument()
    );
    expect(screen.getByText('−11')).toBeInTheDocument();
    expect(sound).toHaveBeenCalledWith('heal');
    sound.mockRestore();
  });
  it('keeps the world language synchronized with the selected course', async () => {
    const changed = vi.fn();
    const props = { transport: async () => state(null), courses: [], onCourse: () => {} };
    const { rerender } = render(
      <AdventureHub {...props} languagePreference="TS" onLanguageChange={changed} />
    );
    expect(screen.getByRole('combobox', { name: 'Linguagem do Mundinho' })).toHaveValue('TS');
    rerender(<AdventureHub {...props} languagePreference="PYTHON" onLanguageChange={changed} />);
    expect(screen.getByRole('combobox', { name: 'Linguagem do Mundinho' })).toHaveValue('PYTHON');
    fireEvent.change(screen.getByRole('combobox', { name: 'Linguagem do Mundinho' }), {
      target: { value: 'JS' },
    });
    expect(changed).toHaveBeenCalledWith('JS');
  });
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
    const retreat = screen.getByRole('button', { name: 'Fugir' });
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
    fireEvent.click(screen.getByRole('button', { name: 'Fugir' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão');
    expect(screen.getByRole('button', { name: 'Fugir' })).toBeEnabled();
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
