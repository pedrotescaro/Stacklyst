import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerCard } from '@/components/AnswerCard';
import { removeAnswerFromTree } from '@/components/AnswerThread';
import { ProfileReplyThread } from '@/components/ProfileReplyThread';
import type { AnswerNode } from '@/components/answer-types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/components/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <span>{content}</span>,
}));
vi.mock('@/components/MarkdownEditor', () => ({
  MarkdownEditor: () => <textarea aria-label="Resposta" />,
}));
vi.mock('@/components/AuthorAvatar', () => ({ AuthorAvatar: () => <span /> }));

const node = (id: string, parent_id: string | null, replies: AnswerNode[] = []): AnswerNode => ({
  id,
  parent_id,
  post_id: 'post-1',
  author_id: id === 'mine' ? 'me' : 'other',
  body: `Resposta ${id}`,
  is_accepted: false,
  upvotes: 0,
  created_at: '2026-01-01T00:00:00Z',
  author: { username: id === 'mine' ? 'pedro' : 'ana' },
  replies,
});

describe('removeAnswerFromTree', () => {
  it('lifts the replies of a deleted answer into its place', () => {
    const tree = [
      node('root', null, [node('mine', 'root', [node('child', 'mine')]), node('sibling', 'root')]),
    ];
    const next = removeAnswerFromTree(tree, 'mine');
    expect(next[0].replies?.map((reply) => reply.id)).toEqual(['child', 'sibling']);
    expect(next[0].replies?.[0].parent_id).toBe('root');
  });

  it('promotes replies of a deleted top-level answer to the top level', () => {
    const next = removeAnswerFromTree([node('mine', null, [node('child', 'mine')])], 'mine');
    expect(next.map((answer) => answer.id)).toEqual(['child']);
    expect(next[0].parent_id).toBeNull();
  });
});

describe('deleting your own reply', () => {
  let fetcher: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    localStorage.setItem('stacklyst-sound', 'false');
    fetcher = vi.fn(async (_input: unknown, init?: RequestInit) =>
      init?.method === 'DELETE'
        ? Response.json({ success: true })
        : Response.json({ bookmarked: false })
    );
    vi.stubGlobal('fetch', fetcher);
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
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('offers delete only on the signed-in author’s answer and reports it', async () => {
    const onDeleted = vi.fn();
    const { rerender } = render(
      <AnswerCard
        answer={node('other-answer', null)}
        depth={0}
        isPostAuthor
        currentUser={{ id: 'me', username: 'pedro' }}
        onAnswerDeleted={onDeleted}
      />
    );
    expect(screen.queryByRole('button', { name: 'Excluir resposta' })).not.toBeInTheDocument();
    rerender(
      <AnswerCard
        answer={node('mine', null)}
        depth={0}
        isPostAuthor
        currentUser={{ id: 'me', username: 'pedro' }}
        onAnswerDeleted={onDeleted}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Excluir resposta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith('mine'));
    expect(fetcher).toHaveBeenCalledWith('/api/answers/mine', { method: 'DELETE' });
  });

  it('shows the server error and keeps the answer when deletion fails', async () => {
    fetcher.mockImplementation(async (_input: unknown, init?: RequestInit) =>
      init?.method === 'DELETE'
        ? Response.json({ error: 'Falhou agora.' }, { status: 500 })
        : Response.json({ bookmarked: false })
    );
    const onDeleted = vi.fn();
    render(
      <AnswerCard
        answer={node('mine', null)}
        depth={0}
        isPostAuthor
        currentUser={{ id: 'me', username: 'pedro' }}
        onAnswerDeleted={onDeleted}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Excluir resposta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falhou agora.');
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('removes your reply from the profile Replies tab', async () => {
    const reply = {
      id: 'mine',
      post_id: 'post-1',
      author_id: 'me',
      body: 'Minha resposta',
      created_at: '2026-01-01T00:00:00Z',
      upvotes: 0,
      votes: [],
      author: { id: 'me', username: 'pedro', total_xp: 0 },
      post: {
        id: 'post-1',
        body: 'Post original',
        created_at: '2026-01-01T00:00:00Z',
        author: { id: 'me', username: 'pedro', total_xp: 0 },
      },
    };
    render(<ProfileReplyThread reply={reply} currentUser={{ id: 'me' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir resposta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(screen.queryByText('Minha resposta')).not.toBeInTheDocument());
    cleanup();
    render(<ProfileReplyThread reply={reply} currentUser={{ id: 'someone-else' }} />);
    expect(screen.queryByRole('button', { name: 'Excluir resposta' })).not.toBeInTheDocument();
  });
});
