import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CHAT_PREFERENCES,
  DEFAULT_PROFILE_CATALOG,
  DEFAULT_PROFILE_PREFERENCES,
  type ProfileCustomizationState,
} from '@/lib/profile-customization';
import { ProfileIdentitySettings } from './ProfileIdentitySettings';
import { SpotifyConnectionSettings } from './SpotifyConnectionSettings';
import { LanguageProvider } from '@/contexts/LanguageContext';

vi.mock('@/lib/client/current-user', () => ({ invalidateCurrentUser: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ProfileIdentitySettings', () => {
  let persisted: ProfileCustomizationState;
  let saved: Record<string, any> | null;

  beforeEach(() => {
    saved = null;
    persisted = {
      avatarUrl: null,
      preferences: structuredClone(DEFAULT_PROFILE_PREFERENCES),
      chat: structuredClone(DEFAULT_CHAT_PREFERENCES),
      version: 4,
      catalog: structuredClone(DEFAULT_PROFILE_CATALOG),
      newUnlocks: [],
      profile: { displayName: 'Pedro' } as ProfileCustomizationState['profile'],
      achievements: DEFAULT_PROFILE_CATALOG.achievements.map((item, index) => ({
        ...item,
        progress: index === 0 ? item.requirement.target : 0,
        unlocked: index === 0,
        unlockedAt: index === 0 ? '2026-10-27T12:00:00Z' : null,
      })),
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        if (init?.method === 'PUT') {
          saved = JSON.parse(init.body as string);
          persisted = {
            ...persisted,
            preferences: saved!.preferences,
            profile: { ...persisted.profile, displayName: saved!.profile.displayName } as never,
            version: persisted.version + 1,
          };
        }
        return Response.json(persisted);
      })
    );
  });

  it('saves name, title, frame and flags from settings', async () => {
    render(
      <LanguageProvider>
        <ProfileIdentitySettings />
      </LanguageProvider>
    );
    const name = await screen.findByLabelText('Nome de exibição');
    expect(name).toHaveValue('Pedro');
    const saveButton = screen.getByRole('button', { name: 'Salvar perfil' });
    expect(saveButton).toBeDisabled();

    fireEvent.change(name, { target: { value: 'Pedro T.' } });
    const unlocked = persisted.achievements[0];
    fireEvent.click(screen.getByRole('button', { name: `Usar: ${unlocked.name}` }));
    const freeFrame = persisted.catalog.frames.find(
      (item) => item.id !== 'none' && !item.achievementId
    )!;
    fireEvent.click(screen.getByRole('button', { name: freeFrame.name }));
    // The flag picker renders after the frame grid, which has a "Brasil" ring too.
    fireEvent.click(screen.getAllByRole('button', { name: 'Brasil' }).at(-1)!);

    fireEvent.click(saveButton);
    await screen.findByText('Perfil atualizado.');
    expect(saved).toMatchObject({
      version: 4,
      profile: { displayName: 'Pedro T.' },
      preferences: { equippedTitleId: unlocked.id, frameId: freeFrame.id },
    });
    expect(saved!.preferences.flags.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Salvar perfil' })).toBeDisabled();
    // Renders the whole frame and flag catalogs; CI runners need more than 5s.
  }, 20000);

  it('does not allow equipping locked titles', async () => {
    render(
      <LanguageProvider>
        <ProfileIdentitySettings />
      </LanguageProvider>
    );
    await screen.findByLabelText('Nome de exibição');
    const locked = persisted.achievements[1];
    expect(screen.getByRole('button', { name: `Usar: ${locked.name}` })).toBeDisabled();
  });
});

describe('SpotifyConnectionSettings', () => {
  it('offers a connect link when the account is not linked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ configured: true, connected: false }))
    );
    render(<SpotifyConnectionSettings />);
    const link = await screen.findByRole('link', { name: 'Conectar' });
    expect(link).toHaveAttribute('href', '/api/spotify/connect');
  });

  it('explains Free accounts keep previews and lets people disconnect', async () => {
    let connected = true;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/spotify/disconnect' && init?.method === 'POST') {
        connected = false;
        return Response.json({ connected: false });
      }
      return Response.json(
        connected
          ? { configured: true, connected: true, displayName: 'Ana', premium: false }
          : { configured: true, connected: false }
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<SpotifyConnectionSettings />);
    expect(await screen.findByText('Conectado como Ana')).toBeInTheDocument();
    expect(screen.getByText(/Spotify Free/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Desconectar' }));
    await waitFor(() => expect(screen.getByText('Não conectado')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/spotify/disconnect', { method: 'POST' });
  });

  it('shows the OAuth outcome once and removes it from the address bar', async () => {
    window.history.replaceState(null, '', '/settings?tab=spotify&spotify=not_allowed');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ configured: true, connected: false }))
    );
    render(<SpotifyConnectionSettings />);
    expect(await screen.findByRole('alert')).toHaveTextContent('modo de desenvolvimento');
    expect(window.location.search).toBe('?tab=spotify');
  });
});
