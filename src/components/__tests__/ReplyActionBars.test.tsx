import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerCard } from '@/components/AnswerCard';
import { ProfileReplyThread } from '@/components/ProfileReplyThread';
import { REPLY_CREATED_EVENT } from '@/components/composer/ReplyComposerDialog';

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/components/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <span>{content}</span>,
}));
vi.mock('@/components/editor/NotionEditor', () => ({
  NotionEditor: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <textarea
      aria-label={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
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
    expect(await screen.findByRole('textbox', { name: 'Postar sua resposta' })).toBeInTheDocument();
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

  it('synchronizes saved state between the answer and its profile publication', async () => {
    const fetcher = vi.fn(async (_input: unknown, init?: RequestInit) =>
      Response.json({
        bookmarked: init?.method === 'POST' ? JSON.parse(String(init.body)).bookmarked : false,
      })
    );
    vi.stubGlobal('fetch', fetcher);
    render(
      <>
        <AnswerCard
          answer={answer}
          depth={0}
          isPostAuthor={false}
          currentUser={{ id: 'owner', username: 'ana' }}
        />
        <ProfileReplyThread
          reply={{
            ...answer,
            author_id: 'owner',
            post: {
              id: 'post-1',
              body: 'Post original',
              author,
              created_at: answer.created_at,
            },
          }}
          currentUser={{ id: 'owner', username: 'ana' }}
        />
      </>
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Salvar' })[0]);
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: 'Remover dos salvos' });
      expect(buttons).toHaveLength(2);
      for (const button of buttons) {
        expect(button).toHaveAttribute('aria-pressed', 'true');
        expect(button).not.toBeDisabled();
      }
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Remover dos salvos' })[1]);
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: 'Salvar' });
      expect(buttons).toHaveLength(2);
      for (const button of buttons) {
        expect(button).toHaveAttribute('aria-pressed', 'false');
        expect(button).not.toBeDisabled();
      }
    });
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(2);
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

  it('uses the rich composer on an owned nested answer, preserves failed drafts, and submits to that answer', async () => {
    const parent = { ...answer, id: 'my-nested-answer', parent_id: answer.id };
    const posted = { ...parent, id: 'new-reply', parent_id: parent.id, body: 'oi' };
    const send = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ message: 'Tente novamente.' }, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ answer: posted }));
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) =>
        url.endsWith('/answer')
          ? send(url, init)
          : Promise.resolve(Response.json({ bookmarked: false }))
      )
    );
    const created = vi.spyOn(window, 'dispatchEvent');
    const { container } = render(
      <AnswerCard
        answer={{ ...answer, replies: [parent] }}
        depth={0}
        isPostAuthor={false}
        currentUser={{ username: 'ana' }}
      />
    );
    try {
      const nested = within(container.querySelector<HTMLElement>('#answer-my-nested-answer')!);
      const trigger = nested.getByRole('button', { name: 'Responder a este comentário' });
      fireEvent.click(trigger);
      const composer = within(nested.getByRole('form', { name: 'Responder comentário' }));
      expect(composer.getByText(/Respondendo a/)).toBeInTheDocument();
      for (const name of ['Adicionar imagens', 'Adicionar GIF', 'Inserir código executável']) {
        expect(composer.getByRole('button', { name })).toBeInTheDocument();
      }
      const editor = await composer.findByRole('textbox', { name: 'Postar sua resposta' });
      const publish = composer.getByRole('button', { name: /^Responder$/ });
      expect(publish).toBeDisabled();
      expect(publish.querySelector('svg')).toBeNull();
      expect(composer.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
      fireEvent.change(editor, { target: { value: posted.body } });
      expect(publish).toBeEnabled();
      fireEvent.click(publish);
      expect(await composer.findByRole('alert')).toHaveTextContent('Tente novamente.');
      expect(editor).toHaveValue(posted.body);
      fireEvent.click(publish);
      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
      expect(trigger).toHaveFocus();
      expect(send).toHaveBeenCalledTimes(2);
      expect(send).toHaveBeenLastCalledWith('/api/posts/post-1/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: posted.body,
          attachments: [],
          music: null,
          parent_answer_id: parent.id,
        }),
      });
      expect(created).toHaveBeenCalledWith(
        expect.objectContaining({
          type: REPLY_CREATED_EVENT,
          detail: expect.objectContaining({ postId: answer.post_id, answer: posted }),
        })
      );
    } finally {
      created.mockRestore();
    }
  });

  it('opens the attachment picker in a viewport sheet for nested inline replies without layout clipping', async () => {
    const nested = { ...answer, id: 'deep-reply', parent_id: answer.id };
    const { container } = render(
      <AnswerCard
        answer={{ ...answer, replies: [nested] }}
        depth={0}
        isPostAuthor={false}
        currentUser={{ username: 'ana' }}
      />
    );

    const card = within(container.querySelector<HTMLElement>('#answer-deep-reply')!);
    fireEvent.click(card.getByRole('button', { name: 'Responder a este comentário' }));
    const composer = within(card.getByRole('form', { name: 'Responder comentário' }));
    fireEvent.click(composer.getByRole('button', { name: 'Adicionar imagens' }));

    const dialog = await screen.findByRole('dialog', { name: 'Adicionar imagens' });
    expect(container).not.toContainElement(dialog);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Adicionar imagens' })).not.toBeInTheDocument()
    );
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
