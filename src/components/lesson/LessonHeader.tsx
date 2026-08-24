'use client';

import { X, Heart, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LessonHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  lives: number;
  maxLives: number;
  combo: number;
  earnedXp: number;
  onExitClick: () => void;
}

function GameHeartIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-[0_2px_6px_rgba(239,68,68,0.5)]`}
    >
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff4b4b" />
          <stop offset="100%" stopColor="#d91b1b" />
        </linearGradient>
        <linearGradient id="heartShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Base Heart */}
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="url(#heartGradient)"
        stroke="#b31010"
        strokeWidth="0.8"
      />
      {/* Top Glossy Highlight */}
      <path
        d="M7.5 4.5c-1.8 0-3.2 1.3-3.4 3.1.5-.8 1.4-1.4 2.5-1.5 1.5-.2 2.6.5 3.4 1.4.3.4.6.9.8 1.4-.4-1.8-1.5-3.4-3.3-4.4z"
        fill="url(#heartShine)"
      />
    </svg>
  );
}

export function LessonHeader({
  currentStepIndex,
  totalSteps,
  lives,
  maxLives,
  combo,
  earnedXp,
  onExitClick,
}: LessonHeaderProps) {
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentStepIndex / Math.max(1, totalSteps)) * 100)
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-dd-border/80 bg-dd-bg/95 backdrop-blur-md px-4 py-3 select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Exit Button */}
        <button
          type="button"
          onClick={onExitClick}
          aria-label="Sair da lição"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-dd-muted hover:text-dd-text hover:bg-dd-surface/80 active:scale-95 transition-all cursor-pointer"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Progress Bar Container */}
        <div className="flex-1 max-w-md h-3.5 bg-dd-surface rounded-full overflow-hidden border border-dd-border/60 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Stats Indicators: Hearts, Combo, XP */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Combo Indicator */}
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-black text-amber-500 shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>{combo}x combo</span>
            </motion.div>
          )}

          {/* Session XP (Blue Pill Badge) */}
          {earnedXp > 0 && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-black text-blue-400 shadow-sm shadow-blue-500/10"
            >
              <Zap className="h-3.5 w-3.5 fill-blue-400 text-blue-400" />
              <span>+{earnedXp} XP</span>
            </motion.div>
          )}

          {/* Lives / Hearts (Game Heart Icon Badge) */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 shadow-sm"
            aria-label={`${lives} de ${maxLives} vidas restantes`}
          >
            <GameHeartIcon className="h-5 w-5" />
            <span className="text-sm font-black text-rose-500 dark:text-rose-400 tabular-nums leading-none">
              {lives}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
