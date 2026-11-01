import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TitlesShowcaseView } from '../TitlesShowcaseView';
import type { ProfileCustomizationState } from '@/lib/profile-customization';

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    refresh: mockRefresh,
  }),
}));

const mockEvents = [
  {
    id: 'halloween-2026',
    name: 'Halloween no Stacklyst',
    startsAt: '2026-10-25T03:00:00.000Z',
    endsAt: '2026-11-01T03:00:00.000Z',
    hashtag: 'Halloween',
    enabled: true,
  },
  {
    id: 'expired-event',
    name: 'Evento Passado',
    startsAt: '2025-01-01T00:00:00.000Z',
    endsAt: '2025-01-02T00:00:00.000Z',
    hashtag: 'Passado',
    enabled: true,
  },
];

const mockInitialData: ProfileCustomizationState = {
  version: 1,
  avatarUrl: null,
  preferences: {
    appearance: {
      backgroundColor: null,
      accentColor: null,
      secondaryColor: null,
      cardColor: null,
      borderColor: null,
      buttonColor: null,
    },
    nameStyle: {
      color: null,
      bold: false,
      italic: false,
      underline: false,
    },
    banner: {
      mode: 'default',
      color: '#0083fe',
      secondaryColor: '#0083fe',
      imageUrl: null,
      positionX: 50,
      positionY: 50,
    },
    music: null,
    flag: null,
    flags: [],
    frameId: 'none',
    tags: [],
    studies: [],
    featuredAchievementIds: [],
    equippedTitleId: 'posts-1',
  },
  chat: {
    mode: 'default',
    backgroundColor: '#0d0f12',
    bubbleColor: '#161922',
    accentColor: null,
  },
  catalog: {
    frames: [{ id: 'none', name: 'Sem moldura', color: '#64748b', decoration: 'none' }],
    events: mockEvents,
    achievements: [],
  },
  achievements: [
    {
      id: 'posts-1',
      name: 'Iniciante',
      description: 'Publique 1 publicação válida.',
      category: 'posts',
      rarity: 'common',
      color: '#64748b',
      icon: 'sprout',
      requirement: { metric: 'posts', target: 1 },
      progress: 1,
      unlocked: true,
      unlockedAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'posts-10',
      name: 'Voz Ativa',
      description: 'Publique 10 publicações válidas.',
      category: 'posts',
      rarity: 'uncommon',
      color: '#16a34a',
      icon: 'award',
      requirement: { metric: 'posts', target: 10 },
      progress: 4,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: 'halloween-spirit',
      name: 'Espírito de Halloween',
      description: 'Publique com a hashtag do evento durante o período.',
      category: 'event',
      rarity: 'special',
      color: '#f97316',
      icon: 'ghost',
      requirement: { metric: 'eventPosts', target: 1, eventId: 'halloween-2026' },
      progress: 0,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: 'primordial',
      name: 'Primordial',
      description: 'Membro antigo.',
      category: 'event',
      rarity: 'special',
      color: '#06b6d4',
      icon: 'sparkles',
      requirement: { metric: 'eventComplete', target: 1, eventId: 'expired-event' },
      progress: 0,
      unlocked: false,
      unlockedAt: null,
    },
  ],
  newUnlocks: [],
};

const mockUser = {
  id: 'user-1',
  username: 'pedrodev',
};

describe('TitlesShowcaseView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, version: 2 }),
    });
  });

  it('renders header, title badges, and unambiguous "Como obter" boxes', () => {
    render(<TitlesShowcaseView initialData={mockInitialData} user={mockUser} />);

    // Header checks
    expect(screen.getByRole('heading', { level: 1, name: 'Títulos' })).toBeInTheDocument();

    // Check titles rendered
    expect(screen.getAllByText('Iniciante').length).toBeGreaterThan(0);
    expect(screen.getByText('Voz Ativa')).toBeInTheDocument();
    expect(screen.getByText('Espírito de Halloween')).toBeInTheDocument();
    expect(screen.getByText('Primordial')).toBeInTheDocument();

    // Unambiguous instruction checks in "Como obter" boxes
    expect(
      screen.getByText(
        /Publique 1 postagem no feed\. Título com pelo menos 4 caracteres e texto com pelo menos 40/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Publique 10 postagens no feed\. Título com pelo menos 4 caracteres e texto com pelo menos 40/
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/hashtag exata #Halloween/)).toBeInTheDocument();
  });

  it('displays correct ownership status rows', () => {
    render(<TitlesShowcaseView initialData={mockInitialData} user={mockUser} />);

    // Unlocked title status
    const ownedStatus = screen.getByText('Você possui');
    expect(ownedStatus).toBeInTheDocument();

    // Locked title status
    const unownedStatusList = screen.getAllByText('Você não possui');
    expect(unownedStatusList.length).toBeGreaterThan(0);

    // Unavailable / limited event title status
    expect(screen.getByText('Indisponível para obter')).toBeInTheDocument();
  });

  it('equips and un-equips titles with instant optimistic feedback', async () => {
    render(<TitlesShowcaseView initialData={mockInitialData} user={mockUser} />);

    // posts-1 is equipped initially, so it has "Em uso" badge and "Retirar" button
    expect(screen.getByText('Em uso')).toBeInTheDocument();
    const removeButton = screen.getByRole('button', { name: 'Retirar' });

    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile/customization',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    // Success toast shown
    await waitFor(() => {
      expect(screen.getByText('Título removido do perfil.')).toBeInTheDocument();
    });
  });

  it('uses the saved version for the next equip and refreshes shared profile identity', async () => {
    const changed = vi.fn();
    window.addEventListener('stacklyst:profile-customization', changed);
    render(<TitlesShowcaseView initialData={mockInitialData} user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retirar' }));
    await waitFor(() => expect(screen.getByText('Título removido do perfil.')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Usar título Iniciante' }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    const first = JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]!.body as string);
    const second = JSON.parse(vi.mocked(global.fetch).mock.calls[1][1]!.body as string);
    expect(first.version).toBe(1);
    expect(second.version).toBe(2);
    expect(second.preferences.equippedTitleId).toBe('posts-1');
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(2));
    expect(changed).toHaveBeenCalledTimes(2);
    window.removeEventListener('stacklyst:profile-customization', changed);
  });

  it('rolls back the equipped title on failed persistence', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Não foi possível salvar. Tente novamente.' }),
    } as Response);
    render(<TitlesShowcaseView initialData={mockInitialData} user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retirar' }));
    expect(screen.queryByText('Em uso')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Não foi possível salvar. Tente novamente.'
      )
    );
    expect(screen.getByText('Em uso')).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Usar título Voz Ativa' })).not.toBeInTheDocument();
  });

  it('filters titles by ownership and search query', () => {
    render(<TitlesShowcaseView initialData={mockInitialData} user={mockUser} />);

    // Filter by "Você possui"
    const ownedFilterBtn = screen.getByRole('button', { name: /Você possui/ });
    fireEvent.click(ownedFilterBtn);

    expect(screen.getAllByText('Iniciante').length).toBeGreaterThan(0);
    expect(screen.queryByText('Voz Ativa')).not.toBeInTheDocument();

    // Filter by "Você não possui"
    const unownedFilterBtn = screen.getByRole('button', { name: /Você não possui/ });
    fireEvent.click(unownedFilterBtn);

    const articles = screen.getAllByRole('article');
    expect(articles.some((a) => within(a).queryByText('Iniciante'))).toBe(false);
    expect(screen.getByText('Voz Ativa')).toBeInTheDocument();

    // Search input
    const searchInput = screen.getByPlaceholderText(/Buscar por título/);
    fireEvent.change(searchInput, { target: { value: 'Halloween' } });

    expect(screen.getByText('Espírito de Halloween')).toBeInTheDocument();
    expect(screen.queryByText('Voz Ativa')).not.toBeInTheDocument();
  });
});
