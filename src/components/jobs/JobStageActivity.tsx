'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/app/jobs/jobs.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

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
  const { text } = useLocalizedText();
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
          setError(
            e.message || text('Não foi possível carregar a atividade.', 'Could not load activity.')
          );
      });
    return () => controller.abort();
  }, [jobId, text]);
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
        throw new Error(
          data.message ??
            data.error ??
            text('Não foi possível atualizar a atividade.', 'Could not update activity.')
        );
      setActivity(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : text('Não foi possível atualizar a atividade.', 'Could not update activity.')
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className={styles.feedback}
      aria-label={text('Atividade técnica', 'Technical activity')}
    >
      <h3>{text('Atividade técnica', 'Technical activity')}</h3>
      {error && <p role="alert">{error}</p>}
      {!activity && !error && (
        <p role="status">{text('Carregando atividade…', 'Loading activity…')}</p>
      )}
      {activity?.message && <p>{activity.message}</p>}
      {activity?.configured && (
        <>
          {activity.completed ? (
            <p role="status">
              {text(
                `Atividade concluída. Nota técnica: ${activity.score} / 100. Aguarde o retorno da empresa.`,
                `Activity completed. Technical score: ${activity.score} / 100. Awaiting company response.`
              )}
            </p>
          ) : (
            <>
              <p>
                {activity.kind === 'duel'
                  ? text(
                      'Participe do duelo atribuído. O resultado será registrado após o encerramento pelo juiz.',
                      'Join the assigned duel. Your result will be recorded once finalized by the judge.'
                    )
                  : text(
                      'Envie uma solução aprovada nos testes do exercício para concluir esta etapa.',
                      'Submit a solution that passes all test cases to complete this stage.'
                    )}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {activity.href && !activity.restartable ? (
                  <Link
                    className="dd-focus-ring rounded-full bg-dd-accent px-4 py-3 text-white"
                    href={activity.href}
                  >
                    {text('Continuar atividade', 'Continue activity')}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="dd-focus-ring rounded-full bg-dd-accent px-4 py-3 text-white disabled:opacity-50"
                    disabled={busy}
                    onClick={() => update('start')}
                  >
                    {busy
                      ? text('Iniciando…', 'Starting…')
                      : activity.kind === 'duel'
                        ? text('Iniciar duelo', 'Start duel')
                        : text('Iniciar desafio', 'Start challenge')}
                  </button>
                )}
                {activity.started && (
                  <button
                    type="button"
                    className="dd-focus-ring rounded-full border border-dd-border px-4 py-3 disabled:opacity-50"
                    disabled={busy}
                    onClick={() => update('refresh')}
                  >
                    {busy
                      ? text('Verificando…', 'Checking…')
                      : text('Verificar resultado', 'Check result')}
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
          {text('Tentar novamente', 'Try again')}
        </button>
      )}
    </section>
  );
}
