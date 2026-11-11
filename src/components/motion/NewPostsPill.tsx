'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { newPostsPillVariants } from '@/lib/motion';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface NewPostsPillProps {
  count: number;
  onClick: () => void;
  visible: boolean;
  loading?: boolean;
}

export function NewPostsPill({ count, onClick, visible, loading = false }: NewPostsPillProps) {
  const { text } = useLocalizedText();
  return (
    <AnimatePresence>
      {visible && count > 0 && (
        <motion.button
          type="button"
          onClick={onClick}
          disabled={loading}
          aria-live="polite"
          variants={newPostsPillVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-40
                     bg-blue-500 text-white text-xs font-bold
                     px-4 py-2 rounded-full shadow-lg shadow-blue-500/25
                     hover:scale-[1.03] active:scale-95 dd-focus-ring cursor-pointer
                     disabled:cursor-wait disabled:opacity-85"
        >
          <span className="flex items-center gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading
              ? 'Atualizando feed...'
              : text(
                  `Ver ${count} ${count === 1 ? 'novo post' : 'novos posts'}`,
                  `View ${count} ${count === 1 ? 'new post' : 'new posts'}`
                )}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
