import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@/components/Sidebar';

const route = vi.hoisted(() => ({ pathname: '/feed' }));
const user = { id: 'u1', username: 'pessoa', role: 'USER' as const };
vi.mock('@/lib/client/current-user', () => ({
  getCurrentUser: vi.fn(async () => user),
  invalidateCurrentUser: vi.fn(),
}));
vi.mock('@/components/auth/AccountSwitcher', () => ({
  AccountSwitcher: () => <button>Contas</button>,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
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
    route.pathname = '/feed';
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

  it('shows the header only on feed and keeps duels in the bottom navigation', () => {
    const view = render(<Sidebar user={user} />);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    const bottom = document.querySelector('nav.fixed') as HTMLElement;
    expect(within(bottom).getByRole('link', { name: 'Duelos' })).toHaveAttribute('href', '/duels');
    expect(within(bottom).queryByRole('link', { name: 'Notificações' })).not.toBeInTheDocument();
    expect(within(bottom).getByRole('button', { name: 'Nova postagem' })).toBeInTheDocument();
    route.pathname = '/duels';
    view.rerender(<Sidebar user={user} />);
    expect(screen.queryByRole('button', { name: 'Abrir menu' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nova postagem' })).not.toBeInTheDocument();
    expect(within(bottom).getByRole('link', { name: 'Duelos' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('opens and closes the feed composer from the floating button, restoring focus', async () => {
    render(<Sidebar user={user} />);
    const button = screen.getByRole('button', { name: 'Nova postagem' });
    button.focus();
    fireEvent.click(button);
    const dialog = await screen.findByRole('dialog', { name: 'Criar nova publicação' });
    expect(within(dialog).getByRole('heading', { name: 'Nova postagem' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Fechar rascunho' })).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(button).toHaveFocus());
  });

  it('publishes the floating composer through the posts API', async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL, _options?: RequestInit) => ({
      ok: true,
      json: async () => ({ count: 0 }),
    }));
    const onCreated = vi.fn();
    window.addEventListener('stacklyst:post-created', onCreated);
    vi.stubGlobal('fetch', fetchMock);
    render(<Sidebar user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nova postagem' }));
    const dialog = await screen.findByRole('dialog', { name: 'Criar nova publicação' });
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Texto da publicação' }), {
      target: { value: 'Minha nova postagem de teste' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Postar' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/posts',
        expect.objectContaining({ method: 'POST' })
      )
    );
    const postCall = fetchMock.mock.calls.find(([url]) => url === '/api/posts');
    expect(JSON.parse((postCall?.[1] as RequestInit).body as string).body).toContain(
      'Minha nova postagem de teste'
    );
    expect(onCreated).toHaveBeenCalledOnce();
    window.removeEventListener('stacklyst:post-created', onCreated);
    vi.unstubAllGlobals();
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
