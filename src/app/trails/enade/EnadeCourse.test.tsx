import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnadeCourse } from './EnadeCourse';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => <nav>Sidebar</nav> }));
const user = { id: 'student-test', username: 'student', avatar_url: null, total_xp: 0 };
const courses = [{ language: 'JS' as const, xp: 0, started: true }];
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
    render(<EnadeCourse user={user} courses={courses} initialAttempts={{}} />);
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
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
  it('confirms a restart, saves before navigation and preserves the per-edition route', async () => {
    const stamp = Date.now() - 10000;
    render(
      <EnadeCourse
        user={user}
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
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/trails/enade/2021'));
    expect(fetch).toHaveBeenCalledWith(
      '/api/enade/2021',
      expect.objectContaining({ method: 'PUT', body: expect.stringContaining('"answers":{}') })
    );
  });
});
