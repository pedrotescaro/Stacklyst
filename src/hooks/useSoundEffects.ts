'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PlatformSounds, type SoundType } from '../lib/platform-sounds';
export type { SoundType } from '../lib/platform-sounds';
const sounds = new PlatformSounds();
let consumers = 0;
const unlockEvents = ['pointerdown', 'pointerup', 'click', 'keydown'] as const;
const unlock = (event: Event) => {
  // Browsers grant touch and pen activation on release, not on the initial press.
  if (event.type === 'pointerdown' && (event as PointerEvent).pointerType !== 'mouse') return;
  void sounds.unlock();
};
const visibility = () => {
  if (document.hidden) sounds.stop();
};

/** Explicit settings preview, including when the saved preference is disabled. */
export function playSoundPreview(type: SoundType = 'notification') {
  sounds.play(type);
}

/** The saved "Efeitos sonoros" setting, kept in sync when Settings changes it. */
export function useSoundPreference() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const sync = () => {
      try {
        setEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
      } catch {
        // Storage can be blocked. Keep the current in-memory preference.
      }
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('stacklyst-sound-changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('stacklyst-sound-changed', sync);
    };
  }, []);
  return enabled;
}

export function useSoundEffects(enabled: boolean = false) {
  const allowed = useRef(enabled);
  allowed.current = enabled;
  useEffect(() => {
    if (!enabled) return;
    void sounds.prepare();
    if (++consumers === 1) {
      // Unlock before the action handler awaits a server response.
      for (const event of unlockEvents)
        window.addEventListener(event, unlock, { capture: true, passive: true });
      document.addEventListener('visibilitychange', visibility);
    }
    return () => {
      if (--consumers === 0) {
        for (const event of unlockEvents) window.removeEventListener(event, unlock, true);
        document.removeEventListener('visibilitychange', visibility);
      }
    };
  }, [enabled]);
  const playSound = useCallback((type: SoundType) => {
    sounds.play(type, () => allowed.current);
  }, []);
  return { playSound };
}
