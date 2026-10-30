import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileActions } from './ProfileActions';

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  );
});
afterEach(() => vi.unstubAllGlobals());

const props = {
  userId: 'other',
  username: 'developer',
  following: true,
  onFollowToggle: vi.fn().mockResolvedValue(undefined),
  onChallenge: vi.fn(),
};

describe('visitor profile actions', () => {
  it('groups options, message and following in reference order and hides secondary actions', () => {
    render(<ProfileActions {...props} />);
    const actions = screen.getByRole('group', { name: 'Ações do perfil' });
    const controls = [...actions.querySelectorAll('button, a')];
    expect(
      controls.map((control) => control.getAttribute('aria-label') || control.textContent)
    ).toEqual(['Mais opções do perfil', 'Enviar mensagem para @developer', 'Seguindo']);
    expect(screen.getByRole('link', { name: 'Enviar mensagem para @developer' })).toHaveAttribute(
      'href',
      '/messages?to=developer'
    );
    expect(screen.queryByText('Desafiar')).not.toBeInTheDocument();
    expect(screen.queryByText('Bloquear @developer')).not.toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Seguindo' }));
    expect(screen.getByRole('button', { name: 'Seguindo' })).toBeInTheDocument();
  });

  it('opens the menu with keyboard and activates the existing challenge flow', async () => {
    const user = userEvent.setup();
    render(<ProfileActions {...props} />);
    const trigger = screen.getByRole('button', { name: 'Mais opções do perfil' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    const challenge = await screen.findByRole('menuitem', { name: 'Desafiar' });
    expect(challenge).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(props.onChallenge).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('keeps blocking behind menu and confirmation, supports cancel and returns focus', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ blocked: true }));
    vi.stubGlobal('fetch', fetchMock);
    render(<ProfileActions {...props} />);
    const trigger = screen.getByRole('button', { name: 'Mais opções do perfil' });
    await user.click(trigger);
    await user.click(await screen.findByRole('menuitem', { name: 'Bloquear @developer' }));
    expect(await screen.findByRole('dialog', { name: 'Bloquear @developer?' })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.click(trigger);
    await user.click(await screen.findByRole('menuitem', { name: 'Bloquear @developer' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar bloqueio' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/users/other/block', { method: 'POST' })
    );
  });
});
