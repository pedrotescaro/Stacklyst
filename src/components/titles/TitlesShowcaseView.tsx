'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CheckCircle2, Circle, Lock, Search, X } from 'lucide-react';
import { ProfileTitle } from '@/components/profile/ProfileIdentity';
import { invalidateCurrentUser } from '@/lib/client/current-user';
import type { ProfileCustomizationState, ProfilePreferences } from '@/lib/profile-customization';
import { getAchievementInstructions, getLocalizedTitleName } from '@/lib/profile-customization';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './TitlesShowcaseView.module.css';

interface TitlesShowcaseViewProps {
  initialData: ProfileCustomizationState;
  user: { id: string; username: string; avatar_url?: string | null };
}

type FilterType = 'all' | 'owned' | 'unowned' | 'events';

export function TitlesShowcaseView({ initialData }: TitlesShowcaseViewProps) {
  const router = useRouter();
  const { isEnglish, text, locale } = useLocalizedText();
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

  const filters = useMemo<{ value: FilterType; label: string; accessibleLabel: string }[]>(
    () => [
      {
        value: 'all',
        label: text('Todos', 'All'),
        accessibleLabel: text('Todos os títulos', 'All titles'),
      },
      {
        value: 'owned',
        label: text('Seus', 'Unlocked'),
        accessibleLabel: text('Você possui', 'You own'),
      },
      {
        value: 'unowned',
        label: text('A conquistar', 'Locked'),
        accessibleLabel: text('Você não possui', 'You do not own'),
      },
      {
        value: 'events',
        label: text('Eventos', 'Events'),
        accessibleLabel: text('Títulos de eventos', 'Event titles'),
      },
    ],
    [text]
  );

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
            ? text(
                'Seu perfil mudou em outra aba. Recarregue a página antes de escolher outro título.',
                'Your profile changed in another tab. Reload the page before choosing another title.'
              )
            : result.message ||
                text(
                  'Não foi possível salvar o título. Tente novamente.',
                  'Could not save title. Please try again.'
                )
        );
      if (typeof result.version === 'number') setVersion(result.version);
      if (result.preferences) setPreferences(result.preferences);
      invalidateCurrentUser();
      window.dispatchEvent(new Event('stacklyst:profile-customization'));
      router.refresh();
      showToast(
        title
          ? isEnglish
            ? `Title “${getLocalizedTitleName(title, true)}” equipped on your profile.`
            : `Título “${title.name}” equipado no seu perfil.`
          : text('Título removido do perfil.', 'Title removed from profile.')
      );
    } catch (failure) {
      setPreferences(previousPreferences);
      showToast(
        failure instanceof Error
          ? failure.message
          : text(
              'Não foi possível salvar o título. Tente novamente.',
              'Could not save title. Please try again.'
            ),
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
        const query = searchQuery.trim().toLocaleLowerCase();
        if (!query) return true;
        const instructions = getAchievementInstructions(
          item,
          events,
          achievements,
          undefined,
          isEnglish
        );
        const localizedName = getLocalizedTitleName(item, isEnglish);
        return [item.name, localizedName, instructions.flavorText, instructions.howToObtain].some(
          (value) => value.toLocaleLowerCase().includes(query)
        );
      }),
    [achievements, events, searchQuery, filter, isEnglish]
  );

  return (
    <section className={styles.surface} aria-label={text('Coleção de títulos', 'Title collection')}>
      <header className={styles.header}>
        <div className={styles.toolbar}>
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? router.back() : router.push('/feed'))}
            aria-label={text('Voltar', 'Back')}
            className={styles.iconButton}
          >
            <ArrowLeft size={21} />
          </button>
          <h1>{text('Títulos', 'Titles')}</h1>
          <span
            className={styles.collectionCount}
            aria-label={`${unlockedCount} ${text('de', 'of')} ${achievements.length} ${text('títulos conquistados', 'titles unlocked')}`}
          >
            {unlockedCount}
            <span aria-hidden="true"> / {achievements.length}</span>
          </span>
          <button
            type="button"
            aria-label={
              searchOpen
                ? text('Fechar busca', 'Close search')
                : text('Buscar títulos', 'Search titles')
            }
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
            className={styles.iconButton}
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>
        <div
          className={styles.tabs}
          role="group"
          aria-label={text('Filtrar títulos', 'Filter titles')}
        >
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
        <p>
          {text(
            'Conquiste um título e leve sua história para o perfil.',
            'Earn a title and bring your story to your profile.'
          )}
        </p>
        <Link href="/personalize?section=identity">
          {text('Personalizar perfil', 'Customize profile')}
        </Link>
        <Link href="/certificates">
          {text('Badges e certificados de cursos', 'Course badges and certificates')}
        </Link>
      </div>
      <div className={`${styles.search} ${searchOpen ? styles.searchOpen : ''}`}>
        <Search size={18} aria-hidden="true" />
        <input
          ref={searchInput}
          type="search"
          aria-label={text('Buscar títulos', 'Search titles')}
          placeholder={text(
            'Buscar por título, objetivo ou hashtag...',
            'Search by title, objective, or hashtag...'
          )}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            aria-label={text('Limpar busca', 'Clear search')}
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
          <span>{text('No seu perfil', 'On your profile')}</span>
          <ProfileTitle title={equippedTitle} className={styles.titlePill} />
        </div>
      )}

      {filteredAchievements.length ? (
        <div className={styles.list} aria-label={text('Títulos disponíveis', 'Available titles')}>
          {filteredAchievements.map((achievement) => {
            const instructions = getAchievementInstructions(
              achievement,
              events,
              achievements,
              undefined,
              isEnglish
            );
            const localizedTitleName = isEnglish
              ? getLocalizedTitleName(achievement, true)
              : achievement.name;
            const isEquipped = preferences.equippedTitleId === achievement.id;
            const target = achievement.requirement.target;
            const progress = Math.max(0, Math.min(achievement.progress, target));
            const busy = equippingId === achievement.id;
            return (
              <article
                key={achievement.id}
                className={styles.item}
                aria-label={`${text('Título', 'Title')} ${localizedTitleName}`}
              >
                <div className={styles.itemHeading}>
                  <ProfileTitle title={achievement} className={styles.titlePill} />
                  {achievement.unlocked && (
                    <div className={styles.equipActions}>
                      {isEquipped && (
                        <span className={styles.inUse}>
                          <Check size={13} aria-hidden="true" />
                          {text('Em uso', 'Equipped')}
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={equippingId !== null}
                        className={styles.equipButton}
                        onClick={() => void handleEquipTitle(isEquipped ? null : achievement.id)}
                        aria-label={
                          isEquipped
                            ? text('Retirar', 'Remove')
                            : `${text('Usar título', 'Equip title')} ${localizedTitleName}`
                        }
                      >
                        {busy
                          ? text('Salvando…', 'Saving…')
                          : isEquipped
                            ? text('Retirar', 'Remove')
                            : text('Usar título', 'Equip title')}
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
                    <p>
                      {achievement.unlocked
                        ? text('Você possui', 'Unlocked')
                        : text('Você não possui', 'Locked')}
                    </p>
                    {!achievement.unlocked && instructions.isUnavailable && (
                      <span>{text('Indisponível para obter', 'Unavailable to unlock')}</span>
                    )}
                  </div>
                </div>
                <p className={styles.description}>{instructions.flavorText}</p>
                <div className={styles.instructions}>
                  <h2>{text('Como obter', 'How to obtain')}</h2>
                  <p>{instructions.howToObtain}</p>
                  {!achievement.unlocked && !instructions.isUnavailable && target > 1 && (
                    <p className={styles.progress}>
                      <span>
                        {progress.toLocaleString(locale)} {text('de', 'of')}{' '}
                        {target.toLocaleString(locale)}
                      </span>
                      <span>
                        {text('Faltam', 'Remaining:')} {(target - progress).toLocaleString(locale)}
                      </span>
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
          <h2>{text('Nenhum título encontrado', 'No titles found')}</h2>
          <p>
            {text(
              'Tente outro nome, objetivo ou hashtag.',
              'Try another name, objective, or hashtag.'
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilter('all');
            }}
          >
            {text('Limpar filtros', 'Clear filters')}
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
          <button
            type="button"
            aria-label={text('Fechar aviso', 'Close notification')}
            onClick={() => setToast(null)}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </section>
  );
}
