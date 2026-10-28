import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@/components/Sidebar';

const user = { id: 'u1', username: 'pessoa', role: 'USER' as const };
vi.mock('@/lib/client/current-user', () => ({
  getCurrentUser: vi.fn(async () => user),
  invalidateCurrentUser: vi.fn(),
}));
vi.mock('@/components/auth/AccountSwitcher', () => ({
  AccountSwitcher: () => <button>Contas</button>,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/feed',
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));
vi.mock('next/dynamic', () => ({
  default:
    () =>
    ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
      <textarea
        aria-label="Texto da publicação"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
}));

describe('responsive web navigation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('opens the drawer with real destinations and closes with Escape, returning focus', async () => {
    render(<Sidebar user={user} />);
    const open = screen.getByRole('button', { name: 'Abrir menu' });
    open.focus();
    fireEvent.click(open);
    const drawer = screen.getByRole('dialog', { name: 'Menu de navegação' });
    for (const [name, href] of [
      ['Itens salvos', '/bookmarks'],
      ['Títulos', '/achievements'],
      ['Ranking', '/ranking'],
      ['Vagas', '/jobs'],
      ['Eventos', '/events'],
      ['Duelos', '/duels'],
      ['Avaliação de Código', '/evaluations'],
      ['Configurações', '/settings'],
    ]) {
      expect(within(drawer).getByRole('link', { name })).toHaveAttribute('href', href);
    }
    expect(within(drawer).queryByText('Indique amigos')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Menu de navegação' })).not.toBeInTheDocument()
    );
    expect(open).toHaveFocus();
  });

  it('opens the composer from drafts', async () => {
    render(<Sidebar user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Menu de navegação' })).getByRole('button', {
        name: 'Rascunhos',
      })
    );
    expect(
      await screen.findByRole('dialog', { name: 'Criar nova publicação' })
    ).toBeInTheDocument();
  });

  it('saves and restores a draft for the current account', async () => {
    const view = render(<Sidebar user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Menu de navegação' })).getByRole('button', {
        name: 'Rascunhos',
      })
    );
    fireEvent.change(await screen.findByRole('textbox', { name: 'Texto da publicação' }), {
      target: { value: 'Meu texto salvo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Fechar rascunho' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar rascunho' }));
    expect(JSON.parse(localStorage.getItem('stacklyst-post-draft:u1')!).body).toBe(
      'Meu texto salvo'
    );
    expect(localStorage.getItem('stacklyst-post-draft:outra')).toBeNull();
    view.unmount();
    render(<Sidebar user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Menu de navegação' })).getByRole('button', {
        name: 'Rascunhos',
      })
    );
    expect(await screen.findByRole('textbox', { name: 'Texto da publicação' })).toHaveValue(
      'Meu texto salvo'
    );
  });
});
