'use client';
import { useState } from 'react';
import styles from './widgets.module.css';

type Kind = 'simple' | 'double' | 'circular';

export function LinkedList({ props }: { props: Record<string, string> }) {
  const [kind, setKind] = useState<Kind>(
    (['simple', 'double', 'circular'].includes(props.kind) ? props.kind : 'simple') as Kind
  );
  const [items, setItems] = useState([12, 7, 30]);
  const [value, setValue] = useState('5');
  const [found, setFound] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const n = Number(value);
  const valid = Number.isFinite(n) && value.trim() !== '';
  const link = kind === 'double' ? '⇄' : '→';
  const run = (text: string, next: number[], highlight: number | null = null) => {
    setItems(next);
    setFound(highlight);
    setMessage(text);
  };
  return (
    <div>
      <div className={styles.title}>
        <strong>Lista encadeada</strong>
        <span>
          Cada nó guarda o dado e o endereço do próximo{kind === 'double' ? ' e do anterior' : ''}
        </span>
      </div>
      <div className={styles.controls}>
        {(['simple', 'double', 'circular'] as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            className={styles.button}
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
          >
            {k === 'simple' ? 'Simples' : k === 'double' ? 'Dupla' : 'Circular'}
          </button>
        ))}
        <input
          aria-label="Valor"
          className={styles.input}
          style={{ width: 70 }}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          className={styles.button}
          disabled={!valid}
          onClick={() =>
            run(
              `Inserido ${n} no início: o novo nó aponta para a antiga cabeça — O(1).`,
              [n, ...items],
              0
            )
          }
        >
          Inserir no início
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!valid}
          onClick={() =>
            run(
              kind === 'simple'
                ? `Inserido ${n} no fim: sem ponteiro para a cauda é preciso percorrer ${items.length} nós — O(n).`
                : `Inserido ${n} no fim usando o ponteiro de cauda/anterior — O(1).`,
              [...items, n],
              items.length
            )
          }
        >
          Inserir no fim
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!valid}
          onClick={() => {
            const index = items.indexOf(n);
            setFound(index >= 0 ? index : null);
            setMessage(
              index >= 0
                ? `Busca sequencial: ${n} encontrado após visitar ${index + 1} nó(s).`
                : `Busca sequencial: ${n} não está na lista (${items.length} nós visitados).`
            );
          }}
        >
          Buscar
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!valid}
          onClick={() => {
            const index = items.indexOf(n);
            if (index < 0) return setMessage(`${n} não encontrado; nada removido.`);
            run(
              `Removido ${n}: o nó anterior passa a apontar para o seguinte${kind === 'double' ? ' e o seguinte aponta de volta para o anterior' : ''}.`,
              items.filter((_, i) => i !== index)
            );
          }}
        >
          Remover
        </button>
      </div>
      <div className={styles.row} aria-label="Nós da lista">
        <span className={styles.hint}>cabeça →</span>
        {items.length === 0 && <span className={styles.hint}>NULL (lista vazia)</span>}
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span className={styles.cell} data-active={found === i}>
              {item}
            </span>
            {i < items.length - 1 ? <span className={styles.arrow}>{link}</span> : null}
          </span>
        ))}
        {items.length > 0 && (
          <span className={styles.hint}>
            {kind === 'circular' ? '↺ volta para a cabeça' : '→ NULL'}
          </span>
        )}
      </div>
      <p className={styles.status} aria-live="polite">
        {message || 'Escolha uma operação.'}
      </p>
    </div>
  );
}
