import Link from 'next/link';
import {
  BookMarked,
  FlaskConical,
  GraduationCap,
  Info,
  Lightbulb,
  ListChecks,
  OctagonAlert,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ArticleBlock, CalloutVariant } from '@/lib/enade/library/markdown';
import { QUESTION_BY_ID } from '@/lib/enade/simulator';
import { questionLabel } from '@/lib/enade/topics';
import { ArticleMarkdown } from './ArticleMarkdown';
import { Quiz } from './Quiz';
import { Mermaid } from './Mermaid';
import { Widget } from '../widgets/Widget';
import styles from './article.module.css';

export const CALLOUT: Record<CalloutVariant, { label: string; icon: LucideIcon }> = {
  tip: { label: 'Dica', icon: Lightbulb },
  trap: { label: 'Pegadinha de prova', icon: TriangleAlert },
  enade: { label: 'Como cai no ENADE', icon: GraduationCap },
  example: { label: 'Exemplo prático', icon: FlaskConical },
  note: { label: 'Observação', icon: Info },
  definition: { label: 'Definição', icon: BookMarked },
  mnemonic: { label: 'Macete', icon: Sparkles },
  warning: { label: 'Atenção', icon: OctagonAlert },
  summary: { label: 'Resumo', icon: ListChecks },
};

export function ArticleBody({
  blocks,
  slug,
  quizBest,
}: {
  blocks: ArticleBlock[];
  slug: string;
  quizBest?: { best: number | null; total: number | null };
}) {
  const quizzes = blocks.filter((block) => block.type === 'quiz');
  return (
    <div className={`${styles.body} dd-markdown`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'markdown':
            return <ArticleMarkdown key={index} text={block.text} />;
          case 'callout': {
            const { label, icon: Icon } = CALLOUT[block.variant];
            return (
              <aside key={index} className={styles.callout} data-variant={block.variant}>
                <p className={styles.calloutTitle}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{block.title || label}</span>
                  {block.title && <span className={styles.calloutKind}>{label}</span>}
                </p>
                <ArticleMarkdown text={block.text} />
              </aside>
            );
          }
          case 'details':
            return (
              <details key={index} className={styles.toggle}>
                <summary>{block.title || 'Ver mais'}</summary>
                <div>
                  <ArticleMarkdown text={block.text} />
                </div>
              </details>
            );
          case 'quiz':
            return (
              <Quiz
                key={index}
                slug={slug}
                index={quizzes.indexOf(block)}
                items={block.items}
                best={quizBest}
              />
            );
          case 'mermaid':
            return <Mermaid key={index} code={block.code} caption={block.caption} />;
          case 'widget':
            return <Widget key={index} name={block.name} props={block.props} />;
          case 'question': {
            const q = QUESTION_BY_ID.get(block.id);
            if (!q) return null;
            return (
              <div key={index} className={styles.official}>
                <p>
                  <span className={styles.officialTag}>Questão oficial · Inep</span>{' '}
                  <Link href={`/trails/enade/questoes/${q.id}`}>{questionLabel(q)}</Link>
                </p>
                {block.note && <p className={styles.officialNote}>{block.note}</p>}
              </div>
            );
          }
        }
      })}
    </div>
  );
}
