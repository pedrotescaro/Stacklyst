import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Limite de tamanho de 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'O arquivo não pode exceder 5MB' }, { status: 400 });
    }

    // Permitir apenas imagens raster seguras (rejeita SVG para evitar XSS armazenado)
    const ALLOWED_TYPES: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          error:
            'Tipo de arquivo não suportado. Envie apenas imagens nos formatos JPEG, PNG, GIF ou WebP.',
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validação de magic bytes para impedir MIME-type spoofing
    const isValidImage =
      (ext === 'jpg' &&
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff) ||
      (ext === 'png' &&
        buffer.length >= 4 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47) ||
      (ext === 'gif' &&
        buffer.length >= 4 &&
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x38) ||
      (ext === 'webp' &&
        buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP');

    if (!isValidImage) {
      return NextResponse.json(
        { error: 'Arquivo corrompido ou formato de imagem inválido.' },
        { status: 400 }
      );
    }

    // Gerar um caminho imprevisível associado ao usuário
    const uniqueName = `${user.id}/${crypto.randomUUID()}.${ext}`;

    // Inicializar o cliente do Supabase
    const supabase = await createClient();

    // Upload do arquivo para o bucket 'uploads' no Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(uniqueName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload da imagem para o armazenamento em nuvem' },
        { status: 500 }
      );
    }

    // Obter a URL pública do arquivo
    const {
      data: { publicUrl },
    } = supabase.storage.from('uploads').getPublicUrl(uniqueName);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 });
  }
}
