'use client';
import { useState } from 'react';
import styles from './widgets.module.css';

export function StackQueue({ props }: { props: Record<string, string> }) {
  const [mode, setMode] = useState<'stack' | 'queue'>(props.mode === 'queue' ? 'queue' : 'stack');
  const [items, setItems] = useState<string[]>(['A', 'B', 'C']);
  const [value, setValue] = useState('D');
  const [log, setLog] = useState<string[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const stack = mode === 'stack';
  const add = () => {
    const v = value.trim().slice(0, 6) || String(items.length + 1);
    setItems([...items, v]);
    setLast(items.length);
    setLog((l) =>
      [
        `${stack ? 'push' : 'enqueue'}(${v}) → ${stack ? 'entra no topo' : 'entra no fim'}`,
        ...l,
      ].slice(0, 8)
    );
    setValue(String.fromCharCode(((v.charCodeAt(0) - 64) % 26) + 65));
  };
  const remove = () => {
    if (!items.length) {
      setLog((l) =>
        [`${stack ? 'pop' : 'dequeue'}() → estrutura vazia (underflow)`, ...l].slice(0, 8)
      );
      return;
    }
    const out = stack ? items[items.length - 1] : items[0];
    setItems(stack ? items.slice(0, -1) : items.slice(1));
    setLast(null);
    setLog((l) => [`${stack ? 'pop' : 'dequeue'}() → saiu ${out}`, ...l].slice(0, 8));
  };
  const peek = () =>
    setLog((l) =>
      [
        items.length
          ? `${stack ? 'top' : 'front'}() → ${stack ? items[items.length - 1] : items[0]} (sem remover)`
          : 'vazia',
        ...l,
      ].slice(0, 8)
    );
  return (
    <div>
      <div className={styles.title}>
        <strong>{stack ? 'Pilha (LIFO)' : 'Fila (FIFO)'}</strong>
        <span>
          {stack ? 'Último a entrar, primeiro a sair' : 'Primeiro a entrar, primeiro a sair'}
        </span>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          aria-pressed={stack}
          onClick={() => {
            setMode('stack');
            setLog([]);
          }}
        >
          Pilha
        </button>
        <button
          type="button"
          className={styles.button}
          aria-pressed={!stack}
          onClick={() => {
            setMode('queue');
            setLog([]);
          }}
        >
          Fila
        </button>
        <input
          aria-label="Valor"
          className={styles.input}
          style={{ width: 70 }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="button" className={`${styles.button} ${styles.primary}`} onClick={add}>
          {stack ? 'push' : 'enqueue'}
        </button>
        <button type="button" className={styles.button} onClick={remove}>
          {stack ? 'pop' : 'dequeue'}
        </button>
        <button type="button" className={styles.button} onClick={peek}>
          {stack ? 'top' : 'front'}
        </button>
      </div>
      {stack ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'flex-start',
            gap: 4,
            minHeight: 60,
          }}
          aria-label="Pilha, base embaixo"
        >
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className={styles.cell}
              data-active={i === items.length - 1}
              style={{ minWidth: 120 }}
            >
              {item}
              {i === items.length - 1 ? ' ← topo' : i === 0 ? ' (base)' : ''}
            </span>
          ))}
        </div>
      ) : (
        <div className={styles.row} aria-label="Fila, início à esquerda">
          <span className={styles.hint}>início →</span>
          {items.map((item, i) => (
            <span key={`${item}-${i}`} className={styles.cell} data-active={i === 0 || i === last}>
              {item}
            </span>
          ))}
          <span className={styles.hint}>← fim</span>
        </div>
      )}
      <ol className={styles.log} aria-live="polite">
        {log.length ? (
          log.map((entry, i) => <li key={i}>{entry}</li>)
        ) : (
          <li>Use os botões para ver a ordem de saída.</li>
        )}
      </ol>
    </div>
  );
}
