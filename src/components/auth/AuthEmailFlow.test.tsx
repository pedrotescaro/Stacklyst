import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ isEnglish: false }) }));
vi.mock('@/components/BrandLogo', () => ({ BrandLogo: () => <span>Stacklyst</span> }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: mocks }) }));
import { AuthEmailFlow } from './AuthEmailFlow';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'verified-user' } }, error: null });
  mocks.updateUser.mockResolvedValue({ error: null });
  mocks.signOut.mockResolvedValue({ error: null });
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
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it('requires matching passwords, updates through Supabase and signs out after success', async () => {
    render(<AuthEmailFlow mode="reset" />);
    const submit = screen.getByRole('button', { name: 'Salvar nova senha' });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'new-strong-password' },
    });
    fireEvent.change(screen.getByLabelText('Confirme a nova senha'), {
      target: { value: 'different-password' },
    });
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent('precisam ser iguais');
    expect(mocks.updateUser).not.toHaveBeenCalled();
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
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'global' });
  });
});
