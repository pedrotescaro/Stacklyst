'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { PostCard } from '@/components/PostCard';
import { FollowButton } from '@/components/motion/FollowButton';
import { EmptyState } from '@/components/motion/EmptyState';
import { LevelBadge } from '@/components/LevelBadge';
import { getCurrentUser } from '@/lib/client/current-user';
import { Search as SearchIcon, Settings, MoreHorizontal, ArrowLeft } from 'lucide-react';

interface SuggestedUser {
  id: string;
  username: string;
  avatar_url: string | null;
  total_xp: number;
}

export default function ExplorePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [activeTab, setActiveTab] = useState<
    'para_voce' | 'assuntos' | 'noticias' | 'open_source' | 'carreira'
  >('para_voce');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    setSearchQuery(new URLSearchParams(window.location.search).get('q') || '');
  }, []);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchUsers, setSearchUsers] = useState<any[]>([]);
  const [searchTab, setSearchTab] = useState<'posts' | 'users'>('posts');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Follow action state
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchPageData = async () => {
      try {
        const [userData, resSuggestions] = await Promise.all([
          getCurrentUser<any>(),
          fetch('/api/users/suggestions', { signal: controller.signal }),
        ]);

        if (!userData) {
          router.replace('/login');
          return;
        }

        if (!active) return;
        const suggestionsData = resSuggestions.ok
          ? await resSuggestions.json().catch(() => [])
          : [];

        if (!active) return;
        setSuggestions(suggestionsData);
        setUser(userData);

        const resFollowing = await fetch(`/api/users/${userData.id}/following`, {
          signal: controller.signal,
        });
        if (resFollowing.ok) {
          const followingData = await resFollowing.json().catch(() => []);
          if (!active) return;
          const fMap: Record<string, boolean> = {};
          if (Array.isArray(followingData)) {
            followingData.forEach((f: any) => {
              fMap[f.id] = true;
            });
          }
          setFollowingMap(fMap);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Error fetching explore data:', err);
      }
    };

    fetchPageData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [router]);

  const executeSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const resPosts = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&type=posts`);
      if (resPosts.ok) {
        const dataPosts = await resPosts.json();
        setSearchResults(dataPosts.items || []);
      }

      const resUsers = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&type=users`);
      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        setSearchUsers(dataUsers.items || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchUsers([]);
      setHasSearched(false);
      return;
    }
    const timer = setTimeout(() => {
      executeSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchUsers([]);
    setHasSearched(false);
  };

  const handleFollowToggle = async (targetUserId: string) => {
    const isCurrentlyFollowing = !!followingMap[targetUserId];
    const newFollowing = !isCurrentlyFollowing;

    // Optimistic update
    setFollowingMap((prev) => ({
      ...prev,
      [targetUserId]: newFollowing,
    }));

    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to toggle follow status');
      }
      const data = await res.json();
      setFollowingMap((prev) => ({
        ...prev,
        [targetUserId]: data.following,
      }));

      if (data.following) {
        // Refetch suggestions to fill spaces if followed
        setTimeout(async () => {
          const resSuggestions = await fetch('/api/users/suggestions');
          if (resSuggestions.ok) {
            const data = await resSuggestions.json();
            setSuggestions(data);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
      // Rollback
      setFollowingMap((prev) => ({
        ...prev,
        [targetUserId]: isCurrentlyFollowing,
      }));
    }
  };

  const trendsByTab = {
    para_voce: [
      {
        rank: 1,
        language: 'TS',
        languageLabel: 'TypeScript',
        title: 'Como tipar corretamente generics com constraints em TypeScript?',
        views: 43,
        answers: 2,
      },
      {
        rank: 2,
        language: 'PYTHON',
        languageLabel: 'Python',
        title: 'Melhor forma de lidar com async generators em Python 3.12?',
        views: 38,
        answers: 0,
      },
      {
        rank: 3,
        language: 'RUST',
        languageLabel: 'Rust',
        title: "Ownership e lifetimes em Rust: quando usar &'static?",
        views: 55,
        answers: 1,
      },
    ],
    assuntos: [
      {
        rank: 1,
        language: 'TS',
        languageLabel: 'TypeScript',
        title: 'Server Components vs Client Components no Next.js 16',
        views: 91,
        answers: 0,
      },
      {
        rank: 2,
        language: 'RUST',
        languageLabel: 'Rust',
        title: "Ownership e lifetimes em Rust: quando usar &'static?",
        views: 55,
        answers: 1,
      },
      {
        rank: 3,
        language: 'TS',
        languageLabel: 'TypeScript',
        title: 'Como tipar corretamente generics com constraints em TypeScript?',
        views: 43,
        answers: 2,
      },
      {
        rank: 4,
        language: 'GO',
        languageLabel: 'Go',
        title: 'Goroutines vazando memória — como debugar?',
        views: 34,
        answers: 1,
      },
      {
        rank: 5,
        language: 'PYTHON',
        languageLabel: 'Python',
        title: 'Melhor forma de lidar com async generators em Python 3.12?',
        views: 38,
        answers: 0,
      },
    ],
    noticias: [
      {
        rank: 1,
        language: 'JS',
        languageLabel: 'JavaScript',
        title: 'Next.js 16 lançado oficialmente com melhorias de performance no Turbopack',
        views: 120,
        answers: 3,
      },
      {
        rank: 2,
        language: 'TS',
        languageLabel: 'TypeScript',
        title: 'React 19 está estável: o que muda com React Server Actions?',
        views: 98,
        answers: 1,
      },
      {
        rank: 3,
        language: 'JS',
        languageLabel: 'JavaScript',
        title: 'Prisma 6 introduz suporte completo a novas extensões do Postgres',
        views: 76,
        answers: 0,
      },
      {
        rank: 4,
        language: 'TS',
        languageLabel: 'TypeScript',
        title: 'GitHub Copilot Workspace: o futuro do desenvolvimento assistido por IA',
        views: 154,
        answers: 4,
      },
    ],
    open_source: [
      {
        rank: 1,
        language: 'JS',
        languageLabel: 'JavaScript',
        title: 'Como fazer sua primeira contribuição em projetos de código aberto',
        views: 64,
        answers: 2,
      },
      {
        rank: 2,
        language: 'RUST',
        languageLabel: 'Rust',
        title: 'Por que Rust é a linguagem favorita para novos projetos Open Source?',
        views: 89,
        answers: 5,
      },
      {
        rank: 3,
        language: 'JS',
        languageLabel: 'JavaScript',
        title: 'O estado do Open Source em 2026: sustentabilidade e IA',
        views: 47,
        answers: 1,
      },
      {
        rank: 4,
        language: 'GO',
        languageLabel: 'Go',
        title: 'Principais repositórios Git para treinar habilidades de desenvolvimento',
        views: 52,
        answers: 0,
      },
    ],
    carreira: [
      {
        rank: 1,
        language: 'TS',
        languageLabel: 'TypeScript',
        title: 'Como passar em interviews de System Design para vagas sênior',
        views: 180,
        answers: 8,
      },
      {
        rank: 2,
        language: 'JS',
        languageLabel: 'JavaScript',
        title: 'O que as empresas realmente buscam em um currículo de desenvolvedor júnior',
        views: 142,
        answers: 12,
      },
      {
        rank: 3,
        language: 'PYTHON',
        languageLabel: 'Python',
        title: 'Dicas essenciais para negociar salário na área de tecnologia',
        views: 99,
        answers: 3,
      },
      {
        rank: 4,
        language: 'RUST',
        languageLabel: 'Rust',
        title: 'Como transicionar de desenvolvedor pleno para sênior em 1 ano',
        views: 115,
        answers: 4,
      },
    ],
  };

  const currentTrends = trendsByTab[activeTab] || [];

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <div className="flex min-w-0 flex-grow flex-col md:flex-row xl:max-w-[950px]">
        {/* Left Side: Search Feed & Trends (Matching image 2) */}
        <main className="min-h-screen w-full max-w-[600px] flex-grow border-r border-dd-border/80 bg-dd-bg pb-24 md:pb-8">
          {/* Header Search Bar */}
          <div className="sticky top-0 z-30 bg-dd-bg/95 backdrop-blur-md border-b border-dd-border/60 p-3 flex items-center gap-3">
            {hasSearched && (
              <button
                onClick={handleClearSearch}
                className="p-1.5 hover:bg-dd-surface/60 rounded-full transition-colors text-dd-text"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <form onSubmit={handleSearch} className="flex-1 relative">
              <SearchIcon className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dd-muted" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full bg-dd-search-bg border border-dd-search-border focus:border-blue-500/50 focus:bg-dd-bg py-2.5 pl-12 pr-4 text-xs font-semibold text-dd-text placeholder-dd-muted/70 focus:outline-none transition-colors"
              />
            </form>

            <button className="p-2 text-dd-text hover:bg-dd-surface/60 rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* If search results are showing */}
          {hasSearched ? (
            <div className="p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-dd-text">
                  Resultados para &ldquo;{searchQuery}&rdquo;
                </h2>
              </div>

              {/* Search Tabs */}
              <div className="flex border-b border-dd-border/40 bg-dd-bg mb-4">
                {(['posts', 'users'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSearchTab(tab)}
                    className="flex-1 py-3 text-xs font-bold relative hover:bg-dd-surface/30 transition-colors"
                  >
                    <span
                      className={
                        searchTab === tab ? 'text-dd-text font-black' : 'text-dd-muted font-bold'
                      }
                    >
                      {tab === 'posts' ? 'Publicações' : 'Pessoas'}
                    </span>
                    {searchTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>

              {searching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <p className="text-xs text-dd-muted">Buscando...</p>
                </div>
              ) : searchTab === 'posts' ? (
                searchResults.length === 0 ? (
                  <div className="space-y-3">
                    <EmptyState type="search" searchTerm={searchQuery} />
                    <div className="text-center">
                      <button
                        onClick={handleClearSearch}
                        className="text-xs text-blue-400 font-bold hover:underline"
                      >
                        Voltar para assuntos do momento
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {searchResults.map((post) => (
                      <div key={post.id} className="border-b border-dd-border/50 last:border-b-0">
                        <PostCard
                          post={post}
                          isOwner={post.author_id === user?.id}
                          flat={true}
                          onDelete={(postId) => {
                            setSearchResults((prev) => prev.filter((p) => p.id !== postId));
                          }}
                          onEdit={(postId, updatedPost) => {
                            setSearchResults((prev) =>
                              prev.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p))
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )
              ) : searchUsers.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-dd-muted text-center py-12 italic">
                    Nenhum desenvolvedor encontrado.
                  </p>
                  <div className="text-center">
                    <button
                      onClick={handleClearSearch}
                      className="text-xs text-blue-400 font-bold hover:underline"
                    >
                      Voltar para assuntos do momento
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchUsers.map((sugUser) => (
                    <div
                      key={sugUser.id}
                      className="flex items-center justify-between gap-3 p-4 border border-dd-border/50 bg-dd-surface/20 rounded-xl hover:bg-dd-surface/30 transition-colors"
                    >
                      <Link
                        href={`/profile/${sugUser.username}`}
                        className="flex items-center gap-3 min-w-0 group"
                      >
                        {sugUser.avatar_url ? (
                          <Image
                            src={sugUser.avatar_url}
                            alt={sugUser.username}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-dd-border group-hover:scale-105 transition-transform shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10 group-hover:scale-105 transition-transform shrink-0">
                            {sugUser.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-black text-dd-text truncate group-hover:underline">
                              {sugUser.username}
                            </p>
                            <LevelBadge totalXp={sugUser.total_xp ?? 0} />
                          </div>
                          <p className="text-[10px] text-dd-muted font-semibold truncate mt-0.5">
                            @{sugUser.username.toLowerCase()}
                          </p>
                        </div>
                      </Link>

                      {sugUser.id !== user?.id && (
                        <FollowButton
                          isFollowing={!!followingMap[sugUser.id]}
                          onToggle={() => handleFollowToggle(sugUser.id)}
                          size="sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Standard Trends Feed
            <>
              {/* Navigation Tabs */}
              <div className="flex border-b border-dd-border/40 bg-dd-bg overflow-x-auto scrollbar-none">
                {(['para_voce', 'assuntos', 'noticias', 'open_source', 'carreira'] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="py-3.5 px-4 text-xs font-bold whitespace-nowrap relative hover:bg-dd-surface/30 transition-colors"
                    >
                      <span
                        className={
                          activeTab === tab ? 'text-dd-text font-black' : 'text-dd-muted font-bold'
                        }
                      >
                        {tab === 'para_voce'
                          ? 'Para você'
                          : tab === 'assuntos'
                            ? 'Assuntos do Momento'
                            : tab === 'noticias'
                              ? 'Notícias'
                              : tab === 'open_source'
                                ? 'Open Source'
                                : 'Carreira'}
                      </span>
                      {activeTab === tab && (
                        <motion.div
                          layoutId="exploreTabIndicator"
                          className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-500 rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Trends List */}
              <div className="divide-y divide-dd-border/40">
                {currentTrends.map((trend, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchQuery(trend.title);
                      setHasSearched(true);
                      setSearchTab('posts');
                      executeSearch(trend.title);
                    }}
                    className="p-4.5 flex justify-between hover:bg-dd-surface/25 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 w-full pr-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-dd-muted font-bold">
                        <span className="font-mono text-blue-500 font-extrabold">
                          # {trend.rank}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-blue-400">{trend.languageLabel}</span>
                      </div>
                      <p className="text-sm font-black text-dd-text leading-snug mt-0.5">
                        {trend.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-dd-muted mt-0.5">
                        <span>{trend.views} visualizações</span>
                        <span>·</span>
                        <span>
                          {trend.answers} {trend.answers === 1 ? 'resposta' : 'respostas'}
                        </span>
                      </div>
                    </div>
                    <button className="text-dd-muted hover:text-dd-text self-start p-1.5 rounded-full transition-colors">
                      <MoreHorizontal className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        {/* Right Side: Who to Follow Widget (Matching image 2) */}
        <aside className="hidden w-[350px] shrink-0 space-y-4 p-5 xl:block">
          <div className="bg-dd-sidebar-bg border border-dd-border rounded-2xl p-4 space-y-4">
            <h3 className="text-sm font-black text-dd-text">Quem seguir</h3>

            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <p className="text-xs text-dd-muted">Nenhuma sugestão disponível no momento.</p>
              ) : (
                suggestions.map((sugUser) => (
                  <div key={sugUser.id} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/profile/${sugUser.username}`}
                      className="flex items-center gap-3 min-w-0 group"
                    >
                      {sugUser.avatar_url ? (
                        <Image
                          src={sugUser.avatar_url}
                          alt={sugUser.username}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-dd-border group-hover:scale-105 transition-transform shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10 group-hover:scale-105 transition-transform shrink-0">
                          {sugUser.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-black text-dd-text truncate group-hover:underline">
                            {sugUser.username}
                          </p>
                        </div>
                        <p className="text-[10px] text-dd-muted font-semibold truncate">
                          @{sugUser.username.toLowerCase()}
                        </p>
                      </div>
                    </Link>

                    <FollowButton
                      isFollowing={!!followingMap[sugUser.id]}
                      onToggle={() => handleFollowToggle(sugUser.id)}
                      size="sm"
                    />
                  </div>
                ))
              )}
            </div>

            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors block pt-2">
              Mostrar mais
            </button>
          </div>

          {/* Subtle footer */}
          <div className="px-4 text-[10px] text-dd-muted leading-normal space-y-2">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <span className="hover:underline cursor-pointer">Termos de Serviço</span>
              <span>|</span>
              <span className="hover:underline cursor-pointer">Política de Privacidade</span>
              <span>|</span>
              <span className="hover:underline cursor-pointer">Política de cookies</span>
              <span>|</span>
              <span className="hover:underline cursor-pointer">Acessibilidade</span>
              <span>|</span>
              <span className="hover:underline cursor-pointer">Informações de anúncios</span>
            </div>
            <p>© {new Date().getFullYear()} Stacklyst Corp.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
