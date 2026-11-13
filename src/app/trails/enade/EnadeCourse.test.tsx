import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnadeCourse } from './EnadeCourse';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => <nav>Sidebar</nav> }));
const user = { id: 'student-test', username: 'student', avatar_url: null, total_xp: 0 };
const courses = [{ language: 'JS' as const, xp: 0, started: true }];
const rail = {
  gems: 12,
  globalRank: 7,
  totalParticipants: 40,
  dailyProgress: { xpEarned: 10, correctAnswers: 1, trailActivities: 0 },
};
beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{"ok":true}', { status: 200 }))
  );
});
afterEach(() => vi.unstubAllGlobals());
describe('Enade course entrance', () => {
  it('keeps navigation on the entrance and links to separate activities without starting a timer', () => {
    render(<EnadeCourse user={user} rail={rail} courses={courses} initialAttempts={{}} />);
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    const progressRail = screen.getByTestId('trails-progress-sidebar');
    expect(progressRail).toHaveTextContent('7º lugar');
    expect(progressRail).toHaveTextContent('Desafios diários');
    expect(screen.getByText('5 edições · 200 questões')).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'Iniciar' }).map((el) => el.getAttribute('href'))
    ).toEqual([
      '/trails/enade/2021',
      '/trails/enade/2017',
      '/trails/enade/2014',
      '/trails/enade/2011',
      '/trails/enade/2008',
    ]);
    expect(screen.queryByRole('heading', { name: 'Simulado 2021' })).not.toBeInTheDocument();
    expect(
      vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/api/enade/'))
    ).toHaveLength(0);
  });
  it('confirms a restart and puts the edition back to "Iniciar"', async () => {
    const stamp = Date.now() - 10000;
    localStorage.setItem(
      `enade-ads:${user.id}:2021`,
      JSON.stringify({
        answers: {},
        marked: [],
        startedAt: stamp,
        updatedAt: stamp,
        finishedAt: null,
      })
    );
    render(
      <EnadeCourse
        user={user}
        rail={rail}
        courses={courses}
        initialAttempts={{
          2021: {
            answers: { '2021-objective-1': 'E' },
            marked: [],
            startedAt: stamp,
            updatedAt: stamp,
            finishedAt: null,
          },
        }}
      />
    );
    expect(screen.getByRole('link', { name: 'Continuar' })).toHaveAttribute(
      'href',
      '/trails/enade/2021'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar simulado 2021' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Continuar' })).not.toBeInTheDocument()
    );
    expect(fetch).toHaveBeenCalledWith('/api/enade/2021', { method: 'DELETE' });
    expect(push).not.toHaveBeenCalled();
    expect(localStorage.getItem(`enade-ads:${user.id}:2021`)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reiniciar simulado 2021' })).toBeNull();
    expect(screen.getAllByRole('link', { name: 'Iniciar' })[0]).toHaveAttribute(
      'href',
      '/trails/enade/2021'
    );
  });
});
