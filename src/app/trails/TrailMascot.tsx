'use client';

import { useRef, type RefObject } from 'react';
import { MASCOT_SPRITE_FRAMES } from './mascotSprites';
import { useTrailMascot } from './useTrailMascot';

interface TrailMascotProps {
  containerRef: RefObject<HTMLDivElement | null>;
  progressKey: string;
  currentNodeKey: string;
}

export function TrailMascot({ containerRef, progressKey, currentNodeKey }: TrailMascotProps) {
  const positionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useTrailMascot({
    containerRef,
    positionRef,
    imageRef,
    progressKey,
    currentNodeKey,
  });

  return (
    <div
      ref={positionRef}
      data-testid="trail-moving-mascot"
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-[25] h-[clamp(64px,8vw,92px)] w-[clamp(64px,8vw,92px)] select-none opacity-0 [contain:layout_style_paint]"
      style={{ transform: 'translate3d(0, 0, 0) translate(-50%, -88%)' }}
    >
      {/* A plain img lets the animation swap already-preloaded frames without React renders. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- frames are local, fixed-size, and preloaded */}
      <img
        ref={imageRef}
        src={MASCOT_SPRITE_FRAMES.baixo[0]}
        alt=""
        draggable={false}
        decoding="async"
        className="h-full w-full object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.28)]"
      />
    </div>
  );
}
