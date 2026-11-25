import Link from 'next/link';
import {
  ArrowUpRight,
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
import { tableOfContents } from '@/lib/enade/library/markdown';
import { QUESTION_BY_ID } from '@/lib/enade/simulator';
import { questionLabel } from '@/lib/enade/topics';
import { ArticleMarkdown } from './ArticleMarkdown';
import { Quiz } from './Quiz';
import { FigureFrame } from './FigureFrame';
import { getFigure } from '../figures';
import { getBookFigure } from '../figures/bookFigures';
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
  const readingBlocks = groupQuestionComments(blocks);
  return (
    <div className={`${styles.body} dd-markdown`}>
      {readingBlocks.map(({ block, comment, section }, index) => {
        switch (block.type) {
          case 'markdown':
            return <ArticleMarkdown key={index} text={block.text} />;
          case 'callout': {
            const { label, icon: Icon } = CALLOUT[block.variant];
            const showTitle =
              block.title || block.variant !== 'enade' || section !== 'como-cai-no-enade';
            return (
              <aside
                key={index}
                className={styles.callout}
                data-variant={block.variant}
                aria-label={label}
              >
                <Icon className={styles.calloutIcon} size={18} aria-hidden="true" />
                <div className={styles.calloutContent}>
                  {showTitle && <p className={styles.calloutTitle}>{block.title || label}</p>}
                  <ArticleMarkdown text={block.text} />
                </div>
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
          case 'figure': {
            const bookFigure = getBookFigure(block.id);
            if (bookFigure) {
              const { title, source, src, alt, width, height } = bookFigure;
              const crop = (
                // Keep the original crop bytes available when opening the large view.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} width={width} height={height} loading="lazy" />
              );
              return (
                <FigureFrame
                  key={index}
                  id={block.id}
                  title={title}
                  sources={[source]}
                  bookCrop
                  expanded={crop}
                >
                  {crop}
                </FigureFrame>
              );
            }
            const figure = getFigure(block.id);
            if (!figure) throw new Error(`Artigo ${slug}: figura desconhecida: ${block.id}.`);
            const { component: Diagram, title, source, relatedSources = [] } = figure;
            return (
              <FigureFrame
                key={index}
                id={block.id}
                title={title}
                sources={[source, ...relatedSources]}
                expanded={<Diagram />}
              >
                <Diagram />
              </FigureFrame>
            );
          }
          case 'widget':
            return <Widget key={index} name={block.name} props={block.props} />;
          case 'question': {
            const q = QUESTION_BY_ID.get(block.id);
            if (!q) return null;
            const label = questionLabel(q);
            return (
              <div key={index} className={styles.official}>
                <div className={styles.officialHead}>
                  <div>
                    <p className={styles.officialTag}>{label} · Inep</p>
                    {block.note && <p className={styles.officialTitle}>{block.note}</p>}
                  </div>
                  <Link href={`/trails/enade/questoes/${q.id}`} aria-label={`Ver ${label}`}>
                    Ver questão <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
                {comment && (
                  <div className={styles.officialComment}>
                    <ArticleMarkdown text={comment} />
                  </div>
                )}
              </div>
            );
          }
        }
      })}
    </div>
  );
}

function groupQuestionComments(blocks: ArticleBlock[]) {
  const reading: { block: ArticleBlock; section: string; comment?: string }[] = [];
  let section = '';

  for (const block of blocks) {
    if (block.type !== 'markdown') {
      reading.push({ block, section });
      continue;
    }

    const previous = reading.at(-1);
    let text = block.text;
    if (section === 'questoes-comentadas' && previous?.block.type === 'question') {
      const nextSection = /^##[\t ]+\S/m.exec(text);
      previous.comment = text.slice(0, nextSection?.index ?? text.length).trim();
      text = nextSection ? text.slice(nextSection.index) : '';
    }
    if (!text) continue;
    const adjusted = { ...block, text };
    section = tableOfContents([adjusted]).findLast((entry) => entry.depth === 2)?.id ?? section;
    reading.push({ block: adjusted, section });
  }

  return reading;
}
