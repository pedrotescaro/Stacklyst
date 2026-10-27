import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSession } from '../lib/session';
import { api } from '../lib/api';

export function PlatformPresence() {
  const { session, isPreview } = useSession();
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId || isPreview) return;
    let request: AbortController | null = null;
    const beat = async () => {
      if (AppState.currentState !== 'active' || request) return;
      const controller = new AbortController();
      request = controller;
      try {
        await api('/api/presence', {
          method: 'POST',
          headers: { 'X-Platform-Presence': '1' },
          signal: controller.signal,
        });
      } catch {
        /* Presence must not interrupt the current activity. */
      } finally {
        if (request === controller) request = null;
      }
    };
    void beat();
    const interval = setInterval(() => void beat(), 20000);
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void beat();
      else request?.abort();
    });
    return () => {
      clearInterval(interval);
      listener.remove();
      request?.abort();
    };
  }, [userId, isPreview]);
  return null;
}
