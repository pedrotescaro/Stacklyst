import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSoundEffects } from '~/lib/sounds';

/** A response belongs to the focus session in which its request began. */
export function useActivitySoundScope() {
  const { stopSounds } = useSoundEffects();
  const active = useRef(false);
  const generation = useRef(0);
  useFocusEffect(
    useCallback(() => {
      active.current = true;
      generation.current += 1;
      return () => {
        active.current = false;
        generation.current += 1;
        stopSounds();
      };
    }, [stopSounds])
  );
  const canPlaySound = useCallback(() => active.current, []);
  const captureSoundEvent = useCallback(() => {
    const requestGeneration = generation.current;
    return () => active.current && generation.current === requestGeneration;
  }, []);
  return { canPlaySound, captureSoundEvent };
}
