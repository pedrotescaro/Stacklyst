import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ThemeSync } from '../ThemeSync';
import { saveTheme, syncTheme, themeBootstrap } from '@/lib/theme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  document.documentElement.classList.remove('dark');
});
it('restores an explicitly selected dark theme after hydration and page restoration', () => {
  saveTheme('dark');
  document.documentElement.classList.remove('dark');
  render(<ThemeSync />);
  expect(document.documentElement).toHaveClass('dark');
  document.documentElement.classList.remove('dark');
  fireEvent(window, new Event('pageshow'));
  expect(document.documentElement).toHaveClass('dark');
  expect(document.documentElement.style.colorScheme).toBe('dark');
});
it('keeps the explicit preference through repeated initializations and updates from another tab', () => {
  render(<ThemeSync />);
  for (let index = 0; index < 10; index++) {
    saveTheme(index % 2 ? 'dark' : 'light');
    expect(syncTheme()).toBe(index % 2 ? 'dark' : 'light');
  }
  localStorage.setItem('theme', 'light');
  fireEvent(window, new StorageEvent('storage', { key: 'theme', newValue: 'light' }));
  expect(document.documentElement).not.toHaveClass('dark');
});
it('uses the same stored preference in the bootstrap before React loads', () => {
  localStorage.setItem('theme', 'dark');
  window.eval(themeBootstrap);
  expect(document.documentElement).toHaveClass('dark');
  localStorage.setItem('theme', 'light');
  window.eval(themeBootstrap);
  expect(document.documentElement).not.toHaveClass('dark');
});
