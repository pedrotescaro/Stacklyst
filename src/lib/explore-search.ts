export const EXPLORE_QUERY_MAX_LENGTH = 100;

export type ExploreTab = 'posts' | 'people';

export function exploreSearchUrl(query: string, tab?: ExploreTab) {
  const term = query.trim().slice(0, EXPLORE_QUERY_MAX_LENGTH);
  if (!term) return '/explore';

  const params = new URLSearchParams({ q: term });
  if (tab === 'people' || term.startsWith('@')) params.set('tab', tab ?? 'people');
  return `/explore?${params}`;
}
