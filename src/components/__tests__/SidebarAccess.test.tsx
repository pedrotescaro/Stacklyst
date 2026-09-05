import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@/components/Sidebar';
import { LanguageProvider } from '@/contexts/LanguageContext';

const getCurrentUser = vi.fn();

vi.mock('@/lib/client/current-user', () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUser(...args),
  invalidateCurrentUser: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element -- image behavior is outside this navigation test
  default: ({ alt, ...props }: ComponentProps<'img'>) => <img alt={alt} {...props} />,
}));

vi.mock('next/dynamic', () => ({
  default: () => () => null,
}));

const regularUser = {
  id: 'user-1',
  name: 'Pessoa Usuária',
  username: 'pessoa',
  role: 'USER' as const,
};

describe('Sidebar role-aware navigation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    getCurrentUser.mockReset();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('keeps evaluator access visible but hides admin and Async for regular users', async () => {
    getCurrentUser.mockResolvedValue(regularUser);
    render(<Sidebar user={regularUser} />);

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Mais' }));

    expect(screen.getByRole('menuitem', { name: 'Avaliação de Código' })).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Painel Administrativo' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Async' })).not.toBeInTheDocument();
  });

  it('shows the admin panel only after the authenticated profile confirms ADMIN', async () => {
    const adminUser = { ...regularUser, id: 'admin-1', username: 'admin', role: 'ADMIN' as const };
    getCurrentUser.mockResolvedValue(adminUser);
    render(<Sidebar user={adminUser} />);

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Mais' }));

    expect(screen.getByRole('menuitem', { name: 'Painel Administrativo' })).toHaveAttribute(
      'href',
      '/admin'
    );
  });

  it('uses the selected English locale for the primary platform navigation', async () => {
    localStorage.setItem('site-language', 'en');
    getCurrentUser.mockResolvedValue(regularUser);

    render(
      <LanguageProvider>
        <Sidebar user={regularUser} />
      </LanguageProvider>
    );

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled());
    expect(await screen.findAllByRole('link', { name: 'Home' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Notifications' })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Bookmarks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });
});
