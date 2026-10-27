'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabasePublicConfigured } from '@/lib/supabase/env';

/** Heartbeats only while an authenticated browser page is visible. */
export default function PlatformPresence() {
  useEffect(() => {
    if (!isSupabasePublicConfigured()) return;
    let signedIn = false;
    let authEventReceived = false;
    let disposed = false;
    let request: AbortController | null = null;
    const beat = async () => {
      if (!signedIn || document.hidden || !navigator.onLine || request) return;
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch('/api/presence', {
          method: 'POST',
          credentials: 'same-origin',
          signal: controller.signal,
          headers: { 'X-Platform-Presence': '1' },
        });
        if (response.ok && !disposed) window.dispatchEvent(new Event('stacklyst:presence'));
      } catch {
        /* Presence failure must not block the app. */
      } finally {
        window.clearTimeout(timeout);
        if (request === controller) request = null;
      }
    };
    const apply = (present: boolean) => {
      if (disposed) return;
      signedIn = present;
      if (present) void beat();
      else request?.abort();
    };
    const client = createClient();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      apply(Boolean(session));
    });
    void client.auth
      .getSession()
      .then(({ data }) => {
        if (!authEventReceived) apply(Boolean(data.session));
      })
      .catch(() => undefined);
    const onVisible = () => {
      if (document.hidden) request?.abort();
      else void beat();
    };
    const interval = window.setInterval(() => void beat(), 20000);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);
    return () => {
      disposed = true;
      request?.abort();
      subscription.unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
    };
  }, []);
  return null;
}
