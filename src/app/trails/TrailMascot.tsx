'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';
import { PixelAvatar } from '@/components/mundinho/PixelArt';
import type { MascotDirection } from './mascotSprites';
import { useTrailMascotAvatar } from './trailMascotAvatar';
import { useTrailMascot, type MascotPose } from './useTrailMascot';
import styles from './TrailMascot.module.css';

interface TrailMascotProps {
  containerRef: RefObject<HTMLDivElement | null>;
  progressKey: string;
  currentNodeKey: string;
}

const HERO_DIRECTION: Record<MascotDirection, 'down' | 'up' | 'left' | 'right'> = {
  baixo: 'down',
  cima: 'up',
  esquerda: 'left',
  direita: 'right',
};

/** The learner's Mundinho hero walks the trail: four walking directions, breathing when still. */
export function TrailMascot({ containerRef, progressKey, currentNodeKey }: TrailMascotProps) {
  const avatar = useTrailMascotAvatar();
  const positionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState<MascotPose>({ direction: 'baixo', walking: false });
  // The walk loop runs every frame; React only re-renders when the pose changes.
  const changePose = useCallback(
    (next: MascotPose) =>
      setPose((current) =>
        current.direction === next.direction && current.walking === next.walking ? current : next
      ),
    []
  );

  useTrailMascot({
    containerRef,
    positionRef,
    spriteRef: heroRef,
    onPoseChange: changePose,
    progressKey,
    currentNodeKey,
  });

  return (
    <div
      ref={positionRef}
      data-testid="trail-moving-mascot"
      data-direction={pose.direction}
      data-walking={pose.walking || undefined}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-[15] h-[clamp(56px,7vw,76px)] w-[clamp(56px,7vw,76px)] select-none opacity-0"
      style={{ transform: 'translate3d(0, 0, 0) translate(-50%, -88%)' }}
    >
      <div ref={heroRef} className={styles.hero}>
        <PixelAvatar
          avatar={avatar}
          direction={HERO_DIRECTION[pose.direction]}
          walking={pose.walking}
        />
      </div>
    </div>
  );
}
