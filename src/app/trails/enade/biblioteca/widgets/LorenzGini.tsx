'use client';
import { useState } from 'react';
import { giniFromShares, lorenzPoints } from '@/lib/enade/economics';
import styles from './widgets.module.css';

const PRESETS: Record<string, number[]> = {
  'Igualdade perfeita': [20, 20, 20, 20, 20],
  'Desigualdade moderada': [8, 13, 18, 24, 37],
  'Desigualdade alta': [3, 7, 12, 20, 58],
};

export function LorenzGini({ props }: { props: Record<string, string> }) {
  void props;
  const [shares, setShares] = useState<number[]>(PRESETS['Desigualdade alta']);
  const total = shares.reduce((s, v) => s + v, 0);
  const valid = Math.abs(total - 100) < 0.01 && shares.every((v) => v >= 0);
  const sorted = [...shares].every((v, i, a) => i === 0 || a[i - 1] <= v);
  const points = lorenzPoints(shares);
  const gini = giniFromShares(shares);
  const S = 240;
  const toXY = ([x, y]: [number, number]) => `${30 + x * S},${10 + S - y * S}`;
  return (
    <div>
      <div className={styles.title}>
        <strong>Curva de Lorenz e índice de Gini</strong>
        <span>Participação de cada quinto da população (do mais pobre ao mais rico) na renda</span>
      </div>
      <div className={styles.controls}>
        {Object.entries(PRESETS).map(([name, values]) => (
          <button
            key={name}
            type="button"
            className={styles.button}
            onClick={() => setShares(values)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className={styles.grid2}>
        <svg
          viewBox={`0 0 ${S + 50} ${S + 40}`}
          className={styles.svg}
          role="img"
          aria-label={`Curva de Lorenz com Gini ${gini.toFixed(2)}`}
        >
          <rect x={30} y={10} width={S} height={S} fill="none" stroke="var(--enade-line)" />
          <polygon
            points={[...points.map(toXY), toXY([1, 1]), toXY([0, 0])].join(' ')}
            fill="color-mix(in srgb, var(--color-dd-accent) 18%, transparent)"
          />
          <line
            x1={30}
            y1={10 + S}
            x2={30 + S}
            y2={10}
            stroke="var(--color-dd-muted)"
            strokeDasharray="4 3"
          />
          <polyline
            points={points.map(toXY).join(' ')}
            fill="none"
            stroke="var(--color-dd-accent)"
            strokeWidth={2}
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={30 + p[0] * S}
              cy={10 + S - p[1] * S}
              r={3.5}
              fill="var(--color-dd-accent)"
            />
          ))}
          <text x={30 + S / 2} y={S + 34} textAnchor="middle" className={styles.muted}>
            % acumulada da população
          </text>
          <text
            x={34 + S * 0.38}
            y={10 + S * 0.42}
            className={styles.muted}
            transform={`rotate(-45 ${34 + S * 0.38} ${10 + S * 0.42})`}
          >
            linha da igualdade
          </text>
        </svg>
        <div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Quinto</th>
                <th>% da renda</th>
                <th>Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share, i) => (
                <tr key={i}>
                  <td>
                    {i === 0 ? '20% mais pobres' : i === 4 ? '20% mais ricos' : `${i + 1}º quinto`}
                  </td>
                  <td>
                    <input
                      aria-label={`Participação do ${i + 1}º quinto`}
                      className={styles.input}
                      style={{ width: 70 }}
                      type="number"
                      min={0}
                      max={100}
                      value={share}
                      onChange={(e) =>
                        setShares(shares.map((v, j) => (j === i ? Number(e.target.value) : v)))
                      }
                    />
                  </td>
                  <td>{Math.round(points[i + 1][1] * 1000) / 10}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.status} role="status">
            {valid ? (
              <>
                Gini = 1 − Σ (X<sub>k</sub> − X<sub>k−1</sub>)(Y<sub>k</sub> + Y<sub>k−1</sub>) ={' '}
                <strong>{gini.toFixed(3)}</strong>.{' '}
                {gini < 0.3 ? 'Baixa' : gini < 0.5 ? 'Média' : 'Alta'} desigualdade (0 = todos
                iguais; 1 = uma pessoa com toda a renda).
              </>
            ) : (
              <span className={styles.error}>
                As participações precisam somar 100% (soma atual: {total}%).
              </span>
            )}
          </p>
          {!sorted && valid && (
            <p className={styles.hint}>
              Ordene os quintos do mais pobre ao mais rico: a curva de Lorenz sempre é convexa.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
