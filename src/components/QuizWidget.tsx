'use client';

import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Zap, Check, X, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_index?: number;
}

interface QuizWidgetProps {
  quiz: Quiz;
  postId: string;
  attempted?: boolean;
  userAnswer?: number;
  onAttemptSuccess?: (selectedIndex: number, isCorrect: boolean, xpResult: any) => void;
}

type QuizState = 'unanswered' | 'correct' | 'incorrect';

export function QuizWidget({
  quiz,
  attempted = false,
  userAnswer,
  onAttemptSuccess,
}: QuizWidgetProps) {
  const [correctIndex, setCorrectIndex] = useState(quiz.correct_index);
  const [state, setState] = useState<QuizState>(
    attempted ? (userAnswer === quiz.correct_index ? 'correct' : 'incorrect') : 'unanswered'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const updateSoundState = () => {
      setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
    };

    updateSoundState();

    window.addEventListener('storage', updateSoundState);
    window.addEventListener('stacklyst-sound-changed', updateSoundState);

    return () => {
      window.removeEventListener('storage', updateSoundState);
      window.removeEventListener('stacklyst-sound-changed', updateSoundState);
    };
  }, []);

  const { playSound } = useSoundEffects(soundEnabled);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(userAnswer ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSelect = async (index: number) => {
    if (state !== 'unanswered' || submitting) return;

    setSelectedIndex(index);
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/quiz/${quiz.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_index: index }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit quiz attempt');
      }

      const data = await res.json();
      const isCorrect = data.is_correct === true;
      setCorrectIndex(data.correct_index);
      setState(isCorrect ? 'correct' : 'incorrect');
      playSound(isCorrect ? 'quiz_correct' : 'quiz_incorrect');
      if (onAttemptSuccess) {
        onAttemptSuccess(index, isCorrect, data.xpResult);
      }
    } catch {
      setSelectedIndex(null);
      setSubmitError('Não foi possível registrar sua resposta agora. Tente novamente.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  const getOptionClasses = (index: number) => {
    const base =
      'w-full text-left px-4 py-3.5 rounded-2xl border-2 border-b-4 font-bold text-sm transition-all duration-150 flex items-center justify-between gap-3 select-none';

    if (state === 'unanswered') {
      if (selectedIndex === index && submitting) {
        return `${base} border-blue-500 bg-blue-500/20 text-white shadow-md`;
      }
      return `${base} border-dd-border bg-dd-surface/80 hover:border-blue-500/60 hover:bg-blue-500/10 active:border-b-2 active:translate-y-[2px] text-dd-text cursor-pointer`;
    }

    // After answering
    if (index === correctIndex) {
      return `${base} border-emerald-600 bg-emerald-500/20 text-emerald-300 font-black shadow-lg shadow-emerald-500/10`;
    }
    if (index === selectedIndex && state === 'incorrect') {
      return `${base} border-rose-600 bg-rose-500/20 text-rose-300 font-black shadow-lg shadow-rose-500/10`;
    }
    return `${base} border-dd-border/50 bg-dd-surface/40 text-dd-muted opacity-50`;
  };

  return (
    <div
      className={cn(
        'p-5 sm:p-6 rounded-2xl border-2 border-b-4 transition-all duration-300',
        state === 'unanswered' && 'border-blue-500/30 bg-blue-950/20 dd-glow-ring',
        state === 'correct' && 'border-emerald-500/40 bg-emerald-950/25 dd-correct-flash',
        state === 'incorrect' && 'border-rose-500/40 bg-rose-950/25 dd-shake-error'
      )}
    >
      {/* Header with Duolingo style XP pill */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block leading-tight">
              Desafio Rápido
            </span>
            <span className="text-xs font-extrabold text-dd-muted">Quiz de Fixação</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black border-2 border-b-[3px] border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm">
          <Zap className="w-3.5 h-3.5 fill-amber-300 stroke-none" />
          +15 XP
        </span>
      </div>

      {/* Question */}
      <h3 className="text-white text-base sm:text-lg font-black mb-5 leading-snug">
        {quiz.question}
      </h3>

      {/* Options in Duolingo 3D button format */}
      <div className="space-y-3">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={state !== 'unanswered' || submitting}
            className={getOptionClasses(index)}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span
                className={cn(
                  'w-8 h-8 rounded-xl border-2 border-b-[3px] flex items-center justify-center font-black text-xs shrink-0 transition-colors',
                  state === 'unanswered'
                    ? 'border-dd-border bg-dd-bg/80 text-dd-muted'
                    : index === correctIndex
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                      : index === selectedIndex && state === 'incorrect'
                        ? 'border-rose-500 bg-rose-500 text-white shadow-sm'
                        : 'border-dd-border/50 bg-dd-bg/40 text-dd-muted'
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="truncate font-bold text-left">{option}</span>
            </div>

            {/* Right side feedback icons */}
            {state !== 'unanswered' && index === correctIndex && (
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}
            {state === 'incorrect' && index === selectedIndex && (
              <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <X className="w-4 h-4 stroke-[3]" />
              </div>
            )}
            {state === 'unanswered' && selectedIndex === index && submitting && (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
            )}
          </button>
        ))}
      </div>

      {submitError && (
        <div className="mt-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-300">
          {submitError}
        </div>
      )}

      {/* Duolingo style Bottom Feedback Banner */}
      {state === 'correct' && (
        <div className="mt-5 p-4 rounded-2xl border-2 border-b-4 border-emerald-600 bg-emerald-500/20 flex items-center justify-between gap-3 shadow-md animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <p className="font-black text-sm text-emerald-200 uppercase tracking-wide">
                Excelente trabalho!
              </p>
              <p className="text-xs font-bold text-emerald-300">Resposta correta (+15 XP)</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
        </div>
      )}

      {state === 'incorrect' && (
        <div className="mt-5 p-4 rounded-2xl border-2 border-b-4 border-rose-600 bg-rose-500/20 flex items-center justify-between gap-3 shadow-md animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <X className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <p className="font-black text-sm text-rose-200 uppercase tracking-wide">Quase lá!</p>
              <p className="text-xs font-bold text-rose-300">
                A resposta certa era a opção{' '}
                <span className="underline font-black">
                  {correctIndex === undefined ? '—' : String.fromCharCode(65 + correctIndex)}
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
