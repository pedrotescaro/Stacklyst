import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { requireAuth } from '@/lib/auth';
import { apiHandler } from '@/lib/api-handler';
import { rateLimit } from '@/lib/ratelimit';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';

export const runtime = 'nodejs';
export const POST = apiHandler(async (request) => {
  const user = await requireAuth();
  await rateLimit(`post-media:${user.id}`, {
    limit: 40,
    window: '1 h',
    endpoint: '/api/posts/media',
  });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !file.size)
    throw new ValidationError('INVALID_FILE', 'Escolha um arquivo válido.');
  if (file.size > 10 * 1024 * 1024)
    throw new ValidationError('FILE_TOO_LARGE', 'O arquivo deve ter até 10 MB.');
  let contentType = file.type.split(';')[0].toLowerCase();
  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  let extension = '';
  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(contentType)) {
    if (file.size > 5 * 1024 * 1024)
      throw new ValidationError('FILE_TOO_LARGE', 'Imagens e GIFs devem ter até 5 MB.');
    try {
      const decoder = sharp(buffer, { limitInputPixels: 40000000, animated: false });
      const metadata = await decoder.metadata();
      const formats: Record<string, string> = {
        'image/jpeg': 'jpeg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };
      if (
        metadata.format !== formats[contentType] ||
        !metadata.width ||
        !metadata.height ||
        metadata.width > 12000 ||
        metadata.height > 12000
      )
        throw new Error('Invalid image');
      if (contentType === 'image/gif') {
        // Validate a frame without flattening the original animation.
        await decoder.resize(1, 1).toBuffer();
        extension = 'gif';
      } else {
        buffer = await decoder
          .rotate()
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();
        contentType = 'image/webp';
        extension = 'webp';
      }
    } catch {
      throw new ValidationError('INVALID_IMAGE', 'Não foi possível ler essa imagem.');
    }
  } else {
    const signature = buffer.toString('ascii', 0, 12);
    const valid =
      (contentType === 'audio/webm' &&
        buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) ||
      (contentType === 'audio/ogg' && signature.startsWith('OggS')) ||
      (contentType === 'audio/mp4' && signature.substring(4, 8) === 'ftyp') ||
      (contentType === 'audio/mpeg' &&
        (signature.startsWith('ID3') || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)));
    if (!valid)
      throw new ValidationError('INVALID_AUDIO', 'Envie um áudio WebM, Ogg, MP4 ou MP3 válido.');
    extension = (
      {
        'audio/webm': 'webm',
        'audio/ogg': 'ogg',
        'audio/mp4': 'm4a',
        'audio/mpeg': 'mp3',
      } as Record<string, string>
    )[contentType];
  }
  const storage = getSupabaseAdminClient();
  if (!storage)
    return NextResponse.json(
      { error: 'O armazenamento de anexos está indisponível.' },
      { status: 503 }
    );
  const bucket = await storage.storage.getBucket('post-media');
  if (bucket.error) {
    const created = await storage.storage.createBucket('post-media', {
      public: false,
      fileSizeLimit: 10485760,
    });
    if (created.error && !created.error.message.toLowerCase().includes('already exists'))
      return NextResponse.json(
        { error: 'Não foi possível preparar o armazenamento de anexos.' },
        { status: 503 }
      );
  } else if (bucket.data.public) {
    return NextResponse.json(
      { error: 'O armazenamento privado precisa ser configurado.' },
      { status: 503 }
    );
  }
  const id = crypto.randomUUID();
  const path = `${user.id}/${id}.${extension}`;
  const uploaded = await storage.storage
    .from('post-media')
    .upload(path, buffer, { contentType, upsert: false });
  if (uploaded.error)
    return NextResponse.json(
      { error: 'Não foi possível enviar o anexo. Tente novamente.' },
      { status: 503 }
    );
  try {
    await prisma.postMedia.create({
      data: {
        id,
        owner_id: user.id,
        storage_path: path,
        content_type: contentType,
        size: buffer.length,
      },
    });
  } catch (error) {
    await storage.storage.from('post-media').remove([path]);
    throw error;
  }
  return NextResponse.json({ url: `/api/posts/media/${id}` }, { status: 201 });
});
