import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminContent } from './AdminContent';

vi.mock('@/components/PlatformPageShell', () => ({
  PlatformPageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  PlatformPageHeader: ({ title, actions }: { title: string; actions: ReactNode }) => (
    <header>
      <h1>{title}</h1>
      {actions}
    </header>
  ),
}));

const user = { id: 'admin', username: 'admin', role: 'ADMIN' as const };
const metrics = {
  users: { total: 42, active: 12, newLast7Days: 3 },
  duels: { total: 8, completed: 5, pendingEvaluation: 3 },
  jobs: { total: 6, active: 2 },
  companies: { total: 4, verified: 2 },
  events: { total: 5, active: 1 },
  moderation: { pendingReports: 1, pendingEvaluatorApps: 1 },
};
const application = {
  id: 'application',
  user_id: 'candidate',
  motivation: 'Tenho experiência com revisão de código e feedback técnico.',
  tech_stack: ['TypeScript'],
  status: 'PENDING',
  created_at: '2026-10-31T12:00:00Z',
  user: {
    id: 'candidate',
    username: 'alice',
    avatar_url: null,
    total_xp: 1200,
    streak_days: 1,
    role: 'USER',
    evaluator_profile: null,
  },
};
const account = {
  id: 'developer',
  username: 'bob',
  email: 'bob@example.test',
  role: 'USER',
  total_xp: 120,
  created_at: '2026-10-01T12:00:00Z',
};
const report = {
  id: 'report',
  reason: 'Spam',
  created_at: '2026-10-31T13:00:00Z',
  user: { id: 'reporter', username: 'carol' },
  post: {
    id: 'post',
    title: 'Publicação denunciada',
    body: 'Conteúdo para revisão administrativa.',
    author: { id: 'author', username: 'dave' },
  },
};
const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;
function defaultResponse(input: RequestInfo | URL) {
  const url = String(input);
  if (url === '/api/admin/metrics') return response(metrics);
  if (url === '/api/admin/evaluators') return response([application]);
  if (url === '/api/admin/reports') return response([report]);
  return response({ users: [account], pagination: { page: 1, total: 22, totalPages: 2 } });
}
beforeEach(() => {
  window.history.replaceState({}, '', '/admin');
  vi.spyOn(global, 'fetch').mockImplementation(async (input) => defaultResponse(input));
});
afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState({}, '', '/admin');
});

describe('Administrative workflow', () => {
  it('supports keyboard navigation and requires a meaningful review justification', async () => {
    const keyboard = userEvent.setup();
    render(<AdminContent user={user} />);
    expect(await screen.findByText('42')).toBeInTheDocument();
    const overview = screen.getByRole('tab', { name: 'Visão geral' });
    overview.focus();
    await keyboard.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /Avaliadores/ })).toHaveFocus();
    const approve = screen.getByRole('button', { name: 'Aprovar candidatura' });
    expect(approve).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Justificativa da decisão'), {
      target: { value: 'Experiência técnica validada com exemplos claros.' },
    });
    expect(approve).toBeEnabled();
    expect(window.location.search).toContain('tab=evaluators');
  });

  it('keeps the evaluator decision payload and reports backend failures clearly', async () => {
    window.history.replaceState({}, '', '/admin?tab=evaluators');
    const fetchMock = vi
      .mocked(global.fetch)
      .mockImplementation(async (input, init) =>
        init?.method === 'POST'
          ? response({ message: 'Esta candidatura já foi analisada.' }, false)
          : defaultResponse(input)
      );
    render(<AdminContent user={user} />);
    const notes = await screen.findByLabelText('Justificativa da decisão');
    const reason = 'Experiência técnica validada com exemplos claros.';
    fireEvent.change(notes, { target: { value: reason } });
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar candidatura' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Esta candidatura já foi analisada.'
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/evaluators',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          application_id: 'application',
          decision: 'APPROVED',
          notes: reason,
        }),
      })
    );
    expect(notes).toHaveValue(reason);
  });

  it('searches the server and saves a role only after an explicit action', async () => {
    const fetchMock = vi
      .mocked(global.fetch)
      .mockImplementation(async (input, init) =>
        init?.method === 'PATCH' ? response({ success: true }) : defaultResponse(input)
      );
    render(<AdminContent user={user} />);
    await screen.findByText('42');
    fireEvent.click(screen.getByRole('tab', { name: 'Usuários' }));
    fireEvent.change(screen.getByLabelText('Buscar por usuário ou e-mail'), {
      target: { value: 'bob@example.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/users?page=1&limit=20&search=bob%40example.test',
        expect.anything()
      )
    );
    const role = await screen.findByRole('combobox', { name: 'Função de @bob' });
    fireEvent.change(role, { target: { value: 'RECRUITER' } });
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar função' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/users',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ user_id: 'developer', role: 'RECRUITER' }),
        })
      )
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Função do usuário atualizada.');
  });

  it('dismisses a report with justification while preserving the publication', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (input, init) =>
        init?.method === 'PATCH' ? response({ success: true }) : defaultResponse(input)
      );
    render(<AdminContent user={user} />);
    fireEvent.click(await screen.findByRole('button', { name: /Denúncias/ }));
    const submit = await screen.findByRole('button', {
      name: 'Encerrar denúncia e manter publicação',
    });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Justificativa para manter a publicação'), {
      target: { value: 'Conteúdo permitido após revisão.' },
    });
    fireEvent.click(submit);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/reports',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            report_id: 'report',
            justification: 'Conteúdo permitido após revisão.',
          }),
        })
      )
    );
    expect(await screen.findByRole('status')).toHaveTextContent('publicação foi mantida');
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false);
  });

  it('requires confirmation before deleting a reported post', async () => {
    const fetchMock = vi
      .mocked(global.fetch)
      .mockImplementation(async (input, init) =>
        init?.method === 'DELETE' ? response({ success: true }) : defaultResponse(input)
      );
    render(<AdminContent user={user} />);
    await screen.findByText('42');
    fireEvent.click(screen.getByRole('tab', { name: /Moderação/ }));
    const item = screen.getByRole('article', { name: 'Denúncia: Publicação denunciada' });
    fireEvent.click(within(item).getByRole('button', { name: 'Excluir publicação e resolver' }));
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false);
    fireEvent.click(within(item).getByRole('button', { name: 'Cancelar' }));
    expect(
      within(item).queryByRole('button', { name: 'Confirmar exclusão' })
    ).not.toBeInTheDocument();
    fireEvent.click(within(item).getByRole('button', { name: 'Excluir publicação e resolver' }));
    fireEvent.click(within(item).getByRole('button', { name: 'Confirmar exclusão' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/reports',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ report_id: 'report', post_id: 'post' }),
        })
      )
    );
  });

  it('recovers an unavailable dashboard without hiding the retry action', async () => {
    let failed = true;
    vi.mocked(global.fetch).mockImplementation(async (input) =>
      String(input) === '/api/admin/metrics' && failed
        ? response({}, false)
        : defaultResponse(input)
    );
    render(<AdminContent user={user} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('resumo da plataforma');
    failed = false;
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('42')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
  it('does not report an empty review queue when the query failed', async () => {
    window.history.replaceState({}, '', '/admin?tab=evaluators');
    vi.mocked(global.fetch).mockImplementation(async (input) =>
      String(input) === '/api/admin/evaluators' ? response({}, false) : defaultResponse(input)
    );
    render(<AdminContent user={user} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('candidaturas de avaliadores');
    expect(screen.getByText(/Candidaturas temporariamente indisponíveis/)).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma candidatura registrada')).not.toBeInTheDocument();
  });
});
