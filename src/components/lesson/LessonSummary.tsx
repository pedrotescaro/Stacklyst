'use client';

import Image from 'next/image';
import { Trophy, Zap, Flame, Target, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Lesson, LessonSessionState } from '@/lib/lessons/types';

interface LessonSummaryProps {
  lesson: Lesson;
  sessionState: LessonSessionState;
  onFinish: () => void;
}

export function LessonSummary({ lesson, sessionState, onFinish }: LessonSummaryProps) {
  const totalAttempts = sessionState.correctAnswersCount + sessionState.wrongAnswersCount;
  const accuracy =
    totalAttempts > 0 ? Math.round((sessionState.correctAnswersCount / totalAttempts) * 100) : 100;

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4 text-center font-sans space-y-7 animate-fade-in select-none">
      {/* Mascote com Troféu de Vitória */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative mx-auto h-48 w-48 drop-shadow-2xl"
      >
        <Image
          src="/assets/trails/devdeck-robot-victory.png"
          alt="Mascote Comemorando com Troféu"
          fill
          sizes="192px"
          className="object-contain drop-shadow-[0_10px_25px_rgba(59,130,246,0.3)]"
          priority
        />
      </motion.div>

      {/* Title & XP */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-dd-text dark:text-white">
          Lição Concluída!
        </h1>
        <p className="text-sm font-semibold text-dd-muted dark:text-neutral-400">
          Você dominou os conceitos de <span className="text-blue-500">{lesson.title}</span>.
        </p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 px-5 py-2.5 text-xl font-black text-amber-500 shadow-sm mt-3"
        >
          <Sparkles className="h-5 w-5 fill-current" />
          <span>+{sessionState.earnedXp} XP</span>
        </motion.div>
      </div>

      {/* Stats Cards Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        {/* Precisão */}
        <div className="rounded-2xl border border-dd-border bg-dd-card p-3.5 shadow-sm text-center">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Target className="h-4 w-4" />
          </div>
          <p className="text-lg font-black text-dd-text dark:text-white">{accuracy}%</p>
          <p className="text-[11px] font-bold text-dd-muted">Precisão</p>
        </div>

        {/* Melhor Combo */}
        <div className="rounded-2xl border border-dd-border bg-dd-card p-3.5 shadow-sm text-center">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Zap className="h-4 w-4" />
          </div>
          <p className="text-lg font-black text-dd-text dark:text-white">
            {sessionState.maxCombo}x
          </p>
          <p className="text-[11px] font-bold text-dd-muted">Maior Combo</p>
        </div>

        {/* Exercícios */}
        <div className="rounded-2xl border border-dd-border bg-dd-card p-3.5 shadow-sm text-center">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-lg font-black text-dd-text dark:text-white">
            {sessionState.correctAnswersCount}
          </p>
          <p className="text-[11px] font-bold text-dd-muted">Acertos</p>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        type="button"
        onClick={onFinish}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-base font-black text-white shadow-xl shadow-blue-500/25 hover:bg-blue-500 active:scale-98 transition-all cursor-pointer"
      >
        <span>Voltar para a Trilha</span>
        <ArrowRight className="h-5 w-5 stroke-[2.5]" />
      </motion.button>
    </div>
  );
}
