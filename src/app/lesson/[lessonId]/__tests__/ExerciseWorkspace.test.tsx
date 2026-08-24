import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExerciseWorkspace } from '@/app/lesson/[lessonId]/ExerciseWorkspace';
import type { ExerciseWorkspaceData } from '@/lib/exercises/types';

vi.mock('@/components/CodeEditor', () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      aria-label="Editor de código"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const exercise: ExerciseWorkspaceData = {
  id: 'exercise-1',
  slug: 'merge-intervals',
  title: 'Mesclar intervalos',
  summary: 'Normalize janelas',
  problem: 'Implemente mergeIntervals.',
  objective: 'Cobrir sobreposição e adjacência.',
  language: 'JS',
  difficulty: 4,
  baseXp: 180,
  estimatedMinutes: 35,
  starterCode: 'function mergeIntervals(intervals) { return intervals; }',
  constraints: ['Não altere a entrada.'],
  hints: ['Ordene uma cópia.'],
  documentationUrl:
    'https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort',
  examples: [
    {
      input: [
        [
          [1, 2],
          [2, 3],
        ],
      ],
      output: [[1, 3]],
    },
  ],
  publicTestCount: 2,
  hiddenTestCount: 2,
  knowledge: {
    id: 'node-1',
    slug: 'collections',
    title: 'Coleções',
    category: 'JavaScript',
    mastery: 0,
    status: 'AVAILABLE',
  },
  activity: { runs: 0, submissions: 0, completed: false },
};

describe('ExerciseWorkspace', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps documentation available in Hard and hides it in No Assist', () => {
    render(<ExerciseWorkspace exercise={exercise} />);

    fireEvent.click(screen.getByLabelText(/Hard/));
    expect(screen.getByRole('link', { name: /Documentação oficial/ })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/No Assist/));
    expect(screen.queryByRole('link', { name: /Documentação oficial/ })).not.toBeInTheDocument();
    expect(screen.getAllByText('150% XP')).toHaveLength(2);
  });

  it('records Run separately and shows public test feedback', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        ok: true,
        passed: true,
        passedTests: 2,
        totalTests: 2,
        tests: [
          {
            id: 'test-1',
            label: 'Sobreposição',
            hidden: false,
            passed: true,
          },
        ],
        consoleOutput: '',
        executionMs: 42,
        runCount: 1,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ExerciseWorkspace exercise={exercise} />);
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));

    await waitFor(() => expect(screen.getByText('Sobreposição')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/exercises/exercise-1/run',
      expect.objectContaining({ method: 'POST' })
    );
    expect(screen.getByText('Runs: 1')).toBeInTheDocument();
    expect(screen.getByText('Submissions: 0')).toBeInTheDocument();
  });

  it('locks section jump challenges to Hard and persists the unlocked section', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url === '/api/trails/jump') {
        return {
          ok: true,
          json: async () => ({ ok: true, sectionNumber: 3 }),
        };
      }

      return {
        ok: true,
        json: async () => ({
          ok: true,
          passed: true,
          passedTests: 4,
          totalTests: 4,
          tests: [],
          consoleOutput: '',
          executionMs: 48,
          submissionCount: 1,
          firstCompletion: false,
        }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ExerciseWorkspace
        exercise={exercise}
        jumpChallenge={{ sectionNumber: 3, pathSlug: 'frontend-react', language: 'JS' }}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Desafio para pular à Seção 3' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Hard/)).toBeChecked();
    expect(screen.getByLabelText(/Hard/)).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(screen.getByText('Desafio concluído. A Seção 3 foi liberada.')).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/exercises/exercise-1/submit',
      expect.objectContaining({
        body: expect.stringContaining('SECTION_JUMP'),
      })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/trails/jump',
      expect.objectContaining({
        body: expect.stringContaining('frontend-react'),
      })
    );
    expect(screen.getByRole('link', { name: 'Começar na seção' })).toHaveAttribute(
      'href',
      '/trails?view=trail&path=frontend-react&section=3'
    );
  });
});
