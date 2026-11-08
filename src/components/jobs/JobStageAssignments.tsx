'use client';
import { useEffect, useState } from 'react';
import styles from '@/app/recruiter/recruiter.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface Stage {
  id: string;
  title: string;
  type: string;
  challenge_id?: string | null;
}
interface Option {
  id: string;
  title: string;
}
export function JobStageAssignments({
  jobId,
  stages,
  onSaved,
}: {
  jobId: string;
  stages: Stage[];
  onSaved: (stageId: string, assignment: string) => void;
}) {
  const { text } = useLocalizedText();
  const [catalog, setCatalog] = useState<{ exercises: Option[]; duels: Option[] } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const technical = stages.filter((s) => ['DESAFIO_TECNICO', 'DUELO_TECNICO'].includes(s.type));
  useEffect(() => {
    if (!technical.length) return;
    const controller = new AbortController();
    setError('');
    fetch('/api/jobs/activities', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? data.error);
        if (!Array.isArray(data.exercises) || !Array.isArray(data.duels))
          throw new Error(
            text('Catálogo inválido. Tente novamente.', 'Invalid catalog. Please try again.')
          );
        setCatalog(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e.message || text('Não foi possível carregar o catálogo.', 'Could not load catalog.')
          );
      });
    return () => controller.abort();
  }, [jobId, technical.length, retry, text]);
  if (!technical.length) return null;
  async function save(stageId: string, assignment: string) {
    setBusy(stageId);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/jobs/${jobId}/stages/${stageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message ?? data.error ?? text('Não foi possível salvar.', 'Could not save.')
        );
      onSaved(stageId, data.challenge_id);
      setNotice(
        text(
          'Atividade atribuída. Candidatos nesta etapa poderão iniciá-la na vaga.',
          'Activity assigned. Candidates in this stage will be able to start it.'
        )
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : text('Não foi possível salvar.', 'Could not save.')
      );
    } finally {
      setBusy('');
    }
  }
  return (
    <section
      aria-label={text('Atividades das etapas técnicas', 'Technical stage activities')}
      className="mb-6 grid gap-4"
    >
      <h3>{text('Atividades das etapas técnicas', 'Technical stage activities')}</h3>
      <p className={styles.muted}>
        {text(
          'Defina o exercício ou duelo de cada etapa antes de encaminhar candidatos. A atividade fica fixa após o primeiro início.',
          'Define the exercise or duel for each stage before routing candidates. The activity becomes fixed after first start.'
        )}
      </p>
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
      {!catalog && !error && (
        <p role="status">{text('Carregando catálogo…', 'Loading catalog…')}</p>
      )}
      {!catalog && error && (
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setRetry((value) => value + 1)}
        >
          {text('Tentar novamente', 'Try again')}
        </button>
      )}
      {catalog &&
        technical.map((stage) => {
          const value = drafts[stage.id] ?? stage.challenge_id ?? '';
          const options = stage.type === 'DUELO_TECNICO' ? catalog.duels : catalog.exercises;
          return (
            <form
              key={stage.id}
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                void save(stage.id, value);
              }}
            >
              <div className={styles.field}>
                <label htmlFor={`activity-${stage.id}`}>{stage.title}</label>
                <select
                  id={`activity-${stage.id}`}
                  required
                  disabled={!!busy}
                  value={value}
                  onChange={(e) => setDrafts((d) => ({ ...d, [stage.id]: e.target.value }))}
                >
                  <option value="">{text('Selecione uma atividade', 'Select an activity')}</option>
                  {value && !options.some((o) => o.id === value) && (
                    <option value={value}>
                      {text('Atividade indisponível', 'Activity unavailable')}
                    </option>
                  )}
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className={styles.secondary}
                type="submit"
                disabled={!!busy || !value || value === stage.challenge_id}
              >
                {busy === stage.id
                  ? text('Salvando…', 'Saving…')
                  : text('Salvar atividade', 'Save activity')}
              </button>
            </form>
          );
        })}
    </section>
  );
}
