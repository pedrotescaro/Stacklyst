'use client';
import { useState } from 'react';
import styles from './widgets.module.css';

const BASES = [
  { base: 2, name: 'Binário', pattern: /^[01]+$/ },
  { base: 8, name: 'Octal', pattern: /^[0-7]+$/ },
  { base: 10, name: 'Decimal', pattern: /^\d+$/ },
  { base: 16, name: 'Hexadecimal', pattern: /^[0-9a-f]+$/i },
];

export function BaseConverter({ props }: { props: Record<string, string> }) {
  const [input, setInput] = useState(props.value || '11010111');
  const [from, setFrom] = useState(Number(props.base) || 2);
  const source = BASES.find((b) => b.base === from)!;
  const clean = input.trim();
  const valid = source.pattern.test(clean) && clean.length <= 20;
  const value = valid ? parseInt(clean, from) : NaN;
  const digits = valid ? clean.toUpperCase().split('') : [];
  const divisions: { q: number; r: number }[] = [];
  if (valid && value > 0) {
    let n = value;
    while (n > 0 && divisions.length < 40) {
      divisions.push({ q: Math.floor(n / 2), r: n % 2 });
      n = Math.floor(n / 2);
    }
  }
  return (
    <div>
      <div className={styles.title}>
        <strong>Conversor de bases numéricas</strong>
        <span>Com o passo a passo das duas conversões clássicas</span>
      </div>
      <div className={styles.controls}>
        <input
          aria-label="Número"
          className={`${styles.input} ${styles.mono}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: 180 }}
        />
        {BASES.map((b) => (
          <button
            key={b.base}
            type="button"
            className={styles.button}
            aria-pressed={from === b.base}
            onClick={() => setFrom(b.base)}
          >
            base {b.base}
          </button>
        ))}
      </div>
      {!valid ? (
        <p className={`${styles.status} ${styles.error}`} role="alert">
          Use apenas dígitos válidos na base {from}.
        </p>
      ) : (
        <>
          <table className={styles.table}>
            <tbody>
              {BASES.map((b) => (
                <tr key={b.base}>
                  <th scope="row">{b.name}</th>
                  <td className={styles.mono}>
                    ({value.toString(b.base).toUpperCase()})<sub>{b.base}</sub>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {from !== 10 && (
            <p className={styles.status}>
              <strong>Para decimal (soma posicional):</strong>{' '}
              <span className={styles.mono}>
                {digits
                  .map((d, i) => `${parseInt(d, from)}×${from}^${digits.length - 1 - i}`)
                  .join(' + ')}{' '}
                = {value}
              </span>
            </p>
          )}
          {divisions.length > 0 && (
            <p className={styles.status}>
              <strong>Decimal para binário (divisões sucessivas por 2):</strong>{' '}
              <span className={styles.mono}>
                {divisions
                  .map((d, i) => `${i === 0 ? value : divisions[i - 1].q}÷2 = ${d.q} resto ${d.r}`)
                  .join(' · ')}
              </span>
              . Lendo os restos de baixo para cima:{' '}
              <span className={styles.mono}>{value.toString(2)}</span>.
            </p>
          )}
          <p className={styles.hint}>
            Atalhos: cada dígito octal vale 3 bits e cada dígito hexadecimal vale 4 bits (agrupe o
            binário da direita para a esquerda).
          </p>
        </>
      )}
    </div>
  );
}
