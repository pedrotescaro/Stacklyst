import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnadeSimulation } from './EnadeSimulation';
import { sessionFromLegacy, type EnadeSession } from '@/lib/enade/simulator';
import type { EnadeAttempt } from '@/lib/enade/types';
import contents from '../../../../public/enade/2021/questions.json';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
const attemptId = 'standard-attempt';
const draftKey = `stacklyst:enade:attempt:${attemptId}`;
const endpoint = `/api/enade/attempts/${attemptId}`;
function simulation(legacy?: EnadeAttempt) {
  return withSession(sessionFromLegacy(2021, legacy, Date.now()));
}
function withSession(initialSession: EnadeSession) {
  return (
    <EnadeSimulation
      attemptId={attemptId}
      title="Simulado 2021"
      kindLabel="Edição oficial"
      initialSession={initialSession}
      aids={{}}
      favorites={[]}
    />
  );
}
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (url: string) =>
        new Response(JSON.stringify(url.includes('questions.json') ? contents : { ok: true }), {
          status: 200,
        })
    )
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Enade course simulations', () => {
  it('flushes the latest draft when leaving the standalone activity', async () => {
    const { unmount } = render(simulation());
    await screen.findByLabelText('Escreva sua resposta');
    fireEvent.change(screen.getByLabelText('Escreva sua resposta'), {
      target: { value: 'Última resposta antes de voltar.' },
    });
    unmount();
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('Última resposta antes de voltar.'),
        })
      )
    );
  });
  it('recovers a newer local draft before evaluating an older expired server attempt', async () => {
    const old = Date.now() - 5 * 60 * 60 * 1000;
    const recent = Date.now() - 10000;
    const initial = sessionFromLegacy(
      2021,
      {
        answers: {},
        marked: [],
        startedAt: old,
        updatedAt: old,
        finishedAt: null,
      },
      Date.now()
    );
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        ...initial,
        answers: { '2021-objective-1': 'D' },
        elapsedMs: 10_000,
        runningSince: Date.now(),
        updatedAt: recent,
      })
    );
    render(withSession(initial));
    expect(screen.queryByRole('region', { name: 'Resultado do simulado' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Questão \d+ de \d+/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Ir para questão 3 ·/ }));
    expect(await screen.findByRole('radio', { name: /^D / })).toBeChecked();
  });
  it('starts a real edition, records objective and discursive answers, finishes and reviews results', async () => {
    render(simulation());
    expect(await screen.findByRole('heading', { name: 'Simulado 2021' })).toBeInTheDocument();
    expect(await screen.findByAltText(/Discursiva 1 da prova Enade ADS 2021/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Escreva sua resposta'), {
      target: { value: 'Minha resposta discursiva.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Questão \d+ de \d+/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Ir para questão 3 ·/ }));
    const option = contents.find((q) => q.id === '2021-objective-1')!.options[4];
    fireEvent.click(screen.getByRole('radio', { name: `E ${option.text}` }));
    expect(screen.getByRole('progressbar', { name: 'Progresso do simulado' })).toHaveAttribute(
      'aria-valuenow',
      '2'
    );
    expect(screen.queryByText(/Gabarito:/)).not.toBeInTheDocument();
    expect(document.querySelector('[data-correction]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Respostas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Caderno' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Imagem da questão' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Resposta da questão' })).toBeVisible();
    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Trocar curso' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar aos simulados' })).toHaveAttribute(
      'href',
      '/trails/enade/simulados'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar simulado' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar e corrigir' }));
    expect(screen.getByRole('region', { name: 'Resultado do simulado' })).toHaveTextContent(
      '1 de 35 questões válidas'
    );
    fireEvent.click(screen.getAllByText('Ver questão completa')[2]);
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(endpoint, expect.objectContaining({ method: 'PUT' }))
    );
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => url === endpoint)).toHaveLength(1);
    expect(screen.getByRole('radio', { name: /^E / })).toBeDisabled();
    expect(document.querySelector('[data-correction="correct"]')).toHaveTextContent(option.text);
    expect(screen.getByText(/Sua resposta: E/)).toHaveTextContent('Gabarito: E');
    const cache = JSON.parse(localStorage.getItem(draftKey)!);
    expect(cache.answers['2021-discursive-1']).toBe('Minha resposta discursiva.');
    expect(cache.finishedAt).toBeTruthy();
  });

  it('finishes an expired attempt and preserves its answers on reopening', async () => {
    const stamp = Date.now() - 5 * 60 * 60 * 1000;
    render(
      simulation({
        answers: { '2021-objective-1': 'E' },
        marked: [],
        startedAt: stamp,
        finishedAt: null,
        updatedAt: stamp,
      })
    );
    expect(await screen.findByRole('region', { name: 'Resultado do simulado' })).toHaveTextContent(
      '1 de 35 questões válidas'
    );
  });

  it('keeps diagram zoom available during final review while locking answers', async () => {
    const stamp = Date.now();
    render(
      simulation({
        answers: {},
        marked: [],
        startedAt: stamp,
        updatedAt: stamp,
        finishedAt: stamp,
      })
    );
    await screen.findByRole('heading', { name: 'Resultado do simulado' });
    const index = contents.findIndex((q) => q.id === '2021-objective-15');
    fireEvent.click(screen.getAllByText('Ver questão completa')[index]);
    expect(screen.getByRole('radio', { name: /^A / })).toBeDisabled();
    const zoom = screen.getByRole('button', {
      name: 'Abrir e ampliar diagrama da alternativa A da questão 15 da prova Enade ADS 2021',
    });
    expect(zoom).toBeEnabled();
    fireEvent.click(zoom);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('retries loading the question content without losing a restored draft', async () => {
    const original = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementationOnce(async () => new Response('{}', { status: 500 }));
    const stamp = Date.now();
    render(
      simulation({
        answers: { '2021-discursive-1': 'Resposta preservada.' },
        marked: [],
        startedAt: stamp,
        updatedAt: stamp,
        finishedAt: null,
      })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a questão'
    );
    vi.mocked(fetch).mockImplementation(original);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByLabelText('Escreva sua resposta')).toHaveValue(
      'Resposta preservada.'
    );
  });

  it('batches draft saves while typing and reports sync failures', async () => {
    vi.useFakeTimers();
    render(simulation());
    await act(async () => {});
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
