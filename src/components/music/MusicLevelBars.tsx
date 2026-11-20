'use client';

import { useEffect, useRef } from 'react';
import styles from './FloatingMiniPlayer.module.css';

/** Middle bars run a little taller, like the low-mid band of a real spectrum. */
const BAR_WEIGHTS = [0.72, 1, 0.9, 0.82, 0.62];
const RESTING_LEVEL = 0.14;

/**
 * Equalizer bars for the now-playing artwork.
 *
 * Spotify plays through its embed or Web Playback SDK, and both keep the audio
 * out of reach of the page (the SDK is DRM-protected), while Spotify's audio
 * analysis API is closed to new apps. The bars therefore can't read the real
 * volume: they follow the playback state and move with a music-like envelope
 * (fast rise, slow fall, louder and quieter stretches), and rest when paused.
 */
export function MusicLevelBars({
  playing,
  className = '',
}: {
  playing: boolean;
  className?: string;
}) {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const elements = bars.current;
    const set = (index: number, level: number) => {
      const element = elements[index];
      if (element) element.style.transform = `scaleY(${Math.max(0.06, Math.min(1, level))})`;
    };
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!playing || reducedMotion || typeof requestAnimationFrame !== 'function') {
      BAR_WEIGHTS.forEach((weight, index) => set(index, playing ? 0.55 * weight : RESTING_LEVEL));
      return;
    }

    const levels = BAR_WEIGHTS.map(() => RESTING_LEVEL);
    const targets = [...levels];
    const nextChange = BAR_WEIGHTS.map(() => 0);
    let energy = 0.7;
    let energyTarget = 0.7;
    let nextEnergy = 0;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(64, now - last);
      last = now;
      // Slow swings between quieter and louder passages.
      if (now >= nextEnergy) {
        energyTarget = 0.45 + Math.random() * 0.55;
        nextEnergy = now + 1500 + Math.random() * 2500;
      }
      energy += (energyTarget - energy) * Math.min(1, elapsed / 700);
      BAR_WEIGHTS.forEach((weight, index) => {
        if (now >= nextChange[index]) {
          targets[index] = 0.12 + Math.random() * 0.88 * energy * weight;
          nextChange[index] = now + 90 + Math.random() * 170;
        }
        // Peaks hit quickly and decay slowly, like a VU meter.
        const speed = targets[index] > levels[index] ? 55 : 190;
        levels[index] += (targets[index] - levels[index]) * Math.min(1, elapsed / speed);
        set(index, levels[index]);
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  return (
    <span className={`${styles.levels} ${className}`} data-playing={playing} aria-hidden="true">
      {BAR_WEIGHTS.map((_, index) => (
        <span
          key={index}
          ref={(element) => {
            bars.current[index] = element;
          }}
          className={styles.levelBar}
        />
      ))}
    </span>
  );
}
