'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Language } from '@prisma/client';
import {
  Check,
  Compass,
  Globe2,
  LoaderCircle,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { LanguageTag } from '@/components/LanguageTag';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { cn } from '@/lib/cn';
import { getCurrentUser } from '@/lib/client/current-user';

interface GuildData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  language: string | null;
  memberCount: number;
  owner: { username: string; avatar_url: string | null };
  createdAt?: string;
  isMember?: boolean;
}

interface GuildsClientProps {
  initialGuilds?: GuildData[];
  initialMyGuilds?: GuildData[];
}

type CommunityTab = 'mine' | 'discover';

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Todos os assuntos' },
  { value: 'TS', label: 'TypeScript' },
  { value: 'JS', label: 'JavaScript' },
  { value: 'PYTHON', label: 'Python' },
  { value: 'RUST', label: 'Rust' },
  { value: 'GO', label: 'Go' },
  { value: 'CPP', label: 'C++' },
  { value: 'JAVA', label: 'Java' },
  { value: 'KOTLIN', label: 'Kotlin' },
  { value: 'SWIFT', label: 'Swift' },
] as const;

const COMMUNITY_THEMES: Record<string, { cover: string; logo: string }> = {
  TS: {
    cover: 'from-blue-600 via-sky-500 to-cyan-400',
    logo: 'bg-blue-600 text-white',
  },
  JS: {
    cover: 'from-amber-500 via-yellow-400 to-orange-400',
    logo: 'bg-yellow-400 text-black',
  },
  PYTHON: {
    cover: 'from-blue-600 via-indigo-500 to-amber-400',
    logo: 'bg-blue-600 text-white',
  },
  RUST: {
    cover: 'from-orange-700 via-amber-700 to-stone-700',
    logo: 'bg-orange-700 text-white',
  },
  GO: {
    cover: 'from-cyan-600 via-sky-500 to-blue-500',
    logo: 'bg-cyan-600 text-white',
  },
  CPP: {
    cover: 'from-indigo-700 via-blue-600 to-fuchsia-600',
    logo: 'bg-indigo-600 text-white',
  },
  JAVA: {
    cover: 'from-red-700 via-orange-600 to-amber-500',
    logo: 'bg-red-700 text-white',
  },
  KOTLIN: {
    cover: 'from-violet-700 via-fuchsia-600 to-orange-500',
    logo: 'bg-violet-700 text-white',
  },
  SWIFT: {
    cover: 'from-orange-600 via-red-500 to-pink-500',
    logo: 'bg-orange-600 text-white',
  },
  DEFAULT: {
    cover: 'from-blue-700 via-indigo-600 to-violet-600',
    logo: 'bg-blue-600 text-white',
  },
};

function getCommunityTheme(language: string | null) {
  return COMMUNITY_THEMES[language ?? 'DEFAULT'] ?? COMMUNITY_THEMES.DEFAULT;
}

function CommunityLogo({ guild, large = false }: { guild: GuildData; large?: boolean }) {
  const theme = getCommunityTheme(guild.language);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl border-4 border-dd-bg font-black shadow-lg',
        theme.logo,
        large ? 'h-16 w-16 text-2xl' : 'h-14 w-14 text-xl'
      )}
      aria-hidden="true"
    >
      {guild.icon || guild.name[0]?.toUpperCase() || 'C'}
    </div>
  );
}

interface CommunityCardProps {
  guild: GuildData;
  isMember: boolean;
  joining: boolean;
  onJoin: (guild: GuildData) => void;
}

function CommunityCard({ guild, isMember, joining, onJoin }: CommunityCardProps) {
  const theme = getCommunityTheme(guild.language);

  return (
    <article className="group overflow-hidden rounded-2xl border border-dd-border bg-dd-card transition-colors hover:border-dd-muted/60">
      <Link
        href={`/guilds/${guild.slug}`}
        aria-label={`Abrir comunidade ${guild.name}`}
        className={cn('relative block h-20 overflow-hidden bg-gradient-to-br', theme.cover)}
      >
        <span className="absolute -right-7 -top-10 h-28 w-28 rounded-full bg-white/15 blur-sm" />
        <span className="absolute left-4 top-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
          Comunidade Stacklyst
        </span>
      </Link>

      <div className="px-4 pb-4">
        <div className="-mt-7 flex items-end justify-between gap-3">
          <Link href={`/guilds/${guild.slug}`} className="relative rounded-2xl">
            <CommunityLogo guild={guild} />
          </Link>
          {isMember ? (
            <Link
              href={`/guilds/${guild.slug}`}
              className="dd-focus-ring mb-1 inline-flex h-8 items-center gap-1.5 rounded-full border border-dd-border px-3 text-[11px] font-bold text-dd-text transition-colors hover:bg-dd-surface"
            >
              <Check className="h-3.5 w-3.5" />
              Participando
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onJoin(guild)}
              disabled={joining}
              className="dd-focus-ring mb-1 inline-flex h-8 min-w-20 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-dd-text px-3 text-[11px] font-black text-dd-bg transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
            >
              {joining ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Participar
            </button>
          )}
        </div>

        <div className="mt-3 min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={`/guilds/${guild.slug}`}
              className="truncate text-sm font-extrabold text-dd-text hover:underline"
            >
              {guild.name}
            </Link>
            {guild.language && <LanguageTag language={guild.language as Language} size="sm" />}
          </div>
          <p className="mt-1 min-h-10 text-[11px] leading-5 text-dd-muted line-clamp-2">
            {guild.description || 'Um espaço para aprender, compartilhar e evoluir em conjunto.'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-dd-border/60 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <AuthorAvatar
              username={guild.owner.username}
              avatar_url={guild.owner.avatar_url}
              className="h-6 w-6 text-[9px]"
            />
            <span className="truncate text-[10px] text-dd-muted">por @{guild.owner.username}</span>
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-dd-muted">
            {guild.memberCount.toLocaleString('pt-BR')}{' '}
            {guild.memberCount === 1 ? 'membro' : 'membros'}
          </span>
        </div>
      </div>
    </article>
  );
}

function CommunityGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Carregando comunidades">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-dd-border">
          <div className="h-20 animate-pulse bg-dd-surface/80" />
          <div className="space-y-3 px-4 pb-4 pt-8">
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-dd-surface" />
            <div className="h-8 animate-pulse rounded-lg bg-dd-surface/60" />
            <div className="h-7 animate-pulse rounded-lg bg-dd-surface/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuildsClient({ initialGuilds = [], initialMyGuilds = [] }: GuildsClientProps) {
  const router = useRouter();
  const [guilds, setGuilds] = useState<GuildData[]>(initialGuilds);
  const [myGuilds, setMyGuilds] = useState<GuildData[]>(initialMyGuilds);
  const [activeTab, setActiveTab] = useState<CommunityTab>('discover');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createLanguage, setCreateLanguage] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [joiningGuildId, setJoiningGuildId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [loadingGuilds, setLoadingGuilds] = useState(
    initialGuilds.length === 0 && initialMyGuilds.length === 0
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser<any>()
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialGuilds.length > 0 || initialMyGuilds.length > 0) return;

    let active = true;
    setLoadingGuilds(true);
    fetch('/api/guilds', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Não foi possível carregar as comunidades.');
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setGuilds(data.guilds ?? []);
        setMyGuilds(data.myGuilds ?? []);
      })
      .catch((error: Error) => {
        if (active) setListError(error.message);
      })
      .finally(() => {
        if (active) setLoadingGuilds(false);
      });

    return () => {
      active = false;
    };
  }, [initialGuilds.length, initialMyGuilds.length]);

  const myGuildIds = useMemo(() => new Set(myGuilds.map((guild) => guild.id)), [myGuilds]);
  const sourceGuilds = activeTab === 'mine' ? myGuilds : guilds;
  const filteredGuilds = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('pt-BR');

    return sourceGuilds.filter((guild) => {
      const matchesLanguage = !languageFilter || guild.language === languageFilter;
      const matchesSearch =
        !normalizedQuery ||
        guild.name.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        guild.description?.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ||
        guild.owner.username.toLocaleLowerCase('pt-BR').includes(normalizedQuery);
      return matchesLanguage && matchesSearch;
    });
  }, [languageFilter, searchQuery, sourceGuilds]);

  const openCreateForm = () => {
    setCreateError(null);
    setShowCreateForm(true);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!createName.trim() || createName.trim().length < 3) {
      setCreateError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch('/api/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim() || null,
          language: createLanguage || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setCreateError(data.message || 'Não foi possível criar a comunidade.');
        return;
      }

      setCreateName('');
      setCreateDescription('');
      setCreateLanguage('');
      setShowCreateForm(false);
      router.push(`/guilds/${data.slug}`);
    } catch {
      setCreateError('Erro de conexão. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (guild: GuildData) => {
    setJoiningGuildId(guild.id);
    setListError(null);
    try {
      const response = await fetch(`/api/guilds/${guild.id}/members`, { method: 'POST' });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Não foi possível participar desta comunidade.');
      }

      const joinedGuild = { ...guild, isMember: true, memberCount: guild.memberCount + 1 };
      setGuilds((current) => current.map((item) => (item.id === guild.id ? joinedGuild : item)));
      setMyGuilds((current) =>
        current.some((item) => item.id === guild.id) ? current : [joinedGuild, ...current]
      );
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Não foi possível participar.');
    } finally {
      setJoiningGuildId(null);
    }
  };

  const changeTab = (tab: CommunityTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setLanguageFilter('');
  };

  const hasFilters = Boolean(searchQuery.trim() || languageFilter);

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <div className="dd-platform-body flex min-w-0 flex-grow flex-col md:flex-row xl:max-w-[950px]">
        <main className="dd-platform-main min-h-screen w-full max-w-[600px] flex-grow border-r border-dd-border/80 pb-24 md:pb-8">
          <header className="sticky top-0 z-30 border-b border-dd-border/70 bg-dd-bg/95 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between px-4 sm:px-5">
              <div>
                <h1 className="text-lg font-black tracking-tight text-dd-text">Comunidades</h1>
                <p className="text-[10px] text-dd-muted">Encontre pessoas que aprendem como você</p>
              </div>
              <button
                type="button"
                onClick={openCreateForm}
                className="dd-focus-ring dd-touch inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500 px-3.5 text-xs font-black text-white transition-colors hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Criar comunidade</span>
                <span className="sm:hidden">Criar</span>
              </button>
            </div>

            <div role="tablist" aria-label="Seções de comunidades" className="flex">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'mine'}
                onClick={() => changeTab('mine')}
                className={cn(
                  'relative h-11 flex-1 cursor-pointer text-xs font-bold transition-colors hover:bg-dd-surface/35',
                  activeTab === 'mine' ? 'text-dd-text' : 'text-dd-muted'
                )}
              >
                Suas comunidades
                {activeTab === 'mine' && (
                  <span className="absolute inset-x-1/3 bottom-0 h-0.5 rounded-full bg-blue-500" />
                )}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'discover'}
                onClick={() => changeTab('discover')}
                className={cn(
                  'relative h-11 flex-1 cursor-pointer text-xs font-bold transition-colors hover:bg-dd-surface/35',
                  activeTab === 'discover' ? 'text-dd-text' : 'text-dd-muted'
                )}
              >
                Descobrir
                {activeTab === 'discover' && (
                  <span className="absolute inset-x-1/3 bottom-0 h-0.5 rounded-full bg-blue-500" />
                )}
              </button>
            </div>
          </header>

          <div className="border-b border-dd-border/60 px-4 py-3 sm:px-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dd-muted" />
              <input
                type="search"
                aria-label="Buscar comunidades"
                placeholder="Buscar por nome, assunto ou criador"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="dd-focus-ring h-10 w-full rounded-full border border-dd-search-border bg-dd-search-bg pl-10 pr-4 text-xs text-dd-text outline-none placeholder:text-dd-muted transition-colors focus:border-blue-500/60"
              />
            </div>

            {activeTab === 'discover' && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {LANGUAGE_OPTIONS.slice(0, 7).map((option) => (
                  <button
                    key={option.value || 'all'}
                    type="button"
                    onClick={() => setLanguageFilter(option.value)}
                    className={cn(
                      'dd-focus-ring shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors',
                      languageFilter === option.value
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-dd-border text-dd-muted hover:bg-dd-surface hover:text-dd-text'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="px-4 py-5 sm:px-5" aria-live="polite">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500">
                  {activeTab === 'mine' ? 'Seu espaço' : 'Para você'}
                </p>
                <h2 className="mt-1 text-base font-black text-dd-text">
                  {activeTab === 'mine' ? 'Suas comunidades' : 'Descubra comunidades'}
                </h2>
              </div>
              {!loadingGuilds && filteredGuilds.length > 0 && (
                <span className="text-[10px] font-semibold text-dd-muted">
                  {filteredGuilds.length}{' '}
                  {filteredGuilds.length === 1 ? 'comunidade' : 'comunidades'}
                </span>
              )}
            </div>

            {listError && (
              <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
                {listError}
              </div>
            )}

            {loadingGuilds ? (
              <CommunityGridSkeleton />
            ) : filteredGuilds.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredGuilds.map((guild) => (
                  <CommunityCard
                    key={guild.id}
                    guild={guild}
                    isMember={Boolean(guild.isMember || myGuildIds.has(guild.id))}
                    joining={joiningGuildId === guild.id}
                    onJoin={handleJoin}
                  />
                ))}
              </div>
            ) : hasFilters ? (
              <div className="flex flex-col items-center rounded-2xl border border-dd-border px-6 py-14 text-center">
                <Search className="h-8 w-8 text-dd-muted/55" />
                <h3 className="mt-4 text-sm font-black text-dd-text">
                  Nenhuma comunidade encontrada
                </h3>
                <p className="mt-1 max-w-sm text-xs leading-5 text-dd-muted">
                  Tente outro nome, criador ou assunto para continuar explorando.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setLanguageFilter('');
                  }}
                  className="mt-4 cursor-pointer text-xs font-bold text-blue-500 hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : activeTab === 'mine' ? (
              <div className="relative overflow-hidden rounded-3xl border border-dd-border bg-dd-surface/25 px-6 py-14 text-center">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-violet-600" />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                  <UsersRound className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-black text-dd-text">Encontre a sua turma</h3>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-dd-muted">
                  Participe de uma comunidade para acompanhar pessoas, ideias e conversas sobre os
                  assuntos que você curte.
                </p>
                <button
                  type="button"
                  onClick={() => changeTab('discover')}
                  className="mt-5 cursor-pointer rounded-full bg-blue-500 px-5 py-2.5 text-xs font-black text-white transition-colors hover:bg-blue-600"
                >
                  Explorar comunidades
                </button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl border border-dd-border bg-dd-surface/25 px-6 py-14 text-center">
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl" />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                  <Compass className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-black text-dd-text">Crie a primeira comunidade</h3>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-dd-muted">
                  Reúna devs em torno de uma tecnologia, projeto ou objetivo de aprendizado.
                </p>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 cursor-pointer rounded-full bg-dd-text px-5 py-2.5 text-xs font-black text-dd-bg transition-opacity hover:opacity-85"
                >
                  Criar comunidade
                </button>
              </div>
            )}
          </section>
        </main>

        <aside className="hidden w-[350px] shrink-0 px-5 py-5 xl:block">
          <div className="sticky top-5 space-y-4">
            <section className="overflow-hidden rounded-2xl border border-dd-border bg-dd-surface/25">
              <div className="bg-gradient-to-br from-blue-600/25 via-cyan-500/10 to-transparent px-5 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                  <UsersRound className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-black text-dd-text">Comunidades no Stacklyst</h2>
                <p className="mt-1 text-xs leading-5 text-dd-muted">
                  Espaços dedicados para trocar experiências e evoluir com quem compartilha seus
                  interesses.
                </p>
              </div>
              <div className="space-y-4 border-t border-dd-border/60 px-5 py-4">
                <div className="flex gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-dd-text">Conversas relevantes</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-dd-muted">
                      Foco no assunto que uniu a comunidade.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-dd-text">Espaços moderados</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-dd-muted">
                      Criadores ajudam a manter as conversas saudáveis.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-dd-text">Novas conexões</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-dd-muted">
                      Descubra pessoas que aprendem junto com você.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={openCreateForm}
              className="dd-focus-ring flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-dd-border py-2.5 text-xs font-black text-dd-text transition-colors hover:bg-dd-surface"
            >
              <Plus className="h-4 w-4" />
              Criar uma comunidade
            </button>
          </div>
        </aside>
      </div>

      {showCreateForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creating) setShowCreateForm(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-community-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-dd-border bg-dd-bg shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-dd-border/70 bg-dd-bg/95 px-5 py-4 backdrop-blur-xl">
              <div>
                <h2 id="create-community-title" className="text-base font-black text-dd-text">
                  Criar uma Comunidade
                </h2>
                <p className="mt-0.5 text-[10px] text-dd-muted">
                  Crie um espaço com propósito claro
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                aria-label="Fechar"
                className="dd-focus-ring dd-touch flex cursor-pointer items-center justify-center rounded-full text-dd-muted transition-colors hover:bg-dd-surface hover:text-dd-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="community-name" className="text-xs font-bold text-dd-text">
                    Nome
                  </label>
                  <span className="text-[10px] text-dd-muted">{createName.length}/50</span>
                </div>
                <input
                  id="community-name"
                  type="text"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  placeholder="Ex.: Front-end Brasil"
                  maxLength={50}
                  minLength={3}
                  required
                  autoFocus
                  className="dd-focus-ring h-11 w-full rounded-xl border border-dd-border bg-dd-surface/35 px-3.5 text-sm text-dd-text outline-none placeholder:text-dd-muted focus:border-blue-500/60"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="community-description" className="text-xs font-bold text-dd-text">
                    Descrição
                  </label>
                  <span className="text-[10px] text-dd-muted">{createDescription.length}/160</span>
                </div>
                <textarea
                  id="community-description"
                  value={createDescription}
                  onChange={(event) => setCreateDescription(event.target.value)}
                  placeholder="Conte para as pessoas sobre o que vocês vão conversar."
                  rows={4}
                  maxLength={160}
                  className="dd-focus-ring w-full resize-none rounded-xl border border-dd-border bg-dd-surface/35 px-3.5 py-3 text-xs leading-5 text-dd-text outline-none placeholder:text-dd-muted focus:border-blue-500/60"
                />
              </div>

              <div>
                <label
                  htmlFor="community-language"
                  className="mb-1.5 block text-xs font-bold text-dd-text"
                >
                  Assunto principal
                </label>
                <select
                  id="community-language"
                  value={createLanguage}
                  onChange={(event) => setCreateLanguage(event.target.value)}
                  className="dd-focus-ring h-11 w-full cursor-pointer rounded-xl border border-dd-border bg-dd-surface/35 px-3.5 text-xs text-dd-text outline-none focus:border-blue-500/60"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 rounded-xl border border-dd-border/70 bg-dd-surface/25 p-3.5">
                <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <div>
                  <p className="text-xs font-bold text-dd-text">Comunidade pública</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-dd-muted">
                    Qualquer pessoa poderá encontrar e participar desta comunidade.
                  </p>
                </div>
              </div>

              {createError && (
                <p role="alert" className="text-xs font-semibold text-red-400">
                  {createError}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t border-dd-border/60 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                  className="cursor-pointer rounded-full px-4 py-2.5 text-xs font-bold text-dd-text transition-colors hover:bg-dd-surface disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || createName.trim().length < 3}
                  className="inline-flex min-w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-xs font-black text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {creating ? 'Criando...' : 'Criar comunidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
