import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WhoToFollow } from '../WhoToFollow';
vi.mock('@/i18n/useLocalizedText', () => ({
  useLocalizedText: () => ({ text: (pt: string) => pt }),
}));
const profiles = [
  {
    id: 'alice',
    username: 'alice_dev',
    display_name: 'Alice',
    avatar_url: null,
    total_xp: 10,
    reason: { type: 'mutual', count: 2 },
  },
  {
    id: 'bob',
    username: 'bob_dev',
    display_name: 'Bob',
    avatar_url: null,
    total_xp: 20,
    reason: { type: 'language', language: 'TS' },
  },
  {
    id: 'carol',
    username: 'carol_dev',
    avatar_url: null,
    total_xp: 0,
    reason: { type: 'interaction' },
  },
  { id: 'dani', username: 'dani_dev', avatar_url: null, total_xp: 0, reason: { type: 'active' } },
];
const otherProfiles = [
  { id: 'eli', username: 'eli_dev', avatar_url: null, total_xp: 0, reason: { type: 'active' } },
  { id: 'fran', username: 'fran_dev', avatar_url: null, total_xp: 0, reason: { type: 'active' } },
  { id: 'gabi', username: 'gabi_dev', avatar_url: null, total_xp: 0, reason: { type: 'active' } },
];
const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('Who to follow', () => {
  it('shows the selected frame and flags without showing a title or level', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      response([
        {
          ...profiles[0],
          total_xp: 99999,
          identity: {
            frame: { id: 'neon', color: '#0083fe', decoration: 'neon' },
            flags: ['BR', 'pride-trans'],
            title: { name: 'Hidden title' },
            level: 99,
          },
        },
      ])
    );
    render(<WhoToFollow viewerId="me" />);
    const profile = await screen.findByRole('link', { name: /Alice/ });
    expect(profile.querySelector('[data-decoration="neon"]')).toHaveStyle({
      '--frame-color': '#0083fe',
    });
    expect(screen.getByRole('img', { name: 'Bandeira: Brasil' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Bandeira: Transgênero' })).toBeInTheDocument();
    expect(screen.queryByText('Hidden title')).not.toBeInTheDocument();
    expect(profile.textContent).not.toMatch(/lvl|nível|99999/i);
  });
  it('shows three real profiles with working profile links and recommendation reasons', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(response(profiles));
    render(<WhoToFollow viewerId="me" />);
    expect(await screen.findByRole('link', { name: /Alice/ })).toHaveAttribute(
      'href',
      '/profile/alice_dev'
    );
    expect(screen.getByText('Seguido por 2 pessoas que você segue')).toBeInTheDocument();
    expect(screen.getByText('Também explora TypeScript')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Seguir @/ })).toHaveLength(3);
    expect(screen.queryByText('@dani_dev')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/users/suggestions?limit=3', {
      signal: expect.any(AbortSignal),
      cache: 'no-store',
    });
  });
  it.each([
    { limit: -2, bounded: 1 },
    { limit: 50, bounded: 10 },
  ])('bounds the requested limit $limit to $bounded', async ({ limit, bounded }) => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(response(profiles));
    render(<WhoToFollow viewerId="me" limit={limit} />);
    await screen.findByRole('link', { name: /Alice/ });
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/users/suggestions?limit=${bounded}`,
      expect.any(Object)
    );
  });
  it('refreshes once while busy and replaces the three visible suggestions', async () => {
    let finish!: (value: Response) => void;
    const refreshResponse = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(response(profiles))
      .mockImplementationOnce(() => refreshResponse);
    render(<WhoToFollow viewerId="me" />);
    await screen.findByText('@alice_dev');
    const refresh = screen.getByRole('button', { name: 'Atualizar sugestões' });
    fireEvent.click(refresh);
    fireEvent.click(refresh);

    expect(refresh).toBeDisabled();
    expect(refresh).toHaveTextContent('Atualizando…');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/users/suggestions?limit=3&exclude=alice%2Cbob%2Ccarol',
      expect.any(Object)
    );
    expect(screen.getByText('@alice_dev')).toBeInTheDocument();
    await act(async () => finish(response(otherProfiles)));

    await screen.findByText('@eli_dev');
    expect(screen.getByText('@fran_dev')).toBeInTheDocument();
    expect(screen.getByText('@gabi_dev')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Seguir @/ })).toHaveLength(3);
    for (const profile of profiles)
      expect(screen.queryByText(`@${profile.username}`)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar sugestões' })).toBeEnabled();
  });
  it('excludes only visible profiles when refreshing a filtered and limited list', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(response(profiles))
      .mockResolvedValueOnce(response(otherProfiles));
    render(<WhoToFollow viewerId="alice" followedUserIds={['bob']} limit={1} />);
    await screen.findByText('@carol_dev');
    expect(screen.queryByText('@dani_dev')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar sugestões' }));
    await screen.findByText('@eli_dev');
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/users/suggestions?limit=1&exclude=carol',
      expect.any(Object)
    );
  });
  it('keeps current suggestions and reports when a refresh has no alternatives', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(response(profiles))
      .mockResolvedValueOnce(response([]));
    render(<WhoToFollow viewerId="me" />);
    await screen.findByText('@alice_dev');
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar sugestões' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Não há outros perfis para sugerir agora.'
    );
    expect(screen.getByText('@alice_dev')).toBeInTheDocument();
    expect(screen.getByText('@bob_dev')).toBeInTheDocument();
    expect(screen.getByText('@carol_dev')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Seguir @/ })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Atualizar sugestões' })).toBeEnabled();
  });
  it('keeps suggestions on a failed refresh and retries with the same exclusions', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(response(profiles))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(response(otherProfiles));
    render(<WhoToFollow viewerId="me" />);
    await screen.findByText('@alice_dev');
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar sugestões' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as sugestões.'
    );
    expect(screen.getByText('@alice_dev')).toBeInTheDocument();
    expect(screen.getByText('@bob_dev')).toBeInTheDocument();
    expect(screen.getByText('@carol_dev')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByText('@eli_dev');

    const refreshUrl = '/api/users/suggestions?limit=3&exclude=alice%2Cbob%2Ccarol';
    expect(fetchMock.mock.calls.slice(1).map(([url]) => url)).toEqual([refreshUrl, refreshUrl]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('@alice_dev')).not.toBeInTheDocument();
  });
  it('aborts a stale refresh when the viewer changes and does not mix the two lists', async () => {
    let finishStaleRefresh!: (value: Response) => void;
    const staleResponse = new Promise<Response>((resolve) => {
      finishStaleRefresh = resolve;
    });
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(response(profiles))
      .mockImplementationOnce(() => staleResponse)
      .mockResolvedValueOnce(response(otherProfiles));
    const { rerender } = render(<WhoToFollow viewerId="first-viewer" />);
    await screen.findByText('@alice_dev');
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar sugestões' }));
    const refreshSignal = fetchMock.mock.calls[1][1]?.signal;
    expect(refreshSignal?.aborted).toBe(false);

    rerender(<WhoToFollow viewerId="second-viewer" />);
    await screen.findByText('@eli_dev');
    expect(refreshSignal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/users/suggestions?limit=3',
      expect.any(Object)
    );
    await act(async () => finishStaleRefresh(response([profiles[3]])));

    expect(screen.getByText('@eli_dev')).toBeInTheDocument();
    expect(screen.getByText('@fran_dev')).toBeInTheDocument();
    expect(screen.getByText('@gabi_dev')).toBeInTheDocument();
    for (const profile of profiles)
      expect(screen.queryByText(`@${profile.username}`)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('uses an idempotent follow, prevents double clicks and replaces the followed suggestion', async () => {
    let finish!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (_url, init) =>
        init?.method === 'PUT' ? pending : response(profiles)
      );
    const onFollowChange = vi.fn();
    render(<WhoToFollow viewerId="me" onFollowChange={onFollowChange} />);
    const button = await screen.findByRole('button', { name: 'Seguir @alice_dev' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(1);
    await act(async () => finish(response({ following: true })));
    await waitFor(() => expect(screen.queryByText('@alice_dev')).not.toBeInTheDocument());
    expect(screen.getByText('@dani_dev')).toBeInTheDocument();
    expect(onFollowChange).toHaveBeenCalledWith('alice', true);
    expect(fetchMock).toHaveBeenCalledWith('/api/users/alice/follow', { method: 'PUT' });
  });
  it('keeps the profile and lets the user retry when following fails', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (_url, init) =>
      response(
        init?.method === 'PUT' ? { message: 'Este perfil não está disponível.' } : profiles,
        init?.method !== 'PUT'
      )
    );
    render(<WhoToFollow viewerId="me" />);
    const button = await screen.findByRole('button', { name: 'Seguir @alice_dev' });
    fireEvent.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('Este perfil não está disponível.');
    expect(button).toBeEnabled();
    expect(screen.getByText('@alice_dev')).toBeInTheDocument();
  });
  it('retries a failed list request and hides self and externally followed profiles', async () => {
    vi.spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(response(profiles));
    render(<WhoToFollow viewerId="alice" followedUserIds={['bob']} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('@carol_dev')).toBeInTheDocument();
    expect(screen.queryByText('@alice_dev')).not.toBeInTheDocument();
    expect(screen.queryByText('@bob_dev')).not.toBeInTheDocument();
  });
});
