import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { visiblePostWhere } from '@/services/post-access.service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Motivo é obrigatório' }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findFirst({
      where: { AND: [{ id: postId }, visiblePostWhere(user.id)] },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    // Create report (upsert or create)
    const existingReport = await prisma.report.findFirst({
      where: {
        user_id: user.id,
        post_id: postId,
      },
    });

    let report;
    if (existingReport) {
      report = await prisma.report.update({
        where: { id: existingReport.id },
        data: { reason: reason.trim() },
      });
    } else {
      report = await prisma.report.create({
        data: {
          user_id: user.id,
          post_id: postId,
          reason: reason.trim(),
        },
      });
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Error reporting post:', error);
    return NextResponse.json({ error: 'Erro ao denunciar postagem' }, { status: 500 });
  }
}
