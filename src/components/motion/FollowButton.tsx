'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => Promise<void> | void;
  size?: 'sm' | 'md';
  className?: string;
}

export function FollowButton({ isFollowing, onToggle, size = 'md', className }: FollowButtonProps) {
  const { text } = useLocalizedText();
  const reduced = useReducedMotion();
  const [optimistic, setOptimistic] = useState(isFollowing);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const following = optimistic;

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    const prev = optimistic;
    setOptimistic(!prev);
    try {
      await onToggle();
    } catch {
      setOptimistic(prev);
    } finally {
      setLoading(false);
    }
  };

  const label = following
    ? hovered
      ? text('Deixar de seguir', 'Unfollow')
      : text('Seguindo', 'Following')
    : text('Seguir', 'Follow');

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      data-following={following}
      className={cn(
        'dd-focus-ring dd-touch font-black rounded-full transition-all cursor-pointer',
        size === 'sm' ? 'text-[10px] px-3 py-1' : 'text-xs px-4 py-1.5',
        following
          ? hovered
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-dd-surface border border-dd-border text-dd-text'
          : 'bg-dd-accent text-white hover:bg-blue-600',
        loading && 'opacity-70 cursor-wait',
        className
      )}
      whileTap={reduced ? undefined : { scale: 0.95 }}
    >
      <span className="inline-flex items-center gap-1">
        {following && !hovered && (
          <motion.span
            initial={reduced ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="w-3 h-3" />
          </motion.span>
        )}
        {label}
      </span>
    </motion.button>
  );
}
