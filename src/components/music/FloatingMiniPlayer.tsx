'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, ExternalLink, Minimize2, X, Music2, ChevronUp } from 'lucide-react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import styles from './FloatingMiniPlayer.module.css';

function formatTime(ms: number): string {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function FloatingMiniPlayer() {
  const [mounted, setMounted] = useState(false);
  const {
    currentTrack,
    isPlaying,
    isMinimized,
    position,
    duration,
    progress,
    togglePlay,
    minimize,
    expand,
    closePlayer,
    seek,
  } = useMusicPlayer();

  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = (clickX / rect.width) * 100;
      seek(percent);
    },
    [seek]
  );

  if (!mounted || !currentTrack) return null;

  const spotifyUrl = currentTrack.spotifyUrl || `https://open.spotify.com/track/${currentTrack.id}`;

  // ==========================================
  // MINIMIZED VIEW (Fortnite Lobby Style)
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
          className={`${styles.minimizedRing} group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-neutral-950/90 backdrop-blur-md transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 cursor-pointer`}
          data-playing={isPlaying}
        >
          {currentTrack.artworkUrl ? (
            <img
              src={currentTrack.artworkUrl}
              alt=""
              className="h-full w-full object-cover rounded-2xl"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-blue-400 rounded-2xl">
              <Music2 size={24} />
            </div>
          )}

          {/* Equalizer indicator badge */}
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/90 border border-white/20 shadow-md">
            <div className={styles.equalizer} data-playing={isPlaying}>
              <span className={styles.bar} style={{ height: '5px' }} />
              <span className={styles.bar} style={{ height: '8px' }} />
              <span className={styles.bar} style={{ height: '6px' }} />
            </div>
          </div>

          {/* Hover overlay with expand arrow */}
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <ChevronUp size={22} className="text-white drop-shadow-md" />
          </div>
        </button>
      </div>
    );
  }

  // ==========================================
  // EXPANDED VIEW (Fortnite Aesthetic Card)
  // ==========================================
  return (
    <aside
      aria-label="Mini player de música"
      data-testid="floating-mini-player"
      className={`${styles.playerContainer} ${styles.slideIn} bottom-[4.75rem] right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-1.5rem)] max-w-[350px] sm:w-[350px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f141c]/90 text-white shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all`}
    >
      <div className="flex items-center gap-3 p-3.5">
        {/* Album Artwork (Vinyl style rotation) */}
        <div className="relative h-12 w-12 shrink-0">
          {currentTrack.artworkUrl ? (
            <div
              className={`${styles.rotatingCover} h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-700/60 shadow-md`}
              data-playing={isPlaying}
            >
              <img
                src={currentTrack.artworkUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className={`${styles.rotatingCover} flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-blue-400`}
              data-playing={isPlaying}
            >
              <Music2 size={22} />
            </div>
          )}

          {/* Vinyl center pin */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-[#0f141c]" />
        </div>

        {/* Track Title, Artist, & Equalizer */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="truncate text-sm font-bold text-white drop-shadow-sm"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </span>
            <div className={styles.equalizer} data-playing={isPlaying} aria-hidden="true">
              <span className={styles.bar} />
              <span className={styles.bar} />
              <span className={styles.bar} />
              <span className={styles.bar} />
            </div>
          </div>
          <p className="truncate text-xs font-medium text-neutral-400" title={currentTrack.artist}>
            {currentTrack.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar música' : 'Reproduzir música'}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-all hover:scale-105 hover:bg-blue-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={15} className="fill-white" />
            ) : (
              <Play size={15} className="ml-0.5 fill-white" />
            )}
          </button>

          {/* Open in Spotify */}
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir faixa completa no Spotify"
            title="Abrir no Spotify"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <ExternalLink size={14} />
          </a>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={minimize}
            aria-label="Minimizar player"
            title="Minimizar"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 cursor-pointer"
          >
            <Minimize2 size={13} />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Fechar player de música"
            title="Fechar"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-500/20 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Progress Bar & Timers */}
      <div
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        aria-label="Progresso da música"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="group relative h-1.5 w-full cursor-pointer bg-white/10 transition-all hover:h-2"
        title={`${formatTime(position)} / ${formatTime(duration)}`}
      >
        <div
          className="h-full bg-blue-500 transition-[width] duration-200 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </aside>
  );
}
