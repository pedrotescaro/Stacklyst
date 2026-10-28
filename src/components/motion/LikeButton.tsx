'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AnimatedCounter } from './AnimatedCounter';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { InteractionCount, postActionClassName } from '@/components/PostActionsBar';
import { useLanguage } from '@/contexts/LanguageContext';

// Twitter like particles with vivid festive colors
const TWITTER_PARTICLES = [
  { angle: 0, color: '#f91880', distance: 18, size: 4 },
  { angle: 45, color: '#e0245e', distance: 20, size: 3 },
  { angle: 90, color: '#794bc4', distance: 19, size: 4 },
  { angle: 135, color: '#1d9bf0', distance: 21, size: 3.5 },
  { angle: 180, color: '#f91880', distance: 18, size: 4 },
  { angle: 225, color: '#ffad1f', distance: 20, size: 3 },
  { angle: 270, color: '#e0245e', distance: 19, size: 4 },
  { angle: 315, color: '#794bc4', distance: 21, size: 3.5 },
];

interface LikeButtonProps {
  count: number;
  isActive: boolean;
  onToggle: () => void;
  title?: string;
  appearance?: 'default' | 'post';
}

export function LikeButton({
  count,
  isActive,
  onToggle,
  title,
  appearance = 'default',
}: LikeButtonProps) {
  const [bursting, setBursting] = useState(false);
  const { isEnglish } = useLanguage();
  const reduced = useReducedMotion();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const updateSoundState = () => {
      setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
    };

    updateSoundState();

    window.addEventListener('storage', updateSoundState);
    window.addEventListener('stacklyst-sound-changed', updateSoundState);

    return () => {
      window.removeEventListener('storage', updateSoundState);
      window.removeEventListener('stacklyst-sound-changed', updateSoundState);
    };
  }, []);

  const { playSound } = useSoundEffects(soundEnabled);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willActivate = !isActive;
    if (willActivate) {
      if (!reduced && appearance !== 'post') {
        setBursting(true);
        setTimeout(() => setBursting(false), 500);
      }
      playSound('like');
    }
    onToggle();
  };

  if (appearance === 'post') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={title}
        aria-label={`${title || (isEnglish ? 'Like' : 'Curtir')}: ${new Intl.NumberFormat(isEnglish ? 'en-US' : 'pt-BR').format(count)}`}
        aria-pressed={isActive}
        className={cn(
          postActionClassName,
          isActive ? 'text-[#f91880]' : 'hover:text-[#f91880] hover:bg-[#f91880]/10'
        )}
      >
        <Heart aria-hidden="true" className={cn(isActive && 'fill-current')} />
        <InteractionCount count={count} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      className={cn(
        'group dd-touch flex items-center gap-1 cursor-pointer py-1 px-1 -ml-1 text-xs select-none transition-colors duration-150',
        isActive ? 'text-[#f91880]' : 'text-dd-muted hover:text-[#f91880]'
      )}
    >
      <div className="relative w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-[#f91880]/10 shrink-0">
        <motion.div
          animate={
            bursting && !reduced
              ? {
                  scale: [1, 0.35, 1.45, 0.95, 1],
                  transition: {
                    duration: 0.45,
                    times: [0, 0.2, 0.55, 0.8, 1],
                    ease: 'easeOut',
                  },
                }
              : { scale: 1 }
          }
          className="flex items-center justify-center"
        >
          <Heart
            className={cn(
              'w-[18px] h-[18px] transition-colors duration-150',
              isActive
                ? 'fill-[#f91880] text-[#f91880]'
                : 'text-dd-muted group-hover:text-[#f91880]'
            )}
          />
        </motion.div>

        {bursting && !reduced && (
          <>
            {/* Burst Expansion Ring */}
            <motion.div
              initial={{ scale: 0.2, opacity: 1, borderWidth: 3 }}
              animate={{ scale: 1.9, opacity: 0, borderWidth: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-[#f91880] pointer-events-none"
            />

            {/* Orbiting Sparkle Particles */}
            {TWITTER_PARTICLES.map((p, i) => {
              const rad = (p.angle * Math.PI) / 180;
              const targetX = Math.cos(rad) * p.distance;
              const targetY = Math.sin(rad) * p.distance;

              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0.6, opacity: 1 }}
                  animate={{
                    x: targetX,
                    y: targetY,
                    scale: [0.6, 1.2, 0],
                    opacity: [1, 0.9, 0],
                  }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    marginLeft: `-${p.size / 2}px`,
                    marginTop: `-${p.size / 2}px`,
                    backgroundColor: p.color,
                  }}
                />
              );
            })}
          </>
        )}
      </div>

      <AnimatedCounter
        value={count}
        className={cn(
          'px-0.5 text-xs transition-colors duration-150',
          isActive ? 'text-[#f91880] font-semibold' : 'text-dd-muted group-hover:text-[#f91880]'
        )}
      />
    </button>
  );
}
