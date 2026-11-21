import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ isEnglish: false }) }));
vi.mock('@/lib/supabase/env', () => ({ isSupabasePublicConfigured: () => true }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: mocks }) }));
vi.mock('@/components/auth/AuthHero', () => ({ default: () => null }));
vi.mock('@/components/LanguageToggle', () => ({ default: () => null }));
vi.mock('@/components/BrandLogo', () => ({ BrandLogo: () => <span>Stacklyst</span> }));
vi.mock('@/components/BrandReveal', () => ({ BrandReveal: () => <span>Preparando...</span> }));

import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/register/page';

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/');
  vi.stubGlobal('fetch', mocks.fetch);
  mocks.signInWithPassword.mockResolvedValue({ error: null });
  mocks.signInWithOAuth.mockResolvedValue({ error: null });
});

describe('Authentication navigation', () => {
  it.each([
    [null, '/feed'],
    ['/profile/developer?tab=replies#activity', '/profile/developer?tab=replies#activity'],
    ['//attacker.example', '/feed'],
  ])('returns password login to a safe destination: %j', async (next, destination) => {
    window.history.replaceState({}, '', `/login?${new URLSearchParams(next ? { next } : {})}`);
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText('Endereço de e-mail'), {
      target: { value: 'developer@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith(destination));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it('preserves the deep link and account-add marker in OAuth without changing account saving', async () => {
    const next = '/jobs?search=ts#list';
    window.history.replaceState({}, '', `/login?${new URLSearchParams({ next, addAccount: '1' })}`);
    mocks.fetch.mockResolvedValue(new Response('{}', { status: 200 }));
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar com Google' }));
    await waitFor(() => expect(mocks.signInWithOAuth).toHaveBeenCalledOnce());
    const callback = new URL(mocks.signInWithOAuth.mock.calls[0][0].options.redirectTo);
    expect(callback.pathname).toBe('/api/auth/callback');
    expect(callback.searchParams.get('next')).toBe(next);
    expect(callback.searchParams.get('addAccount')).toBe('1');
    expect(mocks.fetch).toHaveBeenCalledWith(
      '/api/auth/accounts',
      expect.objectContaining({ body: JSON.stringify({ action: 'save' }) })
    );
  });

  it('keeps the deep-link destination through immediate-session signup', async () => {
    const next = '/jobs?search=ts#list';
    window.history.replaceState({}, '', `/register?${new URLSearchParams({ next })}`);
    mocks.fetch.mockResolvedValue(
      new Response(JSON.stringify({ success: true, requiresEmailConfirmation: false }), {
        status: 200,
      })
    );
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText('Nome de usuário'), { target: { value: 'developer' } });
    fireEvent.change(screen.getByLabelText('Endereço de e-mail'), {
      target: { value: 'developer@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'strong-password' } });
    fireEvent.change(screen.getByLabelText('Confirmar senha'), {
      target: { value: 'strong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith(next));
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body).next).toBe(next);
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
