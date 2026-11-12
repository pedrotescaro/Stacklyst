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
  type EnadeWorkspace,
} from '@/lib/enade/simulator';
import contents from '../../../../public/enade/2021/questions.json';
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async (url: string, options?: RequestInit) =>
        new Response(
          JSON.stringify(
            url.includes('questions.json')
              ? contents
              : { value: options?.body ? JSON.parse(String(options.body)) : undefined }
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
function workspace(
  mode: 'exam' | 'training' = 'exam',
  durationMinutes: number | null = 1
): EnadeWorkspace {
  const config = {
    ...DEFAULT_CONFIG,
    years: [2021],
    questionCount: 3,
    order: 'random' as const,
    mode,
    durationMinutes,
  };
  const session = createSession(config, 184, Date.now());
  return { version: 1, config, session, updatedAt: session.updatedAt };
}
describe('customized Enade activity', () => {
  it('restores question, marked state, shuffled choices and answers on refresh, then pauses safely', async () => {
    let draft = workspace();
    let s = draft.session!;
    s = navigateSession(s, 1, Date.now());
    s = answerQuestion(s, s.questionIds[1], 'A', Date.now());
    s = { ...s, marked: [s.questionIds[1]] };
    draft = { ...draft, session: s, updatedAt: s.updatedAt };
    localStorage.setItem('stacklyst:enade:workspace:v1:custom-user', JSON.stringify(draft));
    const first = render(<EnadeSimulation userId="custom-user" />);
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
    render(<EnadeSimulation userId="custom-user" />);
    await screen.findByRole('radio', { name: /^A / });
    expect(
      screen
        .getAllByRole('radio')
        .map((r) => [r.getAttribute('value'), (r as HTMLInputElement).checked])
    ).toEqual(before);
    fireEvent.click(screen.getByRole('button', { name: 'Pausar simulado' }));
    expect(screen.getByRole('region', { name: 'Simulado pausado' })).toBeInTheDocument();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    const cache = JSON.parse(localStorage.getItem('stacklyst:enade:workspace:v1:custom-user')!);
    expect(cache.session).toMatchObject({ paused: true, runningSince: null, currentIndex: 1 });
    fireEvent.click(screen.getAllByRole('button', { name: 'Retomar simulado' })[0]);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });
  it('shows immediate explanation in training and keeps the canonical answer through shuffled labels', async () => {
    const draft = workspace('training', null);
    const s = draft.session!;
    const id = s.questionIds[0];
    const answer = QUESTION_BY_ID.get(id)!.answer!;
    render(<EnadeSimulation userId="custom-user" initialWorkspace={draft} />);
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
  });
  it('expires to the result, counts blank questions as errors, and repeats only mistakes', async () => {
    vi.useFakeTimers();
    const draft = workspace();
    const session = draft.session!;
    draft.session = { ...session, elapsedMs: 59000, runningSince: Date.now() };
    render(<EnadeSimulation userId="custom-user" initialWorkspace={draft} />);
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
    fireEvent.click(screen.getByRole('button', { name: 'Refazer só as que errei (3)' }));
    expect(screen.queryByRole('region', { name: 'Resultado do simulado' })).not.toBeInTheDocument();
    const next = JSON.parse(
      localStorage.getItem('stacklyst:enade:workspace:v1:custom-user')!
    ).session;
    expect(new Set(next.questionIds)).toEqual(new Set(session.questionIds));
    expect(next.finishedAt).toBeNull();
    expect(next.elapsedMs).toBe(0);
  });
  it('keeps an explicit pause across time passing and recovers failed sync on demand', async () => {
    const draft = workspace();
    draft.session = pauseSession(draft.session!, Date.now());
    render(<EnadeSimulation userId="custom-user" initialWorkspace={draft} />);
    await screen.findByRole('region', { name: 'Simulado pausado' });
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 500 }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar novamente' }));
    expect(await screen.findByText(/Não foi possível sincronizar/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar novamente' }));
    await waitFor(() => expect(screen.getByText('Progresso salvo')).toBeInTheDocument());
  });
});
