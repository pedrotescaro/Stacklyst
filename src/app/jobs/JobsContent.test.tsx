import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobsContent } from './JobsContent';
import type { JobItem } from './JobsContent';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/Sidebar', () => ({
  Sidebar: ({ user }: { user?: { role?: string } }) => (
    <aside data-testid="sidebar" data-user-role={user?.role ?? 'unknown'} />
  ),
}));

const jobs: JobItem[] = [
  {
    id: 'frontend-junior',
    title: 'Desenvolvedora Front-end Júnior',
    description: 'Construa interfaces acessíveis para produtos digitais.',
    level: 'JUNIOR',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    modality: 'REMOTE',
    location: 'Brasil',
    contract_type: 'CLT',
    salary_min: 7000,
    salary_max: 9000,
    created_at: '2026-08-30T12:00:00.000Z',
    company: {
      id: 'acme',
      name: 'Acme Tecnologia',
      slug: 'acme-tecnologia',
      logo_url: null,
      location: 'São Paulo, SP',
      is_verified: true,
    },
    stages: [
      { id: 'frontend-stage-1', title: 'Triagem', type: 'SCREENING', order: 1 },
      { id: 'frontend-stage-2', title: 'Desafio técnico', type: 'CHALLENGE', order: 2 },
    ],
    _count: { applications: 12 },
  },
  {
    id: 'backend-senior',
    title: 'Pessoa Desenvolvedora Backend Sênior',
    description: 'Evolua serviços distribuídos de alta disponibilidade.',
    level: 'SENIOR',
    technologies: ['Java', 'Spring Boot', 'PostgreSQL'],
    modality: 'ONSITE',
    location: 'Curitiba, PR',
    contract_type: 'PJ',
    salary_min: 15000,
    salary_max: null,
    created_at: '2026-08-01T12:00:00.000Z',
    company: {
      id: 'orbital',
      name: 'Orbital Sistemas',
      slug: 'orbital-sistemas',
      logo_url: null,
      location: 'Curitiba, PR',
      is_verified: false,
    },
    stages: [{ id: 'backend-stage-1', title: 'Entrevista técnica', type: 'INTERVIEW', order: 1 }],
    _count: { applications: 5 },
  },
];

function jobsResponse(body: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('JobsContent', () => {
  it('carrega vagas reais, exibe seus detalhes e mostra o acesso do recrutador', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jobsResponse(jobs));
    vi.stubGlobal('fetch', fetchMock);

    render(<JobsContent user={{ id: 'recruiter-1', role: 'RECRUITER' }} />);

    expect(screen.getByLabelText('Carregando vagas abertas')).toHaveAttribute('aria-busy', 'true');

    const frontendLink = await screen.findByRole('link', {
      name: /Desenvolvedora Front-end Júnior/,
    });
    const backendLink = screen.getByRole('link', {
      name: /Pessoa Desenvolvedora Backend Sênior/,
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/jobs', {
      signal: expect.any(AbortSignal),
    });
    expect(screen.getByText('2 vagas encontradas')).toBeInTheDocument();
    expect(frontendLink).toHaveAttribute('href', '/jobs/frontend-junior');
    expect(frontendLink).toHaveTextContent('Acme Tecnologia');
    expect(frontendLink).toHaveTextContent('Remoto · Brasil');
    expect(frontendLink).toHaveTextContent('2 etapas');
    expect(frontendLink).toHaveTextContent('React');
    expect(within(frontendLink).getByText('Empresa verificada')).toBeInTheDocument();
    expect(backendLink).toHaveAttribute('href', '/jobs/backend-senior');
    expect(backendLink).toHaveTextContent('Presencial · Curitiba, PR');
    expect(backendLink).toHaveTextContent('1 etapa');

    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-user-role', 'RECRUITER');
    expect(screen.getByRole('link', { name: 'Painel do recrutador' })).toHaveAttribute(
      'href',
      '/recruiter'
    );
  });

  it('combina filtros de texto e seleção e restaura todas as vagas ao limpar', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jobsResponse(jobs)));

    render(<JobsContent user={{ id: 'member-1', role: 'MEMBER' }} />);
    await screen.findByText('2 vagas encontradas');

    const technologyFilter = screen.getByRole('searchbox', { name: 'Tecnologia' });
    const remoteFilter = within(
      screen.getByRole('group', { name: 'Modelo de trabalho' })
    ).getByRole('checkbox', { name: 'Remoto' });
    const seniorFilter = within(screen.getByRole('group', { name: 'Nível' })).getByRole(
      'checkbox',
      { name: 'Sênior' }
    );

    await user.type(technologyFilter, 'react');
    await user.click(remoteFilter);

    expect(screen.getByText('1 vaga encontrada')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Desenvolvedora Front-end Júnior' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'Pessoa Desenvolvedora Backend Sênior' })
    ).not.toBeInTheDocument();

    await user.click(seniorFilter);

    expect(screen.getByText('0 vagas encontradas')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Nenhuma vaga combina com os filtros' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    await waitFor(() => expect(screen.getByText('2 vagas encontradas')).toBeInTheDocument());
    expect(technologyFilter).toHaveValue('');
    expect(remoteFilter).not.toBeChecked();
    expect(seniorFilter).not.toBeChecked();
    expect(screen.getByRole('heading', { name: 'Desenvolvedora Front-end Júnior' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Pessoa Desenvolvedora Backend Sênior' })
    ).toBeVisible();
  });

  it('apresenta o erro de carregamento e refaz a consulta ao tentar novamente', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jobsResponse({ message: 'indisponível' }, false))
      .mockResolvedValueOnce(jobsResponse([jobs[1]]));
    vi.stubGlobal('fetch', fetchMock);

    render(<JobsContent user={{ id: 'member-1', role: 'MEMBER' }} />);

    expect(
      await screen.findByRole('heading', { name: 'Falha ao carregar as vagas' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Verifique sua conexão e tente novamente/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(
      await screen.findByRole('heading', { name: 'Pessoa Desenvolvedora Backend Sênior' })
    ).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(screen.getByText('1 vaga encontrada')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Falha ao carregar as vagas' })
    ).not.toBeInTheDocument();
  });
});
