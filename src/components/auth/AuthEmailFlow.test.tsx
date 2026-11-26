import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
}));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ isEnglish: false }) }));
vi.mock('@/components/BrandLogo', () => ({ BrandLogo: () => <span>Stacklyst</span> }));
import { RECOVERY_LOGIN_EMAIL_KEY } from '@/lib/auth-redirect';
import { AuthEmailFlow } from './AuthEmailFlow';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
  window.sessionStorage.clear();
  mocks.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
});
describe('Email recovery interface', () => {
  it('submits the requested email and announces sending without revealing account existence', async () => {
    render(<AuthEmailFlow mode="forgot" />);
    fireEvent.change(screen.getByLabelText('Endereço de e-mail'), {
      target: { value: 'developer@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar link por e-mail' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Se este endereço estiver cadastrado')
    );
    expect(mocks.fetch).toHaveBeenCalledWith(
      '/api/auth/forgot-password',
      expect.objectContaining({ body: JSON.stringify({ email: 'developer@example.com' }) })
    );
  });
  it('blocks expired recovery links and offers a new request', async () => {
    mocks.fetch.mockResolvedValue(new Response('{}', { status: 401 }));
    render(<AuthEmailFlow mode="reset" />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('inválido ou expirou'));
    expect(screen.getByRole('button', { name: 'Salvar nova senha' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Solicitar novo link' })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });
  it('shows the verified account and returns to login after a single password update request', async () => {
    mocks.fetch.mockResolvedValueOnce(Response.json({ valid: true, email: 'owner@example.com' }));
    window.sessionStorage.setItem('stacklyst_user', 'previous-user');
    render(<AuthEmailFlow mode="reset" />);
    const submit = screen.getByRole('button', { name: 'Salvar nova senha' });
    await waitFor(() => expect(submit).toBeEnabled());
    const account = screen.getByLabelText('E-mail da conta');
    expect(account).toHaveValue('owner@example.com');
    expect(account).toHaveAttribute('readonly');
    expect(account).toHaveAttribute('autocomplete', 'username');
    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'new-strong-password' },
    });
    fireEvent.change(screen.getByLabelText('Confirme a nova senha'), {
      target: { value: 'different-password' },
    });
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent('precisam ser iguais');
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('Confirme a nova senha'), {
      target: { value: 'new-strong-password' },
    });
    fireEvent.click(submit);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Senha alterada'));
    expect(mocks.fetch).toHaveBeenCalledWith(
      '/api/auth/reset-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ password: 'new-strong-password' }),
      })
    );
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('link', { name: 'Entrar com a nova senha' })).toHaveAttribute(
      'href',
      '/login?passwordReset=1'
    );
    expect(sessionStorage.getItem('stacklyst_user')).toBeNull();
    expect(sessionStorage.getItem(RECOVERY_LOGIN_EMAIL_KEY)).toBe('owner@example.com');
  });
});
