'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EnadeAttempt, EnadeQuestionContent } from '@/lib/enade/types';
import {
  answerQuestion,
  checkpoint,
  checkDiscursive,
  createSession,
  elapsedTime,
  finishSession,
  gradeSession,
  navigateSession,
  pauseSession,
  QUESTION_BY_ID,
  randomUnanswered,
  remainingTime,
  repeatSession,
  sessionFromLegacy,
  sessionQuestions,
  toggleReview,
  type EnadeConfig,
  type EnadeSession,
  type EnadeWorkspace,
} from '@/lib/enade/simulator';
import { enadeSessionSchema } from '@/lib/enade/simulator-schema';
import { useEnadeProgress } from './useEnadeProgress';
import { useEnadeWorkspace } from './useEnadeWorkspace';
import { questionPresentation } from '@/lib/enade/feedback';

export function newEnadeSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

export function useEnadeSession({
  userId,
  year,
  initialAttempt,
  initialWorkspace,
}: {
  userId: string;
  year?: number;
  initialAttempt?: EnadeAttempt;
  initialWorkspace?: EnadeWorkspace;
}) {
  const legacy = useEnadeProgress(userId, year && initialAttempt ? { [year]: initialAttempt } : {});
  const custom = useEnadeWorkspace(userId, initialWorkspace);
  const saveLegacy = legacy.save;
  const saveCustom = custom.save;
  const [session, setSession] = useState<EnadeSession | null>(null);
  const current = useRef<EnadeSession | null>(null);
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [contents, setContents] = useState<Record<string, EnadeQuestionContent>>({});
  const [contentError, setContentError] = useState(false);
  const [retry, setRetry] = useState(0);
  const persist = useCallback(
    (next: EnadeSession, immediate = false) => {
      if (next.sourceYear !== undefined) return saveLegacy(next.sourceYear, next, immediate);
      const value: EnadeWorkspace = {
        version: 1,
        config: next.config,
        session: next,
        updatedAt: next.updatedAt,
      };
      return saveCustom(value, immediate);
    },
    [saveLegacy, saveCustom]
  );
  const commit = useCallback(
    (next: EnadeSession, immediate = false) => {
      current.current = next;
      setSession(next);
      setNow(Date.now());
      return persist(next, immediate);
    },
    [persist]
  );
  useEffect(() => {
    if (!legacy.ready || !custom.ready || initialized.current) return;
    initialized.current = true;
    const stamp = Date.now();
    if (year) {
      const previous = legacy.attempts[year];
      const parsed = enadeSessionSchema.safeParse(previous);
      const recovered =
        parsed.success && parsed.data.sourceYear === year
          ? parsed.data
          : sessionFromLegacy(year, previous, stamp);
      current.current = recovered;
      setSession(recovered);
      if (!previous || !parsed.success) void persist(recovered);
    } else {
      current.current = custom.workspace.session;
      setSession(custom.workspace.session);
    }
    setNow(stamp);
    setReady(true);
  }, [legacy.ready, legacy.attempts, custom.ready, custom.workspace, year, persist]);
  useEffect(() => {
    if (year || !initialized.current || !custom.workspace.session) return;
    if (custom.workspace.session.updatedAt > (current.current?.updatedAt || 0)) {
      current.current = custom.workspace.session;
      setSession(custom.workspace.session);
      setNow(Date.now());
    }
  }, [custom.workspace, year]);
  useEffect(() => {
    if (!year) return;
    const recover = (event: StorageEvent) => {
      if (event.key !== `enade-ads:${userId}:${year}` || !event.newValue) return;
      try {
        const parsed = enadeSessionSchema.safeParse(JSON.parse(event.newValue));
        if (
          parsed.success &&
          parsed.data.sourceYear === year &&
          parsed.data.updatedAt > (current.current?.updatedAt || 0)
        ) {
          current.current = parsed.data;
          setSession(parsed.data);
          setNow(Date.now());
        }
      } catch {
        /* Preserve the valid session. */
      }
    };
    window.addEventListener('storage', recover);
    return () => window.removeEventListener('storage', recover);
  }, [userId, year]);
  const years = [...new Set(session?.questionIds.map((id) => QUESTION_BY_ID.get(id)!.year) || [])]
    .sort()
    .join(',');
  useEffect(() => {
    if (!years) return;
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
  const running = ready && !!session && !session.finishedAt && !session.paused;
  useEffect(() => {
    if (!running) return;
    const refresh = () => setNow(Date.now());
    refresh();
    const timer = setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [running, session?.id]);
  const remaining = session ? remainingTime(session, now) : null;
  useEffect(() => {
    const active = current.current;
    if (ready && active && !active.finishedAt && remaining !== null && remaining <= 0)
      void commit(finishSession(active, Date.now(), 'timeout'), true);
  }, [ready, remaining, commit]);
  useEffect(() => {
    const flush = () => {
      const active = current.current;
      if (!active || active.finishedAt) return;
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
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [commit]);
  function act(transform: (value: EnadeSession, stamp: number) => EnadeSession, immediate = false) {
    if (current.current) {
      const stamp = Date.now();
      const expired = !current.current.finishedAt && remainingTime(current.current, stamp) === 0;
      void commit(
        expired
          ? finishSession(current.current, stamp, 'timeout')
          : transform(current.current, stamp),
        immediate || expired
      );
    }
  }
  function start(config: EnadeConfig) {
    const next = createSession(config, newEnadeSeed(), Date.now());
    void commit(next, true);
    return next;
  }
  function repeat(wrongOnly = false) {
    if (!current.current) return null;
    const next = repeatSession(current.current, newEnadeSeed(), Date.now(), wrongOnly);
    if (next) void commit(next, true);
    return next;
  }
  const questions = session ? sessionQuestions(session) : [];
  const presentations = session
    ? questions.map((q) => questionPresentation(session, q, contents[q.id]))
    : [];
  return {
    session,
    ready,
    now,
    remaining,
    elapsed: session ? elapsedTime(session, now) : 0,
    result: session ? gradeSession(session, now) : null,
    questions,
    presentations,
    question: presentations[session?.currentIndex || 0],
    contents,
    contentError,
    title: session?.sourceYear ? `Simulado ${session.sourceYear}` : 'Simulado personalizado',
    timeWarning:
      !!session &&
      session.config.durationMinutes !== null &&
      remaining !== null &&
      remaining <= session.config.durationMinutes * 6000,
    saveStatus: session?.sourceYear !== undefined ? legacy.saveStatus : custom.saveStatus,
    start,
    repeat,
    answer: (id: string, value: string) => act((s, stamp) => answerQuestion(s, id, value, stamp)),
    navigate: (index: number) => act((s, stamp) => navigateSession(s, index, stamp)),
    mark: (id: string) => act((s, stamp) => toggleReview(s, id, stamp)),
    checkDiscursive: () => act(checkDiscursive),
    pause: () => act(pauseSession, true),
    finish: () => act((s, stamp) => finishSession(s, stamp), true),
    skip: () => {
      if (current.current) {
        const index = randomUnanswered(current.current, Math.random());
        if (index !== null) act((s, stamp) => navigateSession(s, index, stamp));
      }
    },
    canSkip: session ? randomUnanswered(session, 0) !== null : false,
    retryLoad: () => setRetry((n) => n + 1),
    saveNow: () => act(checkpoint, true),
  };
}
