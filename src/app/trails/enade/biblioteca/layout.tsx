import type { ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import '@/components/MarkdownRenderer.css';
import { libraryOutline, loadStudyState, requireEnadeUserId } from '@/lib/enade/hub.server';
import { LibraryFrame } from './_components/LibraryFrame';

/** The library keeps its navigation tree mounted while moving between articles. */
export default async function LibraryLayout({ children }: { children: ReactNode }) {
  const userId = await requireEnadeUserId();
  const study = await loadStudyState(userId);
  const outline = libraryOutline();
  return (
    <LibraryFrame
      categories={outline.categories}
      articles={outline.articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
        parent: a.parent,
      }))}
      studied={study.studied}
      favorites={study.favoriteArticles}
    >
      {children}
    </LibraryFrame>
  );
}
