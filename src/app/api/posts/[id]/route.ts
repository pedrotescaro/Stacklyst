import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { getAuthUser } from '@/lib/auth';
import { extractPostMetadata } from '@/lib/editor/extract-metadata';
import { publicQuiz } from '@/lib/quiz-public';
import { buildAnswerThreads } from '@/lib/answer-threads';
import { visiblePostWhere } from '@/services/post-access.service';
import { postPollInclude, publicPostPoll } from '@/lib/post-poll';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();

    const post = await prisma.post.findFirst({
      where: { AND: [{ id }, visiblePostWhere(user?.id ?? null)] },
      include: {
        poll: { include: postPollInclude(user?.id ?? null) },
        author: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            avatar_config: true,
            total_xp: true,
          },
        },
        answers: {
          where: { author: visibleUserWhere(user?.id ?? null) },
          // Fetch the full thread once. A fixed nested include silently drops deep replies.
          orderBy: { created_at: 'asc' },
          include: {
            author: {
              select: {
                username: true,
                avatar_url: true,
                avatar_config: true,
                total_xp: true,
              },
            },
            votes: user ? { where: { user_id: user.id } } : { where: { id: 'none' } },
          },
        },
        quizzes: {
          include: {
            attempts: user ? { where: { user_id: user.id } } : { where: { id: 'none' } },
          },
        },
        votes: user ? { where: { user_id: user.id } } : { where: { id: 'none' } },
        bookmarks: user ? { where: { user_id: user.id } } : { where: { id: 'none' } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    await prisma.post.update({ where: { id }, data: { view_count: { increment: 1 } } });

    return NextResponse.json({
      ...post,
      poll: publicPostPoll(post.poll),
      answers: buildAnswerThreads(post.answers),
      quizzes: post.quizzes.map(publicQuiz),
    });
  } catch (error) {
    console.error('Error fetching post details:', error);
    return NextResponse.json({ error: 'Erro ao buscar detalhes do post' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        author_id: true,
        attachments: true,
        music: true,
        image_url: true,
        poll: { select: { id: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { body } = await request.json();
    if (
      typeof body !== 'string' ||
      body.length > 5000 ||
      (!body.trim() && !post.attachments && !post.music && !post.image_url && !post.poll)
    ) {
      return NextResponse.json(
        { error: 'Adicione um conteúdo válido de até 5.000 caracteres.' },
        { status: 400 }
      );
    }

    const postMetadata = extractPostMetadata(body);

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        body: body.trim(),
        language: postMetadata.language,
        code_snippet: postMetadata.code || null,
      },
      include: {
        poll: { include: postPollInclude(user.id) },
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
        quizzes: true,
      },
    });

    return NextResponse.json({
      ...updatedPost,
      poll: publicPostPoll(updatedPost.poll),
      quizzes: updatedPost.quizzes.map(publicQuiz),
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Erro ao editar post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { author_id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Erro ao deletar post' }, { status: 500 });
  }
}
