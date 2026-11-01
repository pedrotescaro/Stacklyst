import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { visiblePostWhere } from '@/services/post-access.service';

export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getAuthUser();
  const media = await prisma.postMedia.findFirst({
    where: {
      id,
      OR: [
        ...(viewer ? [{ owner_id: viewer.id, post_id: null }] : []),
        { post: visiblePostWhere(viewer?.id ?? null) },
      ],
    },
  });
  if (!media) return NextResponse.json({ error: 'Anexo não encontrado.' }, { status: 404 });
  const storage = getSupabaseAdminClient();
  if (!storage) return NextResponse.json({ error: 'Armazenamento indisponível.' }, { status: 503 });
  const result = await storage.storage.from('post-media').download(media.storage_path);
  if (result.error || !result.data)
    return NextResponse.json({ error: 'Anexo indisponível.' }, { status: 404 });
  // Proxy bytes instead of handing out a signed URL that survives revoked follows.
  const bytes = await result.data.arrayBuffer();
  const headers: Record<string, string> = {
    'Content-Type': media.content_type,
    'Content-Length': String(result.data.size),
    'Content-Disposition': 'inline',
    'Cache-Control': 'private, no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
    Vary: 'Cookie, Authorization',
  };
  const range = request.headers.get('range');
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const size = bytes.byteLength;
    const start = match?.[1]
      ? Number(match[1])
      : match?.[2]
        ? Math.max(0, size - Number(match[2]))
        : NaN;
    const end = match?.[1] && match?.[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
    if (!Number.isSafeInteger(start) || start < 0 || start >= size || end < start) {
      return new Response(null, {
        status: 416,
        headers: { ...headers, 'Content-Range': `bytes */${size}`, 'Content-Length': '0' },
      });
    }
    return new Response(bytes.slice(start, end + 1), {
      status: 206,
      headers: {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(end - start + 1),
      },
    });
  }
  return new Response(bytes, { headers });
}
