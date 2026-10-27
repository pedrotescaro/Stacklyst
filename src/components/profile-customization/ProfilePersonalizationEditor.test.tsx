import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CHAT_PREFERENCES,
  DEFAULT_PROFILE_CATALOG,
  DEFAULT_PROFILE_PREFERENCES,
  type ProfileCustomizationState,
} from '@/lib/profile-customization';
import { ProfilePersonalizationEditor } from './ProfilePersonalizationEditor';

vi.mock('@/lib/client/current-user', () => ({ invalidateCurrentUser: vi.fn() }));
const user = {
  id: 'owner',
  username: 'developer',
  avatar_url: null,
  avatar_config: { name: 'Developer' },
};
let persisted: ProfileCustomizationState;
let calls: { url: string; body: unknown }[];
let failSave = false;
let uploads = 0;

beforeEach(() => {
  calls = [];
  failSave = false;
  uploads = 0;
  persisted = {
    avatarUrl: null,
    preferences: structuredClone(DEFAULT_PROFILE_PREFERENCES),
    chat: structuredClone(DEFAULT_CHAT_PREFERENCES),
    version: 3,
    catalog: structuredClone(DEFAULT_PROFILE_CATALOG),
    newUnlocks: [],
    achievements: DEFAULT_PROFILE_CATALOG.achievements.map((item, index) => ({
      ...item,
      progress: index === 0 ? item.requirement.target : 0,
      unlocked: index === 0,
      unlockedAt: index === 0 ? '2026-10-27T12:00:00Z' : null,
    })),
  };
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/upload') {
        uploads += 1;
        return Response.json({
          url: 'https://project.supabase.co/storage/v1/object/public/uploads/owner/photo.jpg',
        });
      }
      if (url.startsWith('/api/profile/tags')) return Response.json({ tags: ['python', 'pyqt'] });
      if (url === '/api/profile/music/resolve')
        return Response.json({
          trackId: '11dFghVXANMlKmJXsNCbNl',
          title: 'Minha faixa',
          artist: 'Artista',
          artworkUrl: null,
        });
      if (init?.method === 'PUT') {
        const body = JSON.parse(init.body as string);
        calls.push({ url, body });
        if (failSave) return Response.json({ message: 'Falha temporária' }, { status: 503 });
        persisted = {
          ...persisted,
          avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : persisted.avatarUrl,
          preferences: body.preferences,
          chat: body.chat,
          version: persisted.version + 1,
        };
      }
      return Response.json(persisted);
    })
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function open(initialSection?: 'appearance' | 'achievements') {
  const view = render(<ProfilePersonalizationEditor user={user} initialSection={initialSection} />);
  await screen.findByRole('heading', {
    name: initialSection === 'achievements' ? 'Conquistas' : 'Aparência',
  });
  return view;
}

describe('Profile personalization editor', () => {
  it('previews card, accent, secondary and button colors before saving', async () => {
    await open();
    fireEvent.change(screen.getByLabelText('Fundo do perfil'), { target: { value: '#10151d' } });
    fireEvent.change(screen.getByLabelText('Fundo dos cartões'), { target: { value: '#151e29' } });
    fireEvent.change(screen.getByLabelText('Cor de destaque'), { target: { value: '#70b6ff' } });
    fireEvent.change(screen.getByLabelText('Destaque secundário'), {
      target: { value: '#e879c0' },
    });
    fireEvent.change(screen.getByLabelText('Cor dos botões'), { target: { value: '#0083fe' } });
    const preview = screen.getByTestId('profile-live-preview');
    expect(preview).toHaveStyle({
      '--color-dd-card': '#151e29',
      '--color-dd-accent': '#70b6ff',
      '--color-dd-muted': '#e879c0',
      '--profile-button': '#0083fe',
    });
    expect(within(preview).getByText('Prévia das cores do perfil').parentElement).toHaveStyle({
      backgroundColor: '#151e29',
    });
    expect(within(preview).getByText('Seguir')).toHaveStyle({ backgroundColor: '#0083fe' });
    expect(calls).toHaveLength(0);
  });
  it('saves a chosen theme and restores the persisted preference after remount', async () => {
    const view = await open();
    fireEvent.click(screen.getByRole('button', { name: 'Azul claro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await screen.findByText('Personalização salva. Seu perfil já está atualizado.');
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      url: '/api/profile/customization',
      body: expect.objectContaining({
        version: 3,
        preferences: expect.objectContaining({
          appearance: expect.objectContaining({ backgroundColor: '#eaf4ff' }),
        }),
      }),
    });
    expect(calls[0].body).not.toHaveProperty('userId');
    view.unmount();
    await open();
    expect(screen.getByLabelText('Fundo do perfil')).toHaveValue('#eaf4ff');
  });

  it('preserves unsaved choices on failure and discards only when requested', async () => {
    await open();
    failSave = true;
    fireEvent.change(screen.getByLabelText('Fundo do perfil'), { target: { value: '#123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await screen.findByRole('alert');
    expect(screen.getByLabelText('Fundo do perfil')).toHaveValue('#123456');
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.getByLabelText('Fundo do perfil')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('adds and removes tags and studies, selects a frame and persists the full draft', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Tags e interesses' }));
    fireEvent.change(screen.getByLabelText('Adicionar interesse (0/10)'), {
      target: { value: 'python' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByRole('button', { name: 'Remover tag python' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Estudando atualmente' }));
    fireEvent.change(screen.getByLabelText('Adicionar assunto (0/3)'), {
      target: { value: 'Engenharia de Software' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(
      screen.getByRole('button', { name: 'Remover estudo Engenharia de Software' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Avatar e molduras' }));
    fireEvent.click(screen.getByRole('button', { name: 'Neon azul' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await screen.findByText('Personalização salva. Seu perfil já está atualizado.');
    expect(persisted.preferences).toEqual(
      expect.objectContaining({
        tags: ['python'],
        studies: ['Engenharia de Software'],
        frameId: 'neon-blue',
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tags e interesses' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover tag python' }));
    fireEvent.click(screen.getByRole('button', { name: 'Estudando atualmente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover estudo Engenharia de Software' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(persisted.preferences.tags).toEqual([]));
    expect(persisted.preferences.studies).toEqual([]);
  });

  it('resolves and removes Spotify music, and saves banner positioning', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Música do perfil' }));
    fireEvent.change(screen.getByLabelText('Link da faixa no Spotify'), {
      target: { value: 'https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Selecionar faixa pelo link' }));
    await waitFor(() => expect(screen.getAllByText('Minha faixa').length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(persisted.preferences.music?.title).toBe('Minha faixa'));
    fireEvent.click(screen.getByRole('button', { name: 'Remover música' }));
    fireEvent.click(screen.getByRole('button', { name: 'Banner' }));
    fireEvent.change(screen.getByLabelText('Tipo de banner'), { target: { value: 'gradient' } });
    fireEvent.change(screen.getByLabelText('Cor do banner'), { target: { value: '#112233' } });
    fireEvent.change(screen.getByLabelText('Segunda cor do banner'), {
      target: { value: '#445566' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(persisted.preferences.music).toBeNull());
    expect(persisted.preferences.banner).toEqual(
      expect.objectContaining({ mode: 'gradient', color: '#112233', secondaryColor: '#445566' })
    );
  });

  it('equips only a real unlocked title and shows locked progress', async () => {
    await open('achievements');
    expect(screen.getByRole('heading', { name: 'Minhas Conquistas' })).toBeInTheDocument();
    const first = persisted.achievements[0];
    const article = screen
      .getByRole('heading', { name: new RegExp(first.name) })
      .closest('article')!;
    fireEvent.click(within(article).getByRole('button', { name: 'Usar título' }));
    fireEvent.click(within(article).getByRole('button', { name: 'Destacar no perfil' }));
    expect(
      screen.getByRole('progressbar', { name: `Progresso de ${persisted.achievements[1].name}` })
    ).toHaveAttribute('value', '0');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(persisted.preferences.equippedTitleId).toBe(first.id));
    expect(persisted.preferences.featuredAchievementIds).toEqual([first.id]);
  });

  it('removes a persisted photo only after saving and can discard the removal', async () => {
    persisted.avatarUrl =
      'https://project.supabase.co/storage/v1/object/public/uploads/owner/old.jpg';
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Avatar e molduras' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover foto' }));
    expect(persisted.avatarUrl).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.getAllByAltText('Foto de developer')[0]).toHaveAttribute(
      'src',
      persisted.avatarUrl
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remover foto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await screen.findByText('Personalização salva. Seu perfil já está atualizado.');
    expect(calls.at(-1)?.body).toHaveProperty('avatarUrl', null);
    expect(persisted.avatarUrl).toBeNull();
  });

  it('stages a cropped photo, retries a failed save without uploading twice and persists it atomically', async () => {
    const OriginalURL = URL;
    let nextUrl = 0;
    vi.stubGlobal(
      'URL',
      class extends OriginalURL {
        static createObjectURL = vi.fn(() => `blob:photo-${++nextUrl}`);
        static revokeObjectURL = vi.fn();
      }
    );
    vi.stubGlobal(
      'Image',
      class {
        src = '';
        naturalWidth = 1200;
        naturalHeight = 800;
        decode() {
          return Promise.resolve();
        }
      }
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['cropped'], { type: 'image/jpeg' }));
    });
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Avatar e molduras' }));
    fireEvent.change(screen.getByLabelText('Selecionar foto do perfil'), {
      target: { files: [new File(['image'], 'foto.png', { type: 'image/png' })] },
    });
    await screen.findByAltText('Prévia do recorte da foto');
    fireEvent.change(screen.getByLabelText('Zoom da foto: 1.0×'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar recorte' }));
    await screen.findByText('Foto preparada. Salve a personalização para atualizar seu perfil.');
    expect(uploads).toBe(0);
    expect(persisted.avatarUrl).toBeNull();
    failSave = true;
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await screen.findByRole('alert');
    expect(uploads).toBe(1);
    expect(persisted.avatarUrl).toBeNull();
    failSave = false;
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await screen.findByText('Personalização salva. Seu perfil já está atualizado.');
    expect(uploads).toBe(1);
    expect(calls.at(-1)?.body).toHaveProperty(
      'avatarUrl',
      'https://project.supabase.co/storage/v1/object/public/uploads/owner/photo.jpg'
    );
    expect(persisted.avatarUrl).toContain('/owner/photo.jpg');
  });
});
