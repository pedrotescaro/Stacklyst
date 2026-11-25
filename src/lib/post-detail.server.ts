import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { publicQuiz } from '@/lib/quiz-public';
import { getAuthUser } from '@/lib/auth';
import { buildAnswerThreads, findAnswerPath } from '@/lib/answer-threads';
import { visiblePostWhere } from '@/services/post-access.service';
import { postPollInclude, publicPostPoll } from '@/lib/post-poll';

const authorSelect = {
  id: true,
  username: true,
  avatar_url: true,
  avatar_config: true,
  total_xp: true,
} as const;

export async function loadPostDetail(postId: string, focusedAnswerId?: string) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const postPromise = prisma.post.findFirst({
    where: { AND: [{ id: postId }, visiblePostWhere(user.id)] },
    include: {
      poll: { include: postPollInclude(user.id) },
      author: {
        select: authorSelect,
      },
      answers: {
        where: { author: visibleUserWhere(user.id) },
        orderBy: { created_at: 'asc' },
        include: {
          author: {
            select: authorSelect,
          },
          votes: {
            where: { user_id: user.id },
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
        post_id: postId,
      },
    },
  });

  const [post, bookmark] = await Promise.all([postPromise, bookmarkPromise]);

  if (!post) {
    notFound();
  }

  // Keep replies under their real parent, including when that branch is hidden by blocking.
  const answers = buildAnswerThreads(
    post.answers.map((answer) => ({ ...answer, created_at: answer.created_at.toISOString() }))
  ).filter((answer) => answer.parent_id === null);

  if (focusedAnswerId && !findAnswerPath(answers, focusedAnswerId)) {
    notFound();
  }

  await prisma.post.update({ where: { id: postId }, data: { view_count: { increment: 1 } } });

  return {
    initialIsSaved: !!bookmark,
    post: {
      ...post,
      poll: publicPostPoll(post.poll),
      created_at: post.created_at.toISOString(),
      answers,
      quizzes: post.quizzes.map((quiz) => ({
        ...publicQuiz(quiz),
        created_at: quiz.created_at.toISOString(),
      })),
    },
    user: {
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      avatar_config: user.avatar_config,
      total_xp: user.total_xp,
      streak: Math.max(
        user.streak_days ?? 0,
        ...(user.trails ?? []).map((trail: { streak: number }) => trail.streak)
      ),
      last_active_at: user.last_active_at?.toISOString() ?? null,
      trails: (user.trails ?? []).map(
        (trail: { id: string; language: string; level: number; xp: number; streak: number }) => ({
          id: trail.id,
          language: trail.language,
          level: trail.level,
          xp: trail.xp,
          streak: trail.streak,
        })
      ),
      badges: (user.badges ?? []).map(
        (entry: {
          badge: {
            slug: string;
            label: string;
            description: string;
            icon: string;
            color: string;
          };
          earned_at: Date;
        }) => ({ ...entry.badge, earned_at: entry.earned_at.toISOString() })
      ),
    },
  };
}
