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

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    try {
      // 1. Chamar nossa API customizada de cadastro
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || copy.accountError);
        setLoading(false);
        return;
      }

      // 2. Realizar login automático no Supabase
      const supabase = createClient();
      let { error: loginError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (
        loginError &&
        (loginError.message?.toLowerCase().includes('email not confirmed') ||
          (loginError as any).code === 'email_not_confirmed')
      ) {
        try {
          const confirmRes = await fetch('/api/auth/confirm-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail }),
          });

          if (confirmRes.ok) {
            const retryRes = await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            });
            loginError = retryRes.error;
          }
        } catch {
          // Continua para o tratamento de erro padrão
        }
      }

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
            'relative flex min-h-svh flex-col items-center justify-start px-4 py-4 sm:px-8 sm:py-6 lg:justify-center lg:py-[8vh] lg:px-[clamp(3rem,5.4vw,4rem)]',
          ].join(' ')}
        >
          {/* Top navigation bar */}
          <header className="relative flex w-full max-w-[466px] lg:max-w-none items-center justify-between mb-4 sm:mb-6 lg:absolute lg:top-8 lg:inset-x-0 lg:px-8 lg:mb-0 lg:pointer-events-none">
            {/* Seta para voltar para a landing page */}
            <Link
              href="/"
              aria-label={copy.backHome}
              title={copy.backHome}
              className="group z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#1a1a1a] text-zinc-400 transition-all duration-200 hover:border-white/20 hover:bg-[#222] hover:text-white lg:pointer-events-auto"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </Link>

            {/* Logo centralizado no mobile e tablet (< lg) */}
            <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none lg:hidden">
              <Link
                href="/"
                className="pointer-events-auto inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
              >
                <Image
                  src="/logo.svg"
                  alt="Stacklyst logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <span className="font-sans text-xl font-extrabold tracking-tight text-white">
                  Stacklyst
                </span>
              </Link>
            </div>

            {/* Seletor de idioma */}
            <div className="z-10 flex items-center lg:pointer-events-auto">
              <LanguageToggle />
            </div>
          </header>

          <div className="w-full max-w-[466px] my-auto lg:my-0 pb-6 lg:pb-0">
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
                  <h2 className="text-2xl sm:text-[28px] font-semibold leading-tight tracking-[-0.045em] text-white">
                    {copy.heading}
                  </h2>
                  <p className="mt-2 sm:mt-3 text-sm sm:text-[15px] leading-6 text-zinc-300">
                    {copy.subtitle}
                  </p>
                </header>

                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-lg border border-rose-400/25 bg-rose-400/[0.08] px-4 py-3 text-sm leading-5 text-rose-200"
                  >
                    {error}
                  </div>
                )}

                <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    aria-label={copy.google}
                    onClick={() => handleOAuthLogin('google')}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-2 text-xs font-medium text-white/90 transition-all hover:border-[#4285F4]/50 hover:bg-[#222] cursor-pointer"
                  >
                    <GoogleIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">Google</span>
                  </button>

                  <button
                    type="button"
                    aria-label={copy.github}
                    onClick={() => handleOAuthLogin('github')}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-2 text-xs font-medium text-white/90 transition-all hover:border-white/25 hover:bg-[#222] cursor-pointer"
                  >
                    <GitHubIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">GitHub</span>
                  </button>

                  <button
                    type="button"
                    aria-label={copy.discord}
                    onClick={() => handleOAuthLogin('discord')}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-2 text-xs font-medium text-white/90 transition-all hover:border-[#5865F2]/50 hover:bg-[#222] cursor-pointer"
                  >
                    <DiscordIcon className="h-4 w-4 shrink-0 text-[#5865F2]" />
                    <span className="truncate">Discord</span>
                  </button>
                </div>

                <div className="relative my-5 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.08]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-black px-4 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      {copy.emailContinue}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">
                  <div>
                    <label
                      className="mb-1.5 block text-xs sm:text-[13px] font-medium text-white"
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
                      className="h-11 sm:h-[49px] w-full rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 hover:border-white/15 focus:border-[#469cff]"
                      placeholder={copy.usernamePlaceholder}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-xs sm:text-[13px] font-medium text-white"
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
                      className="h-11 sm:h-[49px] w-full rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 hover:border-white/15 focus:border-[#469cff]"
                      placeholder={copy.emailPlaceholder}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        className="mb-1.5 block text-xs sm:text-[13px] font-medium text-white"
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
                          className="h-11 sm:h-[49px] w-full rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 hover:border-white/15 focus:border-[#469cff]"
                          placeholder={copy.passwordPlaceholder}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                          aria-pressed={showPassword}
                          className="absolute right-1.5 top-1/2 flex size-8 sm:size-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        className="mb-1.5 block text-xs sm:text-[13px] font-medium text-white"
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
                          className="h-11 sm:h-[49px] w-full rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 hover:border-white/15 focus:border-[#469cff]"
                          placeholder={copy.confirmPasswordPlaceholder}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          aria-label={
                            showConfirmPassword ? copy.hideConfirmation : copy.showConfirmation
                          }
                          aria-pressed={showConfirmPassword}
                          className="absolute right-1.5 top-1/2 flex size-8 sm:size-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
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
                    className="flex h-11 sm:h-[49px] w-full items-center justify-center rounded-lg bg-[#f1f1f3] text-sm font-semibold text-black transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? copy.creating : copy.create}
                  </button>
                </form>

                <p className="mt-5 sm:mt-6 text-center text-xs text-zinc-300">
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
