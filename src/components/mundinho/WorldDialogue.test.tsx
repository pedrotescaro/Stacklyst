import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorldDialogue } from './WorldDialogue';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';

const player = {
  ...DEFAULT_AVATAR,
  gender: 'feminine' as const,
  skin: 8,
  hair: 4,
  hairTint: '#2563eb',
  outfit: 5,
  accessory: 3,
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Ada conversations', () => {
  it('walks every topic page by page, switching speaker and portrait', () => {
    const close = vi.fn();
    render(
      <WorldDialogue
        text="ada"
        conversation
        avatar={player}
        username="killua"
        assetBase="/assets/mundinho"
        onClose={close}
      />
    );
    const topics = [
      ['Quem é você?', ['Ada Lovelace', 'compor música']],
      ['Como enfrento os bugs?', ['Aproxime-se de uma criatura', 'Depurar', 'Leia a pergunta']],
      ['Quero mudar meu visual.', ['Abra o editor', 'Salve as alterações']],
      ['O que há nesta clareira?', ['A placa tem', 'O buraco com escadaria', 'Titã do Vazio']],
    ] as const;
    for (const [question, pages] of topics) {
      const ada = screen.getByRole('img', { name: 'Retrato de Ada' });
      expect(ada).toHaveAttribute('data-silhouette', 'feminine');
      expect(ada.querySelector('[data-portrait-layer="ada"]')).toHaveStyle({
        backgroundImage: 'url(/assets/mundinho/ada-portrait.png)',
      });
      fireEvent.click(screen.getByRole('button', { name: question }));
      const panel = screen.getByRole('dialog', { name: 'killua' });
      expect(within(panel).getAllByText(question).length).toBeGreaterThan(0);
      const portrait = screen.getByRole('img', { name: 'Retrato de killua' });
      expect(portrait.querySelector('[data-portrait-layer="accessory"]')).toHaveStyle({
        backgroundPosition: '60% 0px',
      });
      for (const page of pages) {
        fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
        expect(screen.getByRole('dialog', { name: 'Ada' })).toHaveTextContent(page);
      }
      expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Perguntar outra coisa' }));
    }
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: topics[0][0] })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'd' });
    expect(screen.getByRole('button', { name: topics[1][0] })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });

  it('types the line out, lets Enter show it at once, and only then offers choices', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    render(
      <WorldDialogue
        text="ada"
        conversation
        avatar={player}
        username="killua"
        assetBase="/assets/mundinho"
        onClose={() => {}}
      />
    );
    const dialog = screen.getByRole('dialog', { name: 'Ada' });
    // Screen readers get the whole line immediately; the typing is visual only.
    expect(dialog).toHaveAccessibleDescription(/Sobre o que vamos conversar\?$/);
    expect(screen.queryByRole('button', { name: 'Quem é você?' })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(140));
    const text = dialog.querySelector('.world-dialogue-text')!;
    expect(text.firstChild?.textContent).toBe('Oi, killua');
    expect(dialog.querySelector('.world-dialogue-pending')).toHaveTextContent(/^! Sou a Ada/);
    fireEvent.keyDown(dialog, { key: 'Enter' });
    expect(screen.getByRole('button', { name: 'Quem é você?' })).toBeInTheDocument();
    expect(dialog.querySelector('.world-dialogue-pending')).toHaveTextContent('');
  });
});
