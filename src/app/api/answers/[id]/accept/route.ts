import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { awardXPInTransaction } from '@/lib/xp';
import { learningTransaction } from '@/lib/learning/transaction';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: answerId } = await params;

    // Buscar resposta e post relacionado
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        post: true,
      },
    });

    if (!answer) {
      return NextResponse.json({ error: 'Resposta não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário autenticado é o autor do post
    if (answer.post.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Não autorizado a aceitar esta resposta' },
        { status: 403 }
      );
    }

    // Se já foi aceita, não fazer nada
    if (answer.is_accepted) {
      return NextResponse.json({ error: 'Resposta já foi aceita' }, { status: 400 });
    }

    // Claim and reward must commit together, including concurrent requests.
    const result = await learningTransaction(async (tx) => {
      const claim = await tx.answer.updateMany({
        where: { id: answerId, is_accepted: false, post: { author_id: user.id } },
        data: { is_accepted: true },
      });
      if (claim.count !== 1) return null;
      const xpResult = await awardXPInTransaction(tx, answer.author_id, answer.post.language, 50);
      const updatedAnswer = await tx.answer.findUniqueOrThrow({ where: { id: answerId } });
      return { answer: updatedAnswer, xpResult };
    });
    if (!result) {
      return NextResponse.json({ error: 'Resposta já foi aceita' }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error accepting answer:', error);
    return NextResponse.json({ error: 'Erro ao aceitar resposta' }, { status: 500 });
  }
}
