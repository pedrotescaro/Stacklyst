'use client';
import { useEffect } from 'react';
import { syncTheme } from '@/lib/theme';

export function ThemeSync() {
  useEffect(() => {
    syncTheme();
    const storage = (event: StorageEvent) => {
      if (event.key === 'theme' || event.key === null) syncTheme();
    };
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    window.addEventListener('pageshow', syncTheme);
    window.addEventListener('storage', storage);
    system.addEventListener('change', syncTheme);
    return () => {
      window.removeEventListener('pageshow', syncTheme);
      window.removeEventListener('storage', storage);
      system.removeEventListener('change', syncTheme);
    };
  }, []);
  return null;
}
