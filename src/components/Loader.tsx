'use client';

import type { HTMLAttributes } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    container: 'size-20',
    titleClass: 'text-sm/tight font-medium',
    subtitleClass: 'text-xs/relaxed',
    spacing: 'space-y-2',
    maxWidth: 'max-w-48',
  },
  md: {
    container: 'size-32',
    titleClass: 'text-base/snug font-medium',
    subtitleClass: 'text-sm/relaxed',
    spacing: 'space-y-3',
    maxWidth: 'max-w-56',
  },
  lg: {
    container: 'size-40',
    titleClass: 'text-lg/tight font-semibold',
    subtitleClass: 'text-base/relaxed',
    spacing: 'space-y-4',
    maxWidth: 'max-w-64',
  },
} as const;

const infinite = Number.POSITIVE_INFINITY;

export default function Loader({ title, subtitle, size = 'md', className, ...props }: LoaderProps) {
  const { text } = useLocalizedText();
  const reduceMotion = useReducedMotion();
  const config = sizeConfig[size];
  const resolvedTitle =
    title ?? text('Preparando sua experiência...', 'Preparing your experience...');
  const resolvedSubtitle =
    subtitle ??
    text(
      'Aguarde enquanto deixamos tudo pronto para você',
      'Please wait while we get everything ready'
    );

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        role="status"
        aria-live="polite"
        className={cn('flex flex-col items-center justify-center gap-8 p-8', className)}
        {...props}
      >
        <m.div
          animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
          className={cn('relative', config.container)}
          transition={{ duration: 4, repeat: infinite, ease: [0.4, 0, 0.6, 1] }}
          aria-hidden="true"
        >
          <m.div
            animate={reduceMotion ? undefined : { rotate: [0, 360] }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 90deg, transparent 180deg)',
              mask: 'radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)',
              WebkitMask:
                'radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)',
              opacity: 0.8,
            }}
            transition={{ duration: 3, repeat: infinite, ease: 'linear' }}
          />

          <m.div
            animate={reduceMotion ? undefined : { rotate: [0, 360] }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 120deg, rgba(255, 255, 255, 0.5) 240deg, transparent 360deg)',
              mask: 'radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)',
              WebkitMask:
                'radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)',
              opacity: 0.9,
            }}
            transition={{ duration: 2.5, repeat: infinite, ease: [0.4, 0, 0.6, 1] }}
          />

          <m.div
            animate={reduceMotion ? undefined : { rotate: [0, -360] }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 180deg, transparent 0deg, rgba(255, 255, 255, 0.6) 45deg, transparent 90deg)',
              mask: 'radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)',
              WebkitMask:
                'radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)',
              opacity: 0.35,
            }}
            transition={{ duration: 4, repeat: infinite, ease: [0.4, 0, 0.6, 1] }}
          />

          <m.div
            animate={reduceMotion ? undefined : { rotate: [0, 360] }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 270deg, transparent 0deg, rgba(255, 255, 255, 0.4) 20deg, transparent 40deg)',
              mask: 'radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)',
              WebkitMask:
                'radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)',
              opacity: 0.5,
            }}
            transition={{ duration: 3.5, repeat: infinite, ease: 'linear' }}
          />
        </m.div>

        <m.div
          animate={{ opacity: 1, y: 0 }}
          className={cn('text-center', config.spacing, config.maxWidth)}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
          <m.h1
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              config.titleClass,
              'font-medium leading-[1.15] tracking-[-0.02em] text-white/90 antialiased'
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <m.span
              animate={reduceMotion ? undefined : { opacity: [0.9, 0.7, 0.9] }}
              transition={{ duration: 3, repeat: infinite, ease: [0.4, 0, 0.6, 1] }}
            >
              {resolvedTitle}
            </m.span>
          </m.h1>

          <m.p
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              config.subtitleClass,
              'font-normal leading-[1.45] tracking-[-0.01em] text-white/60 antialiased'
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <m.span
              animate={reduceMotion ? undefined : { opacity: [0.6, 0.4, 0.6] }}
              transition={{ duration: 4, repeat: infinite, ease: [0.4, 0, 0.6, 1] }}
            >
              {resolvedSubtitle}
            </m.span>
          </m.p>
        </m.div>
      </div>
    </LazyMotion>
  );
}
