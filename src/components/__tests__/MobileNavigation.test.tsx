import { createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@/components/Sidebar';
import type { NotionEditorRef } from '@/components/editor/NotionEditor';

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
vi.mock('next/dynamic', async () => {
  const { forwardRef, useImperativeHandle, useRef } = await import('react');
  return {
    default: () =>
      forwardRef<
        NotionEditorRef,
        { value: string; onChange: (value: string) => void; placeholder?: string }
      >(function MockEditor({ value, onChange, placeholder }, ref) {
        const inputRef = useRef<HTMLTextAreaElement>(null);
        useImperativeHandle(ref, () => ({
          insertText: (text) => onChange(value + text),
          focus: () => inputRef.current?.focus(),
          toggleBold: vi.fn(),
          toggleItalic: vi.fn(),
          toggleUnderline: vi.fn(),
          setTextColor: vi.fn(),
          clearFormatting: vi.fn(),
          insertCodeBlock: vi.fn(),
          insertBlock: vi.fn(),
        }));
        return (
          <textarea
            ref={inputRef}
            aria-label={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        );
      }),
  };
});

afterEach(() => vi.unstubAllGlobals());

describe('responsive web navigation', () => {
  it('offers active account, adding an account and logging out in the desktop account menu', () => {
    render(<Sidebar user={user} />);
    fireEvent.click(screen.getByRole('button', { name: /pessoa.*Abrir menu do perfil/ }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
    expect(
      within(menu).getByRole('menuitem', { name: 'Adicionar uma conta existente' })
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('menuitem', { name: `Sair de @${user.username}` })
    ).toBeInTheDocument();
  });
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
    route.pathname = '/ranking';
    view.rerender(<Sidebar user={user} />);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
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

  it('uploads and publishes a clipboard image without duplicating it or intercepting plain text', async () => {
    const attachmentUrl = '/api/posts/media/pasted-image';
    const fetchMock = vi.fn(async (url: RequestInfo | URL, _options?: RequestInit) => ({
      ok: true,
      json: async () =>
        url === '/api/posts/media' ? { url: attachmentUrl } : { id: 'post-1', count: 0 },
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<Sidebar user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nova postagem' }));
    const dialog = await screen.findByRole('dialog', { name: 'Criar nova publicação' });
    const editor = within(dialog).getByRole('textbox', { name: 'O que você está pensando?' });

    const textPaste = createEvent.paste(editor, {
      clipboardData: { files: [], items: [{ kind: 'string', type: 'text/plain' }] },
    });
    fireEvent(editor, textPaste);
    expect(textPaste.defaultPrevented).toBe(false);

    const file = new File(['image'], 'clipboard.png', { type: 'image/png' });
    const closeButton = within(dialog).getByRole('button', { name: 'Fechar rascunho' });
    const imagePaste = createEvent.paste(closeButton, {
      clipboardData: {
        files: [file],
        items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
      },
    });
    fireEvent(closeButton, imagePaste);
    expect(imagePaste.defaultPrevented).toBe(true);
    const publish = within(dialog).getByRole('button', { name: 'Publicar' });
    await waitFor(() => expect(publish).toBeEnabled());

    const uploads = fetchMock.mock.calls.filter(([url]) => url === '/api/posts/media');
    expect(uploads).toHaveLength(1);
    expect((uploads[0][1]?.body as FormData).get('file')).toBe(file);
    fireEvent.click(publish);
    await waitFor(() => {
      const request = fetchMock.mock.calls.find(([url]) => url === '/api/posts');
      expect(JSON.parse(request?.[1]?.body as string)).toMatchObject({
        body: '',
        attachments: [{ type: 'image', url: attachmentUrl }],
      });
    });
  });

  it('applies the picker size limit to pasted images and allows a valid retry', async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL, _options?: RequestInit) => ({
      ok: true,
      json: async () =>
        url === '/api/posts/media' ? { url: '/api/posts/media/pasted-gif' } : { count: 0 },
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<Sidebar user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nova postagem' }));
    const dialog = await screen.findByRole('dialog', { name: 'Criar nova publicação' });
    const editor = within(dialog).getByRole('textbox', { name: 'O que você está pensando?' });
    const large = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });
    fireEvent.paste(editor, { clipboardData: { files: [large], items: [] } });
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('até 5 MB');
    expect(fetchMock.mock.calls.some(([url]) => url === '/api/posts/media')).toBe(false);

    const picker = within(dialog).getByRole('dialog', { name: 'Adicionar imagens' });
    const gif = new File(['gif'], 'clipboard.gif', { type: 'image/gif' });
    fireEvent.paste(picker, {
      clipboardData: {
        files: [],
        items: [{ kind: 'file', type: gif.type, getAsFile: () => gif }],
      },
    });
    const publish = within(dialog).getByRole('button', { name: 'Publicar' });
    await waitFor(() => expect(publish).toBeEnabled());
    const uploads = fetchMock.mock.calls.filter(([url]) => url === '/api/posts/media');
    expect(uploads).toHaveLength(1);
    expect((uploads[0][1]?.body as FormData).get('file')).toBe(gif);
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('publishes the floating composer through the posts API', async () => {
    const createdPost = { id: 'post-1', body: 'Minha nova postagem de teste' };
    const fetchMock = vi.fn(async (url: RequestInfo | URL, _options?: RequestInit) => ({
      ok: true,
      json: async () => (url === '/api/posts' ? createdPost : { count: 0 }),
    }));
    const onCreated = vi.fn();
    window.addEventListener('stacklyst:post-created', onCreated);
    vi.stubGlobal('fetch', fetchMock);
    render(<Sidebar user={user} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nova postagem' }));
    const dialog = await screen.findByRole('dialog', { name: 'Criar nova publicação' });
    expect(within(dialog).getByRole('button', { name: 'Publicar' })).toBeDisabled();
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'O que você está pensando?' }), {
      target: { value: 'Minha nova postagem de teste' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publicar' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/posts',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-idempotency-key': expect.any(String),
          },
        })
      )
    );
    const postCall = fetchMock.mock.calls.find(([url]) => url === '/api/posts');
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/posts')).toHaveLength(1);
    expect(JSON.parse((postCall?.[1] as RequestInit).body as string)).toEqual({
      body: 'Minha nova postagem de teste',
      language: null,
      audience: 'everyone',
      attachments: [],
      music: null,
      poll: null,
    });
    await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
    expect((onCreated.mock.calls[0][0] as CustomEvent).detail).toEqual(createdPost);
    expect(within(dialog).getByRole('button', { name: 'Publicado' })).toBeDisabled();
    expect(localStorage.getItem('stacklyst-post-draft:u1')).toBeNull();
    window.removeEventListener('stacklyst:post-created', onCreated);
    await waitFor(
      () =>
        expect(
          screen.queryByRole('dialog', { name: 'Criar nova publicação' })
        ).not.toBeInTheDocument(),
      { timeout: 2000 }
    );
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
      ['Vagas', '/jobs'],
      ['Eventos', '/events'],
      ['Avaliação de Código', '/evaluations'],
      ['Configurações', '/settings'],
    ]) {
      expect(within(drawer).getByRole('link', { name })).toHaveAttribute('href', href);
    }
    expect(within(drawer).queryByText('Indique amigos')).not.toBeInTheDocument();
    expect(within(drawer).queryByRole('link', { name: 'Duelos' })).not.toBeInTheDocument();
    expect(within(drawer).queryByRole('link', { name: 'Certificados' })).not.toBeInTheDocument();
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
    fireEvent.change(await screen.findByRole('textbox', { name: 'O que você está pensando?' }), {
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
    expect(await screen.findByRole('textbox', { name: 'O que você está pensando?' })).toHaveValue(
      'Meu texto salvo'
    );
  });
});
