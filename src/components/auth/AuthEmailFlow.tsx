'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export function AuthEmailFlow({ mode }: { mode: 'forgot' | 'reset' | 'confirmation' }) {
  const { isEnglish } = useLanguage();
  const text = (pt: string, en: string) => (isEnglish ? en : pt);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(mode !== 'reset');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'confirmation') {
      try {
        setEmail(sessionStorage.getItem('stacklyst-confirmation-email') || '');
      } catch {
        /* Storage can be disabled. */
      }
    }
    if (mode !== 'reset') return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch('/api/auth/reset-password', { cache: 'no-store' });
        if (!active) return;
        if (!response.ok) {
          setError(
            text(
              'Este link é inválido ou expirou. Solicite um novo e-mail de recuperação.',
              'This link is invalid or expired. Request a new recovery email.'
            )
          );
        } else setReady(true);
      } catch {
        if (active)
          setError(
            text(
              'Não foi possível verificar o link. Solicite um novo e-mail.',
              'We could not verify this link. Request a new email.'
            )
          );
      }
    })();
    return () => {
      active = false;
    };
    // The auth check runs once for this flow, independently of language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const title =
    mode === 'forgot'
      ? text('Recupere sua senha', 'Reset your password')
      : mode === 'reset'
        ? text('Escolha uma nova senha', 'Choose a new password')
        : text('Confirme seu e-mail', 'Confirm your email');
  const description =
    mode === 'forgot'
      ? text(
          'Enviaremos um link para você voltar à sua conta.',
          'We will email you a link to get back into your account.'
        )
      : mode === 'reset'
        ? text(
            'Use pelo menos 8 caracteres e uma senha que você ainda não usa.',
            'Use at least 8 characters and a password you do not use elsewhere.'
          )
        : text(
            'Abra o link enviado ao seu e-mail para ativar sua conta e escolher suas linguagens. Se precisar, solicite outro abaixo.',
            'Open the link in your email to activate your account and choose your languages. You can request another below.'
          );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (mode === 'reset' && password !== confirmation) {
      setError(text('As senhas precisam ser iguais.', 'The passwords must match.'));
      return;
    }
    setBusy(true);
    try {
      if (mode === 'reset') {
        const supabase = createClient();
        const updateResponse = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        if (!updateResponse.ok)
          throw new Error(
            text(
              'Não foi possível alterar a senha. Solicite um novo link e tente novamente.',
              'We could not update your password. Request a new link and try again.'
            )
          );
        await Promise.allSettled([
          supabase.auth.signOut({ scope: 'global' }),
          fetch('/api/auth/logout', { method: 'POST' }),
        ]);
      } else {
        const response = await fetch(
          mode === 'forgot' ? '/api/auth/forgot-password' : '/api/auth/confirm-email',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              ...(mode === 'confirmation' ? { action: 'resend' } : {}),
            }),
          }
        );
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            payload.message ||
              payload.error ||
              text('Não foi possível enviar o e-mail.', 'We could not send the email.')
          );
      }
      setDone(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : text('Falha de conexão. Tente novamente.', 'Connection failed. Please try again.')
      );
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    'h-12 w-full rounded-lg border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30';
  return (
    <main className="flex min-h-svh items-center justify-center bg-black px-5 py-12 text-white">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-blue-400"
        >
          <BrandLogo size={38} />
        </Link>
        <div className="mt-12">
          {mode === 'reset' ? (
            <LockKeyhole className="mb-5 text-blue-400" size={28} aria-hidden="true" />
          ) : (
            <Mail className="mb-5 text-blue-400" size={28} aria-hidden="true" />
          )}
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300">{description}</p>
        </div>
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg bg-rose-500/10 p-4 text-sm leading-6 text-rose-200"
          >
            {error}
            {mode === 'reset' && (
              <Link href="/forgot-password" className="mt-3 block font-semibold underline">
                {text('Solicitar novo link', 'Request a new link')}
              </Link>
            )}
          </div>
        )}
        {done ? (
          <div role="status" className="mt-8">
            <CheckCircle2 className="mb-3 text-emerald-400" aria-hidden="true" />
            <p className="text-sm leading-6 text-zinc-200">
              {mode === 'reset'
                ? text(
                    'Senha alterada. Entre novamente com sua nova senha.',
                    'Password updated. Sign in again with your new password.'
                  )
                : text(
                    'Se este endereço estiver cadastrado, o e-mail chegará em instantes. Confira também a pasta de spam.',
                    'If this address is registered, the email will arrive shortly. Check your spam folder too.'
                  )}
            </p>
            {mode !== 'reset' && (
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-5 py-2 text-sm text-blue-300 underline-offset-4 hover:underline"
              >
                {text('Tentar outro e-mail ou reenviar', 'Try another email or resend')}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5" aria-busy={busy}>
            {mode !== 'reset' ? (
              <div>
                <label htmlFor="recovery-email" className="mb-2 block text-sm">
                  {text('Endereço de e-mail', 'Email address')}
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  placeholder="voce@email.com"
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="new-password" className="mb-2 block text-sm">
                    {text('Nova senha', 'New password')}
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={visible ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={`${inputClass} pr-14`}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible(!visible)}
                      aria-label={
                        visible
                          ? text('Ocultar senha', 'Hide password')
                          : text('Mostrar senha', 'Show password')
                      }
                      aria-pressed={visible}
                      className="absolute inset-y-0 right-1 flex w-11 items-center justify-center text-zinc-300"
                    >
                      {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className="mb-2 block text-sm">
                    {text('Confirme a nova senha', 'Confirm new password')}
                  </label>
                  <input
                    id="confirm-new-password"
                    type={visible ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={busy || !ready}
              className="h-12 w-full rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300 disabled:cursor-wait disabled:opacity-50"
            >
              {busy
                ? text('Aguarde...', 'Please wait...')
                : mode === 'reset'
                  ? text('Salvar nova senha', 'Save new password')
                  : mode === 'forgot'
                    ? text('Enviar link por e-mail', 'Email me a reset link')
                    : text('Reenviar confirmação', 'Resend confirmation')}
            </button>
          </form>
        )}
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 py-2 text-sm text-zinc-300 hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {text('Voltar para o login', 'Back to sign in')}
        </Link>
      </div>
    </main>
  );
}
