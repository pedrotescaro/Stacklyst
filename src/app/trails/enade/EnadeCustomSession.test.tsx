import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnadeSimulation } from './EnadeSimulation';
import {
  answerQuestion,
  createSession,
  DEFAULT_CONFIG,
  navigateSession,
  pauseSession,
  QUESTION_BY_ID,
  type EnadeSession,
} from '@/lib/enade/simulator';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));
import contents from '../../../../public/enade/2021/questions.json';
beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (url: string, options?: RequestInit) =>
        new Response(
          JSON.stringify(
            url.includes('questions.json')
              ? contents
              : options?.method === 'POST'
                ? { attempt: { id: 'fresh-attempt' } }
                : { attempt: { session: JSON.parse(String(options?.body ?? '{}')) } }
          ),
          { status: 200 }
        )
    )
  );
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function session(
  mode: 'exam' | 'training' = 'exam',
  durationMinutes: number | null = 1
): EnadeSession {
  const config = {
    ...DEFAULT_CONFIG,
    years: [2021],
    questionCount: 3,
    order: 'random' as const,
    mode,
    durationMinutes,
  };
  return createSession(config, 184, Date.now());
}
const attemptId = 'custom-attempt';
const draftKey = `stacklyst:enade:attempt:${attemptId}`;
function simulation(initialSession: EnadeSession) {
  return (
    <EnadeSimulation
      attemptId={attemptId}
      title="Simulado personalizado"
      kindLabel="Personalizado"
      initialSession={initialSession}
      aids={{}}
      favorites={[]}
    />
  );
}

describe('customized Enade activity', () => {
  it('restores question, marked state, shuffled choices and answers on refresh, then pauses safely', async () => {
    const original = session();
    let draft = navigateSession(original, 1, original.updatedAt + 1);
    draft = answerQuestion(draft, draft.questionIds[1], 'A', draft.updatedAt + 1);
    draft = { ...draft, marked: [draft.questionIds[1]] };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    const first = render(simulation(original));
    await screen.findByRole('radio', { name: /^A / });
    expect(screen.getByRole('button', { name: /^Questão 2 de \d+/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Marcada para revisão' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    const before = screen
      .getAllByRole('radio')
      .map((r) => [r.getAttribute('value'), (r as HTMLInputElement).checked]);
    first.unmount();
    render(simulation(original));
    await screen.findByRole('radio', { name: /^A / });
    expect(
      screen
        .getAllByRole('radio')
        .map((r) => [r.getAttribute('value'), (r as HTMLInputElement).checked])
    ).toEqual(before);
    fireEvent.click(screen.getByRole('button', { name: 'Pausar simulado' }));
    expect(screen.getByRole('region', { name: 'Simulado pausado' })).toBeInTheDocument();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    const cache = JSON.parse(localStorage.getItem(draftKey)!);
    expect(cache).toMatchObject({ paused: true, runningSince: null, currentIndex: 1 });
    fireEvent.click(screen.getAllByRole('button', { name: 'Retomar simulado' })[0]);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    await waitFor(() => expect(screen.getByText('Progresso salvo')).toBeInTheDocument());
  });
  it('shows immediate explanation in training and keeps the canonical answer through shuffled labels', async () => {
    const draft = session('training', null);
    const s = draft;
    const id = s.questionIds[0];
    const answer = QUESTION_BY_ID.get(id)!.answer!;
    render(simulation(draft));
    await screen.findByRole('radio', { name: /^A / });
    expect(screen.queryByText('Você acertou')).not.toBeInTheDocument();
    fireEvent.click(document.getElementById(`${id}-${answer}`)!);
    expect(screen.getByText('Você acertou')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Consultar gabarito oficial do Inep' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('radio').every((radio) => (radio as HTMLInputElement).disabled)
    ).toBe(true);
    expect(screen.getByLabelText('Tempo decorrido')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Progresso salvo')).toBeInTheDocument());
  });
  it('expires to the result, counts blank questions as errors, and repeats only mistakes', async () => {
    vi.useFakeTimers();
    const draft = { ...session(), elapsedMs: 59000, runningSince: Date.now() };
    render(simulation(draft));
    await act(async () => {});
    expect(screen.getByLabelText('Tempo restante')).toHaveAttribute('data-warning', 'true');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    expect(screen.getByRole('region', { name: 'Resultado do simulado' })).toHaveTextContent(
      '0 de 3 questões válidas'
    );
    expect(screen.getByText(/O tempo terminou/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finalizar simulado' })).not.toBeInTheDocument();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Refazer só as que errei (3)' }))
    );
    expect(screen.getByRole('region', { name: 'Resultado do simulado' })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      '/api/enade/attempts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ kind: 'WRONG_ONLY', parentId: attemptId }),
      })
    );
    expect(push).toHaveBeenCalledWith('/trails/enade/simulados/fresh-attempt');
    expect(JSON.parse(localStorage.getItem(draftKey)!).finishedAt).toBeTruthy();
  });
  it('keeps an explicit pause across time passing and recovers failed sync on demand', async () => {
    const draft = pauseSession(session(), Date.now());
    render(simulation(draft));
    await screen.findByRole('region', { name: 'Simulado pausado' });
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 500 }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar novamente' }));
    expect(await screen.findByText(/Não foi possível sincronizar/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar novamente' }));
    await waitFor(() => expect(screen.getByText('Progresso salvo')).toBeInTheDocument());
  });
  it('restores an answer confirmed elsewhere without retrying the conflicting draft', async () => {
    const draft = session('training', null);
    const id = draft.questionIds[0];
    const stored = answerQuestion(draft, id, 'B', draft.updatedAt + 1);
    render(simulation(draft));
    await screen.findByRole('radio', { name: /^A / });
    vi.mocked(fetch)
      .mockResolvedValueOnce(Response.json({ error: { code: 'DRAFT_CONFLICT' } }, { status: 409 }))
      .mockResolvedValueOnce(Response.json({ attempt: { session: stored } }));
    fireEvent.click(document.getElementById(`${id}-A`)!);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar novamente' }));
    expect(await screen.findByText(/respostas salvas em outra aba/)).toBeInTheDocument();
    expect(document.getElementById(`${id}-B`)).toBeChecked();
    expect(JSON.parse(localStorage.getItem(draftKey)!).answers[id]).toBe('B');
  });
});
