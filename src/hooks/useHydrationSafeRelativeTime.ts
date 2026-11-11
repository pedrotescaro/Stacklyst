'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatAbsoluteDate, formatRelativeTime, type DateInput } from '@/lib/date';

const RELATIVE_TIME_REFRESH_MS = 60_000;

interface RelativeTimeState {
  timestamp: number;
  language: string;
  text: string;
}

export function useHydrationSafeRelativeTime(dateValue: DateInput) {
  const timestamp = dateValue instanceof Date ? dateValue.getTime() : new Date(dateValue).getTime();
  const { language } = useLanguage();
  const [relativeTime, setRelativeTime] = useState<RelativeTimeState | null>(null);

  useEffect(() => {
    const updateRelativeTime = () => {
      setRelativeTime({
        timestamp,
        language,
        text: formatRelativeTime(timestamp, new Date(), language),
      });
    };

    updateRelativeTime();
    const intervalId = window.setInterval(updateRelativeTime, RELATIVE_TIME_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [timestamp, language]);

  const hydratedRelativeTime =
    relativeTime?.timestamp === timestamp && relativeTime.language === language
      ? relativeTime.text
      : null;

  return {
    text: hydratedRelativeTime ?? formatAbsoluteDate(timestamp, language),
    isRelative: hydratedRelativeTime !== null,
  };
}
