'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  LoaderCircle,
  Share2,
  X,
  Music2,
  ChevronUp,
  ChevronDown,
  SkipForward,
} from 'lucide-react';
import { useMusicPlayer, useMusicPlayerControls } from '@/contexts/MusicPlayerContext';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { MusicLevelBars } from './MusicLevelBars';
import styles from './FloatingMiniPlayer.module.css';

const MOBILE_QUERY = '(max-width: 639px)';

/** Phones get a docked now-playing bar; wider screens keep the floating card. */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return mobile;
}

/** Isolated so frequent position updates only rerender this thin line. */
function ProgressLine() {
  const { progress } = useMusicPlayer();
  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15" aria-hidden="true">
      <div
        className="h-full bg-white transition-[width] duration-700 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function FloatingMiniPlayer() {
  const { text } = useLocalizedText();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    isEmbedOpen,
    isMinimized,
    togglePlay,
    minimize,
    expand,
    closePlayer,
  } = useMusicPlayerControls();

  useEffect(() => {
    setMounted(true);
  }, []);

  const spotifyUrl =
    currentTrack?.spotifyUrl ||
    (currentTrack ? `https://open.spotify.com/track/${currentTrack.id}` : '');

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!spotifyUrl) return;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(spotifyUrl)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
          });
      } else {
        window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
      }
    },
    [spotifyUrl]
  );

  if (!mounted || !currentTrack) return null;

  if (isEmbedOpen) {
    return (
      <aside
        aria-label={text('Player do Spotify', 'Spotify player')}
        data-testid="floating-mini-player"
        className={`${styles.playerContainer} ${styles.slideIn} ${isMobile ? `${styles.mobileBar} inset-x-2` : 'bottom-6 right-6 w-[350px]'} rounded-xl border border-white/10 bg-[#181818] p-2 text-white shadow-xl`}
      >
        <div className="flex items-center justify-between gap-2 pl-2">
          <p role="status" className="text-sm text-neutral-200">
            {text('Toque no player do Spotify', 'Press play in the Spotify player')}
          </p>
          <button
            type="button"
            aria-label={text('Fechar player', 'Close player')}
            onClick={closePlayer}
            className="dd-focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-lg hover:bg-white/10"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <iframe
          key={currentTrack.id}
          title={`${currentTrack.title} · Spotify`}
          src={`https://open.spotify.com/embed/track/${currentTrack.id}`}
          height={152}
          allow="encrypted-media; autoplay"
          className="block w-full rounded-lg border-0"
        />
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dd-focus-ring my-1 inline-flex min-h-10 items-center rounded-md px-2 text-sm text-neutral-200 underline underline-offset-4 hover:text-white"
        >
          {text('Abrir no Spotify', 'Open in Spotify')}
        </a>
      </aside>
    );
  }

  // ==========================================
  // MINIMIZED VIEW
  // ==========================================
  if (isMinimized) {
    return (
      <div
        className={`${styles.playerContainer} ${styles.slideIn} bottom-[4.5rem] right-3 sm:bottom-6 sm:right-6`}
      >
        <button
          type="button"
          onClick={expand}
          data-testid="floating-mini-player-minimized"
          aria-label={`Expandir player: ${currentTrack.title} - ${currentTrack.artist}`}
          title={`${currentTrack.title} · ${currentTrack.artist} (Clique para expandir)`}
          className={`${styles.minimizedRing} group relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-[#181818] shadow-xl transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer`}
          data-playing={isPlaying}
        >
          {currentTrack.artworkUrl ? (
            <img
              src={currentTrack.artworkUrl}
              alt=""
              className="h-full w-full object-cover rounded-xl"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-400 rounded-xl">
              <Music2 size={24} />
            </div>
          )}

          {/* Equalizer bars across the whole artwork square */}
          {isBuffering ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/55">
              <LoaderCircle
                size={20}
                className="text-white motion-safe:animate-spin"
                aria-hidden="true"
              />
            </div>
          ) : (
            <MusicLevelBars playing={isPlaying} />
          )}

          {/* Hover overlay with expand arrow */}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <ChevronUp size={22} className="text-white drop-shadow-md" />
          </div>
        </button>
      </div>
    );
  }

  const statusText = isBuffering
    ? 'Carregando música...'
    : isPlaying
      ? 'Ouvindo agora...'
      : 'Pausado';
  const playLabel = isBuffering
    ? 'Cancelar carregamento da música'
    : isPlaying
      ? 'Pausar música'
      : 'Reproduzir música';

  // ==========================================
  // MOBILE — docked now-playing bar above the bottom navigation
  // ==========================================
  if (isMobile) {
    const controlClass =
      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors active:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white';
    return (
      <aside
        aria-label="Mini player de música"
        data-testid="floating-mini-player"
        data-layout="mobile"
        className={`${styles.playerContainer} ${styles.slideIn} ${styles.mobileBar} inset-x-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#181818] text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)]`}
      >
        <span role="status" className="sr-only">
          {statusText}
        </span>
        <div className="flex items-center gap-1 py-1.5 pl-1.5 pr-1">
          {/* Tapping the track opens it in Spotify, like the desktop card's shortcut. */}
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${currentTrack.title} no Spotify`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-0.5 pr-2 active:bg-white/5 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-neutral-800">
              {currentTrack.artworkUrl ? (
                <img
                  src={currentTrack.artworkUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-neutral-500">
                  <Music2 size={20} />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold leading-tight">
                {currentTrack.title}
              </span>
              <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs leading-tight text-neutral-400">
                {!isBuffering && (
                  <span className={styles.equalizer} data-playing={isPlaying} aria-hidden="true">
                    <span className={styles.bar} />
                    <span className={styles.bar} />
                    <span className={styles.bar} />
                  </span>
                )}
                <span className="truncate">
                  {isBuffering ? 'Carregando…' : currentTrack.artist}
                </span>
              </span>
            </span>
          </a>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playLabel}
            className={`${controlClass} text-white`}
          >
            {isBuffering ? (
              <LoaderCircle size={22} className="motion-safe:animate-spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause size={24} className="fill-current" aria-hidden="true" />
            ) : (
              <Play size={24} className="ml-0.5 fill-current" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={minimize}
            aria-label="Minimizar player"
            className={`${controlClass} text-neutral-400`}
          >
            <ChevronDown size={22} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Fechar player"
            className={`${controlClass} text-neutral-400`}
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <ProgressLine />
      </aside>
    );
  }

  // ==========================================
  // EXPANDED VIEW — Windows 11 Media Flyout
  // ==========================================
  return (
    <aside
      aria-label="Mini player de música"
      data-testid="floating-mini-player"
      className={`${styles.playerContainer} ${styles.slideIn} bottom-[4.75rem] right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-1.5rem)] max-w-[350px] sm:w-[350px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#181818] text-white shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all`}
    >
      {/* ── Header: "Ouvindo agora..." + action buttons ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
        <span
          role="status"
          className="flex items-center gap-2 text-[13px] text-neutral-400 font-normal select-none"
        >
          {!isBuffering && (
            <span className={styles.equalizer} data-playing={isPlaying} aria-hidden="true">
              <span className={styles.bar} />
              <span className={styles.bar} />
              <span className={styles.bar} />
            </span>
          )}
          {statusText}
        </span>
        <div className="flex items-center gap-1">
          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartilhar faixa do Spotify"
            title={copied ? 'Link copiado!' : 'Compartilhar faixa'}
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white cursor-pointer"
          >
            <Share2 size={14} strokeWidth={1.8} />
          </button>

          {/* Minimize / Toggle view button */}
          <button
            type="button"
            onClick={minimize}
            aria-label="Minimizar player"
            title="Minimizar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Fechar player"
            title="Fechar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white cursor-pointer"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* ── Separator ── */}
      <div className="mx-4 h-px bg-white/[0.08]" />

      {/* ── Content: artwork + track details + controls ── */}
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        {/* Album Artwork — square rounded */}
        <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-lg bg-neutral-800 shadow-sm">
          {currentTrack.artworkUrl ? (
            <img
              src={currentTrack.artworkUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-500">
              <Music2 size={26} />
            </div>
          )}
        </div>

        {/* Track Title, Artist, & Platform */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[15px] font-semibold leading-tight text-white"
            title={currentTrack.title}
          >
            {currentTrack.title}
          </p>
          <p
            className="mt-1 truncate text-[13px] text-neutral-400 leading-tight"
            title={currentTrack.artist}
          >
            {currentTrack.artist}
          </p>
          <p className="mt-1 text-[11px] text-neutral-500 leading-tight">Spotify</p>
        </div>

        {/* Controls: Play/Pause circle + Next button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Circular Play / Pause — solid white circle with black icon */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playLabel}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md transition-all hover:bg-neutral-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          >
            {isBuffering ? (
              <LoaderCircle size={18} className="motion-safe:animate-spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause size={18} className="fill-black text-black" />
            ) : (
              <Play size={18} className="ml-0.5 fill-black text-black" />
            )}
          </button>

          {/* Next / Skip forward button */}
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir faixa completa no Spotify"
            title="Abrir no Spotify"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          >
            <SkipForward size={20} className="fill-current text-current" />
          </a>
        </div>
      </div>
    </aside>
  );
}
