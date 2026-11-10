'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import {
  MASCOT_IDLE_FRAMES,
  MASCOT_SPRITE_FRAMES,
  preloadMascotSprites,
} from '@/app/trails/mascotSprites';
import { cubicPoint, useSpriteFrame, type Point } from '../../demo-motion';

const WALK_FRAME_MS = 110;
const IDLE_FRAME_MS = 180;
const SPRITE_SIZE = 72;
/** Same foot anchor and node gap as `useTrailMascot`. */
const NODE_GAP = 8;

interface TrailMascotWalkerProps {
  containerRef: RefObject<HTMLDivElement | null>;
  fromId: string;
  toId: string;
  /** 0 = standing on `fromId`, 1 = standing on `toId`. */
  progress: MotionValue<number>;
  walking: boolean;
}

function anchorOf(element: Element, container: HTMLElement): Point {
  const containerRect = container.getBoundingClientRect();
  const scale = container.offsetWidth ? containerRect.width / container.offsetWidth : 1;
  const rect = element.getBoundingClientRect();
  return {
    x: (rect.left - containerRect.left) / scale + rect.width / scale / 2,
    y: (rect.top - containerRect.top) / scale - NODE_GAP + SPRITE_SIZE * 0.88,
  };
}

/**
 * The trail mascot, moved by the scene clock along the same bezier the map
 * draws between two nodes. Uses the product's walking and idle sprite sets.
 */
export function TrailMascotWalker({
  containerRef,
  fromId,
  toId,
  progress,
  walking,
}: TrailMascotWalkerProps) {
  const [ends, setEnds] = useState<{ from: Point; to: Point } | null>(null);
  const [position, setPosition] = useState<Point | null>(null);

  useEffect(() => {
    void preloadMascotSprites();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const from = container.querySelector(`[data-trail-mascot-node="${fromId}"]`);
      const to = container.querySelector(`[data-trail-mascot-node="${toId}"]`);
      if (!from || !to) return;
      setEnds({ from: anchorOf(from, container), to: anchorOf(to, container) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, fromId, toId]);

  const pointAt = (p: number) =>
    ends
      ? cubicPoint(
          ends.from,
          { x: ends.from.x, y: ends.from.y + 125 },
          { x: ends.to.x, y: ends.to.y - 125 },
          ends.to,
          Math.max(0, Math.min(1, p))
        )
      : null;

  useEffect(() => {
    setPosition(pointAt(progress.get()));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when the ends are measured
  }, [ends]);
  useMotionValueEvent(progress, 'change', (p) => setPosition(pointAt(p)));

  const frames = walking ? MASCOT_SPRITE_FRAMES.baixo : MASCOT_IDLE_FRAMES.baixo;
  const frame = useSpriteFrame(frames, true, walking ? WALK_FRAME_MS : IDLE_FRAME_MS);

  return (
    <div
      className="demo-mascot"
      data-testid="trail-moving-mascot"
      data-walking={walking}
      aria-hidden="true"
      style={{
        opacity: position ? 1 : 0,
        transform: `translate3d(${position?.x ?? 0}px, ${position?.y ?? 0}px, 0) translate(-50%, -88%)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- preloaded local sprite frames */}
      <img
        src={frame}
        alt=""
        draggable={false}
        decoding="async"
        className="h-full w-full object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.28)]"
      />
    </div>
  );
}
