import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WhoToFollow } from '../WhoToFollow';
vi.mock('@/i18n/useLocalizedText', () => ({
  useLocalizedText: () => ({ text: (pt: string) => pt }),
}));
vi.mock('@/components/AuthorAvatar', () => ({ AuthorAvatar: () => <span aria-hidden="true" /> }));
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
const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('Who to follow', () => {
  it('shows three real profiles with working profile links and recommendation reasons', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(response(profiles));
    render(<WhoToFollow viewerId="me" />);
    expect(await screen.findByRole('link', { name: /Alice/ })).toHaveAttribute(
      'href',
      '/profile/alice_dev'
    );
    expect(screen.getByText('Seguido por 2 pessoas que você segue')).toBeInTheDocument();
    expect(screen.getByText('Também explora TypeScript')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Seguir @/ })).toHaveLength(3);
    expect(screen.queryByText('@dani_dev')).not.toBeInTheDocument();
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
