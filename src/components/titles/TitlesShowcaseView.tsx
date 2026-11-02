'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CheckCircle2, Circle, Lock, Search, X } from 'lucide-react';
import { ProfileTitle } from '@/components/profile/ProfileIdentity';
import { invalidateCurrentUser } from '@/lib/client/current-user';
import type { ProfileCustomizationState, ProfilePreferences } from '@/lib/profile-customization';
import { getAchievementInstructions } from '@/lib/profile-customization';
import styles from './TitlesShowcaseView.module.css';

interface TitlesShowcaseViewProps {
  initialData: ProfileCustomizationState;
  user: { id: string; username: string; avatar_url?: string | null };
}

type FilterType = 'all' | 'owned' | 'unowned' | 'events';
const filters: { value: FilterType; label: string; accessibleLabel: string }[] = [
  { value: 'all', label: 'Todos', accessibleLabel: 'Todos os títulos' },
  { value: 'owned', label: 'Seus', accessibleLabel: 'Você possui' },
  { value: 'unowned', label: 'A conquistar', accessibleLabel: 'Você não possui' },
  { value: 'events', label: 'Eventos', accessibleLabel: 'Títulos de eventos' },
];

export function TitlesShowcaseView({ initialData }: TitlesShowcaseViewProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<ProfilePreferences>(initialData.preferences);
  const [version, setVersion] = useState(initialData.version);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const saving = useRef(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  const achievements = initialData.achievements;
  const events = initialData.catalog.events;
  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const equippedTitle = achievements.find((item) => item.id === preferences.equippedTitleId);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  const handleEquipTitle = async (achievementId: string | null) => {
    if (saving.current) return;
    if (achievementId && !achievements.some((item) => item.id === achievementId && item.unlocked))
      return;
    saving.current = true;
    const previousPreferences = preferences;
    const nextPreferences = { ...preferences, equippedTitleId: achievementId };
    const title = achievements.find((item) => item.id === achievementId);
    setPreferences(nextPreferences);
    setEquippingId(achievementId || preferences.equippedTitleId);
    try {
      const response = await fetch('/api/profile/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, preferences: nextPreferences }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 409
            ? 'Seu perfil mudou em outra aba. Recarregue a página antes de escolher outro título.'
            : result.message || 'Não foi possível salvar o título. Tente novamente.'
        );
      if (typeof result.version === 'number') setVersion(result.version);
      if (result.preferences) setPreferences(result.preferences);
      invalidateCurrentUser();
      window.dispatchEvent(new Event('stacklyst:profile-customization'));
      router.refresh();
      showToast(
        title ? `Título “${title.name}” equipado no seu perfil.` : 'Título removido do perfil.'
      );
    } catch (failure) {
      setPreferences(previousPreferences);
      showToast(
        failure instanceof Error
          ? failure.message
          : 'Não foi possível salvar o título. Tente novamente.',
        'error'
      );
    } finally {
      saving.current = false;
      setEquippingId(null);
    }
  };

  const filteredAchievements = useMemo(
    () =>
      achievements.filter((item) => {
        if (filter === 'owned' && !item.unlocked) return false;
        if (filter === 'unowned' && item.unlocked) return false;
        if (filter === 'events' && item.category !== 'event') return false;
        const query = searchQuery.trim().toLocaleLowerCase('pt-BR');
        if (!query) return true;
        const instructions = getAchievementInstructions(item, events, achievements);
        return [item.name, instructions.flavorText, instructions.howToObtain].some((value) =>
          value.toLocaleLowerCase('pt-BR').includes(query)
        );
      }),
    [achievements, events, searchQuery, filter]
  );

  return (
    <section className={styles.surface} aria-label="Coleção de títulos">
      <header className={styles.header}>
        <div className={styles.toolbar}>
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? router.back() : router.push('/feed'))}
            aria-label="Voltar"
            className={styles.iconButton}
          >
            <ArrowLeft size={21} />
          </button>
          <h1>Títulos</h1>
          <span
            className={styles.collectionCount}
            aria-label={`${unlockedCount} de ${achievements.length} títulos conquistados`}
          >
            {unlockedCount}
            <span aria-hidden="true"> / {achievements.length}</span>
          </span>
          <button
            type="button"
            aria-label={searchOpen ? 'Fechar busca' : 'Buscar títulos'}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
            className={styles.iconButton}
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>
        <div className={styles.tabs} role="group" aria-label="Filtrar títulos">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-label={item.accessibleLabel}
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={styles.tab}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.collectionIntro}>
        <p>Conquiste um título e leve sua história para o perfil.</p>
        <Link href="/personalize?section=identity">Personalizar perfil</Link>
        <Link href="/certificates">Badges e certificados de cursos</Link>
      </div>
      <div className={`${styles.search} ${searchOpen ? styles.searchOpen : ''}`}>
        <Search size={18} aria-hidden="true" />
        <input
          ref={searchInput}
          type="search"
          aria-label="Buscar títulos"
          placeholder="Buscar por título, objetivo ou hashtag..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Limpar busca"
            className={styles.iconButton}
            onClick={() => {
              setSearchQuery('');
              searchInput.current?.focus();
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      {equippedTitle && (
        <div className={styles.equippedPreview}>
          <span>No seu perfil</span>
          <ProfileTitle title={equippedTitle} className={styles.titlePill} />
        </div>
      )}

      {filteredAchievements.length ? (
        <div className={styles.list} aria-label="Títulos disponíveis">
          {filteredAchievements.map((achievement) => {
            const instructions = getAchievementInstructions(achievement, events, achievements);
            const isEquipped = preferences.equippedTitleId === achievement.id;
            const target = achievement.requirement.target;
            const progress = Math.max(0, Math.min(achievement.progress, target));
            const busy = equippingId === achievement.id;
            return (
              <article
                key={achievement.id}
                className={styles.item}
                aria-label={`Título ${achievement.name}`}
              >
                <div className={styles.itemHeading}>
                  <ProfileTitle title={achievement} className={styles.titlePill} />
                  {achievement.unlocked && (
                    <div className={styles.equipActions}>
                      {isEquipped && (
                        <span className={styles.inUse}>
                          <Check size={13} aria-hidden="true" />
                          Em uso
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={equippingId !== null}
                        className={styles.equipButton}
                        onClick={() => void handleEquipTitle(isEquipped ? null : achievement.id)}
                        aria-label={isEquipped ? 'Retirar' : `Usar título ${achievement.name}`}
                      >
                        {busy ? 'Salvando…' : isEquipped ? 'Retirar' : 'Usar título'}
                      </button>
                    </div>
                  )}
                </div>
                <div className={`${styles.ownership} ${achievement.unlocked ? styles.owned : ''}`}>
                  {achievement.unlocked ? (
                    <CheckCircle2 size={20} aria-hidden="true" />
                  ) : instructions.isUnavailable ? (
                    <Lock size={19} aria-hidden="true" />
                  ) : (
                    <Circle size={20} aria-hidden="true" />
                  )}
                  <div>
                    <p>{achievement.unlocked ? 'Você possui' : 'Você não possui'}</p>
                    {!achievement.unlocked && instructions.isUnavailable && (
                      <span>Indisponível para obter</span>
                    )}
                  </div>
                </div>
                <p className={styles.description}>{instructions.flavorText}</p>
                <div className={styles.instructions}>
                  <h2>Como obter</h2>
                  <p>{instructions.howToObtain}</p>
                  {!achievement.unlocked && !instructions.isUnavailable && target > 1 && (
                    <p className={styles.progress}>
                      <span>
                        {progress.toLocaleString('pt-BR')} de {target.toLocaleString('pt-BR')}
                      </span>
                      <span>Faltam {(target - progress).toLocaleString('pt-BR')}</span>
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <Search size={27} aria-hidden="true" />
          <h2>Nenhum título encontrado</h2>
          <p>Tente outro nome, objetivo ou hashtag.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilter('all');
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
      {toast && (
        <div className={styles.toast} role={toast.type === 'error' ? 'alert' : 'status'}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} aria-hidden="true" />
          ) : (
            <Circle size={18} aria-hidden="true" />
          )}
          <p>{toast.message}</p>
          <button type="button" aria-label="Fechar aviso" onClick={() => setToast(null)}>
            <X size={17} />
          </button>
        </div>
      )}
    </section>
  );
}
