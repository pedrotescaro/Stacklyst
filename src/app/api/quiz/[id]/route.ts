import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserId } from '@/lib/auth-session';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId();

    const quiz = await prisma.quiz.findFirst({
      where: { post_id: id },
      include: {
        attempts: userId
          ? {
              where: { user_id: userId },
            }
          : false,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const hasAttempted = Boolean(quiz.attempts && quiz.attempts.length > 0);
    const sanitizedQuiz = {
      id: quiz.id,
      post_id: quiz.post_id,
      question: quiz.question,
      options: quiz.options,
      is_daily: quiz.is_daily,
      scheduled_for: quiz.scheduled_for,
      attempts: hasAttempted ? quiz.attempts : [],
      ...(hasAttempted
        ? {
            correct_index: quiz.correct_index,
          }
        : {}),
    };

    return NextResponse.json(sanitizedQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Erro ao buscar quiz' }, { status: 500 });
  }
}
