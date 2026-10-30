import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorldDialogue } from './WorldDialogue';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';

describe('Ada conversations', () => {
  it('shows all three branches, changes speaker/portrait, and returns to Ada with a distinct reply', () => {
    const close = vi.fn();
    render(
      <WorldDialogue
        text="ada"
        conversation
        avatar={{
          ...DEFAULT_AVATAR,
          gender: 'feminine',
          skin: 8,
          hair: 4,
          hairTint: '#2563eb',
          outfit: 5,
          accessory: 3,
        }}
        username="killua"
        assetBase="/assets/mundinho"
        onClose={close}
      />
    );
    const topics = [
      'Como enfrento os bugs?',
      'Quero mudar meu visual.',
      'O que há nesta clareira?',
    ];
    for (const [index, question] of topics.entries()) {
      const ada = screen.getByRole('img', { name: 'Retrato de Ada' });
      expect(ada).toHaveAttribute('data-silhouette', 'feminine');
      fireEvent.click(screen.getByRole('button', { name: question }));
      const panel = screen.getByRole('dialog', { name: 'killua' });
      expect(within(panel).getByText(question)).toBeInTheDocument();
      const player = screen.getByRole('img', { name: 'Retrato de killua' });
      expect(player).toHaveAttribute('data-silhouette', 'feminine');
      expect(player.querySelector('[data-portrait-layer="accessory"]')).toHaveStyle({
        backgroundPosition: '60% 0px',
      });
      fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
      expect(screen.getByRole('dialog', { name: 'Ada' })).toHaveTextContent(
        ['Aproxime-se de uma criatura', 'Abra o editor', 'A placa tem'][index]
      );
      fireEvent.click(screen.getByRole('button', { name: 'Perguntar outra coisa' }));
    }
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: topics[0] })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'd' });
    expect(screen.getByRole('button', { name: topics[1] })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });
});
