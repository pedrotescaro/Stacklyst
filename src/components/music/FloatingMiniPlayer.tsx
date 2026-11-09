'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useCallback } from 'react';
import { Play, Pause, Share2, X, Music2, ChevronUp, SkipForward } from 'lucide-react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import styles from './FloatingMiniPlayer.module.css';

export function FloatingMiniPlayer() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { currentTrack, isPlaying, isMinimized, togglePlay, minimize, expand, closePlayer } =
    useMusicPlayer();

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
          className={`${styles.minimizedRing} group relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#1e1e1e] shadow-xl transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer`}
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

          {/* Equalizer badge */}
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 border border-white/15 shadow-md">
            <div className={styles.equalizer} data-playing={isPlaying}>
              <span className={styles.bar} style={{ height: '5px' }} />
              <span className={styles.bar} style={{ height: '8px' }} />
              <span className={styles.bar} style={{ height: '6px' }} />
            </div>
          </div>

          {/* Hover overlay with expand arrow */}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <ChevronUp size={22} className="text-white drop-shadow-md" />
          </div>
        </button>
      </div>
    );
  }

  // ==========================================
  // EXPANDED VIEW — Windows 11 Media Flyout
  // ==========================================
  return (
    <aside
      aria-label="Mini player de música"
      data-testid="floating-mini-player"
      className={`${styles.playerContainer} ${styles.slideIn} bottom-[4.75rem] right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-1.5rem)] max-w-[350px] sm:w-[350px] overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] text-white shadow-[0_16px_40px_rgba(0,0,0,0.7)] transition-all`}
    >
      {/* ── Header: "Ouvindo agora..." + action buttons ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
        <span className="text-[13px] text-neutral-400 font-normal select-none">
          Ouvindo agora...
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
            aria-label={isPlaying ? 'Pausar música' : 'Reproduzir música'}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-md transition-all hover:bg-neutral-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          >
            {isPlaying ? (
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
