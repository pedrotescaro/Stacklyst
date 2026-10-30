import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { publicQuiz } from '@/lib/quiz-public';
import { getAuthUser } from '@/lib/auth';
import { PostDetailContent } from './PostDetailContent';

export const revalidate = 0; // Desabilitar cache para dados dinâmicos de comentários/respostas

const authorSelect = {
  id: true,
  username: true,
  avatar_url: true,
  avatar_config: true,
  total_xp: true,
} as const;

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { id }] = await Promise.all([getAuthUser(), params]);

  if (!user) {
    redirect('/login');
  }

  // Incrementar visualizações do post no lado do servidor
  const postPromise = prisma.post.findFirst({
    where: { id, author: visibleUserWhere(user.id) },
    include: {
      author: {
        select: authorSelect,
      },
      answers: {
        // Only top-level answers here; nested replies come embedded via `replies`.
        where: { parent_id: null, author: visibleUserWhere(user.id) },
        orderBy: { created_at: 'asc' },
        include: {
          author: {
            select: authorSelect,
          },
          votes: {
            where: { user_id: user.id },
          },
          // Nested replies up to 3 levels deep (matches the UI indent cap).
          replies: {
            where: { author: visibleUserWhere(user.id) },
            orderBy: { created_at: 'asc' },
            include: {
              author: { select: authorSelect },
              votes: { where: { user_id: user.id } },
              replies: {
                where: { author: visibleUserWhere(user.id) },
                orderBy: { created_at: 'asc' },
                include: {
                  author: { select: authorSelect },
                  votes: { where: { user_id: user.id } },
                  replies: {
                    where: { author: visibleUserWhere(user.id) },
                    orderBy: { created_at: 'asc' },
                    include: {
                      author: { select: authorSelect },
                      votes: { where: { user_id: user.id } },
                    },
                  },
                },
              },
            },
          },
        },
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
  });

  const bookmarkPromise = prisma.bookmark.findUnique({
    where: {
      user_id_post_id: {
        user_id: user.id,
        post_id: id,
      },
    },
  });

  const [post, bookmark] = await Promise.all([postPromise, bookmarkPromise]);

  if (!post) {
    notFound();
  }

  await prisma.post.update({ where: { id }, data: { view_count: { increment: 1 } } });

  // Verificar se o post está salvo nos bookmarks do usuário
  const initialIsSaved = !!bookmark;

  // Serializar datas
  const serializedPost = {
    ...post,
    created_at: post.created_at.toISOString(),
    answers: post.answers.map((answer) => ({
      ...answer,
      created_at: answer.created_at.toISOString(),
    })),
    quizzes: post.quizzes.map((quiz) => ({
      ...publicQuiz(quiz),
      created_at: quiz.created_at.toISOString(),
    })),
  };

  return (
    <PostDetailContent
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        total_xp: user.total_xp,
      }}
      post={serializedPost}
      initialIsSaved={initialIsSaved}
    />
  );
}
