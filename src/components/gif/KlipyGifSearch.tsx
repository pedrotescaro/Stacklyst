'use client';

/* KLIPY requires its media to load straight from its CDN, so next/image is not used. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import {
  isKlipyRateLimited,
  klipyApiKey,
  registerKlipyShare,
  searchKlipyGifs,
  type KlipyGif,
} from '@/lib/klipy';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './KlipyGifSearch.module.css';

interface KlipyGifSearchProps {
  onSelect: (gif: KlipyGif) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Message shown when no API key is configured. */
  unavailableMessage?: string;
  /** Search only when the user submits a term. */
  searchOnSubmit?: boolean;
  uploadHint?: string;
  /** Highlights the GIF currently in use, e.g. the saved banner. */
  selectedUrl?: string | null;
  compact?: boolean;
}

type SearchResult = {
  term: string;
  locale: string;
  attempt: number;
  gifs: KlipyGif[];
  error?: 'unavailable' | 'rate-limit';
  retryAt?: number;
};

export function KlipyGifSearch({
  onSelect,
  disabled = false,
  autoFocus = false,
  unavailableMessage,
  searchOnSubmit = false,
  uploadHint,
  selectedUrl,
  compact = false,
}: KlipyGifSearchProps) {
  const { text, language } = useLocalizedText();
  const key = klipyApiKey();
  const [query, setQuery] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [lastCooldownEnd, setLastCooldownEnd] = useState<number>();
  const input = useRef<HTMLInputElement>(null);
  const locale = language === 'en' ? 'us' : 'br';
  const term = searchOnSubmit ? submittedTerm : query.trim();
  const canSearch = !searchOnSubmit || Boolean(term);
  const current =
    canSearch && result?.term === term && result.locale === locale && result.attempt === attempt
      ? result
      : null;
  const searching = canSearch && !current;
  const retryAt = current?.retryAt;
  const coolingDown = retryAt !== undefined && retryAt !== lastCooldownEnd;

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!key || !canSearch) return;
    const controller = new AbortController();
    async function search() {
      try {
        const gifs = await searchKlipyGifs({
          key,
          query: term,
          locale,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResult({ term, locale, attempt, gifs });
      } catch (failure) {
        if (!controller.signal.aborted) {
          const rateLimited = isKlipyRateLimited(failure);
          setResult({
            term,
            locale,
            attempt,
            gifs: [],
            error: rateLimited ? 'rate-limit' : 'unavailable',
            retryAt: rateLimited ? failure.retryAt : undefined,
          });
        }
      }
    }
    const timer = window.setTimeout(search, searchOnSubmit ? 0 : 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key, canSearch, term, locale, searchOnSubmit, attempt]);

  useEffect(() => {
    if (retryAt === undefined) return;
    const timer = window.setTimeout(
      () => setLastCooldownEnd(retryAt),
      Math.max(0, retryAt - Date.now())
    );
    return () => window.clearTimeout(timer);
  }, [retryAt]);

  function submitSearch() {
    if (!query.trim() || disabled || searching || coolingDown) return;
    setSubmittedTerm(query.trim());
    setAttempt((n) => n + 1);
  }

  if (!key)
    return (
      <p className={styles.help}>
        {unavailableMessage ||
          text('A pesquisa de GIFs ainda não está disponível.', 'GIF search is not available yet.')}
        {uploadHint && ` ${uploadHint}`}
      </p>
    );

  return (
    <div className={styles.search}>
      <div className={searchOnSubmit ? styles.searchControls : undefined}>
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (searchOnSubmit && value.trim() !== submittedTerm) setSubmittedTerm('');
          }}
          onKeyDown={(event) => {
            if (searchOnSubmit && event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submitSearch();
            }
          }}
          disabled={disabled}
          maxLength={100}
          className={styles.input}
          aria-label={text('Pesquisar GIFs no KLIPY', 'Search KLIPY GIFs')}
          // KLIPY's attribution guidelines require this placeholder.
          placeholder={text('Pesquisar no KLIPY', 'Search KLIPY')}
        />
        {searchOnSubmit && (
          <button
            type="button"
            className={styles.submit}
            disabled={disabled || !query.trim() || searching || coolingDown}
            onClick={submitSearch}
          >
            {text('Buscar GIFs', 'Find GIFs')}
          </button>
        )}
      </div>
      {searching && (
        <p role="status" className={styles.status}>
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          {text('Pesquisando GIFs…', 'Searching GIFs…')}
        </p>
      )}
      {current?.error && (
        <div className={styles.error}>
          <p role="alert">
            {current.error === 'rate-limit'
              ? text(
                  'O KLIPY atingiu o limite temporário de buscas de GIFs.',
                  'KLIPY has reached its temporary GIF search limit.'
                )
              : text(
                  'A pesquisa de GIFs está indisponível agora.',
                  'GIF search is unavailable right now.'
                )}
          </p>
          <div className={styles.errorActions}>
            {searchOnSubmit && term && current.error === 'rate-limit' && (
              <a
                className={styles.recoveryAction}
                href={`https://klipy.com/search/${encodeURIComponent(term.replace(/\s+/g, '-'))}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {text('Buscar no site do KLIPY', 'Search on the KLIPY website')}
              </a>
            )}
            <button
              type="button"
              className={styles.recoveryAction}
              disabled={disabled || coolingDown}
              onClick={() => setAttempt((n) => n + 1)}
            >
              {coolingDown
                ? text('Aguardando nova tentativa…', 'Waiting to retry…')
                : text('Tentar novamente', 'Try again')}
            </button>
          </div>
          {uploadHint && <p className={styles.help}>{uploadHint}</p>}
        </div>
      )}
      {!!current?.gifs.length && (
        <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
          {current.gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              disabled={disabled}
              aria-pressed={selectedUrl ? selectedUrl === gif.url : undefined}
              onClick={() => {
                registerKlipyShare(key, gif.slug, term);
                onSelect(gif);
              }}
              aria-label={text(`Escolher ${gif.title}`, `Choose ${gif.title}`)}
            >
              <img src={gif.preview} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {term && current && !current.error && !current.gifs.length && (
        <p role="status" className={styles.help}>
          {text('Nenhum GIF encontrado. Tente outra palavra.', 'No GIFs found. Try another word.')}
        </p>
      )}
      <a
        className={styles.attribution}
        href="https://klipy.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by KLIPY
      </a>
    </div>
  );
}
