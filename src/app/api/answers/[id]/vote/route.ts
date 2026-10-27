import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { syncProfileAchievementsSafely } from '@/services/profile-customization.service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: answerId } = await params;
    const body = await request.json();
    const { value } = body; // 1 (upvote), -1 (downvote), ou 0 (remover voto)

    if (value !== 1 && value !== -1 && value !== 0) {
      return NextResponse.json({ error: 'Valor de voto inválido' }, { status: 400 });
    }

    // 1. Atualizar ou deletar o AnswerVote
    if (value === 0) {
      await prisma.answerVote
        .delete({
          where: {
            answer_id_user_id: {
              answer_id: answerId,
              user_id: user.id,
            },
          },
        })
        .catch(() => {
          // Silenciar erro se o voto não existir
        });
    } else {
      await prisma.answerVote.upsert({
        where: {
          answer_id_user_id: {
            answer_id: answerId,
            user_id: user.id,
          },
        },
        update: { value },
        create: {
          answer_id: answerId,
          user_id: user.id,
          value,
        },
      });
    }

    // 2. Calcular o novo saldo de votos
    const aggregate = await prisma.answerVote.aggregate({
      where: { answer_id: answerId },
      _sum: { value: true },
    });

    const newUpvotes = aggregate._sum.value ?? 0;

    // 3. Atualizar a contagem total no modelo Answer
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: { upvotes: newUpvotes },
      select: { author_id: true },
    });
    await syncProfileAchievementsSafely(updatedAnswer.author_id);

    return NextResponse.json({ success: true, upvotes: newUpvotes });
  } catch (error: any) {
    console.error('Error casting answer vote:', error);
    return NextResponse.json({ error: error.message || 'Erro ao votar' }, { status: 500 });
  }
}
