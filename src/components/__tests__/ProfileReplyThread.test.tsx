import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileReplyThread } from '../ProfileReplyThread';
import { encodeReplyMedia } from '@/lib/reply-media';
vi.mock('@/components/music/SpotifyTrackCard', () => ({
  SpotifyTrackCard: ({ music }: { music: { title: string } }) => <p>Música: {music.title}</p>,
}));
vi.mock('@/components/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <p>{content}</p>,
}));
const author = (username: string) => ({ username, total_xp: 0, avatar_url: null });
const reply = {
  id: 'answer',
  post_id: 'post',
  body: 'Minha resposta completa',
  author: author('responder'),
  created_at: '2026-10-29T12:00:00Z',
  upvotes: 3,
  votes: [],
  post: {
    id: 'post',
    body: 'Publicação original',
    author: author('original'),
    created_at: '2026-10-28T12:00:00Z',
  },
};
afterEach(() => vi.unstubAllGlobals());
beforeEach(() => {
  localStorage.setItem('stacklyst-sound', 'false');
  vi.stubGlobal(
    'matchMedia',
    vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  );
});
describe('profile reply publications', () => {
  it('shows root above immediate parent and reply without mock metrics', () => {
    render(
      <ProfileReplyThread
        reply={{
          ...reply,
          parent: {
            id: 'parent',
            body: 'Resposta anterior',
            author: author('parent'),
            created_at: reply.created_at,
          },
        }}
      />
    );
    const root = screen.getByText('Publicação original'),
      parent = screen.getByText('Resposta anterior'),
      answer = screen.getByText('Minha resposta completa');
    expect(root.compareDocumentPosition(parent) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(parent.compareDocumentPosition(answer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver publicação original' })).toHaveAttribute(
      'href',
      '/post/post'
    );
    expect(screen.getByRole('link', { name: 'Abrir resposta' })).toHaveAttribute(
      'href',
      '/post/post#answer-answer'
    );
    expect(screen.getAllByLabelText('Nível 1')).toHaveLength(3);
    expect(screen.queryByText('24')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });
  it('saves from an own reply after likes and restores the saved state on reload', async () => {
    let saved = false;
    const fetcher = vi.fn(async (_input: unknown, init?: RequestInit) => {
      if (init?.method === 'POST') saved = JSON.parse(String(init.body)).bookmarked;
      return Response.json({ bookmarked: saved });
    });
    vi.stubGlobal('fetch', fetcher);
    const ownReply = { ...reply, author_id: 'owner' };
    const currentUser = { id: 'owner', username: 'responder' };
    const view = render(<ProfileReplyThread reply={ownReply} currentUser={currentUser} />);
    const like = screen.getByRole('button', { name: /^Curtir resposta:/ });
    const save = screen.getByRole('button', { name: 'Salvar' });
    const share = screen.getByRole('button', { name: 'Compartilhar resposta' });
    expect(like.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(save.compareDocumentPosition(share) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(save);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Remover dos salvos' })).not.toBeDisabled()
    );
    expect(fetcher).toHaveBeenCalledWith('/api/posts/post/bookmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked: true }),
    });
    view.unmount();
    render(<ProfileReplyThread reply={ownReply} currentUser={currentUser} />);
    expect(await screen.findByRole('button', { name: 'Remover dos salvos' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remover dos salvos' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar' })).not.toBeDisabled());
    expect(saved).toBe(false);
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(2);
  });
  it('rolls a failed save back and lets the author retry', async () => {
    let writes = 0;
    const fetcher = vi.fn(async (_input: unknown, init?: RequestInit) => {
      if (init?.method !== 'POST') return Response.json({ bookmarked: false });
      writes += 1;
      return writes === 1
        ? Response.json({ message: 'Falha ao salvar. Tente novamente.' }, { status: 503 })
        : Response.json({ bookmarked: true });
    });
    vi.stubGlobal('fetch', fetcher);
    render(
      <ProfileReplyThread
        reply={{ ...reply, author_id: 'owner' }}
        currentUser={{ id: 'owner', username: 'responder' }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar. Tente novamente.');
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Salvar' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Remover dos salvos' })).not.toBeDisabled()
    );
    expect(writes).toBe(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('likes the featured reply rather than the context post', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ upvotes: 4 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<ProfileReplyThread reply={reply} />);
    fireEvent.click(screen.getByTitle('Curtir resposta'));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/answers/answer/vote',
        expect.objectContaining({ body: JSON.stringify({ value: 1 }) })
      )
    );
  });
  it('rolls a failed like back and offers a readable error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 403 })));
    render(<ProfileReplyThread reply={reply} />);
    fireEvent.click(screen.getByTitle('Curtir resposta'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível atualizar a curtida'
    );
    expect(screen.getByTitle('Curtir resposta')).toHaveTextContent('3');
  });
  it('shows the music and GIFs of the original post, the previous reply and the reply', () => {
    const track = (title: string) => ({
      trackId: '4cOdK2wGLETKBW3PvgPWqT',
      title,
      artist: 'Artista',
      artworkUrl: null,
    });
    const gif = (alt: string) => ({
      type: 'gif' as const,
      url: `https://static.klipy.com/ii/a/${alt}.webp`,
      alt,
    });
    render(
      <ProfileReplyThread
        reply={{
          ...reply,
          body: encodeReplyMedia('', {
            attachments: [gif('gif-da-resposta')],
            music: track('Faixa da resposta'),
          }),
          post: {
            ...reply.post,
            body: '',
            music: track('Faixa do post'),
            attachments: [gif('gif-do-post')],
          },
          parent: {
            id: 'parent',
            body: encodeReplyMedia('Comentário anterior', {
              attachments: [],
              music: track('Faixa anterior'),
            }),
            author: author('parent'),
            created_at: reply.created_at,
          },
        }}
      />
    );
    expect(screen.getByText('Música: Faixa do post')).toBeInTheDocument();
    expect(screen.getByAltText('gif-do-post')).toHaveAttribute(
      'src',
      'https://static.klipy.com/ii/a/gif-do-post.webp'
    );
    expect(screen.getByText('Comentário anterior')).toBeInTheDocument();
    expect(screen.getByText('Música: Faixa anterior')).toBeInTheDocument();
    expect(screen.getByText('Música: Faixa da resposta')).toBeInTheDocument();
    expect(screen.getByAltText('gif-da-resposta')).toBeInTheDocument();
    expect(screen.queryByText(/stacklyst-reply-media/)).not.toBeInTheDocument();
  });
});
