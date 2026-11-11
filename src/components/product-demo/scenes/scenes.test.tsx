import { act, cleanup, render, screen } from '@testing-library/react';
import { motionValue } from 'framer-motion';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FeedScene, FEED_MARKS } from './FeedScene';
import { TrailsScene, TRAILS_MARKS } from './TrailsScene';
import { RankingScene, RANKING_MARKS } from './RankingScene';
import { ProfileScene, PROFILE_MARKS } from './ProfileScene';

vi.mock('@/contexts/MusicPlayerContext', () => ({
  useMusicPlayerControls: () => ({ currentTrack: null, isPlaying: false, playTrack: vi.fn() }),
}));

function renderScene(node: React.ReactNode) {
  return render(<LanguageProvider>{node}</LanguageProvider>);
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
});
afterEach(cleanup);

describe('walkthrough scenes', () => {
  it('renders the real feed chrome, publishes the draft and runs the snippet', () => {
    const clock = motionValue(0);
    const { rerender } = renderScene(<FeedScene clock={clock} mobile={false} />);
    expect(screen.getByRole('tab', { name: 'Para você' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('O que você está pensando?')).toBeInTheDocument();
    expect(screen.queryByText('Olá, Stacklyst!')).not.toBeInTheDocument();
    act(() => clock.set(FEED_MARKS[FEED_MARKS.length - 1] + 0.1));
    rerender(
      <LanguageProvider>
        <FeedScene clock={clock} mobile={false} />
      </LanguageProvider>
    );
    expect(
      screen.getAllByText('Terminei a unidade 1 de JavaScript hoje 🚀').length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Olá, Stacklyst!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Curtir post: 4/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('walks through the Mundinho hub, world, avatar editor, trail and lesson', () => {
    const clock = motionValue(0);
    const view = () => (
      <LanguageProvider>
        <TrailsScene clock={clock} mobile={false} />
      </LanguageProvider>
    );
    const { rerender } = render(view());
    expect(screen.getByRole('heading', { name: 'Trilhas de aprendizagem' })).toBeInTheDocument();
    act(() => clock.set(TRAILS_MARKS.dialogue + 0.1));
    rerender(view());
    expect(screen.getByTestId('demo-world-dialogue')).toBeInTheDocument();
    act(() => clock.set(TRAILS_MARKS.saved + 0.1));
    rerender(view());
    expect(screen.getByRole('tab', { name: 'Roupas' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Avatar salvo!');
    act(() => clock.set(TRAILS_MARKS.journey + 0.1));
    rerender(view());
    expect(screen.getByText('SUA PRÓXIMA LIÇÃO')).toBeInTheDocument();
    expect(screen.getAllByText(/2\/13/).length).toBeGreaterThan(0);
    act(() => clock.set(TRAILS_MARKS.correct + 0.1));
    rerender(view());
    expect(screen.getByTestId('demo-lesson')).toBeInTheDocument();
    expect(screen.getAllByText('+10 XP').length).toBeGreaterThan(0);
    act(() => clock.set(TRAILS_MARKS.done + 0.1));
    rerender(view());
    expect(screen.queryByText('SUA PRÓXIMA LIÇÃO')).toBeInTheDocument();
    expect(screen.getAllByText(/3\/13/).length).toBeGreaterThan(0);
  });

  it('re-ranks the fictional player once the XP reaches the next level', () => {
    const clock = motionValue(0);
    const view = () => (
      <LanguageProvider>
        <RankingScene clock={clock} mobile={false} />
      </LanguageProvider>
    );
    const { rerender } = render(view());
    const rowFor = (name: string) =>
      screen.getByRole('link', { name: new RegExp(`${name},`) }).closest('[data-demo-rank]');
    expect(rowFor('stack_sam')).toHaveAttribute('data-demo-rank', '5');
    act(() => clock.set(RANKING_MARKS[1] + 0.1));
    rerender(view());
    expect(rowFor('stack_sam')).toHaveAttribute('data-demo-rank', '4');
    expect(screen.getByRole('link', { name: /stack_sam, 1\.500 XP/ })).toBeInTheDocument();
  });

  it('shows the current profile with statistics and certificates tabs', () => {
    const clock = motionValue(0);
    const view = () => (
      <LanguageProvider>
        <ProfileScene clock={clock} mobile={false} />
      </LanguageProvider>
    );
    const { rerender } = render(view());
    expect(screen.getAllByRole('heading', { level: 1, name: 'Sam Stack' }).length).toBeGreaterThan(
      0
    );
    act(() => clock.set(PROFILE_MARKS[0] + 0.1));
    rerender(view());
    expect(screen.getByText('Estatísticas do perfil')).toBeInTheDocument();
    act(() => clock.set(PROFILE_MARKS[1] + 0.1));
    rerender(view());
    expect(screen.getAllByText('Primeira lição de JavaScript').length).toBeGreaterThan(0);
  });

  it('renders the phone layout without the desktop sidebar', () => {
    const clock = motionValue(0);
    const { container } = renderScene(<FeedScene clock={clock} mobile />);
    expect(container.querySelector('.dd-platform-sidebar')).toBeNull();
    expect(container.querySelector('nav.fixed')).not.toBeNull();
  });
});
