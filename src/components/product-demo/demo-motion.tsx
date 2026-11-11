'use client';

import { useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/cn';
import { CASCADE_STAGGER, ramp, smooth } from './timeline';
import { useDemoStill } from './DemoPrewarm';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const cascadeContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: CASCADE_STAGGER, delayChildren: 0.05 } },
};
const cascadeItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } },
};
const staticItem: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

type CascadeTag = 'div' | 'section' | 'article' | 'header' | 'main' | 'footer';

/** Elements inside a scene enter one after another (transform + opacity only). */
export function Cascade({
  children,
  className,
  as = 'div',
  ...rest
}: { children: ReactNode; className?: string; as?: CascadeTag } & Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'className'
>) {
  const Component = motion[as];
  return (
    <Component
      {...(rest as object)}
      className={className}
      variants={cascadeContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </Component>
  );
}

export function CascadeItem({
  children,
  className,
  as = 'div',
  ...rest
}: { children?: ReactNode; className?: string; as?: CascadeTag } & Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'className'
>) {
  const reduced = useReducedMotion();
  const still = useDemoStill();
  const Component = motion[as];
  return (
    <Component
      {...(rest as object)}
      className={cn('demo-cascade-item', className)}
      variants={reduced || still ? staticItem : cascadeItem}
    >
      {children}
    </Component>
  );
}

/** Scene-level crossfade: short fade plus a subtle horizontal travel. */
export const sceneTransitionVariants: Variants = {
  enter: { opacity: 0, x: 18 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE_OUT } },
  exit: { opacity: 0, x: -14, transition: { duration: 0.26, ease: 'easeOut' } },
};
export const staticSceneVariants: Variants = {
  enter: { opacity: 1, x: 0 },
  show: { opacity: 1, x: 0, transition: { duration: 0 } },
  exit: { opacity: 0, x: 0, transition: { duration: 0 } },
};

/** Something being typed between two clock marks, character by character. */
export function TypedText({
  clock,
  text,
  from,
  to,
  placeholder = '',
  className,
}: {
  clock: MotionValue<number>;
  text: string;
  from: number;
  to: number;
  placeholder?: string;
  className?: string;
}) {
  const typed = useTransform(clock, (time) =>
    time < from ? placeholder : text.slice(0, Math.round(text.length * ramp(from, to, time)))
  );
  return <motion.span className={className}>{typed}</motion.span>;
}

/**
 * Integer that counts from `from` to `to` between two clock marks. Rendered
 * as React state so real components receive a plain number; updates are
 * limited to whole-number changes.
 */
export function useCounter(
  clock: MotionValue<number>,
  from: number,
  to: number,
  start: number,
  end: number
) {
  const valueAt = (time: number) => Math.round(from + (to - from) * smooth(start, end, time));
  const [value, setValue] = useState(() => valueAt(clock.get()));
  useMotionValueEvent(clock, 'change', (time) => {
    const next = valueAt(time);
    setValue((previous) => (previous === next ? previous : next));
  });
  return value;
}

/** Keeps sprite animation frames flipping while `active`. */
export function useSpriteFrame(frames: readonly string[], active: boolean, interval: number) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!active) {
      setFrame(0);
      return;
    }
    const timer = window.setInterval(
      () => setFrame((value) => (value + 1) % frames.length),
      interval
    );
    return () => window.clearInterval(timer);
  }, [active, frames.length, interval]);
  return frames[frame % frames.length];
}

export interface Point {
  x: number;
  y: number;
}

/** Cubic bezier through four points. */
export function cubicPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/** Point along a polyline at progress `p` in [0, 1], by arc length. */
export function polylinePoint(points: readonly Point[], p: number): Point {
  if (points.length === 1) return points[0];
  const lengths = points
    .slice(1)
    .map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let distance = Math.max(0, Math.min(1, p)) * total;
  for (let index = 0; index < lengths.length; index++) {
    if (distance <= lengths[index] || index === lengths.length - 1) {
      const t = lengths[index] ? distance / lengths[index] : 1;
      const from = points[index];
      const to = points[index + 1];
      return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
    }
    distance -= lengths[index];
  }
  return points[points.length - 1];
}
