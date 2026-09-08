import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cameraAt, scenePresence } from './timeline';
const preferences = vi.hoisted(() => ({ reduced: false, inView: true }));
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => preferences.reduced,
  useInView: () => preferences.inView,
}));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ isEnglish: false }) }));
vi.mock('./DemoViewport', () => ({ DemoViewport: () => <div>Product viewport</div> }));
import ProductDemo from './ProductDemo';

describe('product demo playback', () => {
  beforeEach(() => {
    preferences.reduced = false;
    preferences.inView = true;
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  it('keeps playback static for reduced motion', () => {
    preferences.reduced = true;
    const { container } = render(<ProductDemo />);
    expect(container.querySelector('section')).toHaveAttribute('data-playing', 'false');
    expect(screen.getByRole('button', { name: 'Pausar demonstração' })).toBeDisabled();
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
  it('stops completely outside the viewport and exposes only the requested five scenes', () => {
    preferences.inView = false;
    const { container } = render(<ProductDemo />);
    expect(container.querySelector('section')).toHaveAttribute('data-playing', 'false');
    expect(screen.queryByRole('button', { name: 'Conquistas' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Cenas da demonstração' }).children).toHaveLength(5);
  });
  it('joins both ends of the loop without a camera or screen discontinuity', () => {
    expect(cameraAt(0)).toEqual(cameraAt(24));
    expect(cameraAt(0, true)).toEqual(cameraAt(24, true));
    expect(scenePresence('feed', 0)).toBe(1);
    expect(scenePresence('feed', 24)).toBe(1);
    expect(scenePresence('feed', 6.01)).toBeGreaterThan(0.99);
  });
});
