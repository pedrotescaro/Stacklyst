import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './page';

const router = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => null }));
vi.mock('@/components/FeedRightSidebar', () => ({ FeedRightSidebar: () => null }));
vi.mock('@/lib/client/current-user', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1', username: 'pessoa' })),
}));

describe('notifications navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => [] }))
    );
  });

  it('goes back when the browser has history', async () => {
    const historyLength = vi.spyOn(window.history, 'length', 'get').mockReturnValue(2);
    render(<NotificationsPage />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Notificações' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.back).toHaveBeenCalledOnce();
    historyLength.mockRestore();
  });

  it('falls back to the feed without browser history', async () => {
    const historyLength = vi.spyOn(window.history, 'length', 'get').mockReturnValue(1);
    render(<NotificationsPage />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Notificações' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.push).toHaveBeenCalledWith('/feed');
    historyLength.mockRestore();
  });
});
