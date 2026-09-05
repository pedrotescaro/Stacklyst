import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from './page';
import { LanguageProvider } from '@/contexts/LanguageContext';

const getCurrentUser = vi.fn();
const playSoundPreview = vi.fn();

vi.mock('@/components/Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar" />,
}));

vi.mock('@/lib/client/current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
  invalidateCurrentUser: vi.fn(),
}));

vi.mock('@/hooks/useSoundEffects', () => ({
  playSoundPreview: (...args: unknown[]) => playSoundPreview(...args),
}));

vi.mock('next/image', () => ({
  default: ({
    alt,
    unoptimized: _unoptimized,
    ...props
  }: ComponentProps<'img'> & { unoptimized?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element -- image optimization is outside this page behavior test
    return <img alt={alt} {...props} />;
  },
}));

const user = {
  id: 'user-1',
  username: 'pedro',
  bio: '',
  institution: '',
  github_username: '',
  discord_username: '',
  banner_url: '',
  pronouns: '',
  birthday: null,
};

function renderSettings() {
  return render(
    <LanguageProvider>
      <SettingsPage />
    </LanguageProvider>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'pt-BR';
    document.documentElement.removeAttribute('data-language');
    getCurrentUser.mockReset();
    getCurrentUser.mockResolvedValue(user);
    playSoundPreview.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render the site footer in settings', async () => {
    renderSettings();

    await screen.findByRole('heading', { name: 'Sua conta' });

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('plays a confirmation preview for both sound transitions and persists the setting', async () => {
    const interaction = userEvent.setup();
    renderSettings();

    await screen.findByRole('heading', { name: 'Sua conta' });
    await interaction.click(screen.getByRole('button', { name: /Efeitos sonoros/ }));

    const toggle = screen.getByRole('button', { name: 'Ligado' });
    await interaction.click(toggle);

    expect(playSoundPreview).toHaveBeenLastCalledWith('notification');
    expect(localStorage.getItem('stacklyst-sound')).toBe('false');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('estão desligados');

    await interaction.click(screen.getByRole('button', { name: 'Desligado' }));

    expect(playSoundPreview).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem('stacklyst-sound')).toBe('true');
    expect(screen.getByRole('button', { name: 'Ligado' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('estão ligados');
  });

  it('switches the settings experience to English and persists the chosen language', async () => {
    const interaction = userEvent.setup();
    renderSettings();

    await screen.findByRole('heading', { name: 'Sua conta' });
    await interaction.click(screen.getByRole('button', { name: /Idioma/ }));
    await interaction.click(screen.getByRole('radio', { name: /English/ }));

    expect(await screen.findByRole('heading', { name: 'Language' })).toBeVisible();
    expect(screen.getByPlaceholderText('Search settings')).toBeVisible();
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dataset.language).toBe('en');
    expect(localStorage.getItem('site-language')).toBe('en');
  });
});
