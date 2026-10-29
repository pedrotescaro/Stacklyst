import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DuelsContent } from './DuelsContent';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => null }));
const user = { id: 'me', username: 'ana', total_xp: 0 };
afterEach(() => {
  vi.unstubAllGlobals();
  push.mockClear();
});

describe('Duel lobby actions', () => {
  it('filters community duels and starts a quick match in the selected language', async () => {
    const fetcher = vi.fn(async (_url, init) =>
      Response.json(init?.method === 'POST' ? { duel: { id: 'new-duel' } } : [])
    );
    vi.stubGlobal('fetch', fetcher);
    render(
      <DuelsContent
        user={user}
        initialDuels={[
          {
            id: 'ts',
            status: 'PENDING',
            language: 'TS',
            problem_title: 'Desafio TypeScript',
            problem_body: 'Teste',
            challenger: user,
          },
          {
            id: 'py',
            status: 'PENDING',
            language: 'PYTHON',
            problem_title: 'Desafio Python',
            problem_body: 'Teste',
            challenger: user,
          },
        ]}
      />
    );
    const python = screen.getAllByRole('button', { name: 'Python' });
    fireEvent.click(python[1]);
    expect(screen.queryByText('Desafio TypeScript')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Desafio Python/ })).toHaveAttribute(
      'href',
      '/duels/py'
    );
    fireEvent.click(python[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na fila rápida 1v1' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/duels/new-duel'));
    expect(fetcher).toHaveBeenCalledWith(
      '/api/duels',
      expect.objectContaining({ body: JSON.stringify({ isQuickMatch: true, language: 'PYTHON' }) })
    );
  });
});
