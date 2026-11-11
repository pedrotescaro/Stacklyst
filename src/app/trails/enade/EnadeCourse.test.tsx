import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnadeCourse } from './EnadeCourse';

vi.mock('@/components/Sidebar', () => ({ Sidebar: () => <nav>Sidebar</nav> }));
const user = { id: 'student-test', username: 'student', avatar_url: null, total_xp: 0 };
const courses = [{ language: 'JS' as const, xp: 0, started: true }];
const page = { image: '/enade/2021/page-2.webp', text: 'Caderno oficial do Inep' };
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(
            url.includes('pages.json') ? Array.from({ length: 48 }, () => page) : { ok: true }
          ),
          { status: 200 }
        )
    )
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Enade course simulations', () => {
  it('starts a real edition, records objective and discursive answers, finishes and reviews results', async () => {
    render(<EnadeCourse user={user} courses={courses} initialAttempts={{}} />);
    expect(screen.getByText('5 edições · 200 questões')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar' })[0]);
    expect(await screen.findByRole('heading', { name: 'Simulado 2021' })).toBeInTheDocument();
    expect(await screen.findByAltText(/Página 2 da prova Enade ADS 2021/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Escreva sua resposta'), {
      target: { value: 'Minha resposta discursiva.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Questão 1' }));
    fireEvent.click(screen.getByRole('radio', { name: 'E' }));
    fireEvent.click(screen.getByRole('button', { name: 'Marcar para revisar' }));
    expect(
      screen.getByRole('button', { name: /Questão 1, marcada para revisar, respondida/ })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar simulado' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar e corrigir' }));
    expect(screen.getByRole('region', { name: 'Resultado do simulado' })).toHaveTextContent(
      '1 de 35 questões válidas'
    );
    expect(screen.getByRole('radio', { name: 'E' })).toBeDisabled();
    expect(screen.getByText(/Sua resposta: E/)).toHaveTextContent('Gabarito: E');
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/enade/2021',
        expect.objectContaining({ method: 'PUT' })
      )
    );
    const cache = JSON.parse(localStorage.getItem('enade-ads:student-test:2021')!);
    expect(cache.answers['2021-discursive-1']).toBe('Minha resposta discursiva.');
    expect(cache.finishedAt).toBeTruthy();
  });

  it('finishes an expired attempt and preserves its answers on reopening', async () => {
    const stamp = Date.now() - 5 * 60 * 60 * 1000;
    render(
      <EnadeCourse
        user={user}
        courses={courses}
        initialAttempts={{
          '2021': {
            answers: { '2021-objective-1': 'E' },
            marked: [],
            startedAt: stamp,
            finishedAt: null,
            updatedAt: stamp,
          },
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByRole('region', { name: 'Resultado do simulado' })).toHaveTextContent(
      '1 de 35 questões válidas'
    );
  });

  it('batches draft saves while typing and reports sync failures', async () => {
    vi.useFakeTimers();
    render(<EnadeCourse user={user} courses={courses} initialAttempts={{}} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar' })[0]);
    fireEvent.change(screen.getByLabelText('Escreva sua resposta'), { target: { value: 'a' } });
    fireEvent.change(screen.getByLabelText('Escreva sua resposta'), { target: { value: 'abc' } });
    expect(
      vi.mocked(fetch).mock.calls.filter(([url]) => String(url).startsWith('/api/enade'))
    ).toHaveLength(0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(701);
    });
    expect(
      vi.mocked(fetch).mock.calls.filter(([url]) => String(url).startsWith('/api/enade'))
    ).toHaveLength(1);
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 500 }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar novamente' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(701);
    });
    expect(screen.getByText(/Não foi possível sincronizar/)).toBeInTheDocument();
  });
});
