import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  beforeEach(() => {
    router.push.mockClear();
    localStorage.setItem('stacklyst-sound', 'false');
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

  it('keeps the reply composer and bookmark interaction on an answer', () => {
    render(
      <AnswerCard
        answer={answer}
        depth={0}
        isPostAuthor={false}
        currentUser={{ username: 'pedro' }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Responder a este comentário' }));
    expect(screen.getByRole('textbox', { name: 'Resposta' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('button', { name: 'Remover dos salvos' })).toBeInTheDocument();
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

  it('navigates to the reply when its comment button is pressed', () => {
    const reply = {
      ...answer,
      post: { id: 'post-1', body: 'Post original', author, created_at: '2026-01-01T00:00:00Z' },
    };
    render(<ProfileReplyThread reply={reply} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver resposta' }));
    expect(router.push).toHaveBeenCalledWith('/post/post-1#answer-answer-1');
  });
});
