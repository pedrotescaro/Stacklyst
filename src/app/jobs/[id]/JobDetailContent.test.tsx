import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobDetailContent } from './JobDetailContent';

vi.mock('@/components/PlatformPageShell', () => ({
  PlatformPageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

const job = {
  id: 'job',
  title: 'Frontend React',
  description: 'Interfaces acessíveis.',
  level: 'JUNIOR',
  modality: 'REMOTE',
  status: 'OPEN',
  company: { name: 'Acme' },
  technologies: ['React'],
  stages: [
    { id: 'first', title: 'Inscrição', order: 1 },
    { id: 'second', title: 'Conversa técnica', order: 2 },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('candidate feedback', () => {
  it('shows the current stage and persisted feedback at the notification anchor', () => {
    render(
      <JobDetailContent
        user={{ id: 'candidate' }}
        job={{
          id: 'job',
          title: 'Frontend React',
          level: 'JUNIOR',
          modality: 'REMOTE',
          company: { name: 'Acme' },
          technologies: [],
          stages: [],
          userApplication: {
            status: 'INTERVIEW',
            stage: { title: 'Conversa técnica' },
            feedback: 'Seu teste passou. Vamos conversar.',
          },
        }}
      />
    );
    expect(screen.getByText('Conversa técnica')).toBeInTheDocument();
    expect(screen.getByText('Seu teste passou. Vamos conversar.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Sua candidatura' })).toHaveAttribute(
      'id',
      'application'
    );
    expect(screen.queryByText('INTERVIEW')).not.toBeInTheDocument();
  });

  it('envia a candidatura e atualiza o status e a etapa sem oferecer uma nova inscrição', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        application: {
          status: 'APPLIED',
          stage_id: 'first',
          stage: { id: 'first', title: 'Inscrição' },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<JobDetailContent user={{ id: 'candidate' }} job={job} />);
    await user.click(screen.getByRole('button', { name: 'Candidatar-se com Stacklyst' }));
    expect(fetchMock).toHaveBeenCalledWith('/api/jobs/job/apply', { method: 'POST' });
    expect(await screen.findByRole('status')).toHaveTextContent('Candidatura enviada!');
    const application = screen.getByRole('region', { name: 'Sua candidatura' });
    expect(within(application).getByText('Inscrição')).toBeInTheDocument();
    expect(within(application).getByText(/Aguarde a análise da empresa/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Candidatar-se com Stacklyst' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Acompanhar minha candidatura' })).toHaveAttribute(
      'href',
      '#application'
    );
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Inscrição');
  });

  it.each([
    ['IN_REVIEW', 'Em análise'],
    ['TECHNICAL_CHALLENGE', 'Desafio técnico'],
    ['DUEL', 'Duelo técnico'],
    ['EVALUATION', 'Avaliação técnica'],
    ['OFFER', 'Proposta'],
  ])('traduz o status persistido %s', (status, label) => {
    render(
      <JobDetailContent user={{ id: 'candidate' }} job={{ ...job, userApplication: { status } }} />
    );
    expect(screen.queryByText(status)).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Sua candidatura' })).getAllByText(label)
    ).toHaveLength(2);
  });

  it('explica falha na candidatura e permite tentar novamente', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'JOB_CLOSED',
          message: 'Esta vaga não está mais aceitando inscrições.',
        }),
      })
    );
    render(<JobDetailContent user={{ id: 'candidate' }} job={job} />);
    await user.click(screen.getByRole('button', { name: 'Candidatar-se com Stacklyst' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esta vaga não está mais aceitando inscrições.'
    );
    expect(screen.getByRole('button', { name: 'Candidatar-se com Stacklyst' })).toBeEnabled();
    expect(screen.queryByText('JOB_CLOSED')).not.toBeInTheDocument();
  });

  it('não oferece candidatura para uma vaga encerrada', () => {
    render(<JobDetailContent user={{ id: 'candidate' }} job={{ ...job, status: 'CLOSED' }} />);
    expect(
      screen.queryByRole('button', { name: 'Candidatar-se com Stacklyst' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Inscrições encerradas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver vagas abertas' })).toHaveAttribute(
      'href',
      '/jobs'
    );
  });
});
