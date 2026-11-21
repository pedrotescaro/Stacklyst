'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './MusicSeekBar.module.css';

export function formatTrackTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * The SDK reports the position about once per second; between reports the bar
 * advances on its own so it moves smoothly instead of jumping.
 */
function useLivePosition(position: number, duration: number, playing: boolean) {
  const [live, setLive] = useState(position);
  const anchor = useRef({ position, at: 0 });

  useEffect(() => {
    anchor.current = { position, at: Date.now() };
    setLive(position);
  }, [position]);

  useEffect(() => {
    if (!playing || !duration) return;
    anchor.current = { position: anchor.current.position, at: Date.now() };
    const interval = setInterval(() => {
      const { position: from, at } = anchor.current;
      setLive(Math.min(duration, from + Date.now() - at));
    }, 250);
    return () => clearInterval(interval);
  }, [playing, duration]);

  return Math.min(live, duration || live);
}

interface MusicSeekBarProps {
  className?: string;
}

/**
 * Elapsed time, a draggable bar and the track length. Seeking needs the
 * listener's connected Premium account; otherwise the bar only shows progress.
 */
export function MusicSeekBar({ className = '' }: MusicSeekBarProps) {
  const { text } = useLocalizedText();
  const { position, duration, isPlaying, playbackSource, seek } = useMusicPlayer();
  const live = useLivePosition(position, duration, isPlaying);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const dragging = useRef(false);

  const canSeek = playbackSource === 'account' && duration > 0;
  const shown = dragValue ?? live;
  const percent = duration > 0 ? Math.min(100, (shown / duration) * 100) : 0;

  const commit = (value: number) => {
    if (duration > 0) seek((value / duration) * 100);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragValue !== null) commit(dragValue);
    setDragValue(null);
  };

  return (
    <div
      className={`flex items-center gap-2 text-[11px] tabular-nums text-neutral-400 ${className}`}
      data-testid="music-seek-bar"
    >
      <span className="w-9 shrink-0 text-right">{formatTrackTime(shown)}</span>
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={1000}
        value={Math.round(shown)}
        disabled={!canSeek}
        aria-label={text('Posição na música', 'Track position')}
        aria-valuetext={`${formatTrackTime(shown)} / ${formatTrackTime(duration)}`}
        style={{ '--seek-percent': `${percent}%` } as React.CSSProperties}
        className={styles.range}
        onPointerDown={() => {
          if (canSeek) dragging.current = true;
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onBlur={endDrag}
        onChange={(event) => {
          const value = Number(event.currentTarget.value);
          // Pointer drags seek on release; keyboard steps seek immediately.
          if (dragging.current) setDragValue(value);
          else commit(value);
        }}
      />
      <span className="w-9 shrink-0">{duration > 0 ? formatTrackTime(duration) : '--:--'}</span>
    </div>
  );
}
