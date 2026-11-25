import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnswerCard } from '@/components/AnswerCard';
import type { AnswerNode } from '@/components/answer-types';

const routerPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/hooks/usePostBookmark', () => ({
  usePostBookmark: () => ({
    saved: false,
    pending: false,
    error: null,
    toggle: vi.fn(),
  }),
}));

function makeAnswer(overrides: Partial<AnswerNode> = {}): AnswerNode {
  return {
    id: 'ans-1',
    post_id: 'post-1',
    parent_id: null,
    author_id: 'author-1',
    body: 'Resposta principal sobre o bug no router.',
    code_snippet: null,
    is_accepted: false,
    upvotes: 4,
    created_at: '2026-11-20T12:00:00.000Z',
    author: {
      username: 'alice',
      avatar_url: null,
      avatar_config: null,
      total_xp: 120,
    },
    replies: [],
    ...overrides,
  };
}

const currentUser = {
  id: 'viewer-1',
  username: 'viewer',
  avatar_url: null,
  avatar_config: null,
};

describe('AnswerCard drill-down navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.getSelection = vi.fn(() => null) as unknown as typeof window.getSelection;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ upvotes: 5 }),
      }))
    );
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('navigates into a reply page when clicking the reply body', () => {
    render(
      <AnswerCard
        answer={makeAnswer()}
        depth={0}
        isPostAuthor={false}
        postId="post-1"
        currentUser={currentUser}
      />
    );

    fireEvent.click(screen.getByText('Resposta principal sobre o bug no router.'));

    expect(routerPush).toHaveBeenCalledTimes(1);
    expect(routerPush).toHaveBeenCalledWith('/post/post-1/reply/ans-1');
  });

  it('does not navigate when clicking buttons or links inside the reply', async () => {
    render(
      <AnswerCard
        answer={makeAnswer()}
        depth={0}
        isPostAuthor={false}
        postId="post-1"
        currentUser={currentUser}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /curtir/i }));
    fireEvent.click(screen.getByText('@alice'));

    await Promise.resolve();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('navigates only to a nested child reply without triggering parent card navigation', () => {
    const nested = makeAnswer({
      id: 'ans-child',
      parent_id: 'ans-1',
      body: 'Resposta aninhada que também vira post.',
      author: {
        username: 'bruno',
        avatar_url: null,
        avatar_config: null,
        total_xp: 250,
      },
    });
    render(
      <AnswerCard
        answer={makeAnswer({ replies: [nested] })}
        depth={0}
        isPostAuthor={false}
        postId="post-1"
        currentUser={currentUser}
      />
    );

    fireEvent.click(screen.getByText('Resposta aninhada que também vira post.'));

    expect(routerPush).toHaveBeenCalledTimes(1);
    expect(routerPush).toHaveBeenCalledWith('/post/post-1/reply/ans-child');
  });

  it('does not navigate when the user is selecting reply text', () => {
    window.getSelection = vi.fn(
      () => ({ toString: () => 'trecho selecionado' }) as unknown as Selection
    );

    render(
      <AnswerCard
        answer={makeAnswer()}
        depth={0}
        isPostAuthor={false}
        postId="post-1"
        currentUser={currentUser}
      />
    );

    fireEvent.click(screen.getByText('Resposta principal sobre o bug no router.'));

    expect(routerPush).not.toHaveBeenCalled();
  });
});
