'use client';

import { CheckCircle2, XCircle, Lightbulb, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonFooterProps {
  isConceptOnly?: boolean;
  answered: boolean;
  isCorrect: boolean;
  feedbackMessage?: string;
  feedbackDetails?: string;
  earnedXp?: number;
  combo?: number;
  hints?: string[];
  onOpenHint?: () => void;
  onVerify: () => void;
  onContinue: () => void;
  onRetry?: () => void;
  canVerify: boolean;
  isVerifying?: boolean;
}

export function LessonFooter({
  isConceptOnly = false,
  answered,
  isCorrect,
  feedbackMessage,
  feedbackDetails,
  earnedXp = 0,
  combo = 0,
  hints,
  onOpenHint,
  onVerify,
  onContinue,
  onRetry,
  canVerify,
  isVerifying = false,
}: LessonFooterProps) {
  return (
    <footer className="sticky bottom-0 z-30 w-full select-none transition-all">
      <AnimatePresence mode="wait">
        {answered ? (
          <motion.div
            key="feedback-banner"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`w-full border-t p-4 md:p-6 backdrop-blur-xl ${
              isCorrect
                ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100 shadow-[0_-8px_30px_rgba(16,185,129,0.15)]'
                : 'border-rose-500/30 bg-rose-950/90 text-rose-100 shadow-[0_-8px_30px_rgba(244,63,94,0.15)]'
            }`}
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 w-full sm:w-auto">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-lg font-black tracking-tight">
                      {isCorrect ? 'Mandou muito bem!' : 'Ops, não foi dessa vez!'}
                    </h3>
                    {isCorrect && earnedXp > 0 && (
                      <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-black text-emerald-300">
                        +{earnedXp} XP
                      </span>
                    )}
                  </div>
                  {feedbackMessage && (
                    <p className="text-xs md:text-sm font-medium opacity-90 leading-snug">
                      {feedbackMessage}
                    </p>
                  )}
                  {feedbackDetails && (
                    <p className="text-xs opacity-75 font-mono pt-1">{feedbackDetails}</p>
                  )}
                </div>
              </div>

              {/* Botões de Ação no Feedback */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {!isCorrect && onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/20 px-5 py-3 text-xs md:text-sm font-black text-rose-200 hover:bg-rose-500/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Tentar Novamente</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onContinue}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-7 py-3 text-xs md:text-sm font-black text-white shadow-lg transition-all active:scale-95 cursor-pointer w-full sm:w-auto ${
                    isCorrect
                      ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                  }`}
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="normal-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full border-t border-dd-border/80 bg-dd-bg/95 backdrop-blur-md p-4 md:p-5"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              {/* Botão de Dica */}
              <div>
                {hints && hints.length > 0 && onOpenHint && (
                  <button
                    type="button"
                    onClick={onOpenHint}
                    className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-500 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>Ver Dica</span>
                  </button>
                )}
              </div>

              {/* Botão Principal de Verificação / Avanço */}
              <button
                type="button"
                disabled={!canVerify || isVerifying}
                onClick={isConceptOnly ? onContinue : onVerify}
                className={`flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-black text-white shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isConceptOnly
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                }`}
              >
                <span>{isConceptOnly ? 'Entendi, Continuar' : 'Verificar'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
