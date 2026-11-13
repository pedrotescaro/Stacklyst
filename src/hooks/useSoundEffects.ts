'use client';

import { useCallback, useEffect, useRef } from 'react';
import { PlatformSounds, type SoundType } from '../lib/platform-sounds';
export type { SoundType } from '../lib/platform-sounds';
const sounds = new PlatformSounds();
let consumers = 0;
const unlock = () => {
  void sounds.unlock();
};
const visibility = () => {
  if (document.hidden) sounds.stop();
};

/** Explicit settings preview, including when the saved preference is disabled. */
export function playSoundPreview(type: SoundType = 'notification') {
  sounds.play(type);
}

export function useSoundEffects(enabled: boolean = false) {
  const allowed = useRef(enabled);
  allowed.current = enabled;
  useEffect(() => {
    if (!enabled) return;
    void sounds.prepare();
    if (++consumers === 1) {
      // Unlock on press, before the click/animation and before any network await.
      window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
      window.addEventListener('keydown', unlock, true);
      document.addEventListener('visibilitychange', visibility);
    }
    return () => {
      if (--consumers === 0) {
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('keydown', unlock, true);
        document.removeEventListener('visibilitychange', visibility);
      }
    };
  }, [enabled]);
  const playSound = useCallback((type: SoundType) => {
    sounds.play(type, () => allowed.current);
  }, []);
  return { playSound };
}
