import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { usersAheadWhere } from '@/lib/learning/rewards';
import { getUserLanguageXp } from '@/lib/learning/language-xp';
import { getEffectiveStreak } from '@/lib/streak';
import { getAuthUser } from '@/lib/auth';
import { ProfileContent } from './ProfileContent';

export const revalidate = 0; // Desabilitar cache para dados dinâmicos do perfil

const TRAIL_ACTIVITY_ID_PATTERN = /^(js|ts|py|python|rust|go|java)-(?:l\d+-q\d+|u\d+-checkpoint)$/i;

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

  // Calcular estatísticas
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [
    allBadges,
    answersCount,
    acceptedCount,
    totalAttempts,
    correctAttempts,
    follow,
    followersCount,
    followingCount,
    usersAhead,
    totalParticipants,
    todayAttempts,
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
    prisma.user.count({ where: usersAheadWhere(profileUser) }),
    prisma.user.count(),
    prisma.quizAttempt.findMany({
      where: {
        user_id: profileId,
        created_at: { gte: todayStart },
      },
      select: {
        quiz_id: true,
        is_correct: true,
        xp_earned: true,
      },
    }),
  ]);

  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Serializar
  const serializedProfileUser = {
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
    birthday: profileUser.birthday ? profileUser.birthday.toISOString() : null,
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

  // Verificar se o usuário atual segue este perfil
  const isFollowing = follow !== null;
  const todayTrailAttempts = todayAttempts.filter((attempt) =>
    TRAIL_ACTIVITY_ID_PATTERN.test(attempt.quiz_id)
  );
  const dailyProgress = {
    xpEarned: todayTrailAttempts.reduce(
      (total, attempt) => total + Math.max(0, attempt.xp_earned),
      0
    ),
    correctAnswers: todayTrailAttempts.filter((attempt) => attempt.is_correct).length,
    trailActivities: todayTrailAttempts.length,
  };

  return (
    <ProfileContent
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
      }}
      trails={serializedTrails}
      allBadges={serializedAllBadges}
      isFollowing={isFollowing}
      followersCount={followersCount}
      followingCount={followingCount}
      globalRank={usersAhead + 1}
      totalParticipants={totalParticipants}
      dailyProgress={dailyProgress}
      initialTab={resolvedSearchParams.tab === 'badges' ? 'badges' : 'posts'}
    />
  );
}
