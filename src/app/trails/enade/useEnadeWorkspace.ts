'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { enadeWorkspaceSchema } from '@/lib/enade/simulator-schema';
import { EMPTY_WORKSPACE, type EnadeWorkspace } from '@/lib/enade/simulator';

export function useEnadeWorkspace(userId: string, initial: EnadeWorkspace = EMPTY_WORKSPACE) {
  const [workspace, setWorkspace] = useState(initial);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const current = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queue = useRef(Promise.resolve(true));
  const mounted = useRef(false);
  const dirty = useRef(false);
  const key = `stacklyst:enade:workspace:v1:${userId}`;
  const adopt = useCallback(
    (value: EnadeWorkspace) => {
      current.current = value;
      setWorkspace(value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* Account persistence remains available. */
      }
    },
    [key]
  );
  const send = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!dirty.current) return queue.current;
    dirty.current = false;
    const value = current.current;
    queue.current = queue.current
      .catch(() => false)
      .then(async () => {
        try {
          const body = JSON.stringify(value);
          const response = await fetch('/api/enade/session', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: new TextEncoder().encode(body).length < 60000,
          });
          if (!response.ok) throw new Error('save');
          const result = await response.json();
          const remote = enadeWorkspaceSchema.safeParse(result.value);
          if (
            mounted.current &&
            remote.success &&
            remote.data.updatedAt > current.current.updatedAt
          )
            adopt(remote.data);
          if (mounted.current && value.updatedAt >= current.current.updatedAt)
            setSaveStatus('Progresso salvo');
          return true;
        } catch {
          if (value.updatedAt === current.current.updatedAt) dirty.current = true;
          if (mounted.current)
            setSaveStatus(
              'Não foi possível sincronizar com a conta. Seu rascunho está neste navegador. Tente salvar novamente.'
            );
          return false;
        }
      });
    return queue.current;
  }, [adopt]);
  const save = useCallback(
    (value: EnadeWorkspace, immediate = false) => {
      adopt(value);
      dirty.current = true;
      setSaveStatus('Salvando...');
      if (timer.current) clearTimeout(timer.current);
      if (immediate) return send();
      timer.current = setTimeout(() => void send(), 700);
      return Promise.resolve(true);
    },
    [adopt, send]
  );
  useEffect(() => {
    mounted.current = true;
    try {
      const cached = enadeWorkspaceSchema.safeParse(
        JSON.parse(localStorage.getItem(key) || 'null')
      );
      if (cached.success && cached.data.updatedAt > current.current.updatedAt) adopt(cached.data);
    } catch {
      /* Ignore damaged local state. */
    }
    setReady(true);
    const recover = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return;
      try {
        const parsed = enadeWorkspaceSchema.safeParse(JSON.parse(event.newValue));
        if (parsed.success && parsed.data.updatedAt > current.current.updatedAt) {
          dirty.current = false;
          current.current = parsed.data;
          setWorkspace(parsed.data);
        }
      } catch {
        /* Ignore a partial storage event. */
      }
    };
    const flush = () => {
      void send();
    };
    window.addEventListener('storage', recover);
    window.addEventListener('pagehide', flush);
    return () => {
      mounted.current = false;
      window.removeEventListener('storage', recover);
      window.removeEventListener('pagehide', flush);
      void send();
    };
  }, [key, adopt, send]);
  return { workspace, ready, saveStatus, save, saveNow: send };
}
