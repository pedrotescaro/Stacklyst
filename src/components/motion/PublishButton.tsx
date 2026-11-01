'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { XPFloatToast } from './XPFloatToast';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type PublishState = 'idle' | 'submitting' | 'success';

interface PublishButtonProps {
  disabled?: boolean;
  state: PublishState;
  xpReward?: number;
  className?: string;
  label?: string;
  form?: string;
}

const labels: Record<PublishState, string> = {
  idle: 'Postar',
  submitting: 'Postando...',
  success: 'Postado ✓',
};

export function PublishButton({
  disabled,
  state,
  xpReward = 15,
  className,
  label,
  form,
}: PublishButtonProps) {
  const reduced = useReducedMotion();
  const isEmpty = disabled && state === 'idle';

  return (
    <div className="relative">
      <XPFloatToast amount={xpReward} visible={state === 'success'} />
      <motion.button
        type="submit"
        form={form}
        disabled={disabled || state !== 'idle'}
        className={cn(
          'dd-focus-ring dd-gpu relative flex items-center justify-center gap-1.5 bg-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-full',
          'shadow-sm transition-[opacity,background-color] duration-200 cursor-pointer',
          'hover:bg-blue-600',
          isEmpty && 'opacity-50 cursor-not-allowed pointer-events-none',
          state === 'success' && 'bg-emerald-500 hover:bg-emerald-500',
          state === 'submitting' && 'opacity-80 cursor-wait',
          className
        )}
        whileHover={!isEmpty && state === 'idle' ? { scale: 1.02 } : undefined}
        whileTap={!reduced && state !== 'submitting' ? { scale: 0.96 } : undefined}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <span>{label ?? labels[state]}</span>
      </motion.button>
    </div>
  );
}

export type { PublishState };
