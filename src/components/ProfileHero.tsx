'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Edit3, GraduationCap, Sparkles, Trophy } from 'lucide-react';
import { FollowButton } from '@/components/motion/FollowButton';
import { LevelBadge, getLevelFromTotalXp } from '@/components/LevelBadge';
import { getTrailLanguageMetadata, TrailLanguageLogo } from '@/app/trails/TrailLanguageLogo';
import { AVATAR_BACKGROUNDS, normalizeAvatarConfig } from '@/lib/avatar';
import { StreakPopover } from '@/components/StreakPopover';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface ProfileHeroProps {
  currentUserId: string;
  profile: {
    id: string;
    name?: string | null;
    username: string;
    bio?: string | null;
    institution?: string | null;
    github_username?: string | null;
    discord_username?: string | null;
    banner_url?: string | null;
    pronouns?: string | null;
    created_at: string;
    total_xp: number;
    streak_days?: number;
    avatar_url?: string | null;
    avatar_config?: unknown;
  };
  trails: Array<{ language: string; xp: number; level: number }>;
  stats?: { answers_count: number; accuracy: number; accepted_count: number };
  following: boolean;
  followers: number;
  followingCount: number;
  weeklyActivity?: ReadonlyMap<number, number>;
  onEdit: () => void;
  onFollowToggle: () => Promise<void>;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
}

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.73.084-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.985-.4 3.005-.405 1.02.005 2.045.138 3.005.405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.096.81 2.21 0 1.595-.015 2.875-.015 3.265 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const languageColors: Record<string, string> = {
  JAVASCRIPT: '#ffc800',
  TYPESCRIPT: '#1cb0f6',
  PYTHON: '#58cc02',
  JAVA: '#ff7043',
  RUST: '#ce82ff',
  GO: '#2fc5d4',
};

function joinedLabel(value: string, locale: string, prefix: string) {
  const date = new Date(value);
  return `${prefix} ${date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}`;
}

export function ProfileHero({
  currentUserId,
  profile,
  trails,
  stats,
  following,
  followers,
  followingCount,
  weeklyActivity,
  onEdit,
  onFollowToggle,
  onShowFollowers,
  onShowFollowing,
}: ProfileHeroProps) {
  const { locale, text } = useLocalizedText();
  const isOwner = currentUserId === profile.id;
  const startedTrails = trails.filter((trail) => trail.xp > 0);
  const topTrails = startedTrails.slice(0, 3);
  const languageLogos = startedTrails.slice(0, 6);
  const avatar = normalizeAvatarConfig(profile.avatar_config, profile.username);
  const bannerColor = AVATAR_BACKGROUNDS[avatar.background];
  const initials = profile.username.trim().slice(0, 2).toUpperCase() || 'DD';
  const displayName =
    profile.name ||
    (profile.avatar_config as any)?.name ||
    (profile.avatar_config as any)?.displayName ||
    profile.username;

  return (
    <section className="w-full px-4 pb-6 pt-5 sm:px-7 sm:pt-9 lg:px-9 lg:pt-[50px]">
      <div
        className="relative flex h-[245px] w-full items-end justify-center overflow-hidden rounded-[28px] border-2 border-b-4 border-black/20 sm:h-[280px] lg:h-[295px] transition-colors duration-300"
        style={{ backgroundColor: bannerColor }}
      >
        {profile.banner_url && (
          <Image
            src={profile.banner_url}
            alt={text('Banner do perfil', 'Profile banner')}
            fill
            sizes="100%"
            className="object-cover"
            priority
          />
        )}
        <div className="relative z-10 mb-7 flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-[36px] border-[6px] border-white/25 bg-black/15 text-5xl font-black text-white shadow-[0_14px_0_rgba(0,0,0,0.18)] sm:h-[210px] sm:w-[210px]">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={text(`Foto de ${profile.username}`, `${profile.username}'s profile picture`)}
              width={220}
              height={220}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <span
              aria-label={text(`Iniciais de ${profile.username}`, `${profile.username}'s initials`)}
            >
              {initials}
            </span>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-black/18 to-transparent" />
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-2xl font-black tracking-tight text-dd-text sm:text-3xl">
              {displayName}
            </h1>
            <LevelBadge totalXp={profile.total_xp} className="text-[10px]" />
          </div>
          <p className="mt-1 text-sm font-bold text-dd-muted">@{profile.username}</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-dd-muted">
            <Calendar className="h-4 w-4 text-sky-400" />
            {joinedLabel(profile.created_at, locale, text('Por aqui desde', 'Joined'))}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isOwner ? (
            <button
              type="button"
              onClick={onEdit}
              className="dd-focus-ring inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-b-4 border-dd-border bg-dd-surface px-4 text-xs font-black uppercase text-dd-text transition-transform hover:-translate-y-0.5"
            >
              <Edit3 className="h-4 w-4" />
              {text('Editar perfil', 'Edit profile')}
            </button>
          ) : (
            <FollowButton isFollowing={following} onToggle={onFollowToggle} />
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <p className="max-w-2xl text-sm font-semibold leading-6 text-dd-text">
          {profile.bio ||
            text(
              'Aprendendo, praticando e compartilhando código com a comunidade Stacklyst.',
              'Learning, practicing, and sharing code with the Stacklyst community.'
            )}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-dd-muted">
            {profile.github_username && (
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-sky-400 text-slate-300 transition-colors group"
                title={`GitHub: @${profile.github_username}`}
              >
                <Github className="h-4 w-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>@{profile.github_username}</span>
              </a>
            )}
            {profile.institution && (
              <span className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-sky-400" /> {profile.institution}
              </span>
            )}
            {profile.pronouns && <span>{profile.pronouns}</span>}
            <button type="button" onClick={onShowFollowing} className="hover:text-sky-400">
              <strong className="text-dd-text">{followingCount}</strong>{' '}
              {text('seguindo', 'following')}
            </button>
            <button type="button" onClick={onShowFollowers} className="hover:text-sky-400">
              <strong className="text-dd-text">{followers}</strong>{' '}
              {text('seguidores', 'followers')}
            </button>
          </div>

          {languageLogos.length > 0 && (
            <div
              aria-label={text('Linguagens das trilhas iniciadas', 'Started trail languages')}
              className="flex flex-wrap items-center gap-2.5 sm:justify-end"
            >
              {languageLogos.map((trail) => {
                const metadata = getTrailLanguageMetadata(trail.language);
                return (
                  <span
                    key={trail.language}
                    role="img"
                    aria-label={`${metadata.label}, ${text('nível', 'level')} ${trail.level}`}
                    title={`${metadata.label} · ${text('Nível', 'Level')} ${trail.level} · ${trail.xp} XP`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-b-[3px] border-dd-border bg-dd-sidebar-bg"
                  >
                    <TrailLanguageLogo language={trail.language} className="h-7 w-7" />
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <h2 className="mt-8 text-xl font-black text-dd-text">{text('Estatísticas', 'Stats')}</h2>
      <p className="mt-1 max-w-2xl text-xs font-semibold text-dd-muted">
        {text(
          'Um resumo verificável da prática e do domínio técnico deste perfil.',
          'A verifiable snapshot of this profile’s practice and technical mastery.'
        )}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StreakPopover
          streak={profile.streak_days ?? 0}
          weeklyActivity={weeklyActivity}
          align="start"
          triggerClassName="dd-focus-ring flex min-h-24 w-full items-center gap-3 rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-4 text-left transition-transform hover:-translate-y-0.5"
        >
          <Image
            src="/assets/trails/streak-flame.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 object-contain"
          />
          <span className="min-w-0">
            <span className="block truncate text-xl font-black text-dd-text">
              {profile.streak_days ?? 0}
            </span>
            <span className="block text-xs font-bold text-dd-muted">
              {text('Dias de ofensiva', 'Streak days')}
            </span>
          </span>
        </StreakPopover>
        <div className="flex min-h-24 items-center gap-3 rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-4">
          <Image
            src="/assets/trails/trail-lightning.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]"
          />
          <div className="min-w-0">
            <p className="truncate text-xl font-black text-dd-text">
              {profile.total_xp.toLocaleString(locale)}
            </p>
            <p className="text-xs font-bold text-dd-muted">{text('Total de XP', 'Total XP')}</p>
          </div>
        </div>
        <StatCard
          icon={Trophy}
          color="#58cc02"
          value={`${text('Nível', 'Level')} ${getLevelFromTotalXp(profile.total_xp)}`}
          label={text('Nível global', 'Global level')}
        />
        <StatCard
          icon={GraduationCap}
          color="#1cb0f6"
          value={`${stats?.accuracy ?? 0}%`}
          label={text('Precisão', 'Accuracy')}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-[22px] border-2 border-dd-border bg-dd-sidebar-bg px-4 py-3">
          <span className="text-xs font-bold text-dd-muted">
            {text('Respostas enviadas', 'Answers submitted')}
          </span>
          <span className="font-mono text-lg font-black text-dd-text">
            {stats?.answers_count ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-[22px] border-2 border-dd-border bg-dd-sidebar-bg px-4 py-3">
          <span className="text-xs font-bold text-dd-muted">
            {text('Respostas aceitas', 'Accepted answers')}
          </span>
          <span className="font-mono text-lg font-black text-dd-text">
            {stats?.accepted_count ?? 0}
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-dd-text">
          {text('Trilhas de aprendizagem', 'Learning trails')}
        </h2>
        <Link
          href="/trails"
          className="text-xs font-black uppercase tracking-wide text-sky-400 hover:text-sky-300"
        >
          {text('Ver trilhas', 'View trails')}
        </Link>
      </div>
      {topTrails.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {topTrails.map((trail) => {
            const percent = Math.min(
              100,
              Math.round((trail.xp / Math.max(500, trail.level * 500)) * 100)
            );
            const color = languageColors[trail.language] ?? '#1cb0f6';
            const metadata = getTrailLanguageMetadata(trail.language);
            return (
              <div
                key={trail.language}
                className="rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: `conic-gradient(${color} ${percent}%, #2b3640 0)` }}
                  >
                    <div
                      role="img"
                      aria-label={text(`Logo ${metadata.label}`, `${metadata.label} logo`)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-dd-sidebar-bg"
                    >
                      <TrailLanguageLogo language={trail.language} className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black capitalize text-dd-text">
                      {trail.language.toLowerCase()}
                    </p>
                    <p className="text-xs font-bold text-dd-muted">
                      {text('Nível', 'Level')} {trail.level}
                    </p>
                    <p className="mt-1 text-sm font-black" style={{ color }}>
                      {percent}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-5 text-sm font-bold text-dd-muted">
          <Sparkles className="h-6 w-6 text-sky-400" />{' '}
          {text(
            'Comece uma trilha para exibir seu progresso aqui.',
            'Start a trail to show your progress here.'
          )}
        </div>
      )}
    </section>
  );
}

function StatCard({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: typeof Trophy;
  color: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-4">
      <Icon className="h-9 w-9 shrink-0" style={{ color }} fill="currentColor" strokeWidth={2.5} />
      <div className="min-w-0">
        <p className="truncate text-xl font-black text-dd-text">{value}</p>
        <p className="text-xs font-bold text-dd-muted">{label}</p>
      </div>
    </div>
  );
}
