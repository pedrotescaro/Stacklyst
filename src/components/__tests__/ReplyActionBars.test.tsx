import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerCard } from '@/components/AnswerCard';
import { ProfileReplyThread } from '@/components/ProfileReplyThread';

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/components/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <span>{content}</span>,
}));
vi.mock('@/components/MarkdownEditor', () => ({
  MarkdownEditor: () => <textarea aria-label="Resposta" />,
}));
vi.mock('@/components/AuthorAvatar', () => ({ AuthorAvatar: () => <span /> }));

const author = { username: 'ana', name: 'Ana' };
const answer = {
  id: 'answer-1',
  post_id: 'post-1',
  body: 'Minha resposta',
  is_accepted: false,
  upvotes: 2,
  created_at: '2026-01-01T00:00:00Z',
  author,
};

describe('reply action bars', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });
  beforeEach(() => {
    router.push.mockClear();
    localStorage.setItem('stacklyst-sound', 'false');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: unknown, init?: RequestInit) =>
        Response.json({ bookmarked: init?.method === 'POST' })
      )
    );
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

  it('persists the parent post from an answer and reads the saved state after reload', async () => {
    let saved = false;
    const fetcher = vi.fn(async (_input: unknown, init?: RequestInit) => {
      if (init?.method === 'POST') saved = JSON.parse(String(init.body)).bookmarked;
      return Response.json({ bookmarked: saved });
    });
    vi.stubGlobal('fetch', fetcher);
    const view = render(
      <AnswerCard
        answer={answer}
        depth={0}
        isPostAuthor={false}
        currentUser={{ username: 'pedro' }}
      />
    );
    await waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith('/api/posts/post-1/bookmark', { cache: 'no-store' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Responder a este comentário' }));
    expect(screen.getByRole('textbox', { name: 'Resposta' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Remover dos salvos' })).not.toBeDisabled()
    );
    expect(saved).toBe(true);
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1);
    view.unmount();
    render(
      <AnswerCard
        answer={answer}
        depth={0}
        isPostAuthor={false}
        currentUser={{ username: 'pedro' }}
      />
    );
    expect(await screen.findByRole('button', { name: 'Remover dos salvos' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('restores the answer bookmark after a failed write and allows retry', async () => {
    const fetcher = vi.fn(async (_input: unknown, init?: RequestInit) =>
      init?.method === 'POST'
        ? Response.json({ message: 'Falha ao salvar.' }, { status: 503 })
        : Response.json({ bookmarked: false })
    );
    vi.stubGlobal('fetch', fetcher);
    render(
      <AnswerCard
        answer={answer}
        depth={0}
        isPostAuthor={false}
        currentUser={{ username: 'pedro' }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar.');
    expect(screen.getByRole('button', { name: 'Salvar' })).not.toBeDisabled();
  });

  it('shows the selected flags and title for comments and nested replies', () => {
    const decoratedAuthor = {
      username: 'ana',
      avatar_config: {
        profileStyle: {
          flags: ['BR', 'PT'],
          title: {
            id: 'first-steps',
            name: 'Iniciante',
            color: '#0083fe',
            rarity: 'common',
          },
        },
      },
    };
    render(
      <AnswerCard
        answer={{
          ...answer,
          author: decoratedAuthor,
          replies: [{ ...answer, id: 'nested', author: decoratedAuthor }],
        }}
        depth={0}
        isPostAuthor={false}
      />
    );
    expect(screen.getAllByAltText('Bandeira: Brasil')).toHaveLength(2);
    expect(screen.getAllByAltText('Bandeira: Portugal')).toHaveLength(2);
    expect(screen.getAllByText('Iniciante')).toHaveLength(2);
  });

  it('keeps a single-reply chain in one column joined by thread lines', () => {
    const { container } = render(
      <AnswerCard
        answer={{
          ...answer,
          id: 'a',
          replies: [{ ...answer, id: 'b', replies: [{ ...answer, id: 'c' }] }],
        }}
        depth={0}
        isPostAuthor={false}
      />
    );
    const a = container.querySelector('#answer-a');
    const b = container.querySelector('#answer-b');
    const c = container.querySelector('#answer-c');
    expect(a?.contains(b)).toBe(false);
    expect(b?.contains(c)).toBe(false);
    expect(container.querySelectorAll('article')).toHaveLength(1);
    expect(screen.getAllByTestId('thread-line')).toHaveLength(2);
  });

  it('indents branching replies under the parent answer', () => {
    const { container } = render(
      <AnswerCard
        answer={{
          ...answer,
          id: 'a',
          replies: [
            { ...answer, id: 'b' },
            { ...answer, id: 'c' },
          ],
        }}
        depth={0}
        isPostAuthor={false}
      />
    );
    const a = container.querySelector('#answer-a');
    expect(a?.contains(container.querySelector('#answer-b'))).toBe(true);
    expect(a?.contains(container.querySelector('#answer-c'))).toBe(true);
  });

  it('links to the reply from its comment action', () => {
    const reply = {
      ...answer,
      post: { id: 'post-1', body: 'Post original', author, created_at: '2026-01-01T00:00:00Z' },
    };
    render(<ProfileReplyThread reply={reply} />);
    expect(screen.getByRole('link', { name: 'Abrir resposta' })).toHaveAttribute(
      'href',
      '/post/post-1#answer-answer-1'
    );
  });
});
