import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileReplyThread } from '../ProfileReplyThread';
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
beforeEach(() =>
  vi.stubGlobal(
    'matchMedia',
    vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  )
);
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
    expect(screen.queryByTitle('Salvar')).not.toBeInTheDocument();
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
});
