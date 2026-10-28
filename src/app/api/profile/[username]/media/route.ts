import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors';

export const GET = apiHandler(async (request, { params }) => {
  const { username } = await params;
  const query = new URL(request.url).searchParams;
  const type = z.enum(['photos', 'videos']).parse(query.get('type') || 'photos');
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(30)
    .parse(query.get('limit') || 18);
  const profile = await prisma.user.findFirst({
    where: { username: { equals: username, mode: 'insensitive' } },
    select: { id: true },
  });
  if (!profile) return Response.json({ error: 'Perfil não encontrado.' }, { status: 404 });
  // Posts currently support image attachments only. No video records or fabricated playback are returned.
  if (type === 'videos')
    return Response.json(
      { items: [], nextCursor: null },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  let cursor: { id: string; createdAt: Date } | undefined;
  if (query.get('cursor')) {
    let decoded: unknown;
    try {
      decoded = JSON.parse(Buffer.from(query.get('cursor')!, 'base64url').toString('utf8'));
    } catch {
      throw new ValidationError('INVALID_CURSOR', 'O cursor de fotos não é válido.');
    }
    const parsed = z
      .object({ id: z.string().min(1).max(100), createdAt: z.string().datetime() })
      .parse(decoded);
    cursor = { id: parsed.id, createdAt: new Date(parsed.createdAt) };
  }
  const rows = await prisma.post.findMany({
    where: {
      author_id: profile.id,
      image_url: { not: null, notIn: [''] },
      ...(cursor
        ? {
            OR: [
              { created_at: { lt: cursor.createdAt } },
              { created_at: cursor.createdAt, id: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: { id: true, title: true, image_url: true, created_at: true },
  });
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  const nextCursor =
    rows.length > limit && last
      ? Buffer.from(
          JSON.stringify({ id: last.id, createdAt: last.created_at.toISOString() })
        ).toString('base64url')
      : null;
  return Response.json(
    { items, nextCursor },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
});
