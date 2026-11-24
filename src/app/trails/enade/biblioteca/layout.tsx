import type { ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import '@/components/MarkdownRenderer.css';
import {
  libraryOutline,
  loadStudyState,
  requireEnadeUser,
  shellUser,
} from '@/lib/enade/hub.server';
import { EnadeShell } from '../_components/EnadeShell';
import { LibraryFrame } from './_components/LibraryFrame';

/** The library keeps its navigation tree mounted while moving between articles. */
export default async function LibraryLayout({ children }: { children: ReactNode }) {
  const user = await requireEnadeUser();
  const study = await loadStudyState(user.id);
  const outline = libraryOutline();
  return (
    <EnadeShell user={shellUser(user)} wide>
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
    </EnadeShell>
  );
}
