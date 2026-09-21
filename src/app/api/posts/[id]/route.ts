import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { extractPostMetadata } from '@/lib/editor/extract-metadata';
import { publicQuiz } from '@/lib/quiz-public';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();

    // Incrementar visualizações do post
    await prisma.post.update({
      where: { id },
      data: {
        view_count: {
          increment: 1,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            username: true,
            avatar_url: true,
            total_xp: true,
          },
        },
        answers: {
          // Only top-level answers here; nested replies come embedded via `replies`.
          where: { parent_id: null },
          orderBy: { created_at: 'asc' },
          include: {
            author: {
              select: {
                username: true,
                avatar_url: true,
              },
            },
            votes: user ? { where: { user_id: user.id } } : { where: { id: 'none' } },
            // Nested replies up to 3 levels deep (matches the UI indent cap).
            replies: {
              orderBy: { created_at: 'asc' },
              include: {
                author: { select: { username: true, avatar_url: true } },
                votes: user ? { where: { user_id: user.id } } : { where: { id: 'none' } },
                replies: {
                  orderBy: { created_at: 'asc' },
                  include: {
                    author: { select: { username: true, avatar_url: true } },
                    votes: user ? { where: { user_id: user.id } } : { where: { id: 'none' } },
                    replies: {
                      orderBy: { created_at: 'asc' },
                      include: {
                        author: { select: { username: true, avatar_url: true } },
                        votes: user ? { where: { user_id: user.id } } : { where: { id: 'none' } },
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

    return NextResponse.json({ ...post, quizzes: post.quizzes.map(publicQuiz) });
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
      select: { author_id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { body } = await request.json();
    if (!body || body.trim().length < 10) {
      return NextResponse.json(
        { error: 'O conteúdo deve ter pelo menos 10 caracteres' },
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

    return NextResponse.json({ ...updatedPost, quizzes: updatedPost.quizzes.map(publicQuiz) });
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
