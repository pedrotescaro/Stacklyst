'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { modalContentVariants, fadeVariants, bottomSheetVariants } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  hasDraft: boolean;
  onDiscard?: () => void;
  onSaveDraft?: () => boolean;
  children: ReactNode;
  headerExtra?: ReactNode;
  mobileTitle?: string;
}

export function ComposeModal({
  open,
  onClose,
  hasDraft,
  onDiscard,
  onSaveDraft,
  children,
  headerExtra,
  mobileTitle,
}: ComposeModalProps) {
  const reduced = useReducedMotion();
  const [discardWarning, setDiscardWarning] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    const container = dialogRef.current;
    if (!open || !viewport || !container) return;

    const updateViewport = () => {
      if (window.innerWidth < 768) {
        container.style.top = `${viewport.offsetTop}px`;
        container.style.height = `${viewport.height}px`;
        container.style.bottom = 'auto';
      } else {
        container.style.removeProperty('top');
        container.style.removeProperty('height');
        container.style.removeProperty('bottom');
      }
    };
    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      viewport.removeEventListener('resize', updateViewport);
      viewport.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      container.style.removeProperty('top');
      container.style.removeProperty('height');
      container.style.removeProperty('bottom');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const elements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]):not([type="file"]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true');
      if (!elements.length) return;
      if (event.shiftKey && document.activeElement === elements[0]) {
        event.preventDefault();
        elements[elements.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === elements[elements.length - 1]) {
        event.preventDefault();
        elements[0].focus();
      }
    };
    window.addEventListener('keydown', trapFocus);
    return () => {
      window.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  const handleClose = useCallback(() => {
    if (hasDraft) {
      setDiscardWarning(true);
      return;
    }
    setDiscardWarning(false);
    onClose();
  }, [hasDraft, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (discardWarning) setDiscardWarning(false);
        else handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, discardWarning, handleClose]);

  const handleDiscard = () => {
    setDiscardWarning(false);
    onDiscard?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
        >
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-[8px]"
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Criar nova publicação"
            variants={reduced ? fadeVariants : modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 max-h-[calc(100%-1rem)] w-full max-w-xl space-y-4 overflow-y-auto overscroll-contain rounded-t-2xl border border-dd-border bg-dd-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] font-sans shadow-2xl sm:rounded-2xl sm:pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1">
              <button
                ref={closeRef}
                onClick={handleClose}
                type="button"
                aria-label="Fechar rascunho"
                className="dd-focus-ring dd-touch flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-dd-text transition-all hover:bg-dd-surface/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {mobileTitle && (
                <h2 className="flex-1 text-center text-base font-bold text-dd-text md:sr-only">
                  {mobileTitle}
                </h2>
              )}
              {headerExtra}
              {mobileTitle && !headerExtra && (
                <span aria-hidden="true" className="w-11 shrink-0 md:hidden" />
              )}
            </div>

            {children}
          </motion.div>

          <AnimatePresence>
            {discardWarning && (
              <motion.div
                variants={reduced ? fadeVariants : bottomSheetVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-2xl rounded-t-3xl border border-dd-border bg-dd-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl"
              >
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-dd-border" />
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-dd-text">Descartar rascunho?</p>
                    <p className="text-xs text-dd-muted">
                      {onSaveDraft
                        ? 'Salve neste navegador para continuar depois ou descarte o texto.'
                        : 'Seu texto permanece aberto até você decidir descartá-lo.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {onSaveDraft && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!onSaveDraft()) {
                            setSaveError(true);
                            return;
                          }
                          setSaveError(false);
                          setDiscardWarning(false);
                          onClose();
                        }}
                        className="dd-touch rounded-full border border-dd-border px-4 py-2 text-xs font-bold text-dd-text cursor-pointer"
                      >
                        Salvar rascunho
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDiscardWarning(false)}
                      className="dd-touch rounded-full border border-dd-border px-4 py-2 text-xs font-bold text-dd-text transition-colors hover:bg-dd-bg cursor-pointer"
                    >
                      Continuar
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscard}
                      className="dd-touch rounded-full bg-red-500/12 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/18 cursor-pointer"
                    >
                      Descartar
                    </button>
                  </div>
                  {saveError && (
                    <p role="alert" className="text-xs text-red-400">
                      Não foi possível salvar neste navegador. Continue editando ou descarte o
                      texto.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
