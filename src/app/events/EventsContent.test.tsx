import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EventsContent } from './EventsContent';
import type { EventItem } from './EventsContent';

vi.mock('@/components/Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar" />,
}));

const events: EventItem[] = [
  {
    id: 'hackathon-1',
    slug: 'hackathon-1',
    title: 'Hackathon Front-end',
    description: 'Construa uma experiência acessível em equipe.',
    type: 'HACKATHON',
    status: 'UPCOMING',
    banner_url: null,
    min_level: 1,
    max_participants: 100,
    xp_reward: 500,
    start_date: '2026-09-12T12:00:00.000Z',
    end_date: '2026-09-13T12:00:00.000Z',
    creator: { username: 'stacklyst' },
    company: { name: 'Acme', is_verified: true },
    _count: { participants: 24 },
  },
  {
    id: 'championship-1',
    slug: 'championship-1',
    title: 'Campeonato de Algoritmos',
    description: 'Resolva problemas progressivos contra o tempo.',
    type: 'CHAMPIONSHIP',
    status: 'UPCOMING',
    banner_url: null,
    min_level: 2,
    max_participants: null,
    xp_reward: 350,
    start_date: '2026-09-20T12:00:00.000Z',
    end_date: '2026-09-20T18:00:00.000Z',
    creator: { username: 'stacklyst' },
    company: null,
    _count: { participants: 16 },
  },
  {
    id: 'challenge-1',
    slug: 'challenge-1',
    title: 'Desafio ao vivo de TypeScript',
    description: 'Implemente uma solução acompanhando a transmissão.',
    type: 'CHALLENGE',
    status: 'ONGOING',
    banner_url: null,
    min_level: 1,
    max_participants: 50,
    xp_reward: 250,
    start_date: '2026-09-08T12:00:00.000Z',
    end_date: '2026-09-08T14:00:00.000Z',
    creator: { username: 'stacklyst' },
    company: null,
    _count: { participants: 31 },
  },
];

function eventsResponse(body: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('EventsContent', () => {
  it('filtra eventos por uma ou mais categorias e restaura os resultados ao limpar', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(eventsResponse(events)));

    render(<EventsContent user={{ id: 'member-1', role: 'MEMBER' }} />);

    expect(screen.getByLabelText('Carregando eventos disponíveis')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    await screen.findByText('3 eventos encontrados');

    const mobileToggle = screen.getByRole('button', { name: /Filtrar eventos/ });
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');

    const typeGroup = screen.getByRole('group', { name: 'Tipo de evento' });
    const hackathonFilter = within(typeGroup).getByRole('checkbox', { name: 'Hackathon' });
    const championshipFilter = within(typeGroup).getByRole('checkbox', { name: 'Campeonato' });
    const workshopFilter = within(typeGroup).getByRole('checkbox', { name: 'Workshop' });

    await user.click(hackathonFilter);
    expect(screen.getByText('1 evento encontrado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hackathon Front-end' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Campeonato de Algoritmos' })).toBeNull();

    await user.click(championshipFilter);
    expect(screen.getByText('2 eventos encontrados')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Campeonato de Algoritmos' })).toBeVisible();

    await user.click(hackathonFilter);
    await user.click(championshipFilter);
    await user.click(workshopFilter);

    expect(screen.getByText('0 eventos encontrados')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Nenhum evento combina com os filtros' })
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    await waitFor(() => expect(screen.getByText('3 eventos encontrados')).toBeInTheDocument());
    expect(workshopFilter).not.toBeChecked();
    expect(screen.getByRole('heading', { name: 'Hackathon Front-end' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Campeonato de Algoritmos' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Desafio ao vivo de TypeScript' })).toBeVisible();
  });

  it('apresenta erro de carregamento e permite tentar novamente', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(eventsResponse({ message: 'indisponível' }, false))
      .mockResolvedValueOnce(eventsResponse([events[0]]));
    vi.stubGlobal('fetch', fetchMock);

    render(<EventsContent user={{ id: 'member-1', role: 'MEMBER' }} />);

    expect(
      await screen.findByRole('heading', { name: 'Falha ao carregar os eventos' })
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('1 evento encontrado')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Hackathon Front-end' })).toBeVisible();
  });
});
