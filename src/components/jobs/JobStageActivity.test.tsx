import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { JobStageActivity } from './JobStageActivity';
const response = (data: unknown, ok = true) => ({ ok, json: async () => data }) as Response;
afterEach(() => vi.restoreAllMocks());
it('starts the assigned activity, keeps its return to the job, and shows a server confirmed result', async () => {
  const fetchMock = vi
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce(
      response({
        configured: true,
        started: false,
        completed: false,
        score: null,
        kind: 'exercise',
        href: null,
      })
    )
    .mockResolvedValueOnce(
      response({
        configured: true,
        started: true,
        completed: false,
        score: null,
        kind: 'exercise',
        href: '/lesson/exercise?mode=workspace&recruitmentJob=job',
      })
    )
    .mockResolvedValueOnce(
      response({ configured: true, started: true, completed: true, score: 100, kind: 'exercise' })
    );
  render(<JobStageActivity jobId="job" />);
  fireEvent.click(await screen.findByRole('button', { name: 'Iniciar desafio' }));
  expect(await screen.findByRole('link', { name: 'Continuar atividade' })).toHaveAttribute(
    'href',
    '/lesson/exercise?mode=workspace&recruitmentJob=job'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Verificar resultado' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Nota técnica: 100 / 100');
  expect(fetchMock).toHaveBeenLastCalledWith(
    '/api/jobs/job/activity',
    expect.objectContaining({ body: JSON.stringify({ action: 'refresh' }) })
  );
});
it('retains a failed start for retry and explains pending company configuration', async () => {
  vi.spyOn(global, 'fetch')
    .mockResolvedValueOnce(response({ configured: true, kind: 'duel', href: null }))
    .mockResolvedValueOnce(response({ message: 'Conclua seu duelo atual.' }, false));
  render(<JobStageActivity jobId="job" />);
  fireEvent.click(await screen.findByRole('button', { name: 'Iniciar duelo' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Conclua seu duelo atual.');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Iniciar duelo' })).toBeEnabled());
});
