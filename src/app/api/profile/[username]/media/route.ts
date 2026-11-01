import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { apiHandler } from '@/lib/api-handler';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors';
import { Prisma } from '@prisma/client';
import { visiblePostWhere } from '@/services/post-access.service';

export const GET = apiHandler(async (request, { params, session }) => {
  const { username } = await params;
  const query = new URL(request.url).searchParams;
  const search = query.get('search')?.trim().slice(0, 200);
  const type = z.enum(['photos', 'videos']).parse(query.get('type') || 'photos');
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(30)
    .parse(query.get('limit') || 18);
  const profile = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: 'insensitive' },
      ...visibleUserWhere(session?.id ?? null),
    },
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
      AND: [
        visiblePostWhere(session?.id ?? null),
        {
          OR: [{ image_url: { not: null, notIn: [''] } }, { attachments: { not: Prisma.DbNull } }],
        },
      ],
      ...(search
        ? {
            AND: [
              visiblePostWhere(session?.id ?? null),
              {
                OR: [
                  { image_url: { not: null, notIn: [''] } },
                  { attachments: { not: Prisma.DbNull } },
                ],
              },
              {
                OR: [
                  { title: { contains: search, mode: 'insensitive' as const } },
                  { body: { contains: search, mode: 'insensitive' as const } },
                  { code_snippet: { contains: search, mode: 'insensitive' as const } },
                ],
              },
            ],
          }
        : {}),
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
    select: { id: true, title: true, image_url: true, attachments: true, created_at: true },
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
    {
      items: items.flatMap((post) => {
        const images = Array.isArray(post.attachments)
          ? post.attachments.filter((entry): entry is Prisma.JsonObject =>
              Boolean(
                entry &&
                typeof entry === 'object' &&
                !Array.isArray(entry) &&
                (entry.type === 'image' || entry.type === 'gif') &&
                typeof entry.url === 'string'
              )
            )
          : [];
        return images.length
          ? images.map((image) => ({
              id: post.id,
              title: post.title,
              image_url: image.url,
              created_at: post.created_at,
            }))
          : post.image_url
            ? [
                {
                  id: post.id,
                  title: post.title,
                  image_url: post.image_url,
                  created_at: post.created_at,
                },
              ]
            : [];
      }),
      nextCursor,
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
});
