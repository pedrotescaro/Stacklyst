import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { UnauthorizedError } from '@/lib/errors';
import { loadLibrary } from '@/lib/enade/library/load';
import { searchLibrary } from '@/lib/enade/library/catalog';

export const GET = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const query = (new URL(request.url).searchParams.get('q') || '').slice(0, 120);
  const library = loadLibrary();
  const titles = new Map(library.categories.map((c) => [c.slug, c.title]));
  return NextResponse.json({
    results: searchLibrary(library, query).map((hit) => ({
      ...hit,
      categoryTitle: titles.get(hit.category) ?? hit.category,
    })),
  });
});
