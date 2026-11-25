'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { plural } from '@/lib/enade/format';
import styles from './library.module.css';

type Hit = {
  slug: string;
  title: string;
  categoryTitle: string;
  heading: string | null;
  headingId: string | null;
  snippet: string;
};
const NO_HITS: Hit[] = [];

/** Command-palette search over every article (titles, headings, tags and text). */
export function LibrarySearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ term: string; hits: Hit[]; failed: boolean } | null>(null);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const listId = useId();
  const term = query.trim();
  const currentResult = term.length >= 2 && result?.term === term ? result : null;
  const hits = currentResult?.hits ?? NO_HITS;
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    input.current?.focus();
    return () => {
      element?.close();
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/enade/library/search?q=${encodeURIComponent(term)}`, {
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('search'))))
        .then((data) => {
          if (!controller.signal.aborted) {
            setResult({ term, hits: data.results ?? [], failed: false });
            setActive(0);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setResult({ term, hits: [], failed: true });
        });
    }, 160);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);
  useEffect(() => {
    if (hits[active])
      document.getElementById(`${listId}-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active, hits, listId]);
  const go = (hit: Hit) => {
    onClose();
    router.push(`/trails/enade/biblioteca/${hit.slug}${hit.headingId ? `#${hit.headingId}` : ''}`);
  };
  return (
    <dialog
      ref={dialog}
      className={styles.palette}
      aria-label="Pesquisar na biblioteca"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.paletteInput}>
        <label className={styles.paletteField}>
          <Search size={17} aria-hidden="true" />
          <input
            ref={input}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (!hits.length || event.nativeEvent.isComposing) return;
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const step = event.key === 'ArrowDown' ? 1 : -1;
                setActive((index) => (index + step + hits.length) % hits.length);
              } else if (event.key === 'Enter' && hits[active]) {
                event.preventDefault();
                go(hits[active]);
              }
            }}
            placeholder="Pesquise um conceito: RUP, include, De Morgan, Gini…"
            aria-label="Termo de busca"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={hits.length > 0}
            aria-controls={listId}
            aria-activedescendant={hits[active] ? `${listId}-${active}` : undefined}
          />
        </label>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onClose}
          aria-label="Fechar pesquisa"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label="Resultados da pesquisa"
        className={styles.paletteResults}
        hidden={!hits.length}
      >
        {hits.map((hit, i) => (
          <li
            key={`${hit.slug}-${i}`}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => go(hit)}
          >
            <span className={styles.hitTitle}>
              {hit.title}
              {hit.heading && <span> › {hit.heading}</span>}
            </span>
            <span className={styles.hitMeta}>{hit.categoryTitle}</span>
            <span className={styles.hitSnippet}>{hit.snippet}</span>
          </li>
        ))}
      </ul>
      <p className={styles.paletteStatus} role="status">
        {currentResult?.failed
          ? 'Não foi possível pesquisar agora.'
          : term.length >= 2 && !currentResult
            ? 'Pesquisando…'
            : currentResult && !hits.length
              ? 'Nenhum conteúdo encontrado.'
              : hits.length
                ? plural(hits.length, 'resultado', 'resultados')
                : 'Pesquise conceitos, assuntos ou palavras-chave da biblioteca.'}
      </p>
    </dialog>
  );
}
