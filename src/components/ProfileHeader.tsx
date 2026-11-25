'use client';

import Image from 'next/image';
import { LanguageTrailBar } from './LanguageTrailBar';
import { Award, BookOpen, CheckCircle, GraduationCap } from 'lucide-react';
import { FollowButton } from './motion/FollowButton';
import { MarkdownRenderer } from './MarkdownRenderer';
import { isKlipyMediaUrl } from '@/lib/klipy';

interface LanguageTrail {
  language: string;
  xp: number;
  level: number;
  maxXp: number;
}

interface ProfileUser {
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  institution?: string | null;
  github_username?: string | null;
  total_xp: number;
}

interface ProfileStats {
  answers_count: number;
  accuracy: number;
  accepted_count: number;
}

interface ProfileHeaderProps {
  user: ProfileUser;
  stats: ProfileStats;
  trails: LanguageTrail[];
  isFollowing?: boolean;
  onFollowToggle?: () => Promise<void> | void;
  showFollowButton?: boolean;
  followersCount?: number;
  followingCount?: number;
  onShowFollowers?: () => void;
  onShowFollowing?: () => void;
}

export function ProfileHeader({
  user,
  stats,
  trails,
  isFollowing = false,
  onFollowToggle,
  showFollowButton = false,
  followersCount = 0,
  followingCount = 0,
  onShowFollowers,
  onShowFollowing,
}: ProfileHeaderProps) {
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Top section: avatar + info */}
      <div className="bg-dd-surface border border-dd-border rounded-xl p-6 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar */}
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.username}
              width={80}
              height={80}
              unoptimized={isKlipyMediaUrl(user.avatar_url)}
              className="w-20 h-20 rounded-full object-cover shrink-0 ring-2 ring-slate-800"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-2xl font-bold shrink-0 shadow-[0_0_15px_rgba(0, 131, 254,0.05)]">
              {initials}
            </div>
          )}

          {/* Info */}
          <div className="flex-grow min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-dd-text text-xl font-extrabold tracking-tight">
                  {user.username}
                </h1>
                <span className="inline-flex w-fit mx-auto sm:mx-0 text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  {user.total_xp.toLocaleString('pt-BR')} XP Total
                </span>
              </div>
              {showFollowButton && onFollowToggle && (
                <div className="flex shrink-0 justify-center sm:justify-end">
                  <FollowButton isFollowing={isFollowing} onToggle={onFollowToggle} />
                </div>
              )}
            </div>

            {user.bio ? (
              <div className="mb-3">
                <MarkdownRenderer content={user.bio} compact />
              </div>
            ) : (
              <p className="text-dd-muted text-xs italic mb-3">Sem biografia fornecida.</p>
            )}

            {/* Seguidores e Seguindo (Estilo Twitter/X) */}
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs mb-4">
              <span onClick={onShowFollowing} className="hover:underline cursor-pointer">
                <strong className="text-dd-text font-bold">{followingCount}</strong>{' '}
                <span className="text-dd-muted">seguindo</span>
              </span>
              <span onClick={onShowFollowers} className="hover:underline cursor-pointer">
                <strong className="text-dd-text font-bold">{followersCount}</strong>{' '}
                <span className="text-dd-muted">seguidores</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-2">
              {user.institution && (
                <div className="flex items-center gap-1.5 text-dd-muted text-[11px] font-semibold uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-blue-500/80" />
                  {user.institution}
                </div>
              )}
              {user.github_username && (
                <a
                  href={`https://github.com/${user.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-dd-muted text-[11px] font-semibold uppercase tracking-wider hover:text-blue-500 transition-colors w-fit"
                >
                  <svg
                    className="h-4 w-4 fill-current text-dd-muted hover:text-blue-500 transition-colors"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span>@{user.github_username}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dd-border">
          <div className="text-center">
            <div className="text-dd-text text-lg font-bold font-mono">{stats.answers_count}</div>
            <div className="text-dd-muted text-[10px] uppercase font-bold tracking-wider mt-1 flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3 text-dd-muted" />
              <span>Respostas</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-dd-text text-lg font-bold font-mono">{stats.accuracy}%</div>
            <div className="text-dd-muted text-[10px] uppercase font-bold tracking-wider mt-1 flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-dd-muted" />
              <span>Precisão</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-dd-text text-lg font-bold font-mono">{stats.accepted_count}</div>
            <div className="text-dd-muted text-[10px] uppercase font-bold tracking-wider mt-1 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-dd-muted" />
              <span>Aceitas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Language trails */}
      {trails.length > 0 && (
        <div className="bg-dd-surface border border-dd-border rounded-xl p-6 backdrop-blur-sm shadow-sm">
          <h2 className="text-dd-text text-sm font-extrabold mb-4 uppercase tracking-wider text-[11px] text-dd-muted">
            Níveis de Trilha de Linguagem
          </h2>
          <div className="space-y-4">
            {trails.map((trail) => (
              <LanguageTrailBar
                key={trail.language}
                language={trail.language}
                xp={trail.xp}
                level={trail.level}
                maxXp={trail.maxXp}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
