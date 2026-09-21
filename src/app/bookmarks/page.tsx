import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { BookmarksContent } from './BookmarksContent';
import { publicQuiz } from '@/lib/quiz-public';

export const revalidate = 0; // Desabilitar cache para refletir itens salvos instantaneamente

export default async function BookmarksPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar todos os bookmarks do usuário com os posts completos correspondentes
  const bookmarks = await prisma.bookmark.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
    include: {
      post: {
        include: {
          author: {
            select: {
              username: true,
              avatar_url: true,
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
    quizzes: b.post.quizzes.map(publicQuiz),
    created_at: b.post.created_at.toISOString(),
    bookmarks: [{ id: b.id }], // Garante que a postagem seja identificada como salva no feed de bookmarks
  }));

  // Serializar usuário
  const serializedUser = {
    id: user.id,
    username: user.username,
    avatar_url: user.avatar_url,
    total_xp: user.total_xp,
  };

  return <BookmarksContent user={serializedUser} initialPosts={serializedPosts} />;
}
