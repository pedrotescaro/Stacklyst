import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EvaluatorApplyContent } from './EvaluatorApplyContent';

vi.mock('@/components/Sidebar', () => ({ Sidebar: () => null }));
vi.mock('@/components/FeedRightSidebar', () => ({ FeedRightSidebar: () => null }));
const user = { id: 'candidate', username: 'candidate', role: 'USER' as const };
const eligibility = {
  eligible: true,
  totalXp: 1200,
  completedTrails: [],
  isAlreadyEvaluator: false,
  hasPendingApplication: false,
  requirements: { hasCompletedTrail: false, hasSufficientXp: true },
};
function response(data: unknown, ok = true) {
  return { ok, json: async () => data } as Response;
}
afterEach(() => vi.restoreAllMocks());

describe('Evaluator application workflow', () => {
  it('recovers from an eligibility request failure', async () => {
    vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(response(eligibility));
    render(<EvaluatorApplyContent user={user} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível consultar');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { name: 'Sua candidatura' })).toBeInTheDocument();
  });

  it('requires explicit technology selection and sends the application, then shows pending status', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (_input, init) =>
        response(init?.method === 'POST' ? { success: true } : eligibility)
      );
    render(<EvaluatorApplyContent user={user} />);
    const motivation = await screen.findByLabelText('Por que você quer ser avaliador?');
    const explanation =
      'Reviso aplicações TypeScript e escrevo feedback com exemplos concretos, testes de borda e sugestões de manutenção.';
    fireEvent.change(motivation, { target: { value: explanation } });
    const submit = screen.getByRole('button', { name: /enviar candidatura/i });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'TypeScript' }));
    expect(submit).toBeEnabled();
    fetchMock.mockImplementation(async (_input, init) =>
      response(
        init?.method === 'POST'
          ? { success: true }
          : { ...eligibility, hasPendingApplication: true }
      )
    );
    fireEvent.click(submit);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/evaluators/apply',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ motivation: explanation, tech_stack: ['TypeScript'] }),
        })
      )
    );
    expect(
      await screen.findByRole('heading', { name: 'Candidatura em análise' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enviar candidatura/i })).not.toBeInTheDocument();
  });

  it('shows the reason for suspension without allowing access to review', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      response({
        ...eligibility,
        isAlreadyEvaluator: true,
        evaluatorProfile: {
          status: 'SUSPENDED',
          sanction_reason: 'Revisões precisam de justificativa técnica.',
        },
      })
    );
    render(<EvaluatorApplyContent user={user} />);
    expect(await screen.findByRole('heading', { name: 'Função suspensa' })).toBeInTheDocument();
    expect(screen.getByText(/Revisões precisam de justificativa técnica/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /abrir central/i })).not.toBeInTheDocument();
  });
  it('preserves administrative access and displays the application review', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      response({
        ...eligibility,
        isAlreadyEvaluator: true,
        latestApplication: {
          status: 'APPROVED',
          reviewer_notes: 'Experiência técnica confirmada pela administração.',
        },
        evaluatorProfile: { status: 'SUSPENDED' },
      })
    );
    render(<EvaluatorApplyContent user={{ ...user, role: 'ADMIN' }} />);
    expect(await screen.findByRole('link', { name: /abrir central/i })).toHaveAttribute(
      'href',
      '/evaluations'
    );
    expect(screen.getByText(/Experiência técnica confirmada/)).toBeInTheDocument();
  });
});
