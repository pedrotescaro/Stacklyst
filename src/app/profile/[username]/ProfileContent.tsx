'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChartNoAxesCombined,
  Heart,
  ImageIcon,
  MessageCircle,
  Newspaper,
  Search,
  Video,
  X,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { ProfileRightRail, type ProfileRailUser } from '@/components/profile/ProfileRightRail';
import { PostCard } from '@/components/PostCard';
import { ProfileReplyThread } from '@/components/ProfileReplyThread';
import { FollowersModal } from '@/components/motion/FollowersModal';
import { AchievementShowcase } from '@/components/AchievementShowcase';
import { LanguageTrailBar } from '@/components/LanguageTrailBar';
import {
  SocialProfileOverview,
  type SocialProfile,
} from '@/components/profile-inline/SocialProfileOverview';
import type { TrailDailyProgress } from '@/app/trails/TrailsProgressSidebar';
import type { ProfilePreferences } from '@/lib/profile-customization';
import { profileAppearanceStyle } from '@/lib/profile-style';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import profileStyles from '@/components/profile/ProfilePublic.module.css';
import styles from '@/components/profile-inline/InlineProfile.module.css';
import headerStyles from './ProfileHeader.module.css';

type ProfileTab = 'posts' | 'photos' | 'videos' | 'likes' | 'replies' | 'stats';
interface ProfileContentProps {
  railUser: ProfileRailUser;
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    total_xp: number;
    streak_days?: number;
    last_active_at?: string | null;
  };
  profileUser: SocialProfile & {
    badges: any[];
    streak_days?: number;
    last_active_at?: string | null;
  };
  stats: {
    answers_count: number;
    accuracy: number;
    accepted_count: number;
    posts_count?: number;
    likes_received?: number;
  };
  trails: Array<{ language: string; xp: number; level: number }>;
  allBadges: any[];
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  globalRank?: number;
  totalParticipants?: number;
  dailyProgress?: TrailDailyProgress;
  initialTab?: ProfileTab | 'trails' | 'badges';
}

export function ProfileContent({
  railUser,
  user,
  profileUser,
  stats,
  trails,
  allBadges,
  isFollowing,
  followersCount,
  followingCount,
  initialTab = 'posts',
}: ProfileContentProps) {
  const { text, isEnglish } = useLocalizedText();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  const [localProfile, setLocalProfile] = useState(profileUser);
  const [previewPreferences, setPreviewPreferences] = useState<ProfilePreferences | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    initialTab === 'trails' || initialTab === 'badges' ? 'stats' : initialTab
  );
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(followersCount);
  const [followersModal, setFollowersModal] = useState<'followers' | 'following' | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<Map<number, number>>(new Map());
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeLanguage, setChallengeLanguage] = useState<'TS' | 'JS' | 'PYTHON'>('TS');
  const [publishOnExpiry, setPublishOnExpiry] = useState(false);
  const [challengeBusy, setChallengeBusy] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState('');
  const [challengeSent, setChallengeSent] = useState(false);
  const listRequest = useRef<AbortController | null>(null);
  const activeRef = useRef(activeTab);
  activeRef.current = activeTab;

  const fetchContent = useCallback(
    async (target: ProfileTab, after: string | null, append = false) => {
      if (target === 'stats') {
        setLoading(false);
        return;
      }
      listRequest.current?.abort();
      const controller = new AbortController();
      listRequest.current = controller;
      setLoading(true);
      setError('');
      try {
        const name = encodeURIComponent(profileUser.username);
        const afterQuery = after ? `&cursor=${encodeURIComponent(after)}` : '';
        const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
        const url =
          target === 'photos' || target === 'videos'
            ? `/api/profile/${name}/media?type=${target}&limit=18${afterQuery}${searchQuery}`
            : target === 'replies'
              ? `/api/profile/${name}/replies?limit=10${afterQuery}${searchQuery}`
              : `/api/posts?${target === 'likes' ? 'likedBy' : 'author'}=${name}&useCursor=true&limit=10${afterQuery}${searchQuery}`;
        const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || result.error || 'Não foi possível carregar este conteúdo.'
          );
        if (activeRef.current !== target || controller.signal.aborted) return;
        setItems((previous) =>
          append ? [...previous, ...(result.items || [])] : result.items || []
        );
        setCursor(result.nextCursor || null);
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(failure instanceof Error ? failure.message : 'Sem conexão. Tente novamente.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [profileUser.username, search]
  );
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setError('');
    void fetchContent(activeTab, null);
    return () => listRequest.current?.abort();
  }, [activeTab, fetchContent]);
  useEffect(() => {
    if (activeTab !== 'stats') return;
    const controller = new AbortController();
    void fetch(`/api/quiz/weekly-activity?userId=${encodeURIComponent(profileUser.id)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.weekDays)
          setWeeklyActivity(
            new Map(
              data.weekDays.map((day: { index: number; count: number }) => [day.index, day.count])
            )
          );
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [activeTab, profileUser.id]);

  const follow = async () => {
    const before = following;
    setFollowing(!before);
    setFollowers((previous) => Math.max(0, previous + (before ? -1 : 1)));
    try {
      const response = await fetch(`/api/users/${profileUser.id}/follow`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Não foi possível seguir este perfil.');
      setFollowing(Boolean(result.following));
      if (result.following !== !before)
        setFollowers((previous) => Math.max(0, previous + (result.following ? 1 : -1)));
    } catch (failure) {
      setFollowing(before);
      setFollowers(followersCount);
      throw failure;
    }
  };
  const challenge = async () => {
    if (challengeBusy || challengeSent) return;
    setChallengeBusy(true);
    setChallengeFeedback('');
    try {
      const response = await fetch('/api/duels/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: profileUser.id,
          language: challengeLanguage,
          publish_on_expiry: publishOnExpiry,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || result.error || 'Não foi possível enviar o desafio.');
      setChallengeFeedback(result.message || 'Convite enviado.');
      setChallengeSent(true);
    } catch (failure) {
      setChallengeFeedback(
        failure instanceof Error ? failure.message : 'Sem conexão ao enviar o convite.'
      );
    } finally {
      setChallengeBusy(false);
    }
  };
  const preferences = previewPreferences || localProfile.customization?.preferences;
  const tabDefinitions = [
    { id: 'posts' as const, label: text('Postagens', 'Posts'), icon: Newspaper },
    { id: 'photos' as const, label: text('Fotos', 'Photos'), icon: ImageIcon },
    { id: 'videos' as const, label: text('Vídeos', 'Videos'), icon: Video },
    { id: 'likes' as const, label: text('Curtidas', 'Likes'), icon: Heart },
    { id: 'replies' as const, label: text('Respostas', 'Replies'), icon: MessageCircle },
    { id: 'stats' as const, label: text('Estatísticas', 'Statistics'), icon: ChartNoAxesCombined },
  ];
  useEffect(() => {
    if (search) tabsRef.current?.scrollIntoView?.({ block: 'start' });
  }, [search]);
  const badgeEarned = new Map(profileUser.badges.map((item) => [item.slug, item.earned_at]));

  return (
    <div data-testid="profile-shell" className="dd-platform-shell dd-platform-shell--fullscreen">
      <Sidebar user={user} />
      <div
        className={`min-w-0 flex-grow bg-dd-bg ${styles.pageLayout} ${profileStyles.scope}`}
        data-secondary={Boolean(preferences?.appearance.secondaryColor)}
        data-custom-card={Boolean(preferences?.appearance.cardColor)}
        style={preferences ? profileAppearanceStyle(preferences) : undefined}
      >
        <main className={styles.pageMain}>
          <div className={styles.content} data-testid="profile-layout">
            <div className={headerStyles.sticky}>
              <header className={headerStyles.header}>
                <button
                  type="button"
                  className={headerStyles.iconButton}
                  onClick={() => router.back()}
                  aria-label={text('Voltar', 'Back')}
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <div className={headerStyles.identity}>
                  <h1>{localProfile.name || localProfile.username}</h1>
                  <p>
                    {stats.posts_count ?? 0}{' '}
                    {stats.posts_count === 1
                      ? text('publicação', 'post')
                      : text('publicações', 'posts')}
                  </p>
                </div>
                <button
                  type="button"
                  className={headerStyles.iconButton}
                  onClick={() => {
                    setSearchOpen((open) => !open);
                    if (searchOpen) setSearchInput('');
                    else if (activeTab === 'stats') setActiveTab('posts');
                  }}
                  aria-expanded={searchOpen}
                  aria-controls="profile-search"
                  aria-label={
                    searchOpen
                      ? text('Fechar busca', 'Close search')
                      : text('Buscar no perfil', 'Search profile')
                  }
                >
                  {searchOpen ? (
                    <X size={20} aria-hidden="true" />
                  ) : (
                    <Search size={20} aria-hidden="true" />
                  )}
                </button>
              </header>
              {searchOpen && (
                <div id="profile-search" className={headerStyles.searchArea}>
                  <div className={headerStyles.search}>
                    <Search size={17} aria-hidden="true" />
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder={text('Buscar no conteúdo do perfil', 'Search profile content')}
                      aria-label={text('Buscar no conteúdo do perfil', 'Search profile content')}
                      maxLength={200}
                      autoFocus
                    />
                  </div>
                  <p>
                    {activeTab === 'stats'
                      ? text(
                          'Selecione uma aba de conteúdo para pesquisar.',
                          'Select a content tab to search.'
                        )
                      : text(
                          `Buscando em ${tabDefinitions.find((tab) => tab.id === activeTab)?.label}. Troque de aba para ver outros resultados.`,
                          `Searching ${tabDefinitions.find((tab) => tab.id === activeTab)?.label}. Switch tabs to see other results.`
                        )}
                  </p>
                </div>
              )}
            </div>
            <SocialProfileOverview
              profile={localProfile}
              currentUserId={user.id}
              following={following}
              onFollowToggle={follow}
              onChallenge={() => {
                setChallengeOpen(true);
                setChallengeFeedback('');
                setChallengeSent(false);
              }}
              onSaved={(next) => setLocalProfile((previous) => ({ ...previous, ...next }))}
              onPreview={setPreviewPreferences}
            />
            <div
              ref={tabsRef}
              className={`${styles.tabs} ${headerStyles.tabs}`}
              role="tablist"
              aria-label={text('Conteúdo do perfil', 'Profile content')}
            >
              {tabDefinitions.map(({ id, label, icon: Icon }, index) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`profile-tab-${id}`}
                  aria-controls={`profile-panel-${id}`}
                  aria-selected={activeTab === id}
                  tabIndex={activeTab === id ? 0 : -1}
                  className={styles.tab}
                  onClick={() => setActiveTab(id)}
                  onKeyDown={(event) => {
                    if (
                      event.key !== 'ArrowLeft' &&
                      event.key !== 'ArrowRight' &&
                      event.key !== 'Home' &&
                      event.key !== 'End'
                    )
                      return;
                    event.preventDefault();
                    const next =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? tabDefinitions.length - 1
                          : (index +
                              (event.key === 'ArrowRight' ? 1 : -1) +
                              tabDefinitions.length) %
                            tabDefinitions.length;
                    setActiveTab(tabDefinitions[next].id);
                    document.getElementById(`profile-tab-${tabDefinitions[next].id}`)?.focus();
                  }}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <div
              role="tabpanel"
              id={`profile-panel-${activeTab}`}
              aria-labelledby={`profile-tab-${activeTab}`}
              aria-busy={loading}
            >
              {error && (
                <div className={styles.empty} role="alert">
                  <p>{error}</p>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => void fetchContent(activeTab, cursor, Boolean(items.length))}
                  >
                    {text('Tentar novamente', 'Try again')}
                  </button>
                </div>
              )}
              {activeTab === 'stats' ? (
                <section className={styles.statistics}>
                  <h2>{text('Estatísticas do perfil', 'Profile statistics')}</h2>
                  <div className={styles.metrics}>
                    <Metric
                      value={followers}
                      label={text('Seguidores', 'Followers')}
                      onClick={() => setFollowersModal('followers')}
                    />
                    <Metric
                      value={followingCount}
                      label={text('Seguindo', 'Following')}
                      onClick={() => setFollowersModal('following')}
                    />
                    <Metric value={stats.posts_count ?? 0} label={text('Publicações', 'Posts')} />
                    <Metric value={stats.answers_count} label={text('Comentários', 'Comments')} />
                    {stats.likes_received !== undefined && (
                      <Metric
                        value={stats.likes_received}
                        label={text('Curtidas recebidas', 'Likes received')}
                      />
                    )}
                    <Metric value={localProfile.total_xp} label="XP" />
                  </div>
                  <details className={styles.statisticsDetails} open={initialTab === 'trails'}>
                    <summary>{text('Aprendizagem e atividade', 'Learning and activity')}</summary>
                    <div className={styles.metrics}>
                      <Metric
                        value={`${stats.accuracy}%`}
                        label={text('Precisão nos quizzes', 'Quiz accuracy')}
                      />
                      <Metric
                        value={stats.accepted_count}
                        label={text('Respostas aceitas', 'Accepted answers')}
                      />
                      <Metric
                        value={localProfile.streak_days || 0}
                        label={text('Dias de ofensiva', 'Streak days')}
                      />
                    </div>
                    <div
                      className={styles.weekly}
                      aria-label={text('Atividade semanal de quizzes', 'Weekly quiz activity')}
                    >
                      {(isEnglish
                        ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                        : ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
                      ).map((day, index) => (
                        <div key={index}>
                          <span>{day}</span>
                          <b data-active={Boolean(weeklyActivity.get(index))}>
                            {weeklyActivity.get(index) || 0}
                          </b>
                        </div>
                      ))}
                    </div>
                    {trails.map((trail) => (
                      <LanguageTrailBar
                        key={trail.language}
                        language={trail.language}
                        xp={trail.xp}
                        level={trail.level}
                        maxXp={Math.max(500, trail.level * 500)}
                      />
                    ))}
                    {trails.length === 0 && (
                      <p className={styles.empty}>
                        {text('Nenhuma trilha iniciada.', 'No trails started.')}
                      </p>
                    )}
                  </details>
                  <details className={styles.statisticsDetails} open={initialTab === 'badges'}>
                    <summary>{text('Conquistas da aprendizagem', 'Learning achievements')}</summary>
                    <AchievementShowcase
                      badges={allBadges.map((badge) => ({
                        ...badge,
                        earned_at: badgeEarned.get(badge.slug) || null,
                      }))}
                    />
                  </details>
                </section>
              ) : (
                <>
                  {activeTab === 'photos' && items.length > 0 && (
                    <div className={styles.mediaGrid}>
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={`/post/${item.id}`}
                          aria-label={`${text('Abrir foto', 'Open photo')}: ${item.title || text('Publicação', 'Post')}`}
                        >
                          <img
                            src={item.image_url}
                            alt={item.title || text('Foto publicada', 'Published photo')}
                            loading="lazy"
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                  {(activeTab === 'posts' || activeTab === 'likes' || activeTab === 'replies') &&
                    items.map((item) =>
                      activeTab === 'replies' ? (
                        <div key={item.id} className="border-b border-dd-border">
                          <ProfileReplyThread reply={item} currentUser={user} />
                        </div>
                      ) : (
                        <div key={item.id} className="border-b border-dd-border">
                          <PostCard
                            post={item}
                            isOwner={item.author_id === user.id}
                            flat
                            onDelete={(id) =>
                              setItems((previous) => previous.filter((post) => post.id !== id))
                            }
                            onEdit={(id, updated) =>
                              setItems((previous) =>
                                previous.map((post) =>
                                  post.id === id ? { ...post, ...updated } : post
                                )
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  {!loading && !error && items.length === 0 && (
                    <p className={styles.empty}>
                      {search
                        ? text(
                            'Nenhum resultado encontrado nesta aba.',
                            'No results found in this tab.'
                          )
                        : activeTab === 'photos'
                          ? text(
                              'Nenhuma foto publicada. As imagens das publicações aparecem aqui.',
                              'No photos yet. Images from posts appear here.'
                            )
                          : activeTab === 'videos'
                            ? text(
                                'Nenhum vídeo publicado neste perfil.',
                                'No videos published on this profile.'
                              )
                            : activeTab === 'likes'
                              ? text('Nenhuma publicação curtida.', 'No liked posts.')
                              : activeTab === 'replies'
                                ? text('Nenhuma resposta publicada.', 'No replies yet.')
                                : text('Nenhuma publicação por enquanto.', 'No posts yet.')}
                    </p>
                  )}
                  {loading && (
                    <div aria-label={text('Carregando conteúdo', 'Loading content')}>
                      <div className={styles.skeleton} />
                      <div className={styles.skeleton} />
                    </div>
                  )}
                  {!loading && cursor && (
                    <div className={styles.empty}>
                      <button
                        className={styles.button}
                        type="button"
                        onClick={() => void fetchContent(activeTab, cursor, true)}
                      >
                        {text('Carregar mais', 'Load more')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
        <div className={styles.rightRail}>
          <ProfileRightRail user={railUser} />
        </div>
      </div>
      <FollowersModal
        open={followersModal !== null}
        onClose={() => setFollowersModal(null)}
        userId={profileUser.id}
        currentUserId={user.id}
        type={followersModal || 'followers'}
        title={
          followersModal === 'followers'
            ? text('Seguidores', 'Followers')
            : text('Seguindo', 'Following')
        }
      />
      {challengeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-dd-border bg-dd-bg p-6">
            <h2 id="challenge-title" className="text-lg font-semibold">
              Desafiar @{profileUser.username}
            </h2>
            <p className="text-xs text-dd-muted">
              O convite fica disponível por 72 horas. Ignorar ou recusar não remove XP.
            </p>
            <label className="grid gap-2 text-sm">
              Linguagem
              <select
                className={styles.select}
                value={challengeLanguage}
                onChange={(event) =>
                  setChallengeLanguage(event.target.value as typeof challengeLanguage)
                }
              >
                <option value="TS">TypeScript</option>
                <option value="JS">JavaScript</option>
                <option value="PYTHON">Python</option>
              </select>
            </label>
            <label className="flex items-start gap-2 text-xs text-dd-muted">
              <input
                type="checkbox"
                checked={publishOnExpiry}
                onChange={(event) => setPublishOnExpiry(event.target.checked)}
              />
              Publicar na arena por mais 24 horas se o convite expirar.
            </label>
            {challengeFeedback && (
              <p className={styles.message} role="status">
                {challengeFeedback}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                className={styles.button}
                type="button"
                onClick={() => setChallengeOpen(false)}
              >
                Fechar
              </button>
              <button
                className={styles.primary}
                type="button"
                onClick={() => void challenge()}
                disabled={challengeBusy || challengeSent}
              >
                {challengeBusy ? 'Enviando…' : 'Enviar desafio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Metric({
  value,
  label,
  onClick,
}: {
  value: number | string;
  label: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <strong>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</strong>
      <span>{label}</span>
    </>
  );
  return (
    <div className={styles.metric}>
      {onClick ? (
        <button type="button" onClick={onClick}>
          {content}
        </button>
      ) : (
        content
      )}
    </div>
  );
}
