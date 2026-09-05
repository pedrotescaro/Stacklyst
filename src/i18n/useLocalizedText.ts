'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function useLocalizedText() {
  const { language, isEnglish } = useLanguage();
  const text = useCallback(
    (portuguese: string, english: string) => (language === 'en' ? english : portuguese),
    [language]
  );

  return {
    language,
    locale: language === 'en' ? 'en-US' : 'pt-BR',
    isEnglish,
    text,
  };
}
