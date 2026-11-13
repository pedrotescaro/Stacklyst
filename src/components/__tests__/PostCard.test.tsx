import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PostCard } from '../PostCard';

const pushMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const pythonPost = {
  id: 'post-1',
  title: 'Python hello world',
  body: 'Como rodar um print simples?',
  language: 'PYTHON',
  code_snippet: 'print("hello world")',
  image_url: null,
  created_at: '2026-08-14T12:00:00.000Z',
  view_count: 0,
  author: {
    username: 'pedrotescaro',
    avatar_url: null,
    total_xp: 1200,
  },
  _count: {
    answers: 0,
  },
  votes: [],
  bookmarks: [],
  upvotes: 0,
  quizzes: [],
};

describe('PostCard', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    pushMock.mockClear();
  });

  it('quietly undoes a like when the network request fails', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<PostCard post={pythonPost} flat />);
    const like = screen.getByRole('button', { name: /^Curtir/ });
    await user.click(like);
    await waitFor(() => expect(like).toHaveAttribute('aria-pressed', 'false'));
    expect(like).toHaveAccessibleName(/: 0$/);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('renders legacy code snippets as executable feed blocks', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, output: 'ran from api' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<PostCard post={pythonPost} flat />);

    const runButton = screen.getByRole('button', { name: /Executar/i });
    expect(runButton).toBeInTheDocument();
    expect(document.body).toHaveTextContent('print("hello world")');

    await user.click(runButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/run', expect.any(Object)));
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(requestInit.body))).toEqual({
      code: 'print("hello world")',
      language: 'python',
    });
    expect(await screen.findByText('ran from api')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('allows the reply link to navigate and does not navigate when interacting with code', () => {
    const { container } = render(<PostCard post={pythonPost} flat />);
    const reply = screen.getByTitle('Responder');
    const event = new Event('click', { bubbles: true, cancelable: true });
    fireEvent(reply, event);
    // The footer stops propagation but must not cancel the link's default action.
    expect(event.defaultPrevented).toBe(false);
    expect(reply).toHaveAttribute('href', '/post/post-1');
    fireEvent.click(container.querySelector('pre')!);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('restores the saved button appearance and callback state when removing a bookmark fails', async () => {
    const user = userEvent.setup();
    const onBookmarkToggle = vi.fn();
    let completeRequest!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          completeRequest = resolve;
        })
    );
    vi.stubGlobal('fetch', fetchMock);
    render(
      <PostCard
        post={{ ...pythonPost, bookmarks: [{ id: 'bookmark-1' }] }}
        flat
        onBookmarkToggle={onBookmarkToggle}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Remover dos salvos' }));
    const pendingButton = screen.getByRole('button', { name: 'Salvar' });
    expect(pendingButton.querySelector('svg')).not.toHaveClass('fill-current');
    expect(onBookmarkToggle).toHaveBeenCalledWith('post-1', false);
    completeRequest(Response.json({ error: 'Não foi possível remover.' }, { status: 400 }));

    const restoredButton = await screen.findByRole('button', { name: 'Remover dos salvos' });
    expect(restoredButton).not.toBeDisabled();
    expect(restoredButton.querySelector('svg')).toHaveClass('fill-current');
    expect(onBookmarkToggle.mock.calls).toEqual([
      ['post-1', false],
      ['post-1', true],
    ]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/posts/post-1/bookmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked: false }),
    });
  });

  it('sends only one bookmark request for a double click while the first request is pending', async () => {
    const user = userEvent.setup();
    const onBookmarkToggle = vi.fn();
    let completeRequest!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          completeRequest = resolve;
        })
    );
    vi.stubGlobal('fetch', fetchMock);
    render(
      <PostCard
        post={{ ...pythonPost, bookmarks: [{ id: 'bookmark-1' }] }}
        flat
        onBookmarkToggle={onBookmarkToggle}
      />
    );

    await user.dblClick(screen.getByRole('button', { name: 'Remover dos salvos' }));
    const pendingButton = screen.getByRole('button', { name: 'Salvar' });
    expect(pendingButton).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/posts/post-1/bookmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked: false }),
    });
    expect(onBookmarkToggle).toHaveBeenCalledExactlyOnceWith('post-1', false);
    completeRequest(Response.json({ success: true, bookmarked: false }));

    await waitFor(() => expect(pendingButton).not.toBeDisabled());
    expect(screen.getByRole('button', { name: 'Salvar' }).querySelector('svg')).not.toHaveClass(
      'fill-current'
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('opens deletion outside animated feed items and cancels without deleting or navigating', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(
      <div style={{ transform: 'translateY(0)', overflow: 'hidden' }}>
        <PostCard post={pythonPost} isOwner flat />
      </div>
    );
    const menu = screen.getByRole('button', { name: 'Mais opções' });
    await user.click(menu);
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    const dialog = screen.getByRole('dialog', { name: 'Deletar postagem?' });
    expect(container).not.toContainElement(dialog);
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    const cancel = within(dialog).getByRole('button', { name: 'Cancelar' });
    expect(cancel).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('button', { name: 'Deletar' })).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(menu).toHaveFocus();
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('keeps a failed deletion visible for retry and removes the post after confirmation succeeds', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    let completeDelete!: (response: Response) => void;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 'TEMPORARY',
            message: 'Servidor indisponível. Tente novamente.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            completeDelete = resolve;
          })
      );
    vi.stubGlobal('fetch', fetchMock);
    render(<PostCard post={pythonPost} isOwner flat onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: 'Mais opções' }));
    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(fetchMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Deletar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
    expect(screen.getByRole('alert')).not.toHaveTextContent('TEMPORARY');
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Deletar' }));
    expect(screen.getByRole('button', { name: 'Deletando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: 'Deletar postagem?' })).toBeInTheDocument();
    completeDelete(new Response(null, { status: 204 }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('post-1'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith('/api/posts/post-1', { method: 'DELETE' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('renders author display name, flags, title, username underneath, and low level badge', () => {
    const postWithProfile = {
      ...pythonPost,
      author: {
        username: 'pedrotescaro',
        avatar_url: null,
        total_xp: 1200, // Level 2 (< 5)
        avatar_config: {
          displayName: 'Pedro',
          profileStyle: {
            flag: 'BR',
            title: {
              id: 'first-steps',
              name: 'Iniciante',
              color: '#0083fe',
              rarity: 'common',
            },
          },
        },
      },
    };

    render(<PostCard post={postWithProfile} flat />);

    // Display name shown
    expect(screen.getByText('Pedro')).toBeInTheDocument();
    // Username shown with @
    expect(screen.getByText('@pedrotescaro')).toBeInTheDocument();
    // Flag shown
    expect(screen.getByAltText(/Bandeira: Brasil/i)).toBeInTheDocument();
    // Title shown
    expect(screen.getByText('Iniciante')).toBeInTheDocument();
    expect(screen.getByLabelText('Nível 2')).toBeInTheDocument();
    // Language tag in header should NOT be present (the code block itself handles language in console)
    const pythonPills = screen.queryAllByText('PYTHON');
    // Only in code block console header, not as a standalone tag in header
    expect(pythonPills.length).toBeLessThanOrEqual(1);
  });

  it.each([0, 1000, 2000, 3000, 4000, 5000, 29000, 99000])(
    'displays the level at %i XP without a threshold',
    (xp) => {
      const highLevelPost = {
        ...pythonPost,
        author: {
          username: 'masterdev',
          total_xp: xp,
        },
      };

      render(<PostCard post={highLevelPost} flat />);
      expect(screen.getByLabelText(`Nível ${Math.floor(xp / 1000) + 1}`)).toBeInTheDocument();
    }
  );
});
