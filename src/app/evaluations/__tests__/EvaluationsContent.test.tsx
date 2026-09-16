import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDuelProblemById } from '@/lib/duel-problems';
import { EvaluationsContent } from '../EvaluationsContent';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/Sidebar', () => ({
  Sidebar: () => <aside aria-label="Sidebar" />,
}));

const mockUser = {
  id: 'evaluator-1',
  username: 'evaluator_pedro',
  role: 'EVALUATOR',
};

const problem = getDuelProblemById('reverse-string');

const mockDuel = {
  id: 'duel-123',
  problem_title: problem.title,
  problem_body: JSON.stringify(problem),
  language: 'TS',
  status: 'EVALUATION',
  challenger: {
    id: 'user-1',
    username: 'alice',
    avatar_url: null,
    total_xp: 1500,
  },
  opponent: {
    id: 'user-2',
    username: 'bob',
    avatar_url: null,
    total_xp: 1200,
  },
  solutions: [
    {
      id: 'sol-1',
      user_id: 'user-1',
      code: 'function reverseString(s: string) { return s.split("").reverse().join(""); }',
      user: { id: 'user-1', username: 'alice', avatar_url: null },
    },
    {
      id: 'sol-2',
      user_id: 'user-2',
      code: 'function reverseString(s: string) { let r = ""; for (let i = s.length - 1; i >= 0; i--) r += s[i]; return r; }',
      user: { id: 'user-2', username: 'bob', avatar_url: null },
    },
  ],
  evaluations: [
    {
      type: 'AUTOMATIC',
      score_player1: 850,
      score_player2: 780,
    },
  ],
};

describe('EvaluationsContent Responsive Page', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/evaluators/eligibility')) {
        return { ok: true, json: async () => ({ evaluatorProfile: null }) } as Response;
      }
      return { ok: true, json: async () => [] } as Response;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it('renders the responsive empty state when there are no duels pending', async () => {
    render(<EvaluationsContent user={mockUser} />);

    expect(screen.getByText(/carregando duelos pendentes/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Fila de Avaliações em Dia')).toBeInTheDocument();
      expect(screen.getByText('Nenhum duelo pendente de homologação')).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: /atualizar fila/i }).length
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('link', { name: /ver duelos na plataforma/i })).toBeInTheDocument();
    });
  });

  it('renders duels queue, code comparison, and allows switching view mode tabs', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/evaluators/eligibility')) {
        return { ok: true, json: async () => ({ evaluatorProfile: null }) } as Response;
      }
      return { ok: true, json: async () => [mockDuel] } as Response;
    });

    render(<EvaluationsContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/fila de duelos \(1\)/i)).toBeInTheDocument();
      expect(screen.getAllByText(problem.title).length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(new RegExp(problem.description.slice(0, 20), 'i'))
      ).toBeInTheDocument();
      expect(screen.getByText(problem.difficulty)).toBeInTheDocument();
    });

    // Both solutions visible initially
    expect(screen.getByText(/split\(""\)\.reverse\(\)/)).toBeInTheDocument();
    expect(screen.getByText(/for \(let i = s\.length - 1/)).toBeInTheDocument();

    // Switch view mode to Bob only
    const bobTab = screen.getByRole('button', { name: /^@bob$/i });
    fireEvent.click(bobTab);

    // Only Bob's code should be visible
    expect(screen.queryByText(/split\(""\)\.reverse\(\)/)).not.toBeInTheDocument();
    expect(screen.getByText(/for \(let i = s\.length - 1/)).toBeInTheDocument();

    // Switch view mode to Alice only
    const aliceTab = screen.getByRole('button', { name: /^@alice$/i });
    fireEvent.click(aliceTab);

    expect(screen.getByText(/split\(""\)\.reverse\(\)/)).toBeInTheDocument();
    expect(screen.queryByText(/for \(let i = s\.length - 1/)).not.toBeInTheDocument();
  });

  it('copies solution code when copy button is clicked', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/evaluators/eligibility')) {
        return { ok: true, json: async () => ({ evaluatorProfile: null }) } as Response;
      }
      return { ok: true, json: async () => [mockDuel] } as Response;
    });

    render(<EvaluationsContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getAllByText('Inverter String').length).toBeGreaterThanOrEqual(1);
    });

    const copyButtons = screen.getAllByTitle(/copiar código/i);
    expect(copyButtons.length).toBe(2);

    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'function reverseString(s: string) { return s.split("").reverse().join(""); }'
    );
  });

  it('submits evaluation form and sends correct payload', async () => {
    let getCallCount = 0;
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        if (url.includes('/api/evaluators/eligibility')) {
          return { ok: true, json: async () => ({ evaluatorProfile: null }) } as Response;
        }
        if (init?.method === 'POST') {
          return { ok: true, json: async () => ({ success: true }) } as Response;
        }
        getCallCount++;
        return {
          ok: true,
          json: async () => (getCallCount === 1 ? [mockDuel] : []),
        } as Response;
      });

    render(<EvaluationsContent user={mockUser} />);

    await waitFor(() => {
      expect(screen.getAllByText(problem.title).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByDisplayValue('850')).toBeInTheDocument();
    });

    // Pick winner
    const aliceRadio = screen.getByRole('radio', { name: /@alice/i });
    fireEvent.click(aliceRadio);

    // Fill feedback
    const feedbackInput = screen.getByPlaceholderText(
      /explique a avaliação de legibilidade, desempenho, casos limite/i
    );
    fireEvent.change(feedbackInput, {
      target: { value: 'A solução de Alice foi mais idiomática e concisa.' },
    });

    // Fill strengths and improvements
    const strengthsInput = screen.getByPlaceholderText(/clean code, tipagem estrita/i);
    fireEvent.change(strengthsInput, {
      target: { value: 'Legibilidade, Uso de APIs nativas' },
    });

    const improvementsInput = screen.getByPlaceholderText(/tratamento de erros, nomenclatura/i);
    fireEvent.change(improvementsInput, {
      target: { value: 'Adicionar testes de borda' },
    });

    // Submit form
    const submitBtn = screen.getByRole('button', {
      name: /homologar avaliação e concluir duelo/i,
    });
    expect(submitBtn).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duel_id: 'duel-123',
        score_player1: 850,
        score_player2: 780,
        winner_id: 'user-1',
        human_feedback: 'A solução de Alice foi mais idiomática e concisa.',
        strengths: ['Legibilidade', 'Uso de APIs nativas'],
        improvements: ['Adicionar testes de borda'],
      }),
    });

    await waitFor(() => {
      expect(screen.getByText('Avaliação de código homologada com sucesso!')).toBeInTheDocument();
    });
  });
});
