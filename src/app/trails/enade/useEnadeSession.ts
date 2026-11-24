'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EnadeQuestionContent } from '@/lib/enade/types';
import {
  answerQuestion,
  checkpoint,
  checkDiscursive,
  elapsedTime,
  finishSession,
  gradeSession,
  navigateSession,
  pauseSession,
  QUESTION_BY_ID,
  randomUnanswered,
  remainingTime,
  sessionQuestions,
  toggleReview,
  type EnadeSession,
} from '@/lib/enade/simulator';
import { enadeSessionSchema } from '@/lib/enade/simulator-schema';
import { questionPresentation } from '@/lib/enade/feedback';

export function newEnadeSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

const draftKey = (attemptId: string) => `stacklyst:enade:attempt:${attemptId}`;

/**
 * Autosave for one attempt: the browser keeps a draft immediately and the
 * account copy is synced shortly after every change (and on tab hide). The
 * server keeps whichever snapshot is newest, so two tabs cannot regress it.
 */
function useAttemptSync(attemptId: string, initial: EnadeSession) {
  const [saveStatus, setSaveStatus] = useState('');
  const latest = useRef(initial);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queue = useRef(Promise.resolve(true));
  const mounted = useRef(true);
  const onRemote = useRef<(session: EnadeSession) => void>(() => {});
  const keepDraft = useRef(true);
  const send = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!dirty.current) return queue.current;
    dirty.current = false;
    const value = latest.current;
    queue.current = queue.current
      .catch(() => false)
      .then(async () => {
        let message = '';
        const endpoint = `/api/enade/attempts/${attemptId}`;
        const adoptStored = (stored: EnadeSession) => {
          latest.current = stored;
          dirty.current = false;
          try {
            localStorage.setItem(draftKey(attemptId), JSON.stringify(stored));
          } catch {
            // The server already has this snapshot.
          }
          if (mounted.current) onRemote.current(stored);
        };
        try {
          const body = JSON.stringify(value);
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: new TextEncoder().encode(body).length < 60000,
          });
          const result = await response.json().catch(() => null);
          if (response.status === 409 && value === latest.current) {
            const storedResponse = await fetch(endpoint, { cache: 'no-store' });
            const storedResult = await storedResponse.json().catch(() => null);
            const stored = enadeSessionSchema.safeParse(storedResult?.attempt?.session);
            if (storedResponse.ok && stored.success && value === latest.current) {
              adoptStored(stored.data as EnadeSession);
              if (mounted.current)
                setSaveStatus(
                  'O progresso da conta foi atualizado com as respostas salvas em outra aba.'
                );
              return false;
            }
          }
          if (!response.ok || result?.attempt?.status === 'ABANDONED') {
            message =
              result?.attempt?.status === 'ABANDONED'
                ? 'Este simulado foi descartado em outra aba.'
                : result?.error?.message || '';
            throw new Error('save');
          }
          const remote = enadeSessionSchema.safeParse(result?.attempt?.session);
          if (
            remote.success &&
            (remote.data.updatedAt > latest.current.updatedAt ||
              (remote.data.finishedAt && !latest.current.finishedAt))
          ) {
            adoptStored(remote.data as EnadeSession);
          }
          if (!dirty.current && mounted.current) setSaveStatus('Progresso salvo');
          return true;
        } catch {
          if (value === latest.current) {
            dirty.current = true;
            if (mounted.current)
              setSaveStatus(
                message ||
                  (keepDraft.current
                    ? 'Não foi possível sincronizar com a conta. O rascunho está neste navegador. Tente salvar novamente.'
                    : 'Não foi possível sincronizar com a conta. Mantenha esta página aberta e tente salvar novamente.')
              );
          }
          return false;
        }
      });
    return queue.current;
  }, [attemptId]);
  const save = useCallback(
    (value: EnadeSession, immediate = false) => {
      latest.current = value;
      dirty.current = true;
      try {
        localStorage.setItem(draftKey(attemptId), JSON.stringify(value));
        keepDraft.current = true;
      } catch {
        keepDraft.current = false;
      }
      setSaveStatus('Salvando...');
      if (timer.current) clearTimeout(timer.current);
      if (immediate || value.finishedAt) return send();
      timer.current = setTimeout(() => void send(), 700);
      return Promise.resolve(true);
    },
    [attemptId, send]
  );
  useEffect(() => {
    mounted.current = true;
    const flush = () => void send();
    window.addEventListener('pagehide', flush);
    return () => {
      mounted.current = false;
      window.removeEventListener('pagehide', flush);
      void send();
    };
  }, [send]);
  return { save, send, saveStatus, onRemote };
}

export function useEnadeSession({
  attemptId,
  initialSession,
}: {
  attemptId: string;
  initialSession: EnadeSession;
}) {
  const { onRemote, save, saveStatus, send } = useAttemptSync(attemptId, initialSession);
  const [session, setSession] = useState<EnadeSession>(initialSession);
  const current = useRef<EnadeSession>(initialSession);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [contents, setContents] = useState<Record<string, EnadeQuestionContent>>({});
  const [contentError, setContentError] = useState(false);
  const [retry, setRetry] = useState(0);
  const adopt = useCallback((next: EnadeSession) => {
    current.current = next;
    setSession(next);
    setNow(Date.now());
  }, []);
  useEffect(() => {
    onRemote.current = adopt;
  }, [onRemote, adopt]);
  const commit = useCallback(
    (next: EnadeSession, immediate = false) => {
      adopt(next);
      return save(next, immediate);
    },
    [adopt, save]
  );
  // A browser draft newer than the account copy (e.g. saved offline) wins once.
  useEffect(() => {
    try {
      const parsed = enadeSessionSchema.safeParse(
        JSON.parse(localStorage.getItem(draftKey(attemptId)) || 'null')
      );
      if (
        parsed.success &&
        parsed.data.id === initialSession.id &&
        !initialSession.finishedAt &&
        parsed.data.updatedAt > initialSession.updatedAt
      )
        void commit(parsed.data as EnadeSession, true);
    } catch {
      /* Ignore a damaged draft. */
    }
    setReady(true);
    // Only on mount: later changes flow through commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const recover = (event: StorageEvent) => {
      if (event.key !== draftKey(attemptId) || !event.newValue) return;
      try {
        const parsed = enadeSessionSchema.safeParse(JSON.parse(event.newValue));
        if (
          parsed.success &&
          parsed.data.id === current.current.id &&
          !current.current.finishedAt &&
          parsed.data.updatedAt > current.current.updatedAt
        )
          adopt(parsed.data as EnadeSession);
      } catch {
        /* Preserve the valid session. */
      }
    };
    window.addEventListener('storage', recover);
    return () => window.removeEventListener('storage', recover);
  }, [attemptId, adopt]);
  const years = [...new Set(session.questionIds.map((id) => QUESTION_BY_ID.get(id)!.year))]
    .sort()
    .join(',');
  useEffect(() => {
    const controller = new AbortController();
    setContentError(false);
    void Promise.all(
      years.split(',').map(async (edition) => {
        const response = await fetch(`/enade/${edition}/questions.json`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('questions');
        const data: EnadeQuestionContent[] = await response.json();
        if (!Array.isArray(data) || data.length !== 40) throw new Error('questions');
        return data;
      })
    )
      .then((editions) => {
        if (!controller.signal.aborted)
          setContents(Object.fromEntries(editions.flat().map((q) => [q.id, q])));
      })
      .catch(() => {
        if (!controller.signal.aborted) setContentError(true);
      });
    return () => controller.abort();
  }, [years, retry]);
  const running = ready && !session.finishedAt && !session.paused;
  useEffect(() => {
    if (!running) return;
    const refresh = () => setNow(Date.now());
    refresh();
    const interval = setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [running, session.id]);
  const remaining = remainingTime(session, now);
  useEffect(() => {
    const active = current.current;
    if (ready && !active.finishedAt && remaining !== null && remaining <= 0)
      void commit(finishSession(active, Date.now(), 'timeout'), true);
  }, [ready, remaining, commit]);
  useEffect(() => {
    const flush = () => {
      const active = current.current;
      if (active.finishedAt || active.paused) return;
      const stamp = Date.now();
      void commit(
        remainingTime(active, stamp) === 0
          ? finishSession(active, stamp, 'timeout')
          : checkpoint(active, stamp),
        true
      );
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') flush();
      else setNow(Date.now());
    };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [commit]);
  function act(transform: (value: EnadeSession, stamp: number) => EnadeSession, immediate = false) {
    const stamp = Date.now();
    const active = current.current;
    const expired = !active.finishedAt && remainingTime(active, stamp) === 0;
    const next = expired ? finishSession(active, stamp, 'timeout') : transform(active, stamp);
    if (next !== active) void commit(next, immediate || expired);
  }
  const questions = sessionQuestions(session);
  const presentations = questions.map((q) => questionPresentation(session, q, contents[q.id]));
  return {
    session,
    ready,
    now,
    remaining,
    elapsed: elapsedTime(session, now),
    result: gradeSession(session, now),
    questions,
    presentations,
    question: presentations[session.currentIndex || 0],
    contents,
    contentError,
    timeWarning:
      session.config.durationMinutes !== null &&
      remaining !== null &&
      remaining <= session.config.durationMinutes * 6000,
    saveStatus,
    answer: (id: string, value: string) => act((s, stamp) => answerQuestion(s, id, value, stamp)),
    navigate: (index: number) => {
      const active = current.current;
      if (active.finishedAt) {
        const currentIndex = Math.max(0, Math.min(active.questionIds.length - 1, index));
        adopt({ ...active, currentIndex });
      } else act((s, stamp) => navigateSession(s, index, stamp));
    },
    mark: (id: string) => act((s, stamp) => toggleReview(s, id, stamp)),
    checkDiscursive: () => act(checkDiscursive, true),
    pause: () => act(pauseSession, true),
    finish: () => act((s, stamp) => finishSession(s, stamp), true),
    skip: () => {
      const index = randomUnanswered(current.current, Math.random());
      if (index !== null) act((s, stamp) => navigateSession(s, index, stamp));
    },
    canSkip: randomUnanswered(session, 0) !== null,
    retryLoad: () => setRetry((n) => n + 1),
    saveNow: () => {
      if (current.current.finishedAt) void send();
      else act(checkpoint, true);
    },
    flush: send,
  };
}
