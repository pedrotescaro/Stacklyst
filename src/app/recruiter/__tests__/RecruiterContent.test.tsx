import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecruiterContent } from '../RecruiterContent';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/FeedRightSidebar', () => ({ FeedRightSidebar: () => null }));

vi.mock('@/components/Sidebar', () => ({
  Sidebar: () => <aside aria-label="Sidebar" />,
}));

const mockUser = {
  id: 'recruiter-1',
  username: 'recruiter_pedro',
  role: 'RECRUITER',
};

const mockCompanies = [
  {
    id: 'comp-1',
    name: 'TechCorp Brasil',
    slug: 'techcorp-brasil',
    website: 'https://techcorp.com.br',
    location: 'São Paulo, SP',
    is_verified: true,
  },
];

const mockJobs = [
  {
    id: 'job-1',
    title: 'Desenvolvedor Frontend React',
    description: 'Trabalhe com Next.js e TypeScript em aplicações modernas.',
    level: 'JUNIOR',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    modality: 'REMOTE',
    location: 'Remoto',
    contract_type: 'CLT',
    salary_min: 5000,
    salary_max: 7000,
    status: 'OPEN',
    created_at: '2026-09-01T10:00:00.000Z',
    company: mockCompanies[0],
    stages: [
      { id: 'st-1', title: 'Inscrição', type: 'INSCRICAO', order: 1 },
      { id: 'st-2', title: 'Desafio Técnico', type: 'DESAFIO_TECNICO', order: 2 },
    ],
    _count: {
      applications: 2,
    },
  },
  {
    id: 'job-2',
    title: 'Backend Engineer Node.js',
    description: 'Construa microsserviços escaláveis.',
    level: 'PLENO',
    technologies: ['Node.js', 'PostgreSQL', 'Docker'],
    modality: 'HYBRID',
    location: 'São Paulo, SP',
    contract_type: 'PJ',
    salary_min: 8000,
    salary_max: 11000,
    status: 'OPEN',
    created_at: '2026-09-05T10:00:00.000Z',
    company: mockCompanies[0],
    stages: [],
    _count: {
      applications: 0,
    },
  },
];

const mockApplicants = [
  {
    id: 'app-1',
    job_id: 'job-1',
    user_id: 'user-dev-1',
    stage_id: 'st-1',
    status: 'APPLIED',
    technical_score: null,
    feedback: null,
    created_at: '2026-09-02T12:00:00.000Z',
    user: {
      id: 'user-dev-1',
      username: 'candidato_alice',
      avatar_url: null,
      total_xp: 2400,
      bio: 'Desenvolvedora front-end apaixonada por UI/UX.',
      github_username: 'alice-dev',
    },
    stage: {
      id: 'st-1',
      title: 'Inscrição',
      type: 'INSCRICAO',
      order: 1,
    },
  },
  {
    id: 'app-2',
    job_id: 'job-1',
    user_id: 'user-dev-2',
    stage_id: 'st-2',
    status: 'TESTING',
    technical_score: 95,
    feedback: 'Excelente solução no desafio prático.',
    created_at: '2026-09-03T14:30:00.000Z',
    user: {
      id: 'user-dev-2',
      username: 'candidato_bob',
      avatar_url: null,
      total_xp: 3800,
      bio: 'Full-stack developer.',
      github_username: 'bob-code',
    },
    stage: {
      id: 'st-2',
      title: 'Desafio Técnico',
      type: 'DESAFIO_TECNICO',
      order: 2,
    },
  },
];

describe('RecruiterContent Dashboard & Applicants', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders overview metrics and published jobs with applicant counters', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr === '/api/jobs/activities')
        return { ok: true, json: async () => ({ exercises: [], duels: [] }) } as Response;
      if (urlStr.includes('/api/companies')) {
        return { ok: true, json: async () => mockCompanies } as Response;
      }
      if (urlStr.includes('/api/jobs')) {
        return { ok: true, json: async () => mockJobs } as Response;
      }
      return { ok: false } as Response;
    });

    render(<RecruiterContent user={mockUser} />);

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend React')).toBeInTheDocument();
      expect(screen.getByText('Backend Engineer Node.js')).toBeInTheDocument();
    });

    // Check Metrics Overview
    // Total applications: 2 + 0 = 2
    expect(screen.getByTestId('metric-total-applications')).toHaveTextContent('2');
    expect(screen.getByTestId('metric-total-jobs')).toHaveTextContent('2');
    expect(screen.getByTestId('metric-total-companies')).toHaveTextContent('1');

    // Check applicant counter badges for each job
    const job1Badge = screen.getByTestId('job-applicants-count-job-1');
    expect(job1Badge).toHaveTextContent('2pessoas inscritas');

    const job2Badge = screen.getByTestId('job-applicants-count-job-2');
    expect(job2Badge).toHaveTextContent('0pessoas inscritas');
  });

  it('expands job applicants drawer and lists candidate details', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr === '/api/jobs/activities')
        return { ok: true, json: async () => ({ exercises: [], duels: [] }) } as Response;
      if (urlStr.includes('/api/companies')) {
        return { ok: true, json: async () => mockCompanies } as Response;
      }
      if (urlStr.includes('/api/jobs/job-1/applications')) {
        return { ok: true, json: async () => mockApplicants } as Response;
      }
      if (urlStr.includes('/api/jobs')) {
        return { ok: true, json: async () => mockJobs } as Response;
      }
      return { ok: false } as Response;
    });

    render(<RecruiterContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend React')).toBeInTheDocument();
    });

    // Click to see applicants for job-1
    const expandBtn = screen.getByRole('button', { name: /ver inscritos \(2\)/i });
    fireEvent.click(expandBtn);

    // Verify applicants drawer opens and loads candidates
    await waitFor(() => {
      expect(screen.getByText('@candidato_alice')).toBeInTheDocument();
      expect(screen.getByText('2400 XP')).toBeInTheDocument();
      expect(screen.getByText('@candidato_bob')).toBeInTheDocument();
      expect(screen.getByText('3800 XP')).toBeInTheDocument();
    });

    expect(screen.getByText('gh: @alice-dev')).toBeInTheDocument();
    expect(screen.getByText('gh: @bob-code')).toBeInTheDocument();
  });

  it('updates candidate application status via dropdown', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (url: any, options: any) => {
        const urlStr = String(url);
        if (urlStr === '/api/jobs/activities')
          return { ok: true, json: async () => ({ exercises: [], duels: [] }) } as Response;
        if (urlStr.includes('/api/companies')) {
          return { ok: true, json: async () => mockCompanies } as Response;
        }
        if (urlStr.includes('/api/jobs/job-1/applications')) {
          return { ok: true, json: async () => mockApplicants } as Response;
        }
        if (urlStr === '/api/jobs/job-1' && options?.method === 'PATCH') {
          return {
            ok: true,
            json: async () => ({ success: true }),
          } as Response;
        }
        if (urlStr.includes('/api/jobs')) {
          return { ok: true, json: async () => mockJobs } as Response;
        }
        return { ok: false } as Response;
      });

    render(<RecruiterContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend React')).toBeInTheDocument();
    });

    // Expand applicants
    fireEvent.click(screen.getByRole('button', { name: /ver inscritos \(2\)/i }));

    await waitFor(() => {
      expect(screen.getByText('@candidato_alice')).toBeInTheDocument();
    });

    // Change Alice status from APPLIED to REVIEWING
    const statusSelect = screen.getByLabelText(/atualizar status de @candidato_alice/i);
    fireEvent.change(statusSelect, { target: { value: 'IN_REVIEW' } });

    expect(fetchMock).toHaveBeenCalledWith('/api/jobs/job-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: 'app-1',
        status: 'IN_REVIEW',
      }),
    });

    await waitFor(() => {
      expect(screen.getByText('Status do candidato atualizado com sucesso!')).toBeInTheDocument();
    });
  });

  it('renders empty state when recruiter has no jobs published', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr === '/api/jobs/activities')
        return { ok: true, json: async () => ({ exercises: [], duels: [] }) } as Response;
      if (urlStr.includes('/api/companies')) {
        return { ok: true, json: async () => mockCompanies } as Response;
      }
      if (urlStr.includes('/api/jobs')) {
        return { ok: true, json: async () => [] } as Response;
      }
      return { ok: false } as Response;
    });

    render(<RecruiterContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma vaga publicada ainda')).toBeInTheDocument();
    });

    expect(screen.getByTestId('metric-total-jobs')).toHaveTextContent('0');
    expect(screen.getByTestId('metric-total-applications')).toHaveTextContent('0');
  });

  it('persists stage and candidate feedback and renders the server-confirmed stage', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (url: any, options: any) => {
        if (String(url).startsWith('/api/companies'))
          return { ok: true, json: async () => mockCompanies } as Response;
        if (String(url) === '/api/jobs/job-1/applications')
          return { ok: true, json: async () => mockApplicants } as Response;
        if (String(url) === '/api/jobs/job-1' && options?.method === 'PATCH')
          return {
            ok: true,
            json: async () => ({
              application: {
                ...mockApplicants[0],
                stage_id: 'st-2',
                feedback: 'Revise os testes antes da entrevista.',
                stage: mockJobs[0].stages[1],
              },
            }),
          } as Response;
        return { ok: true, json: async () => mockJobs } as Response;
      });
    render(<RecruiterContent user={mockUser} />);
    fireEvent.click(await screen.findByRole('button', { name: /ver inscritos \(2\)/i }));
    fireEvent.change(await screen.findByLabelText('Etapa de @candidato_alice'), {
      target: { value: 'st-2' },
    });
    fireEvent.change(screen.getByLabelText('Feedback para @candidato_alice'), {
      target: { value: 'Revise os testes antes da entrevista.' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Salvar etapa e feedback de @candidato_alice' })
    );
    await screen.findByText('Etapa e feedback salvos com sucesso!');
    expect(fetchMock).toHaveBeenCalledWith('/api/jobs/job-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: 'app-1',
        status: 'APPLIED',
        stage_id: 'st-2',
        feedback: 'Revise os testes antes da entrevista.',
      }),
    });
    expect(screen.getByLabelText('Etapa de @candidato_alice')).toHaveValue('st-2');
  });
  it('loads managed listings and recovers a failed jobs request', async () => {
    let failure = true;
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      if (String(input).startsWith('/api/companies'))
        return { ok: true, json: async () => mockCompanies } as Response;
      return { ok: !failure, json: async () => mockJobs } as Response;
    });
    render(<RecruiterContent user={mockUser} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar suas vagas'
    );
    failure = false;
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Desenvolvedor Frontend React')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/companies?mine=true',
      expect.objectContaining({ cache: 'no-store' })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/jobs?status=ALL&mine=true',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('publishes the entered job without inventing salary, requirements or benefits', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      if (String(input).startsWith('/api/companies'))
        return { ok: true, json: async () => mockCompanies } as Response;
      if (init?.method === 'POST')
        return { ok: true, json: async () => ({ success: true }) } as Response;
      return { ok: true, json: async () => mockJobs } as Response;
    });
    render(<RecruiterContent user={mockUser} />);
    await screen.findByText('Desenvolvedor Frontend React');
    fireEvent.click(screen.getByRole('tab', { name: 'Publicar vaga' }));
    fireEvent.change(screen.getByLabelText('Título da vaga'), {
      target: { value: 'Desenvolvedor React' },
    });
    fireEvent.change(screen.getByLabelText('Tecnologias'), {
      target: { value: 'React, TypeScript' },
    });
    fireEvent.change(screen.getByLabelText('Descrição e responsabilidades'), {
      target: { value: 'Desenvolva interfaces acessíveis com a equipe.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar vaga com etapas técnicas' }));
    expect(
      await screen.findByText(
        'Vaga publicada com sucesso! As etapas do processo já estão disponíveis.'
      )
    ).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(
      ([input, init]) => input === '/api/jobs' && init?.method === 'POST'
    );
    expect(post).toBeDefined();
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({
      company_id: 'comp-1',
      title: 'Desenvolvedor React',
      description: 'Desenvolva interfaces acessíveis com a equipe.',
      level: 'JUNIOR',
      modality: 'REMOTE',
      contract_type: 'CLT',
      technologies: ['React', 'TypeScript'],
      requirements: [],
      benefits: [],
    });
  });

  it('supports keyboard navigation between management sections', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      async (input) =>
        ({
          ok: true,
          json: async () => (String(input).includes('/api/companies') ? mockCompanies : mockJobs),
        }) as Response
    );
    render(<RecruiterContent user={mockUser} />);
    await screen.findByText('Desenvolvedor Frontend React');
    const initialTab = screen.getByRole('tab', { name: 'Vagas e candidatos' });
    initialTab.focus();
    fireEvent.keyDown(initialTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Empresas' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Empresas' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Empresas' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Publicar vaga' })).toHaveFocus();
    expect(screen.getByLabelText('Título da vaga')).toBeInTheDocument();
  });
  it('deletes a job after user confirmation and removes it from the list', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (url: any, options: any) => {
        const urlStr = String(url);
        if (urlStr === '/api/jobs/activities')
          return { ok: true, json: async () => ({ exercises: [], duels: [] }) } as Response;
        if (urlStr.includes('/api/companies')) {
          return { ok: true, json: async () => mockCompanies } as Response;
        }
        if (urlStr === '/api/jobs/job-1' && options?.method === 'DELETE') {
          return {
            ok: true,
            json: async () => ({ success: true, message: 'Vaga excluída com sucesso!' }),
          } as Response;
        }
        if (urlStr.includes('/api/jobs')) {
          return { ok: true, json: async () => [...mockJobs] } as Response;
        }
        return { ok: false } as Response;
      });

    render(<RecruiterContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend React')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', {
      name: 'Excluir vaga Desenvolvedor Frontend React',
    });
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Tem certeza que deseja excluir a vaga "Desenvolvedor Frontend React"?'
      )
    );

    expect(fetchMock).toHaveBeenCalledWith('/api/jobs/job-1', {
      method: 'DELETE',
    });

    await waitFor(() => {
      expect(screen.queryByText('Desenvolvedor Frontend React')).not.toBeInTheDocument();
      expect(
        screen.getByText('Vaga "Desenvolvedor Frontend React" excluída com sucesso!')
      ).toBeInTheDocument();
    });

    // Metric updated
    expect(screen.getByTestId('metric-total-jobs')).toHaveTextContent('1');
  });

  it('does not delete a job when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr === '/api/jobs/activities')
        return { ok: true, json: async () => ({ exercises: [], duels: [] }) } as Response;
      if (urlStr.includes('/api/companies')) {
        return { ok: true, json: async () => mockCompanies } as Response;
      }
      if (urlStr.includes('/api/jobs')) {
        return { ok: true, json: async () => [...mockJobs] } as Response;
      }
      return { ok: false } as Response;
    });

    render(<RecruiterContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend React')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', {
      name: 'Excluir vaga Desenvolvedor Frontend React',
    });
    fireEvent.click(deleteBtn);

    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/jobs/job-1',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(screen.getByText('Desenvolvedor Frontend React')).toBeInTheDocument();
  });

  it('shows error message when job deletion fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(global, 'fetch').mockImplementation(async (url: any, options: any) => {
      const urlStr = String(url);
      if (urlStr === '/api/jobs/activities')
        return { ok: true, json: async () => ({ exercises: [], duels: [] }) } as Response;
      if (urlStr.includes('/api/companies')) {
        return { ok: true, json: async () => mockCompanies } as Response;
      }
      if (urlStr === '/api/jobs/job-1' && options?.method === 'DELETE') {
        return {
          ok: false,
          json: async () => ({ error: 'FORBIDDEN', message: 'Você não gerencia esta empresa.' }),
        } as Response;
      }
      if (urlStr.includes('/api/jobs')) {
        return { ok: true, json: async () => [...mockJobs] } as Response;
      }
      return { ok: false } as Response;
    });

    render(<RecruiterContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor Frontend React')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', {
      name: 'Excluir vaga Desenvolvedor Frontend React',
    });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText('Você não gerencia esta empresa.')).toBeInTheDocument();
    });
    expect(screen.getByText('Desenvolvedor Frontend React')).toBeInTheDocument();
  });
});
