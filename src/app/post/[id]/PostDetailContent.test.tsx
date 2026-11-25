import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PostDetailContent } from './PostDetailContent';
import {
  REPLY_CREATED_EVENT,
  type ReplyCreatedDetail,
} from '@/components/composer/ReplyComposerDialog';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  openReplyComposer: vi.fn((_target: unknown) => false),
  fetch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
    back: mocks.back,
    refresh: mocks.refresh,
  }),
  usePathname: () => '/post/post-1/reply/r2',
}));

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { alt = '', src = '' } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={String(alt)} src={String(src)} />;
  },
}));

vi.mock('@/components/Sidebar', () => ({
  Sidebar: () => null,
}));

vi.mock('@/components/FeedRightSidebar', () => ({
  FeedRightSidebar: () => null,
}));

vi.mock('@/hooks/useSoundEffects', () => ({
  useSoundEffects: () => ({ playSound: vi.fn() }),
}));

vi.mock('@/hooks/usePostBookmark', () => ({
  usePostBookmark: () => ({
    saved: false,
    pending: false,
    error: null,
    toggle: vi.fn(),
  }),
}));

vi.mock('@/components/composer/ReplyComposerDialog', async (importActual) => {
  const actual = await importActual<typeof import('@/components/composer/ReplyComposerDialog')>();
  return {
    ...actual,
    openReplyComposer: (target: unknown) => {
      mocks.openReplyComposer(target);
      return false;
    },
    ReplyComposerForm: ({
      postId,
      parentAnswer,
      onCancel,
    }: {
      postId: string;
      parentAnswer?: { id: string; username: string };
      onCancel?: () => void;
    }) => (
      <div
        data-testid="mock-reply-composer"
        data-post-id={postId}
        data-parent-id={parentAnswer?.id ?? ''}
        data-parent-username={parentAnswer?.username ?? ''}
      >
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    ),
  };
});

vi.mock('@/components/replies/ReplyOwnerMenu', () => ({
  ReplyOwnerMenu: ({
    answerId,
    onEdit,
    onDeleted,
  }: {
    answerId: string;
    onEdit: () => void;
    onDeleted: () => void;
  }) => (
    <div data-testid={`owner-menu-${answerId}`}>
      <button type="button" onClick={onEdit}>
        Editar foco
      </button>
      <button type="button" onClick={onDeleted}>
        Excluir foco
      </button>
    </div>
  ),
}));

vi.mock('@/components/replies/ReplyEditForm', () => ({
  ReplyEditForm: ({
    body,
    onSaved,
    onCancel,
  }: {
    answerId: string;
    body: string;
    onSaved: (nextBody: string) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="mock-reply-edit-form">
      <span>{body}</span>
      <button type="button" onClick={() => onSaved('Conteudo editado na resposta')}>
        Salvar edicao
      </button>
      <button type="button" onClick={onCancel}>
        Cancelar edicao
      </button>
    </div>
  ),
}));

const viewerUser = {
  id: 'user-viewer',
  username: 'pedro',
  avatar_url: null,
  avatar_config: null,
  total_xp: 200,
  streak: 2,
  last_active_at: null,
  trails: [],
  badges: [],
};

function makeThreadPost() {
  return {
    id: 'post-1',
    author_id: 'user-root',
    title: 'Post raiz',
    body: 'Conteudo do post original',
    created_at: '2026-11-20T10:00:00.000Z',
    view_count: 15,
    upvotes: 3,
    reposts_count: 0,
    votes: [],
    quizzes: [
      {
        id: 'quiz-1',
        question: 'Pergunta do post raiz',
        options: ['A', 'B'],
        attempts: [],
      },
    ],
    author: {
      id: 'user-root',
      username: 'rootauthor',
      avatar_url: null,
      avatar_config: null,
      total_xp: 500,
    },
    answers: [
      {
        id: 'r1',
        post_id: 'post-1',
        parent_id: null,
        author_id: 'user-parent',
        body: 'Primeira resposta pai',
        code_snippet: null,
        upvotes: 2,
        votes: [],
        created_at: '2026-11-20T10:05:00.000Z',
        author: {
          id: 'user-parent',
          username: 'parentdev',
          avatar_url: null,
          avatar_config: null,
          total_xp: 120,
        },
        replies: [
          {
            id: 'r2',
            post_id: 'post-1',
            parent_id: 'r1',
            author_id: 'user-viewer',
            body: 'Resposta focal tratada como post',
            code_snippet: null,
            upvotes: 7,
            votes: [],
            created_at: '2026-11-20T10:10:00.000Z',
            author: {
              id: 'user-viewer',
              username: 'pedro',
              avatar_url: null,
              avatar_config: null,
              total_xp: 200,
            },
            replies: [
              {
                id: 'r3',
                post_id: 'post-1',
                parent_id: 'r2',
                author_id: 'user-child',
                body: 'Filha dentro da resposta focal',
                code_snippet: null,
                upvotes: 1,
                votes: [],
                created_at: '2026-11-20T10:15:00.000Z',
                author: {
                  id: 'user-child',
                  username: 'childdev',
                  avatar_url: null,
                  avatar_config: null,
                  total_xp: 90,
                },
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: 'sibling-1',
        post_id: 'post-1',
        parent_id: null,
        author_id: 'user-other',
        body: 'Outra resposta fora deste galho',
        code_snippet: null,
        upvotes: 0,
        votes: [],
        created_at: '2026-11-20T10:06:00.000Z',
        author: {
          id: 'user-other',
          username: 'otherdev',
          avatar_url: null,
          avatar_config: null,
          total_xp: 50,
        },
        replies: [],
      },
    ],
  };
}

describe('PostDetailContent focal reply mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.getSelection = vi.fn(() => null) as unknown as typeof window.getSelection;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ upvotes: 8 }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders ancestor thread chain above the focused reply, hides unrelated branches/quiz, and allows climbing up', () => {
    render(<PostDetailContent user={viewerUser} post={makeThreadPost()} focusedAnswerId="r2" />);

    expect(screen.getByTestId('ancestor-root-post')).toHaveTextContent('Conteudo do post original');
    expect(screen.getByTestId('ancestor-reply-r1')).toHaveTextContent('Primeira resposta pai');
    expect(screen.getByTestId('focal-reply-article')).toHaveTextContent(
      'Resposta focal tratada como post'
    );
    expect(screen.getByTestId('focal-reply-article')).toHaveTextContent(
      /Respondendo a\s*@parentdev/i
    );
    expect(screen.getByText('Filha dentro da resposta focal')).toBeInTheDocument();
    expect(screen.getByText(/Respostas\s*\(1\)/i)).toBeInTheDocument();
    expect(screen.queryByText('Outra resposta fora deste galho')).not.toBeInTheDocument();
    expect(screen.queryByText(/Quiz de Aprendizado/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('ancestor-reply-r1'));
    expect(mocks.push).toHaveBeenCalledWith('/post/post-1/reply/r1');

    fireEvent.click(screen.getByTestId('ancestor-root-post'));
    expect(mocks.push).toHaveBeenCalledWith('/post/post-1');
  });

  it('votes on the focused reply endpoint rather than the root post', async () => {
    render(<PostDetailContent user={viewerUser} post={makeThreadPost()} focusedAnswerId="r2" />);

    const likeBtn = screen.getAllByTitle('Curtir resposta')[0];
    expect(likeBtn.closest('[data-testid="focal-reply-article"]')).not.toBeNull();
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledWith('/api/answers/r2/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 1 }),
      });
    });
    expect(likeBtn).toHaveTextContent('8');
  });

  it('targets focusedAnswer as parent_answer in inline composer and inserts created child replies', () => {
    render(<PostDetailContent user={viewerUser} post={makeThreadPost()} focusedAnswerId="r2" />);

    fireEvent.click(screen.getByText('Postar sua resposta'));

    const composer = screen.getByTestId('mock-reply-composer');
    expect(composer).toHaveAttribute('data-post-id', 'post-1');
    expect(composer).toHaveAttribute('data-parent-id', 'r2');
    expect(composer).toHaveAttribute('data-parent-username', 'pedro');

    act(() => {
      window.dispatchEvent(
        new CustomEvent<ReplyCreatedDetail>(REPLY_CREATED_EVENT, {
          detail: {
            postId: 'post-1',
            answer: {
              id: 'r4',
              post_id: 'post-1',
              parent_id: 'r2',
              author_id: 'user-viewer',
              body: 'Nova resposta dentro da resposta',
              code_snippet: null,
              is_accepted: false,
              upvotes: 0,
              created_at: '2026-11-20T10:20:00.000Z',
              author: {
                username: 'pedro',
                avatar_url: null,
                avatar_config: null,
                total_xp: 200,
              },
              replies: [],
            },
          },
        })
      );
    });

    expect(screen.getByText('Nova resposta dentro da resposta')).toBeInTheDocument();
    expect(screen.getByText(/Respostas\s*\(2\)/i)).toBeInTheDocument();
  });

  it('supports editing the focused reply inline and navigating back to parent on delete', () => {
    render(<PostDetailContent user={viewerUser} post={makeThreadPost()} focusedAnswerId="r2" />);

    fireEvent.click(screen.getByText('Editar foco'));
    expect(screen.getByTestId('mock-reply-edit-form')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Salvar edicao'));
    expect(screen.getByTestId('focal-reply-article')).toHaveTextContent(
      'Conteudo editado na resposta'
    );

    fireEvent.click(screen.getByText('Excluir foco'));
    expect(mocks.push).toHaveBeenCalledWith('/post/post-1/reply/r1');
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it('lets the post author pin and unpin their root post as main profile post, but hides controls for others', async () => {
    const authorUser = { ...viewerUser, id: 'user-root', username: 'rootauthor' };
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, pinned: true, postId: 'post-1' }),
    });

    const { unmount } = render(
      <PostDetailContent user={authorUser} post={{ ...makeThreadPost(), is_pinned: false }} />
    );

    const pinButton = screen.getByRole('button', { name: 'Fixar no perfil' });
    expect(pinButton).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(pinButton);

    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledWith('/api/posts/post-1/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: true }),
      });
    });
    expect(screen.getByRole('button', { name: 'Fixado no perfil' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    // Dropdown menu also switches to Desafixar do perfil for the owner.
    fireEvent.click(screen.getByTitle('Mais opções'));
    expect(screen.getByRole('button', { name: 'Desafixar do perfil' })).toBeInTheDocument();

    unmount();
    render(<PostDetailContent user={viewerUser} post={{ ...makeThreadPost(), is_pinned: true }} />);
    expect(screen.queryByRole('button', { name: /Fixar|Fixado/ })).not.toBeInTheDocument();
    expect(screen.getByText('Fixado no perfil')).toBeInTheDocument();
  });
});
