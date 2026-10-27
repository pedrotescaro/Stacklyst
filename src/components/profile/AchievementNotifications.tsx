'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabasePublicConfigured } from '@/lib/supabase/env';
import styles from './AchievementNotifications.module.css';

export default function AchievementNotifications() {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    if (!isSupabasePublicConfigured()) return;
    let owner: string | null = null;
    let disposed = false;
    let authEvent = false;
    let pending: AbortController | null = null;
    const check = async () => {
      if (!owner || disposed || document.hidden || !navigator.onLine || pending) return;
      const requestedOwner = owner;
      const controller = new AbortController();
      pending = controller;
      const timeout = window.setTimeout(() => controller.abort(), 25000);
      try {
        const response = await fetch('/api/profile/achievements?notify=1', {
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        if (disposed || owner !== requestedOwner) return;
        const ids = new Set<string>(Array.isArray(data.newUnlocks) ? data.newUnlocks : []);
        const unlocked = Array.isArray(data.achievements)
          ? data.achievements.filter((item: { id: string; name: string }) => ids.has(item.id))
          : [];
        if (unlocked.length) setNames(unlocked.map((item: { name: string }) => item.name));
      } catch {
        // Awards remain in the notification center when a transient request fails.
      } finally {
        window.clearTimeout(timeout);
        if (pending === controller) pending = null;
      }
    };
    const apply = (id: string | null) => {
      if (disposed) return;
      if (owner !== id) {
        pending?.abort();
        setNames([]);
      }
      owner = id;
      if (id) void check();
    };
    const client = createClient();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      authEvent = true;
      apply(session?.user.id || null);
    });
    void client.auth
      .getSession()
      .then(({ data }) => {
        if (!authEvent) apply(data.session?.user.id || null);
      })
      .catch(() => undefined);
    const visible = () => {
      if (!document.hidden) void check();
    };
    const interval = window.setInterval(() => void check(), 60000);
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('online', visible);
    return () => {
      disposed = true;
      pending?.abort();
      subscription.unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('online', visible);
    };
  }, []);
  useEffect(() => {
    if (!names.length) return;
    const timer = window.setTimeout(() => setNames([]), 12000);
    return () => window.clearTimeout(timer);
  }, [names]);
  if (!names.length) return null;
  return (
    <aside className={styles.toast} aria-live="polite" aria-atomic="true">
      <Award size={24} aria-hidden="true" />
      <div>
        <strong>{names.length > 1 ? 'Novas conquistas!' : 'Nova conquista!'}</strong>
        <p>
          {names.slice(0, 3).join(' · ')}
          {names.length > 3 ? ` +${names.length - 3}` : ''}
        </p>
        <Link href="/achievements" onClick={() => setNames([])}>
          Ver minhas conquistas
        </Link>
      </div>
      <button type="button" aria-label="Fechar aviso de conquista" onClick={() => setNames([])}>
        <X size={18} />
      </button>
    </aside>
  );
}
