'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { motionValue, type MotionValue } from 'framer-motion';
import type { SceneId } from './timeline';

/**
 * The first time the GPU draws each kind of sprite, filter and layer of the
 * walkthrough it compiles pipelines and uploads textures, which froze the
 * first pass through every view for 100-500 ms. While the visitor is still
 * on the hero, every view is painted once in a nearly transparent copy of
 * the frame, so the walkthrough itself only reuses warm GPU state.
 */

/** Clock marks that land on each distinct view of every scene. */
const PREWARM_STEPS: ReadonlyArray<readonly [SceneId, number]> = [
  ['feed', 7],
  ['trails', 1],
  ['trails', 4.5],
  ['trails', 7],
  ['trails', 10.5],
  ['trails', 12],
  ['trails', 15],
  ['trails', 17],
  ['trails', 19.5],
  ['trails', 23],
  ['ranking', 1],
  ['ranking', 4.5],
  ['profile', 1],
  ['profile', 3],
  ['profile', 6],
];
/** Wait for the entry loader and the hero reveal before touching the GPU. */
const PREWARM_DELAY_MS = 3600;
/** Time each view stays painted so its raster work completes. */
const PREWARM_STEP_MS = 220;
/** Hold off while the visitor scrolls, types or moves the pointer, so input never competes with it. */
const PREWARM_INPUT_QUIET_MS = 500;

/** Inside the warm-up copy, cascades render settled instead of animating. */
const DemoStillContext = createContext(false);
export const useDemoStill = () => useContext(DemoStillContext);

type SceneComponent = ComponentType<{ clock: MotionValue<number>; mobile: boolean }>;

function nextFrame() {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function DemoPrewarm({
  scenes,
  mobile,
  frame,
  scale,
  onDone,
}: {
  scenes: Record<SceneId, SceneComponent>;
  mobile: boolean;
  frame: { width: number; height: number };
  scale: number;
  onDone: () => void;
}) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    let lastInput = 0;
    const onInput = () => {
      lastInput = performance.now();
    };
    // Pointer movement drives the hero ripple, so it counts as input too.
    const events = [
      'wheel',
      'scroll',
      'touchmove',
      'keydown',
      'pointerdown',
      'pointermove',
    ] as const;
    events.forEach((name) => window.addEventListener(name, onInput, { passive: true }));

    const run = async () => {
      await wait(PREWARM_DELAY_MS);
      for (let index = 0; index < PREWARM_STEPS.length && !cancelled; index++) {
        while (!cancelled && performance.now() - lastInput < PREWARM_INPUT_QUIET_MS) {
          await wait(PREWARM_INPUT_QUIET_MS);
        }
        if (cancelled) return;
        setStep(index);
        await nextFrame();
        await wait(PREWARM_STEP_MS);
      }
      if (!cancelled) onDone();
    };
    void run();

    return () => {
      cancelled = true;
      events.forEach((name) => window.removeEventListener(name, onInput));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount
  }, []);

  const current = step >= 0 ? PREWARM_STEPS[step] : null;
  // A frozen clock per step, so each view mounts directly in its settled state.
  const clock = useMemo(() => (current ? motionValue(current[1]) : null), [current]);
  if (!current || !clock || typeof document === 'undefined') return null;
  const Scene = scenes[current[0]];

  return createPortal(
    <div
      className="demo-viewport demo-prewarm"
      data-frame={mobile ? 'mobile' : 'desktop'}
      inert
      aria-hidden="true"
      style={{ width: frame.width * scale, height: frame.height * scale }}
    >
      <div
        className="demo-fit dark"
        style={{
          width: frame.width,
          height: frame.height,
          transform: `scale(${scale})`,
        }}
      >
        <DemoStillContext.Provider value>
          <div className="demo-scene" key={step}>
            <Scene clock={clock} mobile={mobile} />
          </div>
        </DemoStillContext.Provider>
      </div>
    </div>,
    document.body
  );
}
