import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getUserLanguageXp } from '@/lib/learning/language-xp';
import { getEffectiveStreak } from '@/lib/streak';
import { getAuthUser } from '@/lib/auth';
import { ProfileContent } from './ProfileContent';
import { getPublicProfileCustomization } from '@/services/profile-customization.service';

export const revalidate = 0; // Desabilitar cache para dados dinâmicos do perfil

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [user, { username }, resolvedSearchParams] = await Promise.all([
    getAuthUser(),
    params,
    searchParams,
  ]);

  if (!user) {
    redirect('/login');
  }

  // Buscar usuário dono do perfil
  const profileUser = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: 'insensitive' },
    },
    include: {
      trails: {
        orderBy: { xp: 'desc' },
      },
      badges: {
        include: {
          badge: true,
        },
      },
    },
  });

  if (!profileUser) {
    notFound();
  }

  // Buscar todos os badges cadastrados no sistema
  const profileId = profileUser.id;

  const [
    allBadges,
    answersCount,
    acceptedCount,
    totalAttempts,
    correctAttempts,
    follow,
    followersCount,
    followingCount,
    postsCount,
    postLikes,
    answerLikes,
  ] = await Promise.all([
    prisma.badge.findMany({ orderBy: { slug: 'asc' } }),
    prisma.answer.count({ where: { author_id: profileId } }),
    prisma.answer.count({ where: { author_id: profileId, is_accepted: true } }),
    prisma.quizAttempt.count({ where: { user_id: profileId } }),
    prisma.quizAttempt.count({ where: { user_id: profileId, is_correct: true } }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: profileId,
        },
      },
    }),
    prisma.follow.count({ where: { followingId: profileId } }),
    prisma.follow.count({ where: { followerId: profileId } }),
    prisma.post.count({ where: { author_id: profileId } }),
    prisma.postVote.count({ where: { value: 1, post: { author_id: profileId } } }),
    prisma.answerVote.count({ where: { value: 1, answer: { author_id: profileId } } }),
  ]);

  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Serializar
  const serializedProfileUser = {
    customization: await getPublicProfileCustomization(profileUser.id),
    id: profileUser.id,
    name:
      (profileUser as any).name ||
      (profileUser.avatar_config as any)?.name ||
      (profileUser.avatar_config as any)?.displayName ||
      profileUser.username,
    username: profileUser.username,
    avatar_url: profileUser.avatar_url,
    avatar_config: profileUser.avatar_config,
    bio: profileUser.bio,
    institution: profileUser.institution,
    github_username: profileUser.github_username,
    discord_username: profileUser.discord_username,
    banner_url: profileUser.banner_url,
    pronouns: profileUser.pronouns,
    birthday:
      user.id === profileId && profileUser.birthday ? profileUser.birthday.toISOString() : null,
    created_at: profileUser.created_at.toISOString(),
    total_xp: profileUser.total_xp,
    streak_days: getEffectiveStreak(profileUser.streak_days, profileUser.last_active_at),
    last_active_at: profileUser.last_active_at ? profileUser.last_active_at.toISOString() : null,
    badges: profileUser.badges.map((ub) => ({
      slug: ub.badge.slug,
      earned_at: ub.earned_at.toISOString(),
    })),
  };

  const serializedTrails = await getUserLanguageXp(profileUser.id);

  const serializedAllBadges = allBadges.map((b) => ({
    slug: b.slug,
    label: b.label,
    description: b.description,
    icon: b.icon,
    color: b.color,
  }));

  const viewerBadgeDates = new Map<string, string | null>(
    user.badges.map((entry: any): [string, string | null] => [
      entry.badge.slug,
      entry.earned_at?.toISOString() ?? null,
    ])
  );

  // Verificar se o usuário atual segue este perfil
  const isFollowing = follow !== null;

  return (
    <ProfileContent
      railUser={{
        username: user.username,
        streak: Math.max(
          user.streak_days,
          user.trails.reduce(
            (max: number, trail: { streak: number }) => Math.max(max, trail.streak),
            0
          )
        ),
        last_active_at: user.last_active_at?.toISOString() ?? null,
        trails: [...user.trails]
          .sort((a, b) => b.xp - a.xp)
          .map((trail) => ({
            id: trail.id,
            language: trail.language,
            xp: trail.xp,
            level: trail.level,
          })),
        badges: serializedAllBadges.map((badge) => ({
          ...badge,
          earned_at: viewerBadgeDates.get(badge.slug) ?? null,
        })),
      }}
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        avatar_config: user.avatar_config,
        total_xp: user.total_xp,
        streak_days: user.streak_days,
        last_active_at: user.last_active_at ? user.last_active_at.toISOString() : null,
      }}
      profileUser={serializedProfileUser}
      stats={{
        answers_count: answersCount,
        accuracy,
        accepted_count: acceptedCount,
        posts_count: postsCount,
        likes_received: postLikes + answerLikes,
      }}
      trails={serializedTrails}
      allBadges={serializedAllBadges}
      isFollowing={isFollowing}
      followersCount={followersCount}
      followingCount={followingCount}
      initialTab={
        typeof resolvedSearchParams.tab === 'string' &&
        ['posts', 'photos', 'videos', 'likes', 'replies', 'stats', 'trails', 'badges'].includes(
          resolvedSearchParams.tab
        )
          ? (resolvedSearchParams.tab as
              | 'posts'
              | 'photos'
              | 'videos'
              | 'likes'
              | 'replies'
              | 'stats'
              | 'trails'
              | 'badges')
          : 'posts'
      }
    />
  );
}
