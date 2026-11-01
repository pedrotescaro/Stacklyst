import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { visiblePostWhere } from '@/services/post-access.service';
import { postPollInclude, publicPostPoll } from '@/lib/post-poll';
import { getAuthUser } from '@/lib/auth';
import { BookmarksContent } from './BookmarksContent';
import { publicQuiz } from '@/lib/quiz-public';
import type { PostAttachment } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';

export const revalidate = 0; // Desabilitar cache para refletir itens salvos instantaneamente

export default async function BookmarksPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar todos os bookmarks do usuário com os posts completos correspondentes
  const bookmarks = await prisma.bookmark.findMany({
    where: { user_id: user.id, post: visiblePostWhere(user.id) },
    orderBy: { created_at: 'desc' },
    include: {
      post: {
        include: {
          poll: { include: postPollInclude(user.id) },
          author: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              avatar_config: true,
              total_xp: true,
            },
          },
          _count: {
            select: { answers: true },
          },
          quizzes: {
            include: {
              attempts: {
                where: { user_id: user.id },
              },
            },
          },
          votes: {
            where: { user_id: user.id },
          },
        },
      },
    },
  });

  // Mapear posts salvos
  const serializedPosts = bookmarks.map((b) => ({
    ...b.post,
    // These persisted JSON fields are validated when the post is created.
    attachments: b.post.attachments as PostAttachment[] | null,
    music: b.post.music as SpotifyProfileTrack | null,
    poll: publicPostPoll(b.post.poll),
    quizzes: b.post.quizzes.map(publicQuiz),
    created_at: b.post.created_at.toISOString(),
    bookmarks: [{ id: b.id }], // Garante que a postagem seja identificada como salva no feed de bookmarks
  }));

  // Serializar usuário
  const serializedUser = {
    id: user.id,
    username: user.username,
    avatar_url: user.avatar_url,
    avatar_config: user.avatar_config,
    role: user.role,
    total_xp: user.total_xp,
    streak: Math.max(
      user.streak_days,
      ...user.trails.map((trail: { streak: number }) => trail.streak)
    ),
    last_active_at: user.last_active_at?.toISOString() ?? null,
    trails: user.trails
      .map((trail: { id: string; language: string; xp: number; level: number }) => ({
        id: trail.id,
        language: trail.language,
        xp: trail.xp,
        level: trail.level,
      }))
      .sort((a: { xp: number }, b: { xp: number }) => b.xp - a.xp),
  };

  return <BookmarksContent user={serializedUser} initialPosts={serializedPosts} />;
}
