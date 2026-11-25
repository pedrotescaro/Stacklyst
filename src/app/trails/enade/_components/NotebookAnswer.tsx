'use client';
import { useEffect, useRef, useState } from 'react';
import { NOTEBOOK_LINES } from '@/lib/enade/discursive';
import styles from './NotebookAnswer.module.css';

const LINE = 32;
const PADDING_Y = 24;

/** Visual lines the text takes, wrapped lines included. */
function measureLines(el: HTMLTextAreaElement) {
  if (!el.value) return 0;
  const height = el.style.height;
  el.style.height = '0px';
  const lines = Math.max(1, Math.round((el.scrollHeight - PADDING_Y) / LINE));
  el.style.height = height;
  return lines;
}

/**
 * Ruled answer sheet like the ENADE booklet: 15 numbered lines, and typing
 * stops once the text would need a 16th line (wrapped lines count too).
 */
export function NotebookAnswer({
  id,
  value,
  readOnly,
  onChange,
}: {
  id: string;
  value: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [lines, setLines] = useState(0);
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (ref.current) setLines(measureLines(ref.current));
  }, [value]);
  return (
    <div className={styles.sheet} data-readonly={readOnly || undefined}>
      <ol className={styles.gutter} aria-hidden="true">
        {Array.from({ length: NOTEBOOK_LINES }, (_, i) => (
          <li key={i}>{i + 1}</li>
        ))}
      </ol>
      <textarea
        ref={ref}
        id={id}
        className={styles.paper}
        rows={NOTEBOOK_LINES}
        readOnly={readOnly}
        spellCheck
        placeholder="Escreva sua resposta aqui…"
        aria-label="Escreva sua resposta"
        value={value}
        data-overflow={lines > NOTEBOOK_LINES || undefined}
        aria-describedby={`${id}-count`}
        onChange={(event) => {
          const next = measureLines(event.target);
          // Deleting is always allowed, even for an older answer past the limit.
          if (next > NOTEBOOK_LINES && event.target.value.length > value.length) {
            setFull(true);
            return;
          }
          setFull(false);
          onChange(event.target.value);
        }}
      />
      <p
        id={`${id}-count`}
        className={styles.count}
        data-full={full || undefined}
        aria-live="polite"
      >
        {full
          ? `Limite de ${NOTEBOOK_LINES} linhas atingido`
          : `${Math.min(lines, NOTEBOOK_LINES)} de ${NOTEBOOK_LINES} linhas`}
      </p>
    </div>
  );
}
