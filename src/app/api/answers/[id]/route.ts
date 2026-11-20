import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { uploadedMediaIds } from '@/lib/post-content';
import { encodeReplyMedia, parseReplyMedia, stripReplyMedia } from '@/lib/reply-media';
import { appendPostExtras, parsePostExtras } from '@/lib/post-composer';
import { updateAnswerSchema } from '@/lib/validators';

/**
 * Edits the text of a reply written by the signed-in user. The reply's media
 * (attachments, Spotify track) and composer markers (sensitive content,
 * location) are taken from the stored reply, so editing never drops them.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const parsed = updateAnswerSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Resposta inválida.' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const answer = await prisma.answer.findUnique({
      where: { id },
      select: { author_id: true, body: true },
    });
    if (!answer) {
      return NextResponse.json({ error: 'Resposta não encontrada' }, { status: 404 });
    }
    if (answer.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Você só pode editar as suas próprias respostas.' },
        { status: 403 }
      );
    }

    const media = parseReplyMedia(answer.body);
    const extras = parsePostExtras(media.content);
    const text = stripReplyMedia(parsed.data.body);
    if (text.length < 5 && !media.attachments.length && !media.music) {
      return NextResponse.json(
        { error: 'A resposta deve ter pelo menos 5 caracteres' },
        { status: 400 }
      );
    }

    const body = encodeReplyMedia(
      appendPostExtras(text, {
        isSensitive: extras.isSensitive,
        location: extras.location ?? undefined,
      }),
      { attachments: media.attachments, music: media.music }
    );
    const updated = await prisma.answer.update({
      where: { id },
      data: { body },
      select: { id: true, body: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error editing answer:', error);
    return NextResponse.json({ error: 'Não foi possível editar a resposta.' }, { status: 500 });
  }
}

/**
 * Deletes a reply written by the signed-in user.
 *
 * Replies below it may belong to other people, so they are not deleted with
 * it (the schema would cascade): they move up to the deleted reply's parent
 * and stay in the thread. Files uploaded for the reply are released too.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const answer = await prisma.answer.findUnique({
      where: { id },
      select: { author_id: true, post_id: true, parent_id: true, body: true },
    });
    if (!answer) {
      return NextResponse.json({ error: 'Resposta não encontrada' }, { status: 404 });
    }
    if (answer.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Você só pode excluir as suas próprias respostas.' },
        { status: 403 }
      );
    }

    const mediaIds = uploadedMediaIds(parseReplyMedia(answer.body).attachments);
    await prisma.$transaction([
      prisma.answer.updateMany({
        where: { parent_id: id },
        data: { parent_id: answer.parent_id },
      }),
      ...(mediaIds.length
        ? [
            prisma.postMedia.deleteMany({
              where: { id: { in: mediaIds }, owner_id: user.id, post_id: answer.post_id },
            }),
          ]
        : []),
      prisma.answer.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting answer:', error);
    return NextResponse.json({ error: 'Não foi possível excluir a resposta.' }, { status: 500 });
  }
}
