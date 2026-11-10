import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { phaseAt, SCENES, smooth } from './timeline';

const preferences = vi.hoisted(() => ({ reduced: false, inView: true }));
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => preferences.reduced,
  useInView: () => preferences.inView,
}));
vi.mock('@/contexts/LanguageContext', async (importOriginal) => {
  const { translations } = await import('@/i18n/translations');
  return {
    ...(await importOriginal<typeof import('@/contexts/LanguageContext')>()),
    useLanguage: () => ({ t: translations.pt, isEnglish: false, language: 'pt' }),
  };
});
vi.mock('./DemoViewport', () => ({
  DemoViewport: ({ scene }: { scene: string }) => <div data-testid="viewport">{scene}</div>,
}));
import ProductDemo from './ProductDemo';

describe('product demo playback', () => {
  beforeEach(() => {
    preferences.reduced = false;
    preferences.inView = true;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps playback static for reduced motion and still allows manual navigation', () => {
    preferences.reduced = true;
    const { container } = render(<ProductDemo />);
    expect(container.querySelector('section')).toHaveAttribute('data-playing', 'false');
    expect(screen.getByRole('button', { name: 'Pausar demonstração' })).toBeDisabled();
    fireEvent.click(screen.getByRole('tab', { name: 'Ranking' }));
    expect(screen.getByTestId('viewport')).toHaveTextContent('ranking');
  });

  it('pauses manually and while the page is hidden, preserving the pause on return', () => {
    const { container } = render(<ProductDemo />);
    fireEvent.click(screen.getByRole('button', { name: 'Pausar demonstração' }));
    expect(container.querySelector('section')).toHaveAttribute('data-playing', 'false');
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    visibility.mockReturnValue('visible');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(container.querySelector('section')).toHaveAttribute('data-playing', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir demonstração' }));
    expect(container.querySelector('section')).toHaveAttribute('data-playing', 'true');
    visibility.mockReturnValue('hidden');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(container.querySelector('section')).toHaveAttribute('data-playing', 'false');
  });

  it('pauses on hover and keyboard focus, and resumes afterwards', () => {
    const { container } = render(<ProductDemo />);
    const section = container.querySelector('section')!;
    fireEvent.pointerEnter(section, { pointerType: 'mouse' });
    expect(section).toHaveAttribute('data-playing', 'false');
    fireEvent.pointerLeave(section, { pointerType: 'mouse' });
    expect(section).toHaveAttribute('data-playing', 'true');
    const tab = screen.getByRole('tab', { name: 'Feed' });
    act(() => tab.focus());
    expect(section).toHaveAttribute('data-playing', 'false');
    act(() => tab.blur());
    expect(section).toHaveAttribute('data-playing', 'true');
  });

  it('stops outside the viewport and exposes the four scenes as real tabs', () => {
    preferences.inView = false;
    const { container } = render(<ProductDemo />);
    expect(container.querySelector('section')).toHaveAttribute('data-playing', 'false');
    const tablist = screen.getByRole('tablist', { name: 'Cenas da demonstração' });
    const tabs = screen.getAllByRole('tab');
    expect(tablist).toBeInTheDocument();
    expect(tabs).toHaveLength(SCENES.length);
    expect(screen.queryByRole('tab', { name: 'Duelos' })).not.toBeInTheDocument();
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/dados fictícios/)).toBeVisible();
  });

  it('switches scenes on click and with the arrow keys', () => {
    render(<ProductDemo />);
    fireEvent.click(screen.getByRole('tab', { name: 'Trilhas e Mundinho' }));
    expect(screen.getByTestId('viewport')).toHaveTextContent('trails');
    expect(screen.getByRole('tab', { name: 'Trilhas e Mundinho' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Trilhas e Mundinho' }), {
      key: 'ArrowRight',
    });
    expect(screen.getByTestId('viewport')).toHaveTextContent('ranking');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Ranking' }), { key: 'End' });
    expect(screen.getByTestId('viewport')).toHaveTextContent('profile');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Perfil' }), { key: 'ArrowRight' });
    expect(screen.getByTestId('viewport')).toHaveTextContent('feed');
  });

  it('derives beats from the scene clock', () => {
    expect(phaseAt([1, 3, 5], 0)).toBe(0);
    expect(phaseAt([1, 3, 5], 3)).toBe(2);
    expect(phaseAt([1, 3, 5], 9)).toBe(3);
    expect(smooth(0, 1, 0.5)).toBe(0.5);
    expect(smooth(0, 1, 2)).toBe(1);
  });
});
