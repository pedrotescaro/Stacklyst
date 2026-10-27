import { apiHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
export const GET = apiHandler(
  async (request) => {
    const query = z
      .string()
      .max(24)
      .parse(new URL(request.url).searchParams.get('q') || '')
      .trim()
      .replace(/^#/, '')
      .toLowerCase();
    const rows = await prisma.$queryRaw<Array<{ tag: string }>>`
    SELECT DISTINCT tag FROM profile_customizations p,
      jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.preferences->'tags')='array' THEN p.preferences->'tags' ELSE '[]'::jsonb END) AS tag
    WHERE tag LIKE ${query + '%'} AND char_length(tag)<=24 ORDER BY tag LIMIT 15
  `;
    return Response.json(
      { tags: rows.map((row) => row.tag) },
      { headers: { 'Cache-Control': 'public, max-age=30' } }
    );
  },
  { resolveSession: false }
);
