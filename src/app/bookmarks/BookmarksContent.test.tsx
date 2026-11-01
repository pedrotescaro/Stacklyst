import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { BookmarksContent } from './BookmarksContent';

vi.mock('@/components/PlatformPageShell', () => ({
  PlatformPageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

const base = {
  title: '',
  body: '',
  created_at: '2026-11-01T12:00:00.000Z',
  view_count: 0,
  author: { username: 'ana', total_xp: 100 },
  _count: { answers: 0 },
  bookmarks: [{ id: 'saved' }],
};
const posts = [
  { ...base, id: 'z-first', body: 'Leitura para estudar depois.' },
  {
    ...base,
    id: 'a-second',
    body: 'Exemplo de TypeScript.',
    code_snippet: 'const value = 1;',
    language: 'TS',
  },
  {
    ...base,
    id: 'm-third',
    music: {
      trackId: '11dFghVXANMlKmJXsNCbNl',
      title: 'Best Friend',
      artist: 'Artista',
      artworkUrl: null,
    },
  },
];
const user = { id: 'viewer', username: 'viewer', total_xp: 200 };

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi
      .fn()
      .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Bookmarks collection', () => {
  it('filters actual saved content, searches music and restores all results', async () => {
    render(<BookmarksContent user={user} initialPosts={posts} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByLabelText('3 publicações salvas')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Código' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
    expect(screen.getByText('Exemplo de TypeScript.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mídia' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
    expect(screen.getByText('Best Friend')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Buscar itens salvos' }));
    const input = screen.getByLabelText('Buscar nos itens salvos');
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: 'sem resultado' } });
    expect(screen.getByRole('heading', { name: 'Nenhum item encontrado' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos os itens' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByLabelText('Buscar nos itens salvos')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar itens salvos' })).toHaveFocus();
  });

  it('uses only one request and restores the original saved order on failure', async () => {
    let finish!: (response: Response) => void;
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        })
    );
    vi.stubGlobal('fetch', fetcher);
    render(<BookmarksContent user={user} initialPosts={posts} />);
    const first = screen.getAllByRole('article')[0];
    fireEvent.click(within(first).getByRole('button', { name: 'Remover dos salvos' }));
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith('/api/posts/z-first/bookmark', { method: 'POST' });
    expect(screen.getByLabelText('2 publicações salvas')).toBeInTheDocument();
    await act(async () => finish(Response.json({ message: 'Falhou' }, { status: 500 })));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('Leitura para estudar depois.');
    expect(screen.getAllByRole('article')[1]).toHaveTextContent('Exemplo de TypeScript.');
    expect(screen.getAllByRole('article')[2]).toHaveTextContent('Best Friend');
    expect(
      within(screen.getAllByRole('article')[0]).getByRole('button', { name: 'Remover dos salvos' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('3 publicações salvas')).toBeInTheDocument();
  });

  it('keeps a confirmed removal out of the list and provides a useful empty state', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ bookmarked: false }));
    vi.stubGlobal('fetch', fetcher);
    render(<BookmarksContent user={user} initialPosts={[posts[0]]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remover dos salvos' }));
    await waitFor(() => expect(screen.queryByRole('article')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Guarde boas descobertas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explorar o feed' })).toHaveAttribute('href', '/feed');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
