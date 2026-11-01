'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Lock,
  Search,
  Sparkles,
  Trophy,
  SlidersHorizontal,
  X,
  ExternalLink,
} from 'lucide-react';
import type {
  AchievementProgress,
  ProfileCatalog,
  ProfileCustomizationState,
  ProfilePreferences,
} from '@/lib/profile-customization';
import { getAchievementInstructions } from '@/lib/profile-customization';
import { contrastRatio, foregroundOn } from '@/lib/profile-style';

interface TitlesShowcaseViewProps {
  initialData: ProfileCustomizationState;
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
}

type FilterType = 'all' | 'owned' | 'unowned' | 'events';
type CategoryType = 'all' | 'posts' | 'comments' | 'community' | 'learning' | 'event';

function getPillStyle(titleName: string, color: string) {
  const norm = titleName.toLowerCase();
  if (norm.includes('primordial')) {
    return {
      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #d946ef 100%)',
      color: '#ffffff',
    };
  }
  if (norm.includes('oficial')) {
    return {
      background: '#facc15',
      color: '#090a0f',
    };
  }
  if (norm.includes('meangirl')) {
    return {
      background: '#ec4899',
      color: '#ffffff',
    };
  }
  if (norm.includes('muuuu')) {
    return {
      background: '#ffffff',
      color: '#090a0f',
    };
  }
  if (norm.includes('pastel')) {
    return {
      background: '#fef08a',
      color: '#18181b',
    };
  }
  if (norm.includes('estrela')) {
    return {
      background: '#ef4444',
      color: '#ffffff',
    };
  }
  if (norm.includes('abóbora') || norm.includes('abobora')) {
    return {
      background: '#ea580c',
      color: '#ffffff',
    };
  }
  if (norm.includes('bruxa')) {
    return {
      background: '#9333ea',
      color: '#ffffff',
    };
  }
  if (norm.includes('fogaréu') || norm.includes('fogareu')) {
    return {
      background: '#f97316',
      color: '#ffffff',
    };
  }

  const foreground = foregroundOn(color);
  const textColor = contrastRatio(foreground, color) >= 4.5 ? foreground : '#000000';
  return {
    background: color,
    color: textColor,
  };
}

export function TitlesShowcaseView({ initialData, user }: TitlesShowcaseViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preferences, setPreferences] = useState<ProfilePreferences>(initialData.preferences);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [equippingId, setEquippingId] = useState<string | null>(null);

  const achievements = initialData.achievements;
  const events = initialData.catalog.events;

  const totalTitles = achievements.length;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const unlockedPercent = totalTitles > 0 ? Math.round((unlockedCount / totalTitles) * 100) : 0;

  const equippedTitle = useMemo(() => {
    if (!preferences.equippedTitleId) return null;
    return achievements.find((a) => a.id === preferences.equippedTitleId) ?? null;
  }, [preferences.equippedTitleId, achievements]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleEquipTitle = async (achievementId: string | null) => {
    const previousId = preferences.equippedTitleId;
    const nextPreferences: ProfilePreferences = {
      ...preferences,
      equippedTitleId: achievementId,
    };

    // Optimistic UI update
    setPreferences(nextPreferences);
    setEquippingId(achievementId || previousId);

    const titleObj = achievementId ? achievements.find((a) => a.id === achievementId) : null;

    try {
      const response = await fetch('/api/profile/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: initialData.version,
          preferences: nextPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar título');
      }

      if (achievementId && titleObj) {
        showToast(`Título "${titleObj.name}" equipado no seu perfil!`, 'success');
      } else {
        showToast('Título removido do perfil.', 'success');
      }
    } catch {
      // Rollback on failure
      setPreferences({
        ...preferences,
        equippedTitleId: previousId,
      });
      showToast('Não foi possível salvar o título. Tente novamente.', 'error');
    } finally {
      setEquippingId(null);
    }
  };

  // Filtered titles
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const instructions = getAchievementInstructions(item, events);

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesFlavor = instructions.flavorText.toLowerCase().includes(q);
        const matchesHowTo = instructions.howToObtain.toLowerCase().includes(q);
        if (!matchesName && !matchesFlavor && !matchesHowTo) {
          return false;
        }
      }

      // Filter match
      if (filter === 'owned' && !item.unlocked) return false;
      if (filter === 'unowned' && item.unlocked) return false;
      if (filter === 'events' && item.category !== 'event') return false;

      // Category match
      if (category !== 'all' && item.category !== category) return false;

      return true;
    });
  }, [achievements, events, searchQuery, filter, category]);

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 font-sans pb-16">
      {/* Toast notification */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#0f1b2b] text-blue-200 border-blue-500/40 shadow-blue-500/10'
              : 'bg-[#2b1010] text-red-200 border-red-500/40 shadow-red-500/10'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <X className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </aside>
      )}

      {/* Top Header - Mobile Mode (Matches reference images 1:1) */}
      <header className="sticky top-0 z-30 bg-[#08090d]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 sm:py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/feed');
              }
            }}
            aria-label="Voltar"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors text-zinc-200"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Títulos
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
            {unlockedCount}/{totalTitles}
          </span>
          <Link
            href="/personalize?section=identity"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 transition-colors"
          >
            Personalizar
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
        {/* Desktop Hero Banner & Status (only shows on sm and up) */}
        <section className="hidden sm:block mb-6 p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0f1118] to-[#0a0c10] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-blue-400" />
                Conquistas & Títulos do Stacklyst
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Coleção de Títulos
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Acompanhe o que falta para desbloquear cada título e escolha qual exibir com orgulho
                nas suas postagens e no perfil.
              </p>
            </div>

            {/* Quick overview metric */}
            <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5 bg-black/40 border border-white/[0.06] p-3.5 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Progresso total:</span>
                <span className="font-bold text-white text-sm">
                  {unlockedCount} de {totalTitles} ({unlockedPercent}%)
                </span>
              </div>
              <div className="w-44 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${unlockedPercent}%` }}
                />
              </div>
              {equippedTitle && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <span>Equipado:</span>
                  <span
                    className="font-semibold text-xs px-2 py-0.5 rounded-full"
                    style={getPillStyle(equippedTitle.name, equippedTitle.color)}
                  >
                    {equippedTitle.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="mb-4 sm:mb-6 space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, objetivo ou hashtag..."
              className="w-full bg-[#101218] border border-white/[0.08] focus:border-blue-500/50 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                filter === 'all'
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 border border-white/[0.06]'
              }`}
            >
              Todos ({totalTitles})
            </button>
            <button
              type="button"
              onClick={() => setFilter('owned')}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                filter === 'owned'
                  ? 'bg-blue-500 text-white font-bold shadow-sm shadow-blue-500/20'
                  : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 border border-white/[0.06]'
              }`}
            >
              Você possui ({unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unowned')}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                filter === 'unowned'
                  ? 'bg-zinc-700 text-white font-bold shadow-sm'
                  : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 border border-white/[0.06]'
              }`}
            >
              Você não possui ({totalTitles - unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('events')}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                filter === 'events'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 border border-white/[0.06]'
              }`}
            >
              Eventos ({achievements.filter((a) => a.category === 'event').length})
            </button>
          </div>
        </section>

        {/* Empty state */}
        {filteredAchievements.length === 0 && (
          <div className="py-12 text-center rounded-2xl border border-white/[0.06] bg-[#0c0d12]/60 px-4">
            <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-300">Nenhum título encontrado</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Tente buscar por outro termo ou remova os filtros selecionados para visualizar outros
              títulos.
            </p>
            {(searchQuery || filter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Cards Grid: 1 column on mobile (matching reference 1:1), 2 columns on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
          {filteredAchievements.map((achievement) => {
            const isEquipped = preferences.equippedTitleId === achievement.id;
            const instructions = getAchievementInstructions(achievement, events);
            const pillStyle = getPillStyle(achievement.name, achievement.color);
            const target = achievement.requirement.target;
            const progress = Math.min(achievement.progress, target);
            const isBusy = equippingId === achievement.id;

            return (
              <article
                key={achievement.id}
                className="rounded-2xl border border-white/[0.08] bg-[#0d0e14] hover:border-white/[0.14] transition-all p-4 sm:p-5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Top Header: Title Pill on left + Equip Action on right */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
                      style={pillStyle}
                    >
                      {achievement.name}
                    </span>

                    {/* Quick equip / unequip action for unlocked titles */}
                    {achievement.unlocked && (
                      <div className="flex items-center gap-1.5">
                        {isEquipped ? (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/35 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              Em uso
                            </span>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleEquipTitle(null)}
                              className="text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded transition-colors"
                              title="Retirar título do perfil"
                            >
                              Retirar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleEquipTitle(achievement.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[11px] font-semibold px-3 py-1 transition-all shadow-sm disabled:opacity-50"
                          >
                            Usar título
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Indicator (Identical to reference screenshot) */}
                  <div className="mt-3 flex items-start gap-2">
                    {achievement.unlocked ? (
                      <div className="flex items-center gap-2">
                        {/* Blue check icon in circle */}
                        <div className="w-4.5 h-4.5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-[14px] font-semibold text-white/95 tracking-tight">
                          Você possui
                        </span>
                      </div>
                    ) : instructions.isUnavailable ? (
                      <div className="flex items-start gap-2">
                        <Lock className="w-4.5 h-4.5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[14px] font-normal text-zinc-400 tracking-tight leading-tight">
                            Você não possui
                          </p>
                          <p className="text-[12px] text-zinc-500 mt-0.5">
                            Indisponível para obter
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Empty circle icon */}
                        <Circle className="w-4.5 h-4.5 text-zinc-500 shrink-0 stroke-[1.8]" />
                        <span className="text-[14px] font-normal text-zinc-400 tracking-tight">
                          Você não possui
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Flavor text / Lore description */}
                  {instructions.flavorText && (
                    <p className="mt-2 text-[13px] text-zinc-300 leading-snug">
                      {instructions.flavorText}
                    </p>
                  )}

                  {/* "Como obter" Box (The dedicated nested rounded container from screenshots) */}
                  <div className="mt-3.5 rounded-xl bg-black/60 border border-white/[0.07] p-3.5 sm:p-4">
                    <h3 className="text-[12px] font-bold text-zinc-200 mb-1 tracking-tight">
                      Como obter
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-zinc-400 leading-relaxed">
                      {instructions.howToObtain}
                    </p>
                  </div>
                </div>

                {/* Progress bar for locked titles with progress */}
                {!achievement.unlocked && !instructions.isUnavailable && target > 1 && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.05]">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-medium">
                      <span>Progresso:</span>
                      <span>
                        {progress.toLocaleString('pt-BR')} / {target.toLocaleString('pt-BR')} (
                        {Math.round((progress / target) * 100)}%)
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={target}
                      aria-label={`Progresso de ${achievement.name}`}
                      className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.round((progress / target) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
