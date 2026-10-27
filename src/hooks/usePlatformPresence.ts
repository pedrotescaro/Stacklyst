'use client';
import { useEffect, useState } from 'react';
import type { PlatformPresenceSummary } from '@/lib/platform-presence';

export function usePlatformPresence() {
  const [summary, setSummary] = useState<PlatformPresenceSummary | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let disposed = false;
    let request: AbortController | null = null;
    const refresh = async () => {
      if (document.hidden || request) return;
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch('/api/presence', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Presence unavailable');
        const result = (await response.json()) as PlatformPresenceSummary;
        if (
          !Number.isSafeInteger(result.activeCount) ||
          result.activeCount < 0 ||
          !Array.isArray(result.avatars)
        )
          throw new Error('Invalid presence');
        if (!disposed) {
          setSummary(result);
          setUnavailable(false);
        }
      } catch {
        if (!disposed && !document.hidden) {
          setUnavailable(true);
          setSummary(null);
        }
      } finally {
        window.clearTimeout(timeout);
        if (request === controller) request = null;
      }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 20000);
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);
    window.addEventListener('stacklyst:presence', onVisible);
    return () => {
      disposed = true;
      request?.abort();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
      window.removeEventListener('stacklyst:presence', onVisible);
    };
  }, []);
  return { summary, unavailable };
}
