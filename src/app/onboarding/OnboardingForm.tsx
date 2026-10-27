'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Users, Compass } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { BrandReveal } from '@/components/BrandReveal';
import SiteEntryLoader from '@/components/landing/SiteEntryLoader';
import {
  TrailLanguageLogo,
  TRAIL_LANGUAGE_CODES,
  getTrailLanguageMetadata,
} from '@/app/trails/TrailLanguageLogo';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OnboardingPreferences } from '@/lib/onboarding';

export function OnboardingForm({
  initialPreferences,
}: {
  initialPreferences: OnboardingPreferences | null;
}) {
  const router = useRouter();
  const { isEnglish } = useLanguage();
  const text = (pt: string, en: string) => (isEnglish ? en : pt);
  const [feed, setFeed] = useState<OnboardingPreferences['feed']>(
    initialPreferences?.feed || 'for-you'
  );
  const [languages, setLanguages] = useState<OnboardingPreferences['languages']>(
    initialPreferences?.languages || []
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!languages.length) {
      setError(
        text(
          'Escolha pelo menos uma linguagem para continuar.',
          'Choose at least one language to continue.'
        )
      );
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed, languages }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error);
      setSaved(true);
    } catch {
      setError(
        text(
          'Não foi possível salvar. Suas escolhas continuam aqui; tente novamente.',
          'We could not save. Your choices are still here; try again.'
        )
      );
      setBusy(false);
    }
  }

  if (saved) {
    return (
      <SiteEntryLoader
        onComplete={() => {
          router.push('/feed');
          router.refresh();
        }}
      />
    );
  }

  return (
    <main className="min-h-svh bg-dd-bg px-5 py-10 text-dd-text sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <BrandLogo size={36} />
        {busy ? (
          <BrandReveal
            title={text('Seu Stacklyst está abrindo', 'Your Stacklyst is opening')}
            subtitle={text('Salvando suas preferências...', 'Saving your preferences...')}
            className="min-h-[65svh]"
          />
        ) : (
          <>
            <h1 className="mt-12 text-3xl font-semibold tracking-tight sm:text-4xl">
              {text('O que move sua curiosidade?', 'What sparks your curiosity?')}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-dd-muted">
              {text(
                'Escolha como começar. Você pode mudar de feed a qualquer momento e ajustar suas linguagens depois.',
                'Choose where to start. You can switch feeds anytime and adjust your languages later.'
              )}
            </p>
            <form onSubmit={submit} className="mt-10 space-y-10">
              <fieldset>
                <legend className="mb-4 text-base font-semibold">
                  {text('Qual feed você quer abrir?', 'Which feed would you like to open?')}
                </legend>
                <div className="space-y-3">
                  {(['for-you', 'following'] as const).map((value) => {
                    const Icon = value === 'for-you' ? Compass : Users;
                    return (
                      <label
                        key={value}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${feed === value ? 'border-blue-500 bg-blue-500/10' : 'border-dd-border hover:bg-dd-elevated'}`}
                      >
                        <input
                          type="radio"
                          name="feed"
                          value={value}
                          checked={feed === value}
                          onChange={() => setFeed(value)}
                          className="h-4 w-4 accent-blue-500"
                        />
                        <Icon size={23} className="shrink-0 text-blue-400" aria-hidden="true" />
                        <span>
                          <span className="block text-sm font-semibold">
                            {value === 'for-you'
                              ? text('Para você', 'For you')
                              : text('Seguindo', 'Following')}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-dd-muted">
                            {value === 'for-you'
                              ? text(
                                  'Publicações nas linguagens que você escolher abaixo.',
                                  'Posts in the languages you choose below.'
                                )
                              : text(
                                  'Publicações das pessoas que você segue. Você pode encontrá-las em Explorar.',
                                  'Posts from people you follow. Find people in Explore.'
                                )}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-base font-semibold">
                  {text(
                    'Quais linguagens você quer acompanhar?',
                    'Which languages would you like to follow?'
                  )}
                </legend>
                <p className="mt-2 text-xs text-dd-muted">
                  {text(
                    'Escolha uma ou mais. Elas também iniciam sua seleção de trilhas.',
                    'Choose one or more. These also start your trail selection.'
                  )}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {TRAIL_LANGUAGE_CODES.map((language) => {
                    const checked = languages.includes(language);
                    return (
                      <label
                        key={language}
                        className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${checked ? 'border-blue-500 bg-blue-500/10' : 'border-dd-border hover:bg-dd-elevated'}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setLanguages((current) =>
                              checked
                                ? current.filter((item) => item !== language)
                                : [...current, language]
                            )
                          }
                          className="h-4 w-4 shrink-0 accent-blue-500"
                        />
                        <TrailLanguageLogo language={language} className="h-6 w-6 shrink-0" />
                        <span className="min-w-0 text-xs font-medium sm:text-sm">
                          {getTrailLanguageMetadata(language).label}
                        </span>
                        {checked && (
                          <Check
                            size={12}
                            className="absolute right-2 top-2 text-blue-400"
                            aria-hidden="true"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              {error && (
                <p role="alert" className="text-sm text-rose-400">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-dd-border pt-6">
                <p className="text-xs text-dd-muted">
                  {text(
                    `${languages.length} linguagem(ns) selecionada(s)`,
                    `${languages.length} language(s) selected`
                  )}
                </p>
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                >
                  {text('Abrir meu feed', 'Open my feed')}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
