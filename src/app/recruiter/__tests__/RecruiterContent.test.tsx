import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecruiterContent } from '../RecruiterContent';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

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
    fireEvent.change(statusSelect, { target: { value: 'REVIEWING' } });

    expect(fetchMock).toHaveBeenCalledWith('/api/jobs/job-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: 'app-1',
        status: 'REVIEWING',
      }),
    });

    await waitFor(() => {
      expect(screen.getByText('Status do candidato atualizado com sucesso!')).toBeInTheDocument();
    });
  });

  it('renders empty state when recruiter has no jobs published', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
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
});
