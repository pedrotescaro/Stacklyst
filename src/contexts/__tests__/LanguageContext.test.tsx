import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { LanguageProvider, useLanguage } from '../LanguageContext';
import React from 'react';

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'pt-BR';
    document.documentElement.removeAttribute('data-language');
    vi.restoreAllMocks();
  });

  it('provides default Portuguese language and translations', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    );

    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('pt');
    expect(result.current.isEnglish).toBe(false);
    expect(result.current.t.nav.howItWorks).toBe('Como funciona');
    expect(result.current.t.hero.titleLine1).toBe('Desbloqueie o melhor do Stacklyst.');
  });

  it('toggles language between pt and en and updates html attributes', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    );

    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.language).toBe('en');
    expect(result.current.isEnglish).toBe(true);
    expect(result.current.t.nav.howItWorks).toBe('How it works');
    expect(result.current.t.hero.titleLine1).toBe('Unlock the best of Stacklyst.');
    expect(result.current.t.hero.titleLine2).toBe('The developer community of the future.');
    expect(result.current.t.hero.subtitle).toBe(
      'Where developers build and prove exceptional craft.'
    );
    expect(result.current.t.showcase.howItWorks.proofCard.title).toBe(
      'Let your code speak for you'
    );
    expect(result.current.t.showcase.cta.titlePart1).toBe("Don't just claim skills. ");
    expect(result.current.t.showcase.cta.titleShowIt).toBe('Prove them.');
    expect(localStorage.getItem('site-language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dataset.language).toBe('en');

    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.language).toBe('pt');
    expect(result.current.isEnglish).toBe(false);
    expect(localStorage.getItem('site-language')).toBe('pt');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.documentElement.dataset.language).toBe('pt');
  });

  it('restores saved language from localStorage', () => {
    localStorage.setItem('site-language', 'en');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    );

    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.isEnglish).toBe(true);
  });
});
