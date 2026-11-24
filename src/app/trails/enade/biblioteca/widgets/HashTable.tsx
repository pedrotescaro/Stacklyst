'use client';
import { useState } from 'react';
import styles from './widgets.module.css';

type Strategy = 'chaining' | 'linear';

export function HashTable({ props }: { props: Record<string, string> }) {
  const size = Math.min(13, Math.max(5, Number(props.size) || 7));
  const [strategy, setStrategy] = useState<Strategy>('chaining');
  const [keys, setKeys] = useState<number[]>([10, 22, 31, 4, 15]);
  const [value, setValue] = useState('28');
  const [message, setMessage] = useState('');
  const buckets: number[][] = Array.from({ length: size }, () => []);
  const slots: (number | null)[] = Array(size).fill(null);
  const probes = new Map<number, number>();
  for (const key of keys) {
    const h = key % size;
    if (strategy === 'chaining') buckets[h].push(key);
    else {
      let i = 0;
      while (i < size && slots[(h + i) % size] !== null) i++;
      if (i < size) {
        slots[(h + i) % size] = key;
        probes.set(key, i);
      }
    }
  }
  const n = Number(value);
  const valid = value.trim() !== '' && Number.isInteger(n) && n >= 0;
  const load = keys.length / size;
  return (
    <div>
      <div className={styles.title}>
        <strong>Tabela hash</strong>
        <span>h(k) = k mod {size}</span>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          aria-pressed={strategy === 'chaining'}
          onClick={() => setStrategy('chaining')}
        >
          Encadeamento separado
        </button>
        <button
          type="button"
          className={styles.button}
          aria-pressed={strategy === 'linear'}
          onClick={() => setStrategy('linear')}
        >
          Sondagem linear
        </button>
        <input
          aria-label="Chave"
          className={styles.input}
          style={{ width: 70 }}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          disabled={!valid || keys.includes(n) || (strategy === 'linear' && keys.length >= size)}
          onClick={() => {
            const h = n % size;
            const collision = strategy === 'chaining' ? buckets[h].length > 0 : slots[h] !== null;
            setKeys([...keys, n]);
            setMessage(
              `h(${n}) = ${n} mod ${size} = ${h}${collision ? ` → colisão! ${strategy === 'chaining' ? 'entra na lista da posição ' + h : 'procura a próxima posição livre'}` : ' → posição livre'}`
            );
          }}
        >
          Inserir
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            setKeys([]);
            setMessage('');
          }}
        >
          Limpar
        </button>
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        {Array.from({ length: size }, (_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={styles.mono} style={{ width: 28, color: 'var(--color-dd-muted)' }}>
              [{i}]
            </span>
            {strategy === 'chaining' ? (
              buckets[i].length ? (
                buckets[i].map((k, j) => (
                  <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {j > 0 && <span className={styles.arrow}>→</span>}
                    <span className={styles.cell} style={{ height: 32, minWidth: 36 }}>
                      {k}
                    </span>
                  </span>
                ))
              ) : (
                <span className={styles.hint}>vazio</span>
              )
            ) : slots[i] !== null ? (
              <span
                className={styles.cell}
                style={{ height: 32, minWidth: 36 }}
                data-active={(probes.get(slots[i]!) ?? 0) > 0}
              >
                {slots[i]}
              </span>
            ) : (
              <span className={styles.hint}>vazio</span>
            )}
          </div>
        ))}
      </div>
      <p className={styles.status} aria-live="polite">
        {message || 'Insira chaves para ver colisões.'} Fator de carga α = {keys.length}/{size} ={' '}
        {load.toFixed(2)}.
        {strategy === 'linear' ? ' Em destaque: chaves que saíram da posição original.' : ''}
      </p>
    </div>
  );
}
