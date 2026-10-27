import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn(), fetch: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ isEnglish: false }) }));
vi.mock('@/lib/supabase/env', () => ({ isSupabasePublicConfigured: () => true }));
vi.mock('@/lib/supabase/client', () => ({ createClient: vi.fn() }));
vi.mock('@/components/auth/AuthHero', () => ({ default: () => <div data-testid="auth-hero" /> }));
vi.mock('@/components/LanguageToggle', () => ({ default: () => <span /> }));
vi.mock('@/components/BrandLogo', () => ({
  BrandLogo: () => <span data-testid="brand-logo">Stacklyst</span>,
}));
vi.mock('@/components/BrandReveal', () => ({
  BrandReveal: () => <span role="status">Preparando...</span>,
}));
vi.mock('@/components/landing/SiteEntryLoader', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="opening-animation">
      <span data-testid="brand-logo">Stacklyst</span>
      <button onClick={onComplete}>Concluir animação</button>
    </div>
  ),
}));
vi.mock('@/app/trails/TrailLanguageLogo', () => ({
  TRAIL_LANGUAGE_CODES: ['JS', 'TS', 'PYTHON'],
  getTrailLanguageMetadata: (language: string) => ({ label: language }),
  TrailLanguageLogo: () => <span aria-hidden="true" />,
}));

import RegisterPage from '@/app/register/page';
import { OnboardingForm } from '@/app/onboarding/OnboardingForm';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
});

function registerForm() {
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
}

describe('Account opening animation', () => {
  it.each([
    [true, '/check-email'],
    [false, '/onboarding'],
  ] as const)(
    'waits for the successful signup opening before navigating with confirmation=%s',
    async (requiresEmailConfirmation, destination) => {
      mocks.fetch.mockResolvedValue(
        new Response(JSON.stringify({ success: true, requiresEmailConfirmation }), { status: 200 })
      );
      registerForm();
      await screen.findByTestId('opening-animation');
      expect(mocks.push).not.toHaveBeenCalled();
      expect(screen.getAllByTestId('brand-logo')).toHaveLength(1);
      expect(screen.queryByTestId('auth-hero')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Concluir animação' }));
      expect(mocks.push).toHaveBeenCalledOnce();
      expect(mocks.push).toHaveBeenCalledWith(destination);
      expect(mocks.refresh).toHaveBeenCalledOnce();
    }
  );
  it('restores the signup form immediately on failure without playing the opening or navigating', async () => {
    mocks.fetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Falha ao criar conta' }), { status: 503 })
    );
    registerForm();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Falha ao criar conta')
    );
    expect(screen.queryByTestId('opening-animation')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeEnabled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
  it('waits for opening completion after preferences are saved', async () => {
    mocks.fetch.mockResolvedValue(
      new Response(JSON.stringify({ feed: 'for-you', languages: ['JS'] }), { status: 200 })
    );
    render(<OnboardingForm initialPreferences={{ feed: 'for-you', languages: ['JS'] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir meu feed' }));
    await screen.findByTestId('opening-animation');
    expect(mocks.push).not.toHaveBeenCalled();
    expect(screen.getAllByTestId('brand-logo')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Concluir animação' }));
    expect(mocks.push).toHaveBeenCalledWith('/feed');
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it('keeps one logo while preferences are saving and shows the opening only after success', async () => {
    let resolveSave!: (response: Response) => void;
    mocks.fetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveSave = resolve;
      })
    );
    render(<OnboardingForm initialPreferences={{ feed: 'following', languages: ['TS'] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir meu feed' }));

    expect(screen.getAllByTestId('brand-logo')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Salvando preferências...');
    expect(screen.getByRole('button', { name: 'Salvando preferências...' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'TS' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'TS' })).toBeDisabled();
    expect(screen.queryByTestId('opening-animation')).not.toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body)).toEqual({
      feed: 'following',
      languages: ['TS'],
    });

    await act(async () => {
      resolveSave(
        new Response(JSON.stringify({ feed: 'following', languages: ['TS'] }), { status: 200 })
      );
    });
    expect(screen.getByTestId('opening-animation')).toBeInTheDocument();
    expect(screen.getAllByTestId('brand-logo')).toHaveLength(1);
    expect(screen.queryByRole('checkbox', { name: 'TS' })).not.toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Concluir animação' }));
    expect(mocks.push).toHaveBeenCalledOnce();
    expect(mocks.push).toHaveBeenCalledWith('/feed');
  });
  it('preserves choices after a save failure and does not play the opening', async () => {
    mocks.fetch.mockRejectedValue(new Error('network'));
    render(<OnboardingForm initialPreferences={{ feed: 'following', languages: ['TS'] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir meu feed' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('checkbox', { name: 'TS' })).toBeChecked();
    expect(screen.queryByTestId('opening-animation')).not.toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
