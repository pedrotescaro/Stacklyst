'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { ProfileHero } from '@/components/ProfileHero';
import { AchievementShowcase } from '@/components/AchievementShowcase';
import { PostCard } from '@/components/PostCard';
import { ProfileReplyThread } from '@/components/ProfileReplyThread';
import { FollowersModal } from '@/components/motion/FollowersModal';
import { LanguageTrailBar } from '@/components/LanguageTrailBar';
import { EditProfileModal } from '@/components/EditProfileModal';
import { BookOpen, Award, Check, Calendar } from 'lucide-react';
import { TrailsProgressSidebar, type TrailDailyProgress } from '@/app/trails/TrailsProgressSidebar';
import { TRAIL_LANGUAGE_CODES, type TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface ProfileContentProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    total_xp: number;
    streak_days?: number;
  };
  profileUser: {
    id: string;
    name?: string | null;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    bio?: string | null;
    institution?: string | null;
    github_username?: string | null;
    discord_username?: string | null;
    banner_url?: string | null;
    pronouns?: string | null;
    birthday?: string | null;
    created_at: string;
    total_xp: number;
    streak_days?: number;
    badges: any[];
  };
  stats: {
    answers_count: number;
    accuracy: number;
    accepted_count: number;
  };
  trails: Array<{
    language: string;
    xp: number;
    level: number;
  }>;
  allBadges: any[];
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  globalRank: number;
  totalParticipants: number;
  dailyProgress: TrailDailyProgress;
  initialTab?: 'posts' | 'replies' | 'likes' | 'stats' | 'trails' | 'badges';
}

export function ProfileContent({
  user,
  profileUser,
  stats,
  trails,
  allBadges,
  isFollowing,
  followersCount,
  followingCount,
  globalRank,
  totalParticipants,
  dailyProgress,
  initialTab = 'posts',
}: ProfileContentProps) {
  const router = useRouter();
  const { isEnglish, text } = useLocalizedText();
  const [weeklyActivity, setWeeklyActivity] = useState<Map<number, number>>(new Map());
  const [posts, setPosts] = useState<{ tab: string; items: any[] }>({ tab: 'posts', items: [] });
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(followersCount);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [activeTab, setActiveTab] = useState<
    'posts' | 'replies' | 'likes' | 'stats' | 'trails' | 'badges'
  >(initialTab);
  const itemsToRender = posts.tab === activeTab ? posts.items : [];
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [localProfileUser, setLocalProfileUser] = useState(profileUser);
  const profileRailCourses = TRAIL_LANGUAGE_CODES.map((language) => {
    const trail = trails.find((item) => item.language.toUpperCase() === language);

    return {
      language,
      xp: trail?.xp ?? 0,
      started: Boolean(trail && (trail.xp > 0 || trail.level > 1)),
    };
  });
  const defaultProfileRailLanguage =
    profileRailCourses.find((course) => course.started)?.language ?? 'JS';
  const [profileRailLanguage, setProfileRailLanguage] = useState<TrailLanguageCode>(
    defaultProfileRailLanguage
  );

  const showFollowersModal = () => {
    setModalType('followers');
    setModalOpen(true);
  };

  const showFollowingModal = () => {
    setModalType('following');
    setModalOpen(true);
  };

  const handleFollowToggle = async () => {
    const previousFollowing = following;
    const newFollowing = !previousFollowing;

    setFollowing(newFollowing);
    setFollowers((prev) => (newFollowing ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`/api/users/${profileUser.id}/follow`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Erro ao seguir/deixar de seguir usuário');
      }
      const data = await res.json();
      setFollowing(data.following);

      if (data.following !== newFollowing) {
        setFollowers((prev) => (data.following ? prev + 1 : prev - 1));
      }
    } catch (err) {
      console.error('Erro no follow/unfollow:', err);
      setFollowing(previousFollowing);
      setFollowers(followersCount);
      throw err;
    }
  };

  const fetchUserPosts = useCallback(
    async (
      currentCursor: string | null,
      isInitial: boolean,
      targetTab: 'posts' | 'likes' | 'replies'
    ) => {
      setLoading(true);
      try {
        let url: string;
        if (targetTab === 'replies') {
          url = `/api/profile/${profileUser.username}/replies?limit=10${currentCursor ? `&cursor=${currentCursor}` : ''}`;
        } else {
          const paramName = targetTab === 'likes' ? 'likedBy' : 'author';
          url = `/api/posts?${paramName}=${profileUser.username}&useCursor=true&limit=10${currentCursor ? `&cursor=${currentCursor}` : ''}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          if (isInitial) {
            setPosts({ tab: targetTab, items });
          } else {
            setPosts((prev) => ({
              tab: targetTab,
              items: [...prev.items, ...items],
            }));
          }
          setNextCursor(data.nextCursor || null);
          setHasMore(!!data.nextCursor);
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
      } finally {
        setLoading(false);
      }
    },
    [profileUser.username]
  );

  // Fetch weekly activity data for this profile user
  useEffect(() => {
    const fetchWeeklyActivity = async () => {
      try {
        const res = await fetch(`/api/quiz/weekly-activity?userId=${profileUser.id}`);
        if (res.ok) {
          const data = await res.json();
          const counts = new Map<number, number>();
          (data.weekDays as Array<{ index: number; count: number }>).forEach((d) => {
            counts.set(d.index, d.count);
          });
          setWeeklyActivity(counts);
        }
      } catch (err) {
        console.error('Error loading weekly activity:', err);
      }
    };
    if (activeTab === 'stats') {
      fetchWeeklyActivity();
    }
  }, [profileUser.id, activeTab]);

  useEffect(() => {
    if (activeTab === 'posts' || activeTab === 'likes' || activeTab === 'replies') {
      setPosts({ tab: activeTab, items: [] });
      setNextCursor(null);
      setHasMore(true);
      fetchUserPosts(null, true, activeTab);
    }
  }, [profileUser.username, activeTab, fetchUserPosts]);

  const loadMorePosts = () => {
    if (loading || !hasMore) return;
    if (activeTab === 'posts' || activeTab === 'likes' || activeTab === 'replies') {
      fetchUserPosts(nextCursor, false, activeTab);
    }
  };

  const userEarnedSlugs = new Map<string, string>(
    profileUser.badges.map((ub) => [ub.slug, ub.earned_at])
  );

  const mappedBadges = allBadges.map((badge) => {
    const earnedAt = userEarnedSlugs.get(badge.slug);
    return {
      slug: badge.slug,
      label: badge.label,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
      earned_at: earnedAt ? earnedAt : null,
    };
  });

  const mappedTrails = trails.map((t) => {
    let nextXpThreshold = 500;
    if (t.level === 2) nextXpThreshold = 800;
    else if (t.level === 3) nextXpThreshold = 1100;
    else if (t.level === 4) nextXpThreshold = 1500;
    else if (t.level === 5) nextXpThreshold = 2000;
    else if (t.level >= 6) nextXpThreshold = 2000 + (t.level - 5) * 600;

    return {
      language: t.language,
      xp: t.xp,
      level: t.level,
      maxXp: nextXpThreshold,
    };
  });

  return (
    <div data-testid="profile-shell" className="dd-platform-shell dd-platform-shell--fullscreen">
      <Sidebar user={user} />

      <div className="flex min-w-0 flex-grow flex-col bg-dd-bg">
        <main className="flex min-h-screen w-full min-w-0 flex-grow flex-col bg-dd-bg pb-24 md:pb-8">
          <div
            data-testid="profile-layout"
            className="mx-auto flex w-full max-w-[1320px] items-start justify-center xl:justify-start"
          >
            <div className="min-w-0 w-full max-w-[900px] flex-1">
              <ProfileHero
                currentUserId={user.id}
                profile={localProfileUser}
                trails={trails}
                stats={stats}
                following={following}
                followers={followers}
                followingCount={followingCount}
                weeklyActivity={weeklyActivity}
                onEdit={() => setEditModalOpen(true)}
                onFollowToggle={handleFollowToggle}
                onShowFollowers={showFollowersModal}
                onShowFollowing={showFollowingModal}
              />

              <div className="mx-4 mb-4 grid grid-cols-3 gap-1 rounded-2xl border-2 border-dd-border bg-dd-sidebar-bg p-1.5 sm:mx-7 sm:grid-cols-6">
                {[
                  { id: 'posts', label: text('Postagens', 'Posts') },
                  { id: 'replies', label: text('Respostas', 'Replies') },
                  { id: 'likes', label: text('Curtidas', 'Likes') },
                  { id: 'stats', label: text('Estatísticas', 'Stats') },
                  { id: 'trails', label: text('Trilhas', 'Trails') },
                  { id: 'badges', label: text('Conquistas', 'Achievements') },
                ].map((tab) => {
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`min-h-11 rounded-xl px-2 py-2 text-[11px] font-black transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'border-b-[3px] border-sky-700 bg-sky-400 text-slate-950'
                          : 'text-dd-muted hover:bg-dd-surface hover:text-dd-text'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Conditional Content Rendering */}
              <div className="flex flex-grow flex-col">
                {(activeTab === 'posts' || activeTab === 'likes' || activeTab === 'replies') && (
                  <div className="flex flex-col">
                    {itemsToRender.length === 0 && !loading ? (
                      <p className="text-xs text-dd-muted italic py-12 text-center border-b border-dd-border/40">
                        {activeTab === 'likes'
                          ? text('Nenhuma curtida encontrada.', 'No liked posts found.')
                          : activeTab === 'replies'
                            ? text('Nenhuma resposta encontrada.', 'No replies found.')
                            : text('Nenhuma publicação encontrada.', 'No posts found.')}
                      </p>
                    ) : (
                      itemsToRender.map((item) => {
                        if (activeTab === 'replies') {
                          return (
                            <div
                              key={item.id}
                              className="border-b border-dd-border/50 last:border-b-0"
                            >
                              <ProfileReplyThread reply={item} currentUser={user} />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={item.id}
                            className="border-b border-dd-border/50 last:border-b-0"
                          >
                            <PostCard
                              post={item}
                              isOwner={item.author_id === user.id}
                              flat={true}
                              onDelete={(postId) => {
                                setPosts((prev) => ({
                                  ...prev,
                                  items: prev.items.filter((p) => p.id !== postId),
                                }));
                              }}
                              onEdit={(postId, updatedPost) => {
                                setPosts((prev) => ({
                                  ...prev,
                                  items: prev.items.map((p) =>
                                    p.id === postId ? { ...p, ...updatedPost } : p
                                  ),
                                }));
                              }}
                            />
                          </div>
                        );
                      })
                    )}

                    {loading && (
                      <div className="text-center py-6 border-b border-dd-border/40">
                        <span className="text-xs text-dd-muted animate-pulse font-semibold">
                          {text('Carregando...', 'Loading...')}
                        </span>
                      </div>
                    )}

                    {hasMore && !loading && (
                      <div className="flex justify-center py-6 border-b border-dd-border/40">
                        <button
                          onClick={loadMorePosts}
                          className="px-5 py-2.5 bg-dd-surface hover:bg-dd-border border border-dd-border text-dd-text rounded-full text-xs font-bold transition-all cursor-pointer hover:border-blue-500/20 active:scale-95"
                        >
                          {text('Carregar mais', 'Load more')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="p-6 space-y-6 animate-fade-in">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-dd-surface/40 border border-dd-border/60 rounded-2xl p-5 text-center shadow-sm">
                        <div className="text-dd-text text-2xl font-black font-mono">
                          {stats.answers_count}
                        </div>
                        <div className="text-dd-muted text-[10px] uppercase font-bold tracking-wider mt-1.5 flex items-center justify-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                          <span>{text('Respostas', 'Replies')}</span>
                        </div>
                      </div>
                      <div className="bg-dd-surface/40 border border-dd-border/60 rounded-2xl p-5 text-center shadow-sm">
                        <div className="text-dd-text text-2xl font-black font-mono">
                          {stats.accuracy}%
                        </div>
                        <div className="text-dd-muted text-[10px] uppercase font-bold tracking-wider mt-1.5 flex items-center justify-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-blue-500" />
                          <span>{text('Precisão', 'Accuracy')}</span>
                        </div>
                      </div>
                      <div className="bg-dd-surface/40 border border-dd-border/60 rounded-2xl p-5 text-center shadow-sm">
                        <div className="text-dd-text text-2xl font-black font-mono">
                          {stats.accepted_count}
                        </div>
                        <div className="text-dd-muted text-[10px] uppercase font-bold tracking-wider mt-1.5 flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                          <span>{text('Aceitas', 'Accepted')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Quiz Activity */}
                    <div className="bg-dd-surface/40 border border-dd-border/60 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-dd-muted flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {text('Atividade semanal (quizzes)', 'Weekly activity (quizzes)')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        {(isEnglish
                          ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                          : ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
                        ).map((day, index) => {
                          const count = weeklyActivity.get(index) || 0;
                          const isActive = count > 0;
                          const tooltipText = isActive
                            ? `${count} ${count === 1 ? text('quiz respondido', 'quiz completed') : text('quizzes respondidos', 'quizzes completed')}`
                            : text('Nenhum quiz respondido', 'No quizzes completed');
                          return (
                            <div key={index} className="flex flex-col items-center gap-1.5 group">
                              <span className="text-[9px] font-bold text-dd-muted">{day}</span>
                              <div
                                title={tooltipText}
                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors text-xs font-bold ${
                                  isActive
                                    ? 'bg-blue-500 text-black shadow-[0_0_8px_rgba(0, 131, 254,0.3)]'
                                    : 'bg-dd-surface border border-dd-border text-dd-muted'
                                }`}
                              >
                                {isActive ? count : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'trails' && (
                  <div className="p-6 space-y-4 animate-fade-in">
                    {mappedTrails.length === 0 ? (
                      <p className="text-xs text-dd-muted italic text-center py-6">
                        {text('Nenhuma trilha iniciada.', 'No trails started.')}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {mappedTrails.map((trail) => (
                          <LanguageTrailBar
                            key={trail.language}
                            language={trail.language}
                            xp={trail.xp}
                            level={trail.level}
                            maxXp={trail.maxXp}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'badges' && (
                  <div className="p-6 space-y-6 animate-fade-in">
                    <AchievementShowcase badges={mappedBadges} />
                  </div>
                )}
              </div>
            </div>

            <TrailsProgressSidebar
              activeLanguage={profileRailLanguage}
              courses={profileRailCourses}
              onSelectCourse={setProfileRailLanguage}
              totalXp={localProfileUser.total_xp}
              streak={localProfileUser.streak_days ?? 0}
              globalRank={globalRank}
              totalParticipants={totalParticipants}
              username={localProfileUser.username}
              avatarUrl={localProfileUser.avatar_url}
              dailyProgress={dailyProgress}
              weeklyActivity={weeklyActivity}
              variant="profile"
              allowAddingCourses={false}
            />
          </div>
        </main>
      </div>

      <FollowersModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={profileUser.id}
        currentUserId={user.id}
        type={modalType}
        title={
          modalType === 'followers'
            ? text('Seguidores', 'Followers')
            : text('Seguindo', 'Following')
        }
      />

      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profileUser={localProfileUser}
        onSaved={(updatedFields) => {
          setLocalProfileUser((prev) => ({ ...prev, ...updatedFields }));
          if (updatedFields.username && updatedFields.username !== profileUser.username) {
            router.push(`/profile/${updatedFields.username}`);
          }
        }}
      />
    </div>
  );
}
