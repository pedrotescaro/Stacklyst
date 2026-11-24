'use client';
import { useState } from 'react';
import { describe } from '@/lib/enade/statistics';
import styles from './widgets.module.css';

const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 3 });

export function StatsCalculator({ props }: { props: Record<string, string> }) {
  const [input, setInput] = useState(props.values || '7 8 6 9 7 10 5 7');
  const values = input
    .split(/[\s;]+/)
    .map((v) => Number(v.replace(',', '.')))
    .filter(Number.isFinite)
    .slice(0, 60);
  const stats = values.length ? describe(values) : null;
  const max = Math.max(1, ...values);
  return (
    <div>
      <div className={styles.title}>
        <strong>Calculadora de estatística descritiva</strong>
        <span>Separe os valores por espaço; use vírgula para decimais</span>
      </div>
      <input
        aria-label="Valores"
        className={`${styles.input} ${styles.mono}`}
        style={{ width: '100%' }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {stats ? (
        <div className={styles.grid2} style={{ marginTop: 12 }}>
          <div>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <th scope="row">n</th>
                  <td>{stats.n}</td>
                </tr>
                <tr>
                  <th scope="row">Média</th>
                  <td>
                    {fmt(stats.sum)} ÷ {stats.n} = <strong>{fmt(stats.mean)}</strong>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Mediana</th>
                  <td>
                    <strong>{fmt(stats.median)}</strong>{' '}
                    {stats.n % 2 === 0 ? '(média dos dois centrais)' : '(valor central)'}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Moda</th>
                  <td>{stats.modes.length ? stats.modes.map(fmt).join(', ') : 'amodal'}</td>
                </tr>
                <tr>
                  <th scope="row">Amplitude</th>
                  <td>{fmt(stats.range)}</td>
                </tr>
                <tr>
                  <th scope="row">Variância (pop. / amostra)</th>
                  <td>
                    {fmt(stats.variance)} / {stats.n > 1 ? fmt(stats.sampleVariance) : '—'}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Desvio padrão (pop. / amostra)</th>
                  <td>
                    {fmt(Math.sqrt(stats.variance))} /{' '}
                    {stats.n > 1 ? fmt(Math.sqrt(stats.sampleVariance)) : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className={styles.hint} style={{ marginTop: 6 }}>
              Ordenados: <span className={styles.mono}>{stats.sorted.map(fmt).join(' ')}</span>.
              Variância = Σ(xᵢ − média)² ÷ n (população) ou ÷ (n − 1) (amostra).
            </p>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140 }}
            aria-hidden="true"
          >
            {values.map((v, i) => (
              <div
                key={i}
                title={fmt(v)}
                style={{
                  flex: 1,
                  height: `${(v / max) * 100}%`,
                  minHeight: 2,
                  borderRadius: '3px 3px 0 0',
                  background: 'color-mix(in srgb, var(--color-dd-accent) 70%, var(--color-dd-bg))',
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className={`${styles.status} ${styles.error}`}>Digite ao menos um número.</p>
      )}
    </div>
  );
}
