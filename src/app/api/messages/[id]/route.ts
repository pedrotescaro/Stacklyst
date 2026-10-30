import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlockService } from '@/services/block.service';
import { AppError } from '@/lib/errors';
import { getAuthUser } from '@/lib/auth';

// PATCH /api/messages/[id] - Edit a message
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'O conteúdo é obrigatório' }, { status: 400 });
    }

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
    }

    // Check ownership
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta mensagem' },
        { status: 403 }
      );
    }

    await BlockService.assertCanInteract(user.id, message.receiver_id);

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        content: content.trim(),
        is_edited: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    if (error instanceof AppError)
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      );
    console.error('Error editing message:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/messages/[id] - Delete a message
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Mensagem não encontrada' }, { status: 404 });
    }

    // Check ownership
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir esta mensagem' },
        { status: 403 }
      );
    }

    // Delete message
    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
