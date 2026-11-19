'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { motion, useMotionValue, useMotionValueEvent, type MotionValue } from 'framer-motion';
import {
  MASCOT_IDLE_FRAMES,
  MASCOT_SPRITE_FRAMES,
  preloadMascotSprites,
} from '@/app/trails/mascotSprites';
import { buildMascotRoute, type MascotNodeBox } from '@/app/trails/trailMascotRoute';
import type { SmoothTrailPath } from '@/app/trails/trailPath';
import { useSpriteFrame } from '../../demo-motion';

const WALK_FRAME_MS = 110;
const IDLE_FRAME_MS = 180;
const SPRITE_SIZE = 72;
/** Same node gap as `useTrailMascot`. */
const NODE_GAP = 8;
const SPRITE = { width: SPRITE_SIZE, height: SPRITE_SIZE, gap: NODE_GAP };

interface TrailMascotWalkerProps {
  containerRef: RefObject<HTMLDivElement | null>;
  fromId: string;
  toId: string;
  /** 0 = standing on `fromId`, 1 = standing on `toId`. */
  progress: MotionValue<number>;
  walking: boolean;
}

/** Same transform the walker always used: map point, then the foot anchor. */
const mascotTransform = ({ x, y }: { x?: unknown; y?: unknown }) =>
  `translate3d(${x ?? '0px'}, ${y ?? '0px'}, 0) translate(-50%, -88%)`;

function boxOf(element: Element, container: HTMLElement): MascotNodeBox {
  const containerRect = container.getBoundingClientRect();
  const scale = container.offsetWidth ? containerRect.width / container.offsetWidth : 1;
  const rect = element.getBoundingClientRect();
  const side = element.closest('[data-side]')?.getAttribute('data-side');
  return {
    cx: (rect.left - containerRect.left + rect.width / 2) / scale,
    cy: (rect.top - containerRect.top + rect.height / 2) / scale,
    halfWidth: rect.width / scale / 2,
    halfHeight: rect.height / scale / 2,
    side: side === 'left' || side === 'right' ? side : null,
  };
}

/**
 * The trail mascot, moved by the scene clock along the same route the real
 * map uses (`buildMascotRoute`). Uses the product's walking and idle sprites.
 */
export function TrailMascotWalker({
  containerRef,
  fromId,
  toId,
  progress,
  walking,
}: TrailMascotWalkerProps) {
  const [route, setRoute] = useState<SmoothTrailPath | null>(null);
  // Position lives on motion values: the walker moves every frame without
  // re-rendering React, and only the compositor layer is translated.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const routeRef = useRef(route);
  routeRef.current = route;

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
      setRoute(buildMascotRoute([boxOf(from, container), boxOf(to, container)], SPRITE));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, fromId, toId]);

  const place = (p: number) => {
    const current = routeRef.current;
    if (!current) return;
    const point = current.getPointAtLength(Math.max(0, Math.min(1, p)) * current.totalLength);
    x.set(point.x);
    y.set(point.y);
  };

  useEffect(() => {
    place(progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when the route is measured
  }, [route]);
  useMotionValueEvent(progress, 'change', place);

  const frames = walking ? MASCOT_SPRITE_FRAMES.baixo : MASCOT_IDLE_FRAMES.baixo;
  const frame = useSpriteFrame(frames, true, walking ? WALK_FRAME_MS : IDLE_FRAME_MS);

  return (
    <motion.div
      className="demo-mascot"
      data-testid="trail-moving-mascot"
      data-walking={walking}
      aria-hidden="true"
      style={{ x, y, opacity: route ? 1 : 0 }}
      transformTemplate={mascotTransform}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- preloaded local sprite frames */}
      <img
        src={frame}
        alt=""
        draggable={false}
        decoding="async"
        className="h-full w-full object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.28)]"
      />
    </motion.div>
  );
}
