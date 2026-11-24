'use client';
import { useMemo, useState } from 'react';
import { truthTable } from '@/lib/enade/logic';
import styles from './widgets.module.css';

const PRESETS = [
  'p -> q',
  '~q -> ~p',
  '~(p & q) <-> (~p | ~q)',
  'p | ~p',
  'p & ~p',
  '(p -> q) & (q -> r) -> (p -> r)',
  'p xor q',
  '~(p -> q)',
];
const SYMBOLS = ['¬', '∧', '∨', '⊕', '→', '↔', '(', ')'];

export function TruthTable({ props }: { props: Record<string, string> }) {
  const [expression, setExpression] = useState(props.expr || 'p -> q');
  const result = useMemo(() => {
    try {
      return { ok: true as const, ...truthTable(expression) };
    } catch (error) {
      return { ok: false as const, message: (error as Error).message };
    }
  }, [expression]);
  return (
    <div>
      <div className={styles.title}>
        <strong>Simulador de tabela-verdade</strong>
        <span>Digite uma proposição com p, q, r, s, t</span>
      </div>
      <label className={styles.hint} htmlFor="truth-expression">
        Expressão (aceita ~ & | -&gt; &lt;-&gt; xor ou os símbolos)
      </label>
      <div className={styles.controls}>
        <input
          id="truth-expression"
          className={`${styles.input} ${styles.mono}`}
          style={{ flex: '1 1 260px' }}
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        {SYMBOLS.map((symbol) => (
          <button
            key={symbol}
            type="button"
            className={styles.button}
            onClick={() =>
              setExpression(
                (e) =>
                  `${e}${symbol === '(' || symbol === ')' || symbol === '¬' ? symbol : ` ${symbol} `}`
              )
            }
            aria-label={`Inserir ${symbol}`}
          >
            {symbol}
          </button>
        ))}
      </div>
      <div className={styles.controls}>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`${styles.button} ${styles.mono}`}
            onClick={() => setExpression(preset)}
          >
            {preset}
          </button>
        ))}
      </div>
      {result.ok ? (
        <>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {result.names.map((name) => (
                    <th key={name} scope="col">
                      {name}
                    </th>
                  ))}
                  {result.columns.map((column, i) => (
                    <th
                      key={column}
                      scope="col"
                      style={
                        i === result.columns.length - 1
                          ? { color: 'var(--color-dd-accent)' }
                          : undefined
                      }
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i}>
                    {result.names.map((name) => (
                      <td key={name} className={row.values[name] ? styles.true : styles.false}>
                        {row.values[name] ? 'V' : 'F'}
                      </td>
                    ))}
                    {row.results.map((value, j) => (
                      <td key={j} className={value ? styles.true : styles.false}>
                        {value ? 'V' : 'F'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.status} role="status">
            {result.rows.length} linhas (2<sup>{result.names.length}</sup>). A proposição é uma{' '}
            <strong>{result.classification}</strong>
            {result.classification === 'tautologia'
              ? ': verdadeira em todas as linhas.'
              : result.classification === 'contradição'
                ? ': falsa em todas as linhas.'
                : ': verdadeira em algumas linhas e falsa em outras.'}
          </p>
        </>
      ) : (
        <p className={`${styles.status} ${styles.error}`} role="alert">
          {result.message}
        </p>
      )}
    </div>
  );
}
