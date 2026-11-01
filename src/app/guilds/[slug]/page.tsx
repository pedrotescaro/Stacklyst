'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language } from '@prisma/client';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Crown,
  Globe2,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Shield,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { LanguageTag } from '@/components/LanguageTag';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { cn } from '@/lib/cn';
import { getCurrentUser } from '@/lib/client/current-user';

interface GuildDetailProps {
  params: Promise<{ slug: string }>;
}

interface GuildMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joined_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    total_xp: number;
  };
}

interface GuildDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  language: string | null;
  is_public: boolean;
  created_at: string;
  owner: {
    id: string;
    username: string;
    avatar_url: string | null;
    total_xp: number;
  };
  memberCount: number;
  members: GuildMember[];
  userRole: GuildMember['role'] | null;
  isMember: boolean;
}

interface CurrentUser {
  id: string;
  username: string;
  avatar_url?: string | null;
  total_xp: number;
  streak?: number;
}

type CommunityDetailTab = 'about' | 'members';

const ROLE_ICON: Record<GuildMember['role'], ComponentType<{ className?: string }>> = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: UsersRound,
};

const ROLE_LABEL: Record<GuildMember['role'], string> = {
  OWNER: 'Criador',
  ADMIN: 'Moderador',
  MEMBER: 'Membro',
};

const ROLE_COLOR: Record<GuildMember['role'], string> = {
  OWNER: 'text-amber-400',
  ADMIN: 'text-blue-400',
  MEMBER: 'text-dd-muted',
};

const COVER_THEME: Record<string, string> = {
  TS: 'from-blue-700 via-sky-500 to-cyan-400',
  JS: 'from-amber-500 via-yellow-400 to-orange-400',
  PYTHON: 'from-blue-700 via-indigo-500 to-amber-400',
  RUST: 'from-orange-800 via-amber-700 to-stone-700',
  GO: 'from-cyan-700 via-sky-500 to-blue-500',
  CPP: 'from-indigo-800 via-blue-600 to-fuchsia-600',
  JAVA: 'from-red-800 via-orange-600 to-amber-500',
  KOTLIN: 'from-violet-800 via-fuchsia-600 to-orange-500',
  SWIFT: 'from-orange-700 via-red-500 to-pink-500',
  DEFAULT: 'from-blue-800 via-indigo-600 to-violet-600',
};

function CommunityDetailSkeleton() {
  return (
    <div className="dd-platform-shell">
      <div className="dd-platform-sidebar-placeholder hidden shrink-0 border-r border-dd-border md:block" />
      <div className="dd-platform-body flex min-w-0 flex-1 xl:max-w-[950px]">
        <main className="dd-platform-main w-full max-w-[600px] border-r border-dd-border">
          <div className="h-14 animate-pulse border-b border-dd-border bg-dd-surface/30" />
          <div className="h-40 animate-pulse bg-dd-surface/60" />
          <div className="space-y-4 px-5 py-6">
            <div className="h-7 w-1/2 animate-pulse rounded-full bg-dd-surface" />
            <div className="h-14 animate-pulse rounded-xl bg-dd-surface/70" />
            <div className="h-40 animate-pulse rounded-2xl bg-dd-surface/40" />
          </div>
        </main>
        <div className="hidden w-[350px] shrink-0 xl:block" />
      </div>
    </div>
  );
}

export default function GuildDetailPage({ params }: GuildDetailProps) {
  const router = useRouter();
  const [guild, setGuild] = useState<GuildDetail | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [membershipPending, setMembershipPending] = useState(false);
  const [activeTab, setActiveTab] = useState<CommunityDetailTab>('about');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      params.then(({ slug }) =>
        fetch(`/api/guilds/by-slug/${slug}`, { cache: 'no-store' }).then((response) => {
          if (!response.ok) throw new Error('Comunidade não encontrada.');
          return response.json();
        })
      ),
      getCurrentUser<CurrentUser>(),
    ])
      .then(([guildData, userData]) => {
        if (!active) return;
        setGuild(guildData);
        setUser(userData);
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params]);

  const handleJoin = async () => {
    if (!guild || membershipPending) return;
    setMembershipPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/guilds/${guild.id}/members`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Não foi possível participar.');

      setGuild((current) =>
        current
          ? {
              ...current,
              isMember: true,
              userRole: 'MEMBER',
              members: [
                ...current.members,
                {
                  id: data.membership.id,
                  role: 'MEMBER',
                  joined_at: data.membership.joined_at,
                  user: data.membership.user,
                },
              ],
              memberCount: current.memberCount + 1,
            }
          : current
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível participar.');
    } finally {
      setMembershipPending(false);
    }
  };

  const handleLeave = async () => {
    if (!guild || membershipPending) return;
    setMembershipPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/guilds/${guild.id}/members`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || 'Não foi possível sair da comunidade.');

      setGuild((current) =>
        current
          ? {
              ...current,
              isMember: false,
              userRole: null,
              members: current.members.filter((member) => member.user.id !== user?.id),
              memberCount: Math.max(0, current.memberCount - 1),
            }
          : current
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível sair da comunidade.');
    } finally {
      setMembershipPending(false);
    }
  };

  if (loading) return <CommunityDetailSkeleton />;

  if (!guild) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dd-bg px-6 text-center">
        <UsersRound className="h-10 w-10 text-dd-muted/50" />
        <h1 className="mt-4 text-lg font-black text-dd-text">Comunidade não encontrada</h1>
        <p className="mt-1 text-xs text-dd-muted">{error || 'Este espaço não está disponível.'}</p>
        <Link
          href="/guilds"
          className="mt-5 rounded-full bg-blue-500 px-5 py-2.5 text-xs font-black text-white"
        >
          Voltar para Comunidades
        </Link>
      </div>
    );
  }

  const coverTheme = COVER_THEME[guild.language ?? 'DEFAULT'] ?? COVER_THEME.DEFAULT;
  const joinedMembers = guild.members.slice(0, 4);

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <div className="dd-platform-body flex min-w-0 flex-grow flex-col md:flex-row xl:max-w-[950px]">
        <main className="dd-platform-main min-h-screen w-full max-w-[600px] flex-grow border-r border-dd-border/80 pb-24 md:pb-8">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-dd-border/70 bg-dd-bg/95 px-4 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Voltar"
              className="dd-focus-ring dd-touch flex cursor-pointer items-center justify-center rounded-full text-dd-text transition-colors hover:bg-dd-surface"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black text-dd-text">{guild.name}</h1>
              <p className="text-[10px] text-dd-muted">
                {guild.memberCount.toLocaleString('pt-BR')}{' '}
                {guild.memberCount === 1 ? 'membro' : 'membros'}
              </p>
            </div>
          </header>

          <section>
            <div
              className={cn('relative h-40 overflow-hidden bg-gradient-to-br sm:h-44', coverTheme)}
            >
              <span className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/15 blur-xl" />
              <span className="absolute bottom-5 right-6 text-xs font-black uppercase tracking-[0.2em] text-white/60">
                Comunidade
              </span>
            </div>

            <div className="px-4 sm:px-5">
              <div className="-mt-10 flex items-end justify-between gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-4 border-dd-bg bg-blue-600 text-3xl font-black text-white shadow-xl">
                  {guild.icon || guild.name[0]?.toUpperCase() || 'C'}
                </div>

                {!guild.isMember ? (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={membershipPending}
                    className="dd-focus-ring mb-1 inline-flex h-9 min-w-24 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-dd-text px-4 text-xs font-black text-dd-bg transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
                  >
                    {membershipPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    Participar
                  </button>
                ) : guild.userRole !== 'OWNER' ? (
                  <button
                    type="button"
                    onClick={handleLeave}
                    disabled={membershipPending}
                    className="dd-focus-ring mb-1 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-dd-border px-4 text-xs font-black text-dd-text transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-wait disabled:opacity-60"
                  >
                    {membershipPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Participando
                  </button>
                ) : (
                  <span className="mb-1 inline-flex h-9 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 text-xs font-black text-amber-400">
                    <Crown className="h-4 w-4" />
                    Criador
                  </span>
                )}
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-dd-text">{guild.name}</h2>
                  {guild.language && <LanguageTag language={guild.language as Language} />}
                </div>
                <p className="mt-2 max-w-xl text-xs leading-5 text-dd-muted">
                  {guild.description ||
                    'Um espaço para compartilhar conhecimento, fazer perguntas e evoluir em conjunto.'}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-dd-muted">
                  <Link
                    href={`/profile/${guild.owner.username}`}
                    className="flex items-center gap-2 hover:text-blue-400"
                  >
                    <AuthorAvatar
                      username={guild.owner.username}
                      avatar_url={guild.owner.avatar_url}
                      className="h-6 w-6 text-[9px]"
                    />
                    Criada por{' '}
                    <strong className="font-bold text-dd-text">@{guild.owner.username}</strong>
                  </Link>
                  <span className="flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5" />
                    {guild.is_public ? 'Pública' : 'Privada'}
                  </span>
                </div>

                {joinedMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('members')}
                    className="mt-4 flex cursor-pointer items-center text-[11px] text-dd-muted hover:text-dd-text"
                  >
                    <span className="mr-2 flex -space-x-2">
                      {joinedMembers.map((member) => (
                        <AuthorAvatar
                          key={member.id}
                          username={member.user.username}
                          avatar_url={member.user.avatar_url}
                          className="h-6 w-6 border-2 border-dd-bg text-[8px]"
                        />
                      ))}
                    </span>
                    <strong className="mr-1 font-black text-dd-text">
                      {guild.memberCount.toLocaleString('pt-BR')}
                    </strong>
                    {guild.memberCount === 1 ? 'membro' : 'membros'}
                  </button>
                )}
              </div>
            </div>
          </section>

          {error && (
            <div className="mx-4 mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400 sm:mx-5">
              {error}
            </div>
          )}

          <div
            className="mt-5 flex border-y border-dd-border/70"
            role="tablist"
            aria-label="Conteúdo da comunidade"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'about'}
              onClick={() => setActiveTab('about')}
              className={cn(
                'relative h-12 flex-1 cursor-pointer text-xs font-bold transition-colors hover:bg-dd-surface/35',
                activeTab === 'about' ? 'text-dd-text' : 'text-dd-muted'
              )}
            >
              Sobre
              {activeTab === 'about' && (
                <span className="absolute inset-x-1/3 bottom-0 h-0.5 rounded-full bg-blue-500" />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'members'}
              onClick={() => setActiveTab('members')}
              className={cn(
                'relative h-12 flex-1 cursor-pointer text-xs font-bold transition-colors hover:bg-dd-surface/35',
                activeTab === 'members' ? 'text-dd-text' : 'text-dd-muted'
              )}
            >
              Membros
              {activeTab === 'members' && (
                <span className="absolute inset-x-1/3 bottom-0 h-0.5 rounded-full bg-blue-500" />
              )}
            </button>
          </div>

          {activeTab === 'about' ? (
            <section className="space-y-4 px-4 py-5 sm:px-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500">
                  Propósito
                </p>
                <h3 className="mt-1 text-base font-black text-dd-text">Sobre esta comunidade</h3>
                <p className="mt-2 text-xs leading-5 text-dd-muted">
                  {guild.description ||
                    'Conecte-se com outros desenvolvedores, compartilhe descobertas e participe de conversas relevantes.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-dd-border bg-dd-surface/25 p-4">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                  <p className="mt-3 text-sm font-black text-dd-text">
                    {new Date(guild.created_at).toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="mt-0.5 text-[10px] text-dd-muted">Criada em</p>
                </div>
                <div className="rounded-2xl border border-dd-border bg-dd-surface/25 p-4">
                  <UsersRound className="h-4 w-4 text-blue-500" />
                  <p className="mt-3 text-sm font-black text-dd-text">
                    {guild.memberCount.toLocaleString('pt-BR')}
                  </p>
                  <p className="mt-0.5 text-[10px] text-dd-muted">Participantes</p>
                </div>
              </div>

              <div className="rounded-2xl border border-dd-border bg-dd-surface/20 p-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <h3 className="text-xs font-black text-dd-text">Boas conversas começam aqui</h3>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-dd-muted">
                  Mantenha o foco no tema, respeite os outros membros e compartilhe conhecimento que
                  ajude a comunidade a crescer.
                </p>
              </div>
            </section>
          ) : (
            <section className="px-3 py-3 sm:px-4">
              <div className="mb-2 flex items-center justify-between px-2 py-2">
                <h3 className="text-sm font-black text-dd-text">Membros</h3>
                <span className="text-[10px] font-semibold text-dd-muted">
                  {guild.memberCount.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="divide-y divide-dd-border/55">
                {guild.members.map((member) => {
                  const RoleIcon = ROLE_ICON[member.role];
                  return (
                    <Link
                      key={member.id}
                      href={`/profile/${member.user.username}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-dd-surface/35"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <AuthorAvatar
                          username={member.user.username}
                          avatar_url={member.user.avatar_url}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-black text-dd-text">
                              @{member.user.username}
                            </p>
                            <RoleIcon className={cn('h-3 w-3', ROLE_COLOR[member.role])} />
                          </div>
                          <p className="mt-0.5 text-[10px] text-dd-muted">
                            {ROLE_LABEL[member.role]} · desde{' '}
                            {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-dd-muted">
                        {member.user.total_xp.toLocaleString('pt-BR')} XP
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        <aside className="hidden w-[350px] shrink-0 px-5 py-5 xl:block">
          <div className="sticky top-5 space-y-4">
            <section className="rounded-2xl border border-dd-border bg-dd-surface/25 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <h2 className="text-sm font-black text-dd-text">Espaço da comunidade</h2>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-dd-muted">
                Comunidades são espaços dedicados para conversas mais relevantes e próximas.
              </p>
              <div className="mt-4 space-y-3 border-t border-dd-border/60 pt-4 text-[11px] text-dd-muted">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-3.5 w-3.5 text-blue-500" />
                  {guild.is_public ? 'Qualquer pessoa pode participar' : 'Entrada restrita'}
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  Administrada por @{guild.owner.username}
                </div>
              </div>
            </section>

            {guild.isMember && guild.userRole !== 'OWNER' && (
              <button
                type="button"
                onClick={handleLeave}
                disabled={membershipPending}
                className="dd-focus-ring flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-dd-border py-2.5 text-xs font-bold text-dd-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                Sair da comunidade
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
