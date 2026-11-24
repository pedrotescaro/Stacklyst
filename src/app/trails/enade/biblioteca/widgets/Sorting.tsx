'use client';
import { useEffect, useMemo, useState } from 'react';
import styles from './widgets.module.css';

type Frame = {
  array: number[];
  compare: number[];
  swap: number[];
  sorted: number[];
  note: string;
  comparisons: number;
  swaps: number;
};
type Algorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick';

const INFO: Record<
  Algorithm,
  { name: string; best: string; average: string; worst: string; stable: string }
> = {
  bubble: {
    name: 'Bolha (bubble sort)',
    best: 'O(n)*',
    average: 'O(n²)',
    worst: 'O(n²)',
    stable: 'estável',
  },
  selection: {
    name: 'Seleção',
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    stable: 'não estável',
  },
  insertion: {
    name: 'Inserção',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    stable: 'estável',
  },
  merge: {
    name: 'Merge sort (intercalação)',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    stable: 'estável',
  },
  quick: {
    name: 'Quicksort',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    stable: 'não estável',
  },
};

function frames(input: number[], algorithm: Algorithm): Frame[] {
  const a = [...input];
  const out: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;
  const push = (note: string, compare: number[] = [], swap: number[] = [], sorted: number[] = []) =>
    out.push({ array: [...a], compare, swap, sorted, note, comparisons, swaps });
  push('Vetor inicial');
  if (algorithm === 'bubble') {
    for (let i = 0; i < a.length - 1; i++) {
      let swapped = false;
      for (let j = 0; j < a.length - 1 - i; j++) {
        comparisons++;
        push(`Compara posições ${j} e ${j + 1}`, [j, j + 1]);
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          swaps++;
          swapped = true;
          push(`Troca: o maior "borbulha" para a direita`, [], [j, j + 1]);
        }
      }
      push(
        `Passada ${i + 1} concluída: posição ${a.length - 1 - i} definitiva`,
        [],
        [],
        range(a.length - 1 - i, a.length)
      );
      if (!swapped) {
        push(
          'Nenhuma troca na passada: vetor já ordenado (parada antecipada)',
          [],
          [],
          range(0, a.length)
        );
        break;
      }
    }
  } else if (algorithm === 'selection') {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) {
        comparisons++;
        push(`Procura o menor a partir de ${i}`, [min, j], [], range(0, i));
        if (a[j] < a[min]) min = j;
      }
      if (min !== i) {
        [a[i], a[min]] = [a[min], a[i]];
        swaps++;
      }
      push(`Menor elemento vai para a posição ${i}`, [], [i, min], range(0, i + 1));
    }
  } else if (algorithm === 'insertion') {
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      push(`Pega ${key} e insere na parte já ordenada`, [i], [], range(0, i));
      while (j >= 0) {
        comparisons++;
        push(`Compara ${a[j]} com ${key}`, [j, j + 1], [], range(0, i));
        if (a[j] <= key) break;
        a[j + 1] = a[j];
        swaps++;
        push(`Desloca ${a[j]} uma casa para a direita`, [], [j, j + 1], range(0, i));
        j--;
      }
      a[j + 1] = key;
      push(`${key} encaixado na posição ${j + 1}`, [], [j + 1], range(0, i + 1));
    }
  } else if (algorithm === 'merge') {
    const sort = (lo: number, hi: number) => {
      if (hi - lo < 1) return;
      const mid = Math.floor((lo + hi) / 2);
      sort(lo, mid);
      sort(mid + 1, hi);
      const left = a.slice(lo, mid + 1);
      const right = a.slice(mid + 1, hi + 1);
      let i = 0;
      let j = 0;
      let k = lo;
      while (i < left.length && j < right.length) {
        comparisons++;
        a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
      }
      while (i < left.length) a[k++] = left[i++];
      while (j < right.length) a[k++] = right[j++];
      swaps += hi - lo + 1;
      push(`Intercala [${lo}..${mid}] com [${mid + 1}..${hi}]`, range(lo, hi + 1));
    };
    sort(0, a.length - 1);
  } else {
    const sort = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const pivot = a[hi];
      let i = lo;
      push(`Pivô ${pivot} (último do trecho [${lo}..${hi}])`, [hi]);
      for (let j = lo; j < hi; j++) {
        comparisons++;
        if (a[j] < pivot) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
          push(`${a[i]} < pivô: vai para a esquerda`, [hi], [i, j]);
          i++;
        }
      }
      [a[i], a[hi]] = [a[hi], a[i]];
      swaps++;
      push(`Pivô ${pivot} na posição final ${i}`, [], [i, hi]);
      sort(lo, i - 1);
      sort(i + 1, hi);
    };
    sort(0, a.length - 1);
  }
  push('Ordenado', [], [], range(0, a.length));
  return out;
}
function range(from: number, to: number) {
  return Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);
}

export function Sorting({ props }: { props: Record<string, string> }) {
  const [algorithm, setAlgorithm] = useState<Algorithm>(
    (props.algorithm as Algorithm) in INFO ? (props.algorithm as Algorithm) : 'bubble'
  );
  const [input, setInput] = useState(props.values || '5 1 4 2 8 3');
  const list = useMemo(() => {
    const values = input
      .trim()
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map(Number)
      .filter(Number.isFinite)
      .slice(0, 12);
    return frames(values, algorithm);
  }, [input, algorithm]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => setIndex(0), [list]);
  useEffect(() => {
    if (!playing) return;
    if (index >= list.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => i + 1), 520);
    return () => clearTimeout(t);
  }, [playing, index, list.length]);
  const frame = list[Math.min(index, list.length - 1)];
  const scale = Math.max(1, ...frame.array.map(Math.abs));
  const baseline = Math.min(0, ...frame.array.map((value) => value / scale));
  const info = INFO[algorithm];
  return (
    <div>
      <div className={styles.title}>
        <strong>Algoritmos de ordenação passo a passo</strong>
        <span>
          {info.name}: melhor {info.best} · médio {info.average} · pior {info.worst} · {info.stable}
        </span>
      </div>
      <div className={styles.controls}>
        {(Object.keys(INFO) as Algorithm[]).map((a) => (
          <button
            key={a}
            type="button"
            className={styles.button}
            aria-pressed={a === algorithm}
            onClick={() => setAlgorithm(a)}
          >
            {INFO[a].name.split(' (')[0]}
          </button>
        ))}
      </div>
      <div className={styles.controls}>
        <input
          aria-label="Valores do vetor"
          className={`${styles.input} ${styles.mono}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: '1 1 200px' }}
        />
        <button
          type="button"
          className={styles.button}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          ◀ Voltar
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? 'Pausar' : 'Reproduzir'}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => setIndex((i) => Math.min(list.length - 1, i + 1))}
          disabled={index >= list.length - 1}
        >
          Avançar ▶
        </button>
      </div>
      <div
        style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 150 }}
        aria-hidden="true"
      >
        {frame.array.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'grid', gap: 4, justifyItems: 'center' }}>
            <div
              style={{
                width: '100%',
                height: `${((v / scale - baseline) / (1 - baseline)) * 120 + 6}px`,
                borderRadius: '4px 4px 0 0',
                background: frame.swap.includes(i)
                  ? 'var(--enade-warning)'
                  : frame.compare.includes(i)
                    ? 'var(--color-dd-accent)'
                    : frame.sorted.includes(i)
                      ? 'var(--enade-success)'
                      : 'color-mix(in srgb, var(--color-dd-accent) 30%, var(--color-dd-bg))',
                transition: 'height 0.2s ease',
              }}
            />
            <span className={styles.mono} style={{ fontSize: 12 }}>
              {v}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.status} aria-live="polite">
        Passo {index + 1}/{list.length}: {frame.note} · {frame.comparisons} comparações ·{' '}
        {frame.swaps} {algorithm === 'merge' ? 'escritas' : 'trocas/deslocamentos'}
        <span className="sr-only">
          {frame.array.length ? ` Vetor atual: ${frame.array.join(', ')}.` : ' Vetor vazio.'}
        </span>
      </p>
      <p className={styles.hint}>
        Azul: comparando · laranja: trocando · verde: posição definitiva. *Bolha com parada
        antecipada.
      </p>
    </div>
  );
}
