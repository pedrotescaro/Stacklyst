import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InteractionCount, PostActionsBar, postActionClassName } from '@/components/PostActionsBar';
import { LikeButton } from '@/components/motion/LikeButton';
import { RepostMenu } from '@/components/motion/RepostMenu';
import { BookmarkButton } from '@/components/motion/BookmarkButton';
import { LanguageProvider } from '@/contexts/LanguageContext';

vi.mock('@/hooks/useSoundEffects', () => ({ useSoundEffects: () => ({ playSound: vi.fn() }) }));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));

describe('post actions', () => {
  it('keeps full counts accessible while providing compact mobile text', () => {
    render(<InteractionCount count={23500} />);
    expect(screen.getByText('23,5K')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('23.500', { selector: '[title] span:last-child' })).toBeInTheDocument();
    expect(screen.getByTitle('23.500')).toBeInTheDocument();
  });

  it('formats counts in the selected language and avoids 1000K at the boundary', async () => {
    localStorage.setItem('site-language', 'en');
    const { unmount } = render(
      <LanguageProvider>
        <InteractionCount count={23500} />
        <InteractionCount count={999950} />
        <InteractionCount count={1000000} />
      </LanguageProvider>
    );
    expect(await screen.findByText('23.5K')).toBeInTheDocument();
    expect(screen.getByTitle('999,950')).toHaveTextContent('1M');
    const million = screen.getByTitle('1,000,000');
    expect(million.querySelector('span')?.textContent).toBe('1M');
    expect(million).toHaveTextContent('1,000,000');
    unmount();
    localStorage.removeItem('site-language');
  });

  it('provides independent actions with full accessible counts and stops card clicks', () => {
    const outer = vi.fn();
    const like = vi.fn();
    const repost = vi.fn();
    const bookmark = vi.fn();
    render(
      <div onClick={outer}>
        <PostActionsBar data-testid="actions">
          <button className={postActionClassName}>
            Responder <InteractionCount count={1} />
          </button>
          <RepostMenu appearance="post" count={23500} onRepost={repost} onQuote={() => {}} />
          <LikeButton
            appearance="post"
            count={12345}
            isActive={false}
            title="Curtir"
            onToggle={like}
          />
          <BookmarkButton appearance="post" isSaved={false} onToggle={bookmark} />
          <button className={postActionClassName}>Compartilhar</button>
          <button className={postActionClassName}>Mais</button>
        </PostActionsBar>
      </div>
    );
    expect(screen.getByTestId('actions').children).toHaveLength(6);
    fireEvent.click(screen.getByRole('button', { name: 'Curtir: 12.345' }));
    expect(like).toHaveBeenCalledOnce();
    expect(outer).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Repostar: 23.500' }));
    fireEvent.click(screen.getByRole('button', { name: 'Repostar' }));
    expect(repost).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(bookmark).toHaveBeenCalledOnce();
  });
});
