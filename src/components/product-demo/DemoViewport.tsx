'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type MotionValue } from 'framer-motion';
import type { SceneId } from './timeline';
import { sceneTransitionVariants, staticSceneVariants } from './demo-motion';
import { DemoPrewarm } from './DemoPrewarm';
import { FeedScene } from './scenes/FeedScene';
import { TrailsScene } from './scenes/TrailsScene';
import { RankingScene } from './scenes/RankingScene';
import { ProfileScene } from './scenes/ProfileScene';

/**
 * The frame renders the real screens at a fixed canvas and scales it to the
 * available width. Real components answer to viewport breakpoints, so the
 * canvas follows the same `767px` split: desktop layout above it, the
 * phone layout below it.
 */
export const DESKTOP_FRAME = { width: 1280, height: 800 } as const;
export const MOBILE_FRAME = { width: 390, height: 780 } as const;

const scenes = {
  feed: FeedScene,
  trails: TrailsScene,
  ranking: RankingScene,
  profile: ProfileScene,
} as const;

export function DemoViewport({
  clock,
  scene,
  mobile,
  prewarm = false,
}: {
  /** Clock of the active scene; an exiting scene keeps its own, frozen clock. */
  clock: MotionValue<number>;
  scene: SceneId;
  mobile: boolean;
  /** Paint every view once ahead of time while the walkthrough has not started. */
  prewarm?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [warmed, setWarmed] = useState(false);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const frame = mobile ? MOBILE_FRAME : DESKTOP_FRAME;
  const Scene = scenes[scene];
  const scale = width ? width / frame.width : 1;

  return (
    <div ref={stage} className="demo-viewport" data-frame={mobile ? 'mobile' : 'desktop'}>
      <div
        className="demo-fit dark"
        inert
        aria-hidden="true"
        style={{
          width: frame.width,
          height: frame.height,
          transform: `scale(${scale})`,
          visibility: width ? 'visible' : 'hidden',
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={scene}
            className="demo-scene"
            data-demo-scene={scene}
            variants={reduced ? staticSceneVariants : sceneTransitionVariants}
            initial="enter"
            animate="show"
            exit="exit"
          >
            <Scene clock={clock} mobile={mobile} />
          </motion.div>
        </AnimatePresence>
      </div>
      {prewarm && !warmed && !reduced && width > 0 && (
        <DemoPrewarm
          scenes={scenes}
          mobile={mobile}
          frame={frame}
          scale={scale}
          onDone={() => setWarmed(true)}
        />
      )}
    </div>
  );
}
