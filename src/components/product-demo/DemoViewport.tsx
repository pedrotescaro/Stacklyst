'use client';

import { useEffect, useRef, useState } from 'react';
import type { MotionValue } from 'framer-motion';
import type { SceneId } from './timeline';
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
}: {
  clock: MotionValue<number>;
  scene: SceneId;
  mobile: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const frame = mobile ? MOBILE_FRAME : DESKTOP_FRAME;
  const Scene = scenes[scene];

  return (
    <div ref={stage} className="demo-viewport" data-frame={mobile ? 'mobile' : 'desktop'}>
      <div
        className="demo-fit dark"
        inert
        aria-hidden="true"
        style={{
          width: frame.width,
          height: frame.height,
          transform: `scale(${width ? width / frame.width : 1})`,
          visibility: width ? 'visible' : 'hidden',
        }}
      >
        <div className="demo-scene" data-demo-scene={scene}>
          <Scene key={scene} clock={clock} mobile={mobile} />
        </div>
      </div>
    </div>
  );
}
