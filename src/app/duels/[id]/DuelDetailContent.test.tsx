import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDuelProblemById } from '@/lib/duel-problems';
import { DUEL_TIME_LIMIT_SECONDS } from '@/lib/duels/constants';
import { DuelDetailContent } from './DuelDetailContent';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/Sidebar', () => ({
  Sidebar: () => <aside aria-label="Sidebar" />,
}));

vi.mock('@/components/CodeEditor', () => ({
  CodeEditor: () => <div aria-label="Editor de código" />,
}));

const problem = getDuelProblemById('reverse-string');
const challenger = { id: 'user-1', username: 'pedro', avatar_url: null };

const pendingDuel = {
  id: 'duel-1',
  challenger_id: challenger.id,
  opponent_id: null,
  winner_id: null,
  problem_title: problem.title,
  problem_body: JSON.stringify(problem),
  problem_id: problem.id,
  language: 'TS',
  status: 'PENDING',
  time_limit_seconds: DUEL_TIME_LIMIT_SECONDS,
  match_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  started_at: null,
  finished_at: null,
  closed_reason: null,
  created_at: new Date().toISOString(),
  challenger,
  opponent: null,
  winner: null,
  solutions: [],
  submissions: [],
  evaluations: [],
} as const;

function response(data: unknown) {
  return { ok: true, json: async () => data } as Response;
}

describe('DuelDetailContent matchmaking', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('opens the challenge automatically when an opponent joins', async () => {
    vi.useFakeTimers();
    const opponent = { id: 'user-2', username: 'oponente', avatar_url: null };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ ...pendingDuel }))
      .mockResolvedValueOnce(
        response({
          ...pendingDuel,
          status: 'ACTIVE',
          opponent_id: opponent.id,
          opponent,
          started_at: new Date().toISOString(),
          time_limit_seconds: DUEL_TIME_LIMIT_SECONDS,
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <DuelDetailContent user={{ ...challenger, total_xp: 0 }} initialDuel={pendingDuel as never} />
    );

    expect(screen.getByText('Aguardando um oponente')).toBeInTheDocument();
    expect(screen.getByText(/não precisa atualizar a página/i)).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(1_500);
    });

    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText('Aguardando um oponente')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Descrição' })).toBeInTheDocument();
    expect(screen.getByText('pedro vs. oponente')).toBeInTheDocument();
  });

  it('uses a two-hour challenge window', () => {
    expect(DUEL_TIME_LIMIT_SECONDS).toBe(7_200);
  });
});
