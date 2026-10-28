'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { ProfilePreferences } from '@/lib/profile-customization';
import styles from './ContextSelectors.module.css';

type Track = NonNullable<ProfilePreferences['music']>;
type SearchResponse = {
  configured: boolean;
  tracks: Track[];
  nextOffset?: number | null;
  total?: number;
  reason?: string;
  message?: string;
  retryAfter?: number;
  unavailable?: boolean;
};
const persistedTrack = (track: Track): Track => ({
  trackId: track.trackId,
  title: track.title,
  artist: track.artist,
  artworkUrl: track.artworkUrl,
  ...(track.album !== undefined ? { album: track.album } : {}),
  ...(track.durationMs !== undefined ? { durationMs: track.durationMs } : {}),
});
const duration = (milliseconds: number) =>
  `${Math.floor(milliseconds / 60000)}:${Math.floor(milliseconds / 1000) % 60 < 10 ? '0' : ''}${Math.floor(milliseconds / 1000) % 60}`;

export function MusicSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: ProfilePreferences['music'];
  onChange: (value: ProfilePreferences['music']) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [url, setUrl] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState('');
  const sequence = useRef(0);
  const debounce = useRef<number | null>(null);
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
    };
  }, []);
  const search = async (term: string, offset = 0) => {
    request.current?.abort();
    const current = ++sequence.current;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        `/api/profile/music/search?q=${encodeURIComponent(term)}&offset=${offset}`,
        { signal: controller.signal, cache: 'no-store' }
      );
      const result = (await response.json()) as SearchResponse;
      if (!mounted.current || current !== sequence.current) return;
      if (!response.ok) {
        const retry = Number(response.headers.get('Retry-After') || result.retryAfter);
        throw new Error(
          response.status === 429
            ? `O Spotify limitou as consultas. ${retry > 0 ? `Tente novamente em ${retry} segundos.` : 'Aguarde um pouco e tente novamente.'}`
            : result.message || 'A pesquisa está indisponível. Você pode usar um link de faixa.'
        );
      }
      if (!result.configured || result.unavailable) {
        setTracks([]);
        setNextOffset(null);
        setAvailability(
          result.message ||
            'A busca por nome ainda não está disponível neste ambiente. Use o link oficial de uma faixa do Spotify.'
        );
        return;
      }
      setAvailability('');
      setTracks((previous) =>
        offset
          ? [
              ...previous,
              ...result.tracks.filter(
                (track) => !previous.some((existing) => existing.trackId === track.trackId)
              ),
            ]
          : result.tracks
      );
      setNextOffset(typeof result.nextOffset === 'number' ? result.nextOffset : null);
    } catch (failure) {
      if (!mounted.current || current !== sequence.current) return;
      if (controller.signal.aborted) {
        if (request.current === controller)
          setError('A consulta demorou mais que o esperado. Tente novamente ou use um link.');
      } else
        setError(
          failure instanceof Error ? failure.message : 'Não foi possível pesquisar o Spotify.'
        );
    } finally {
      window.clearTimeout(timeout);
      if (mounted.current && current === sequence.current) setBusy(false);
      if (request.current === controller) request.current = null;
    }
  };
  useEffect(() => {
    request.current?.abort();
    sequence.current++;
    setTracks([]);
    setNextOffset(null);
    setError('');
    setBusy(false);
    const term = query.trim();
    if (term.length < 2) return;
    debounce.current = window.setTimeout(() => {
      debounce.current = null;
      void search(term);
    }, 350);
    return () => {
      if (debounce.current !== null) window.clearTimeout(debounce.current);
      debounce.current = null;
    };
    // search reads only stable setters and request refs; query is the input boundary.
  }, [query]);
  const resolve = async () => {
    if (!url.trim() || busy || disabled) return;
    if (debounce.current !== null) window.clearTimeout(debounce.current);
    debounce.current = null;
    request.current?.abort();
    const current = ++sequence.current;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/profile/music/resolve', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Não foi possível consultar essa faixa.');
      if (mounted.current && current === sequence.current) {
        onChange(persistedTrack(result));
        setUrl('');
      }
    } catch (failure) {
      if (mounted.current && current === sequence.current)
        setError(
          controller.signal.aborted
            ? 'A consulta demorou. Sua música anterior continua selecionada.'
            : failure instanceof Error
              ? failure.message
              : 'Não foi possível consultar o Spotify.'
        );
    } finally {
      window.clearTimeout(timeout);
      if (mounted.current && current === sequence.current) setBusy(false);
      if (request.current === controller) request.current = null;
    }
  };
  return (
    <div className={styles.selector}>
      {value && (
        <div className={styles.selectedMusic}>
          <strong>{value.title || 'Faixa do Spotify'}</strong>
          {value.artist && <p className={styles.help}>{value.artist}</p>}
          <a
            href={`https://open.spotify.com/track/${value.trackId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir no Spotify
          </a>
          <div>
            <button
              className={styles.button}
              type="button"
              disabled={disabled || busy}
              onClick={() => onChange(null)}
            >
              Remover música
            </button>
          </div>
        </div>
      )}
      <label className={styles.field}>
        <span>Pesquisar música ou artista</span>
        <div className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Lady Gaga, Bad Romance…"
            aria-label="Pesquisar música ou artista"
            value={query}
            disabled={disabled}
            maxLength={100}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </label>
      {busy && (
        <p className={styles.help} role="status">
          Consultando Spotify…
        </p>
      )}
      {availability && (
        <p className={styles.help} role="status">
          {availability}
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.results}>
        {tracks.map((track) => (
          <div className={styles.track} key={track.trackId}>
            {track.artworkUrl && (
              <img src={track.artworkUrl} width={42} height={42} alt="" loading="lazy" />
            )}
            <div className={styles.trackInfo}>
              <strong>{track.title || 'Faixa do Spotify'}</strong>
              <p>{track.artist}</p>
              {(track.album || track.durationMs) && (
                <p>
                  {[track.album, track.durationMs ? duration(track.durationMs) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
            <button
              className={styles.button}
              type="button"
              disabled={disabled || busy}
              onClick={() => onChange(persistedTrack(track))}
              aria-label={`Selecionar ${track.title} de ${track.artist}`}
            >
              Escolher
            </button>
          </div>
        ))}
      </div>
      {!busy && !availability && !error && query.trim().length >= 2 && tracks.length === 0 && (
        <p className={styles.help} role="status">
          Nenhuma faixa encontrada. Tente outra música ou artista.
        </p>
      )}
      {nextOffset !== null && (
        <button
          className={styles.button}
          type="button"
          disabled={disabled || busy}
          onClick={() => void search(query.trim(), nextOffset)}
        >
          Carregar mais músicas
        </button>
      )}
      {error && query.trim().length >= 2 && (
        <button
          className={styles.button}
          type="button"
          disabled={disabled || busy}
          onClick={() => void search(query.trim())}
        >
          Tentar pesquisa novamente
        </button>
      )}
      <label className={styles.field}>
        <span>Ou cole um link do Spotify</span>
        <input
          type="url"
          aria-label="Link alternativo do Spotify"
          placeholder="https://open.spotify.com/track/…"
          maxLength={500}
          value={url}
          disabled={disabled || busy}
          onChange={(event) => setUrl(event.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <button
          className={styles.button}
          type="button"
          disabled={disabled || busy || !url.trim()}
          onClick={() => void resolve()}
        >
          Usar link da faixa
        </button>
      </div>
      <p className={styles.help} style={{ marginTop: 12 }}>
        A música muda só depois de salvar o perfil. A reprodução usa o player oficial e não começa
        automaticamente.
      </p>
    </div>
  );
}
