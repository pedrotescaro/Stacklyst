'use client';
import { useMemo, useState } from 'react';
import { schedule, type Job, type Policy } from '@/lib/enade/scheduling';
import styles from './widgets.module.css';

const JOBS: Job[] = [
  { id: 'P1', arrival: 0, burst: 6 },
  { id: 'P2', arrival: 1, burst: 3 },
  { id: 'P3', arrival: 2, burst: 8 },
  { id: 'P4', arrival: 3, burst: 2 },
];
const NAMES: Record<Policy, string> = {
  fcfs: 'FCFS (ordem de chegada)',
  sjf: 'SJF (menor job primeiro)',
  srtf: 'SRTF (SJF preemptivo)',
  rr: 'Round-Robin',
};

export function Scheduling({ props }: { props: Record<string, string> }) {
  const [policy, setPolicy] = useState<Policy>(
    (props.policy as Policy) in NAMES ? (props.policy as Policy) : 'fcfs'
  );
  const [quantum, setQuantum] = useState(2);
  const result = useMemo(() => schedule(JOBS, policy, quantum), [policy, quantum]);
  const end = result.timeline.at(-1)?.end ?? 1;
  return (
    <div>
      <div className={styles.title}>
        <strong>Escalonamento de processos</strong>
        <span>Mesmos 4 processos, políticas diferentes</span>
      </div>
      <div className={styles.controls}>
        {(Object.keys(NAMES) as Policy[]).map((p) => (
          <button
            key={p}
            type="button"
            className={styles.button}
            aria-pressed={p === policy}
            onClick={() => setPolicy(p)}
          >
            {NAMES[p]}
          </button>
        ))}
        {policy === 'rr' && (
          <label className={styles.hint}>
            quantum{' '}
            <input
              type="number"
              min={1}
              max={6}
              value={quantum}
              onChange={(e) => setQuantum(Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
              className={styles.input}
              style={{ width: 60 }}
            />
          </label>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          border: '1px solid var(--enade-line)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
        role="img"
        aria-label={`Diagrama de Gantt: ${result.timeline.map((t) => `${t.id} de ${t.start} a ${t.end}`).join(', ')}`}
      >
        {result.timeline.map((slot, i) => (
          <div
            key={i}
            style={{
              flex: slot.end - slot.start,
              padding: '8px 0',
              textAlign: 'center',
              fontWeight: 650,
              fontSize: 13,
              borderRight: '2px solid var(--color-dd-bg)',
              background:
                slot.id === 'ocioso'
                  ? 'var(--enade-soft)'
                  : `color-mix(in srgb, var(--color-dd-accent) ${30 + JOBS.findIndex((j) => j.id === slot.id) * 18}%, var(--color-dd-bg))`,
            }}
          >
            {slot.id}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }} className={styles.hint}>
        <span>0</span>
        <span>{end}</span>
      </div>
      <div className={styles.scroll}>
        <table className={styles.table} style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Processo</th>
              <th>Chegada</th>
              <th>Execução</th>
              <th>Término</th>
              <th>Turnaround</th>
              <th>Espera</th>
            </tr>
          </thead>
          <tbody>
            {result.jobs.map((j) => (
              <tr key={j.id}>
                <td>{j.id}</td>
                <td>{j.arrival}</td>
                <td>{j.burst}</td>
                <td>{j.finish}</td>
                <td>{j.turnaround}</td>
                <td>{j.waiting}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.status}>
        Espera média:{' '}
        <strong>
          {result.averageWaiting.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
        </strong>{' '}
        · turnaround médio:{' '}
        <strong>
          {result.averageTurnaround.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
        </strong>
        . Turnaround = término − chegada; espera = turnaround − execução.
      </p>
    </div>
  );
}
