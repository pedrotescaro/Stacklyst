'use client';

import { Swords, Clock, User as UserIcon } from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { LanguageTag } from '@/components/LanguageTag';
import { cn } from '@/lib/cn';

interface DuelBattleHeaderProps {
  me: {
    username: string;
    avatar_url?: string | null;
    avatar_config?: any;
  };
  opponent?: {
    username: string;
    avatar_url?: string | null;
    avatar_config?: any;
  } | null;
  language: string;
  difficulty?: string;
  myTestsPassed: number;
  myTotalTests: number;
  opponentTestsPassed: number;
  opponentTotalTests: number;
  opponentIsTyping?: boolean;
  timeLeft: number;
  isDuelActive: boolean;
}

export function DuelBattleHeader({
  me,
  opponent,
  language,
  difficulty = 'Fácil',
  myTestsPassed,
  myTotalTests,
  opponentTestsPassed,
  opponentTotalTests,
  opponentIsTyping = false,
  timeLeft,
  isDuelActive,
}: DuelBattleHeaderProps) {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const myProgress = myTotalTests > 0 ? (myTestsPassed / myTotalTests) * 100 : 0;
  const opponentProgress =
    opponentTotalTests > 0 ? (opponentTestsPassed / opponentTotalTests) * 100 : 0;

  return (
    <div className="w-full rounded-[24px] border-2 border-b-4 border-dd-border bg-dd-surface/80 backdrop-blur-xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top bar: Language, Difficulty & Timer */}
      <div className="flex items-center justify-between border-b border-dd-border/60 pb-3">
        <div className="flex items-center gap-2">
          <LanguageTag language={language} size="sm" />
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-xl border-2 border-b-[3px] border-blue-500/40 border-b-blue-600 bg-blue-500/15 text-blue-500 dark:text-blue-400">
            {difficulty}
          </span>
        </div>

        {/* 3D Duolingo Timer Pill */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-b-[3px] font-mono font-black text-xs select-none transition-colors',
            timeLeft < 60
              ? 'border-rose-500/40 border-b-rose-600 bg-rose-500/15 text-rose-400 animate-pulse'
              : 'border-blue-500/40 border-b-blue-600 bg-blue-500/15 text-blue-500 dark:text-blue-400'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Versus Grid: Player 1 VS Player 2 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        {/* Left: Player 1 (Você / Me) */}
        <div className="flex flex-col items-start gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <AuthorAvatar
                username={me.username}
                avatar_url={me.avatar_url}
                avatar_config={me.avatar_config}
                size="md"
                className="ring-2 ring-blue-500/60 ring-offset-2 ring-offset-dd-surface"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center text-[7px] font-black text-white">
                ✓
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-dd-text truncate flex items-center gap-1">
                {me.username}
                <span className="text-[9px] font-bold text-blue-400">(Você)</span>
              </p>
              <p className="text-[10px] text-dd-muted font-semibold">
                {myTestsPassed}/{myTotalTests} testes
              </p>
            </div>
          </div>

          {/* Duolingo 3D Health/Test Battery Bar */}
          <div className="w-full bg-dd-bg rounded-full h-3.5 border-2 border-dd-border p-0.5 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
              style={{ width: `${myProgress}%` }}
            />
          </div>
        </div>

        {/* Center: VS Badge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="w-10 h-10 rounded-2xl border-2 border-b-4 border-blue-500/40 border-b-blue-600 bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Swords className="w-5 h-5" />
          </div>
        </div>

        {/* Right: Player 2 (Oponente) */}
        <div className="flex flex-col items-end gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-row-reverse text-right">
            <div className="relative">
              {opponent ? (
                <>
                  <AuthorAvatar
                    username={opponent.username}
                    avatar_url={opponent.avatar_url}
                    avatar_config={opponent.avatar_config}
                    size="md"
                    className="ring-2 ring-blue-500/40 ring-offset-2 ring-offset-dd-surface"
                  />
                  <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-black" />
                </>
              ) : (
                <div className="w-10 h-10 rounded-full bg-dd-surface border-2 border-dashed border-dd-border flex items-center justify-center text-dd-muted animate-pulse">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-dd-text truncate">
                {opponent ? opponent.username : 'Aguardando oponente...'}
              </p>
              <p className="text-[10px] text-dd-muted font-semibold">
                {opponent ? (
                  opponentIsTyping ? (
                    <span className="text-blue-400 font-bold animate-pulse">Programando...</span>
                  ) : (
                    `${opponentTestsPassed}/${opponentTotalTests} testes`
                  )
                ) : (
                  'Convidar'
                )}
              </p>
            </div>
          </div>

          {/* Duolingo 3D Health/Test Battery Bar for Opponent */}
          <div className="w-full bg-dd-bg rounded-full h-3.5 border-2 border-dd-border p-0.5 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
              style={{ width: `${opponentProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
