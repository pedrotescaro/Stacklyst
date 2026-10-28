'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/cn';
import { popoverMenuVariants } from '@/lib/motion';
import { InteractionCount, postActionClassName } from '@/components/PostActionsBar';
import { useLanguage } from '@/contexts/LanguageContext';

export function RetweetIcon({ className = 'w-[18px] h-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <g>
        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
      </g>
    </svg>
  );
}

interface RepostMenuProps {
  onRepost: () => void;
  onQuote: () => void;
  count?: number;
  isReposted?: boolean;
  className?: string;
  appearance?: 'default' | 'post';
}

export function RepostMenu({
  onRepost,
  onQuote,
  count = 0,
  isReposted = false,
  className,
  appearance = 'default',
}: RepostMenuProps) {
  const [open, setOpen] = useState(false);
  const { isEnglish } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div
      className={cn('relative flex items-center', appearance !== 'post' && 'gap-0.5', className)}
      ref={ref}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          appearance === 'post'
            ? postActionClassName
            : 'dd-touch dd-focus-ring w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0',
          isReposted
            ? 'text-emerald-400 hover:bg-emerald-500/10'
            : 'text-dd-muted hover:text-emerald-400 hover:bg-emerald-500/10'
        )}
        title="Repostar"
        aria-expanded={open}
        aria-label={
          appearance === 'post'
            ? `${isEnglish ? 'Repost' : 'Repostar'}: ${new Intl.NumberFormat(isEnglish ? 'en-US' : 'pt-BR').format(count)}`
            : undefined
        }
      >
        <RetweetIcon className="w-[18px] h-[18px]" />
        {appearance === 'post' && <InteractionCount count={count} />}
      </button>
      {appearance !== 'post' && count > 0 && (
        <span
          className={cn(
            'px-0.5 text-xs font-normal',
            isReposted ? 'text-emerald-400 font-medium' : 'text-dd-muted'
          )}
        >
          {count}
        </span>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 z-50 bg-dd-surface border border-dd-border rounded-xl shadow-xl overflow-hidden min-w-[180px]"
            variants={popoverMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onRepost();
              }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-bold text-dd-text hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <RetweetIcon className="w-4 h-4" />
              Repostar
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onQuote();
              }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-bold text-dd-text hover:bg-blue-500/10 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              Comentar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
