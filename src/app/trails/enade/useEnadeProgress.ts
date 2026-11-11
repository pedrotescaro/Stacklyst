'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { EnadeAttempt } from '@/lib/enade/types';
import catalog from '@/lib/enade/exams.json';

export function useEnadeProgress(userId: string, initialAttempts: Record<string, EnadeAttempt>) {
  const [attempts, setAttempts] = useState(initialAttempts);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const mounted = useRef(false);
  const pending = useRef(Promise.resolve(true));
  const jobs = useRef(
    new Map<number, { timer: ReturnType<typeof setTimeout>; send: () => Promise<boolean> }>()
  );
  const revision = useRef(0);

  const save = useCallback(
    (edition: number, value: EnadeAttempt, immediate = false) => {
      setAttempts((current) => ({ ...current, [edition]: value }));
      try {
        localStorage.setItem(`enade-ads:${userId}:${edition}`, JSON.stringify(value));
      } catch {
        /* Account saving is still available. */
      }
      setSaveStatus('Salvando...');
      const requestRevision = ++revision.current;
      const previous = jobs.current.get(edition);
      if (previous) clearTimeout(previous.timer);
      jobs.current.delete(edition);
      const send = () => {
        pending.current = pending.current
          .catch(() => false)
          .then(async () => {
            try {
              const response = await fetch(`/api/enade/${edition}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(value),
              });
              if (!response.ok) throw new Error('save');
              if (mounted.current && requestRevision === revision.current)
                setSaveStatus('Progresso salvo');
              return true;
            } catch {
              if (mounted.current && requestRevision === revision.current)
                setSaveStatus('Não foi possível sincronizar com a conta. Tente salvar novamente.');
              return false;
            }
          });
        return pending.current;
      };
      if (immediate) return send();
      const timer = setTimeout(
        () => {
          jobs.current.delete(edition);
          void send();
        },
        value.finishedAt ? 0 : 700
      );
      jobs.current.set(edition, { timer, send });
      return Promise.resolve(true);
    },
    [userId]
  );

  useEffect(() => {
    mounted.current = true;
    const outstanding = jobs.current;
    setAttempts((current) => {
      const next = { ...current };
      for (const edition of catalog) {
        try {
          const local = JSON.parse(
            localStorage.getItem(`enade-ads:${userId}:${edition.year}`) || 'null'
          ) as EnadeAttempt | null;
          if (
            local &&
            typeof local.startedAt === 'number' &&
            typeof local.updatedAt === 'number' &&
            local.answers &&
            Array.isArray(local.marked) &&
            local.updatedAt > (next[edition.year]?.updatedAt || 0)
          )
            next[edition.year] = local;
        } catch {
          /* Ignore a damaged local draft. */
        }
      }
      return next;
    });
    setReady(true);
    return () => {
      mounted.current = false;
      // Navigation to the standalone activity must not drop the last queued save.
      for (const job of outstanding.values()) {
        clearTimeout(job.timer);
        void job.send();
      }
      outstanding.clear();
    };
  }, [userId]);

  return { attempts, ready, saveStatus, save };
}
