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
  /** Highlights the GIF currently in use, e.g. the saved banner. */
  selectedUrl?: string | null;
  compact?: boolean;
}

export function KlipyGifSearch({
  onSelect,
  disabled = false,
  autoFocus = false,
  unavailableMessage,
  selectedUrl,
  compact = false,
}: KlipyGifSearchProps) {
  const { text, language } = useLocalizedText();
  const key = klipyApiKey();
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<KlipyGif[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  // Bumped by "Tentar novamente" to run the same search again.
  const [attempt, setAttempt] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    // Waits for a pause in typing so each keystroke does not spend the API quota.
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setError('');
      try {
        const next = await searchKlipyGifs({
          key,
          query,
          locale: language === 'en' ? 'us' : 'br',
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setGifs(next);
      } catch (failure) {
        if (!controller.signal.aborted) {
          setGifs([]);
          setError(
            isKlipyRateLimited(failure)
              ? text(
                  'Muitas buscas de GIF em pouco tempo. Aguarde alguns segundos e tente de novo.',
                  'Too many GIF searches in a short time. Wait a few seconds and try again.'
                )
              : text(
                  'A pesquisa de GIFs está indisponível agora. Tente novamente em instantes.',
                  'GIF search is unavailable right now. Try again in a moment.'
                )
          );
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key, query, language, text, attempt]);

  if (!key)
    return (
      <p className={styles.help}>
        {unavailableMessage ||
          text('A pesquisa de GIFs ainda não está disponível.', 'GIF search is not available yet.')}
      </p>
    );

  return (
    <div className={styles.search}>
      <input
        ref={input}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        disabled={disabled}
        maxLength={100}
        className={styles.input}
        aria-label={text('Pesquisar GIFs no KLIPY', 'Search KLIPY GIFs')}
        // KLIPY's attribution guidelines require this placeholder.
        placeholder={text('Pesquisar no KLIPY', 'Search KLIPY')}
      />
      {searching && (
        <p role="status" className={styles.status}>
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          {text('Pesquisando GIFs…', 'Searching GIFs…')}
        </p>
      )}
      {error && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          <button type="button" className={styles.retry} onClick={() => setAttempt((n) => n + 1)}>
            {text('Tentar novamente', 'Try again')}
          </button>
        </div>
      )}
      {!!gifs.length && (
        <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
          {gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              disabled={disabled}
              aria-pressed={selectedUrl ? selectedUrl === gif.url : undefined}
              onClick={() => {
                registerKlipyShare(key, gif.slug, query);
                onSelect(gif);
              }}
              aria-label={text(`Escolher ${gif.title}`, `Choose ${gif.title}`)}
            >
              <img src={gif.preview} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {!searching && !error && query.trim() && !gifs.length && (
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
