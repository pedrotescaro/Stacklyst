'use client';

import { useMemo, useState } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';

/**
 * Scenes of the walkthrough, in story order. Each scene has its own clock
 * (seconds since the scene started); beats inside a scene are expressed as
 * marks on that clock. Durations leave room for every micro-animation to
 * settle before the next scene.
 */
export const SCENES = [
  { id: 'feed', duration: 9.5 },
  { id: 'trails', duration: 25 },
  { id: 'ranking', duration: 8 },
  { id: 'profile', duration: 9.5 },
] as const;
export type SceneId = (typeof SCENES)[number]['id'];
export const SCENE_IDS = SCENES.map((scene) => scene.id) as SceneId[];

/** Crossfade length between scenes, in seconds. */
export const SCENE_TRANSITION = 0.3;
/** Stagger between cascading elements inside a scene, in seconds. */
export const CASCADE_STAGGER = 0.05;

export function sceneAt(index: number) {
  return SCENES[((index % SCENES.length) + SCENES.length) % SCENES.length];
}

/** Smoothstep between two clock marks, clamped to [0, 1]. */
export function smooth(from: number, to: number, time: number) {
  const p = Math.max(0, Math.min(1, (time - from) / (to - from)));
  return p * p * (3 - 2 * p);
}

/** Linear progress between two clock marks, clamped to [0, 1]. */
export function ramp(from: number, to: number, time: number) {
  return Math.max(0, Math.min(1, (time - from) / (to - from)));
}

/** Number of marks already reached by the clock. */
export function phaseAt(marks: readonly number[], time: number) {
  let phase = 0;
  for (const mark of marks) if (time >= mark) phase++;
  return phase;
}

/**
 * Discrete beat index derived from a scene clock. Only re-renders when the
 * beat changes, so continuous values stay on MotionValues.
 */
export function usePhase(clock: MotionValue<number>, marks: readonly number[]) {
  const [phase, setPhase] = useState(() => phaseAt(marks, clock.get()));
  useMotionValueEvent(clock, 'change', (time) => {
    const next = phaseAt(marks, time);
    setPhase((previous) => (previous === next ? previous : next));
  });
  return phase;
}

/**
 * Named beats: `reached('lesson')` is true once the clock passed that mark.
 * `marks` must be a module-level constant so the sorted order is stable.
 */
export function useBeats<T extends Record<string, number>>(clock: MotionValue<number>, marks: T) {
  const sorted = useMemo(
    () => Object.entries(marks).sort((left, right) => left[1] - right[1]),
    [marks]
  );
  const phase = usePhase(
    clock,
    sorted.map(([, mark]) => mark)
  );
  return (name: keyof T) => phase > sorted.findIndex(([key]) => key === name);
}
