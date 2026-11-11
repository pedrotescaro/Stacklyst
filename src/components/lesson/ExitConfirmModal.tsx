'use client';

import { AlertTriangle, LogOut, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitConfirmModal({ isOpen, onConfirm, onCancel }: ExitConfirmModalProps) {
  const { text } = useLocalizedText();
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-dd-border bg-dd-card p-6 text-center shadow-2xl z-10 font-sans"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-black text-dd-text dark:text-white tracking-tight">
            {text('Deseja sair da lição?', 'Leave the lesson?')}
          </h3>
          <p className="mt-2 text-sm text-dd-muted dark:text-neutral-400 font-medium leading-relaxed">
            {text(
              'Seu progresso salvo nesta etapa permanecerá registrado, mas a sessão atual será encerrada.',
              'Progress saved in this step stays recorded, but the current session will end.'
            )}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-98 transition-all cursor-pointer"
            >
              {text('Continuar Aprendendo', 'Keep Learning')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full rounded-2xl border border-dd-border bg-dd-surface/60 py-3.5 text-sm font-bold text-dd-muted hover:text-red-500 hover:bg-red-500/10 active:scale-98 transition-all cursor-pointer"
            >
              {text('Sair para a Trilha', 'Exit to the Trail')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
