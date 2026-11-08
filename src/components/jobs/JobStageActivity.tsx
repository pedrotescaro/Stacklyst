'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/jobs/jobs.module.css';

interface Activity {
  configured: boolean;
  started?: boolean;
  completed: boolean;
  score: number | null;
  kind?: string;
  href: string | null;
  restartable?: boolean;
  message?: string | null;
}
export function JobStageActivity({ jobId }: { jobId: string }) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/jobs/${jobId}/activity`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? data.error);
        setActivity(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e.message || 'Não foi possível carregar a atividade.');
      });
    return () => controller.abort();
  }, [jobId]);
  async function update(action: 'start' | 'refresh') {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/jobs/${jobId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message ?? data.error ?? 'Não foi possível atualizar a atividade.');
      setActivity(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível atualizar a atividade.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.feedback} aria-label="Atividade técnica">
      <h3>Atividade técnica</h3>
      {error && <p role="alert">{error}</p>}
      {!activity && !error && <p role="status">Carregando atividade…</p>}
      {activity?.message && <p>{activity.message}</p>}
      {activity?.configured && (
        <>
          {activity.completed ? (
            <p role="status">
              Atividade concluída. Nota técnica: {activity.score} / 100. Aguarde o retorno da
              empresa.
            </p>
          ) : (
            <>
              <p>
                {activity.kind === 'duel'
                  ? 'Participe do duelo atribuído. O resultado será registrado após o encerramento pelo juiz.'
                  : 'Envie uma solução aprovada nos testes do exercício para concluir esta etapa.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {activity.href && !activity.restartable ? (
                  <Link
                    className="dd-focus-ring rounded-full bg-dd-accent px-4 py-3 text-white"
                    href={activity.href}
                  >
                    Continuar atividade
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="dd-focus-ring rounded-full bg-dd-accent px-4 py-3 text-white disabled:opacity-50"
                    disabled={busy}
                    onClick={() => update('start')}
                  >
                    {busy
                      ? 'Iniciando…'
                      : activity.kind === 'duel'
                        ? 'Iniciar duelo'
                        : 'Iniciar desafio'}
                  </button>
                )}
                {activity.started && (
                  <button
                    type="button"
                    className="dd-focus-ring rounded-full border border-dd-border px-4 py-3 disabled:opacity-50"
                    disabled={busy}
                    onClick={() => update('refresh')}
                  >
                    {busy ? 'Verificando…' : 'Verificar resultado'}
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
      {error && (
        <button
          type="button"
          className="dd-focus-ring mt-3 min-h-11 underline"
          disabled={busy}
          onClick={() => update('refresh')}
        >
          Tentar novamente
        </button>
      )}
    </section>
  );
}
