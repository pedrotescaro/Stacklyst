import { render, screen, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { loadHistory } from '@/lib/enade/hub.server';
import { dayKey, type AttemptRecord } from '@/lib/enade/stats';
import EvolutionPage from './page';

vi.mock('@/lib/enade/hub.server', () => ({
  requireEnadeUserId: vi.fn(async () => 'student'),
  loadHistory: vi.fn(),
  libraryOutline: () => ({ categories: [], articles: [] }),
  topicCategories: () => new Map(),
  topicTitles: () => new Map(),
}));

const emptyHistory = { attempts: [], answers: [], daily: [] };

beforeEach(() => {
  vi.mocked(loadHistory).mockResolvedValue(emptyHistory);
});

async function renderEvolution(searchParams: Record<string, string> = {}) {
  return render(await EvolutionPage({ searchParams: Promise.resolve(searchParams) }));
}

it('shows a zero-day calendar when the selected period has no study activity', async () => {
  await renderEvolution({ periodo: '7d' });

  expect(
    screen.getByRole('heading', { name: 'Ainda não há dados para este recorte' })
  ).toBeVisible();
  const streak = within(screen.getByRole('region', { name: 'Sequência de dias estudados' }));
  expect(streak.getAllByText('0 dias')).toHaveLength(2);
  expect(streak.getByText('Dias ativos')).toBeVisible();
});

it('shows study time and keeps weekly data accessible without an empty response plot', async () => {
  vi.mocked(loadHistory).mockResolvedValue({
    ...emptyHistory,
    daily: [
      {
        day: dayKey(new Date()),
        readingMs: 600_000,
        practiceMs: 0,
        questionsAnswered: 0,
        questionsCorrect: 0,
        articlesStudied: 1,
      },
    ],
  });
  await renderEvolution();

  expect(screen.getByText('10 min lendo · 0 min praticando')).toBeVisible();
  const weekly = within(screen.getByRole('region', { name: 'Evolução semanal' }));
  expect(weekly.getByText('Sem respostas corrigidas nas semanas exibidas.')).toBeVisible();
  expect(weekly.queryByRole('group', { name: 'Respostas corrigidas por semana' })).toBeNull();
  expect(weekly.getByText('Ver dados em tabela')).toBeVisible();
  expect(weekly.getByText('10 min de estudo')).toBeInTheDocument();
});

it('distinguishes a completed simulation without valid objective questions from a zero score', async () => {
  const now = new Date();
  const attempt: AttemptRecord = {
    id: 'unscored',
    kind: 'CUSTOM',
    mode: 'exam',
    status: 'FINISHED',
    title: 'Simulado',
    sourceYear: null,
    topic: null,
    questions: [],
    questionCount: 1,
    answeredCount: 0,
    scoredCount: 0,
    correctCount: 0,
    wrongCount: 0,
    blankCount: 1,
    elapsedMs: 0,
    startedAt: now,
    finishedAt: now,
    updatedAt: now,
  };
  vi.mocked(loadHistory).mockResolvedValue({ ...emptyHistory, attempts: [attempt] });
  const view = await renderEvolution();

  expect(screen.getByText('Sem objetivas válidas')).toBeVisible();
  expect(
    screen.getByText('Os simulados concluídos neste recorte não têm questões objetivas válidas.')
  ).toBeVisible();
  view.unmount();

  vi.mocked(loadHistory).mockResolvedValue({
    ...emptyHistory,
    attempts: [{ ...attempt, scoredCount: 1, wrongCount: 1 }],
  });
  await renderEvolution();

  expect(screen.getByText('Melhor 0% · média 0%')).toBeVisible();
  expect(
    screen.getByRole('group', { name: 'Aproveitamento por simulado concluído' })
  ).toBeVisible();
});
