'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabasePublicConfigured } from '@/lib/supabase/env';
import { OAUTH_PROVIDER_LABELS, type OAuthProvider } from '@/lib/supabase/oauth';
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import AuthHero from '@/components/auth/AuthHero';
import { DiscordIcon, GitHubIcon, GoogleIcon } from '@/components/auth/OAuthProviderIcons';
import Loader from '@/components/Loader';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { isEnglish } = useLanguage();
  const copy = isEnglish
    ? {
        backHome: 'Back to home',
        heading: 'Create your account',
        subtitle: 'Join the community today',
        google: 'Sign up with Google',
        github: 'Sign up with GitHub',
        discord: 'Sign up with Discord',
        emailContinue: 'or continue with email',
        username: 'Username',
        usernamePlaceholder: 'your_username',
        email: 'Email address',
        emailPlaceholder: 'you@email.com',
        password: 'Password',
        passwordPlaceholder: 'At least 6 characters',
        confirmPassword: 'Confirm password',
        confirmPasswordPlaceholder: 'Repeat your password',
        hidePassword: 'Hide password',
        showPassword: 'Show password',
        hideConfirmation: 'Hide confirmation',
        showConfirmation: 'Show confirmation',
        passwordsMatch: 'Passwords match',
        creating: 'Creating account...',
        create: 'Create account',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in',
        configError:
          'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable authentication.',
        oauthError: (provider: string) =>
          `Could not authenticate with ${provider}. Please try again.`,
        passwordMismatch: 'Passwords do not match. Enter the same password in both fields.',
        accountError: 'Could not create your account.',
        automaticSignInError:
          'Your account was created, but automatic sign-in failed. Please sign in manually.',
        serverError: 'A server error occurred. Please try again.',
        loadingTitle: 'Creating your account...',
        loadingSubtitle: 'We’re preparing your Stacklyst profile',
      }
    : {
        backHome: 'Voltar para a página inicial',
        heading: 'Crie sua conta',
        subtitle: 'Junte-se à comunidade hoje',
        google: 'Cadastrar com Google',
        github: 'Cadastrar com GitHub',
        discord: 'Cadastrar com Discord',
        emailContinue: 'ou continue com e-mail',
        username: 'Nome de usuário',
        usernamePlaceholder: 'seu_usuario',
        email: 'Endereço de e-mail',
        emailPlaceholder: 'voce@email.com',
        password: 'Senha',
        passwordPlaceholder: 'Pelo menos 6 caracteres',
        confirmPassword: 'Confirmar senha',
        confirmPasswordPlaceholder: 'Repita sua senha',
        hidePassword: 'Ocultar senha',
        showPassword: 'Mostrar senha',
        hideConfirmation: 'Ocultar confirmação',
        showConfirmation: 'Mostrar confirmação',
        passwordsMatch: 'As senhas coincidem',
        creating: 'Criando conta...',
        create: 'Criar conta',
        hasAccount: 'Já tem uma conta?',
        signIn: 'Entrar',
        configError:
          'Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para habilitar a autenticação.',
        oauthError: (provider: string) =>
          `Não foi possível autenticar com ${provider}. Tente novamente.`,
        passwordMismatch: 'As senhas não coincidem. Digite a mesma senha nos dois campos.',
        accountError: 'Não foi possível criar sua conta.',
        automaticSignInError:
          'Sua conta foi criada, mas a entrada automática falhou. Entre manualmente.',
        serverError: 'Ocorreu um erro no servidor. Tente novamente.',
        loadingTitle: 'Criando sua conta...',
        loadingSubtitle: 'Estamos preparando seu perfil no Stacklyst',
      };
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('lp-landing-page');
    return () => {
      document.documentElement.classList.remove('lp-landing-page');
    };
  }, []);

  const checkSupabaseConfig = () => {
    if (!isSupabasePublicConfigured()) {
      setError(copy.configError);
      return false;
    }
    return true;
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setError(null);
    if (!checkSupabaseConfig()) return;

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (err) {
      console.error(err);
      setError(copy.oauthError(OAUTH_PROVIDER_LABELS[provider]));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    if (!checkSupabaseConfig()) return;

    setLoading(true);

    try {
      // 1. Chamar nossa API customizada de cadastro
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || copy.accountError);
        setLoading(false);
        return;
      }

      // 2. Realizar login automático no Supabase
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(copy.automaticSignInError);
        setLoading(false);
        router.push('/login');
        return;
      }

      router.push('/feed');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(copy.serverError);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-svh bg-black font-sans text-white antialiased">
      <div className="grid min-h-svh w-full lg:grid-cols-[53%_47%]">
        <AuthHero />

        <section
          className={[
            styles.formPanel,
            'relative flex min-h-svh items-start justify-center px-5 py-8 sm:px-12 lg:py-[8vh] lg:px-[clamp(3rem,5.4vw,4rem)]',
          ].join(' ')}
        >
          {/* Seta para voltar para a landing page */}
          <Link
            href="/"
            aria-label={copy.backHome}
            title={copy.backHome}
            className="group absolute left-5 top-5 sm:left-8 sm:top-8 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#1a1a1a] text-zinc-400 transition-all duration-200 hover:border-white/20 hover:bg-[#222] hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </Link>
          <div className="absolute right-5 top-5 z-10 sm:right-8 sm:top-8">
            <LanguageToggle />
          </div>

          <div className="w-full max-w-[466px]">
            <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
              <Image
                src="/logo.svg"
                alt="Stacklyst logo"
                width={38}
                height={38}
                className={[styles.brandLogo, 'h-[38px] w-[38px] object-contain'].join(' ')}
              />
              <span
                className={[styles.brandText, 'text-2xl font-bold tracking-[-0.04em]'].join(' ')}
              >
                Stacklyst
              </span>
            </Link>

            {loading ? (
              <Loader
                title={copy.loadingTitle}
                subtitle={copy.loadingSubtitle}
                size="md"
                className="min-h-[520px] px-0"
              />
            ) : (
              <>
                <header className="text-center">
                  <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.045em] text-white">
                    {copy.heading}
                  </h2>
                  <p className="mt-4 text-[15px] leading-6 text-zinc-300">{copy.subtitle}</p>
                </header>

                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-lg border border-rose-400/25 bg-rose-400/[0.08] px-4 py-3 text-sm leading-5 text-rose-200"
                  >
                    {error}
                  </div>
                )}

                <div className="mt-8 grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    aria-label={copy.google}
                    onClick={() => handleOAuthLogin('google')}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-white/[0.06] bg-[#1a1a1a] px-1.5 text-[9px] font-medium whitespace-nowrap text-white/85 transition-colors hover:border-[#4285F4]/45 hover:bg-[#202020] sm:gap-2 sm:px-2 sm:text-[10px] cursor-pointer"
                  >
                    <GoogleIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    aria-label={copy.github}
                    onClick={() => handleOAuthLogin('github')}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-white/[0.06] bg-[#1a1a1a] px-1.5 text-[9px] font-medium whitespace-nowrap text-white/85 transition-colors hover:border-white/20 hover:bg-[#202020] sm:gap-2 sm:px-2 sm:text-[10px] cursor-pointer"
                  >
                    <GitHubIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>GitHub</span>
                  </button>

                  <button
                    type="button"
                    aria-label={copy.discord}
                    onClick={() => handleOAuthLogin('discord')}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-white/[0.06] bg-[#1a1a1a] px-1.5 text-[9px] font-medium whitespace-nowrap text-white/85 transition-colors hover:border-[#5865F2]/45 hover:bg-[#202020] sm:gap-2 sm:px-2 sm:text-[10px] cursor-pointer"
                  >
                    <DiscordIcon className="h-3.5 w-4 shrink-0 text-[#5865F2]" />
                    <span>Discord</span>
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.08]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#111] px-4 text-[11px] font-medium uppercase tracking-[-0.025em] text-zinc-400">
                      {copy.emailContinue}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label
                      className="mb-2 block text-[13px] font-medium text-white"
                      htmlFor="username"
                    >
                      {copy.username}
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      autoComplete="username"
                      className="h-[49px] w-full rounded-md border border-white/[0.06] bg-[#1a1a1a] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-400 hover:border-white/10 focus:border-[#469cff]"
                      placeholder={copy.usernamePlaceholder}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-[13px] font-medium text-white"
                      htmlFor="email"
                    >
                      {copy.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      autoComplete="email"
                      className="h-[49px] w-full rounded-md border border-white/[0.06] bg-[#1a1a1a] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-400 hover:border-white/10 focus:border-[#469cff]"
                      placeholder={copy.emailPlaceholder}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block text-[13px] font-medium text-white"
                        htmlFor="password"
                      >
                        {copy.password}
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          className="h-[49px] w-full rounded-md border border-white/[0.06] bg-[#1a1a1a] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-zinc-400 hover:border-white/10 focus:border-[#469cff]"
                          placeholder={copy.passwordPlaceholder}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                          aria-pressed={showPassword}
                          className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        className="mb-2 block text-[13px] font-medium text-white"
                        htmlFor="confirmPassword"
                      >
                        {copy.confirmPassword}
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          className="h-[49px] w-full rounded-md border border-white/[0.06] bg-[#1a1a1a] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-zinc-400 hover:border-white/10 focus:border-[#469cff]"
                          placeholder={copy.confirmPasswordPlaceholder}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          aria-label={
                            showConfirmPassword ? copy.hideConfirmation : copy.showConfirmation
                          }
                          aria-pressed={showConfirmPassword}
                          className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {confirmPassword && password === confirmPassword && (
                    <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <CheckCircle2 size={13} /> {copy.passwordsMatch}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-[49px] w-full items-center justify-center rounded-md bg-[#f1f1f3] text-sm font-semibold text-black transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? copy.creating : copy.create}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-zinc-300">
                  {copy.hasAccount}{' '}
                  <Link href="/login" className="font-semibold text-white hover:underline">
                    {copy.signIn}
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
