'use client';

import { Fragment, useId, useRef, useState, type ReactNode } from 'react';
import { Maximize2, X } from 'lucide-react';
import type { FigureSource } from '../figures/types';
import styles from './FigureFrame.module.css';

export function FigureFrame({
  id,
  title,
  sources,
  children,
  expanded,
}: {
  id: string;
  title: string;
  sources: FigureSource[];
  children: ReactNode;
  expanded: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const [open, setOpen] = useState(false);

  function showFigure() {
    dialog.current?.showModal();
    setOpen(true);
  }

  return (
    <figure className={styles.diagram} data-figure-id={id}>
      <div className={styles.diagramFrame}>{children}</div>
      <figcaption className={styles.diagramCaption}>
        <div>
          <strong>{title}</strong>
          <span className={styles.diagramSource}>
            Fonte: modelo descrito em{' '}
            {sources.map(({ author, year, chapter, href }, index) => {
              const citation = `${author.toLocaleUpperCase('pt-BR')} (${year}${chapter ? `, ${chapter}` : ''})`;
              return (
                <Fragment key={citation}>
                  {index > 0 && ' e '}
                  {href ? <a href={href}>{citation}</a> : citation}
                </Fragment>
              );
            })}
            ; ilustração autoral Stacklyst.
          </span>
        </div>
        <button
          type="button"
          className={styles.diagramExpand}
          onClick={showFigure}
          aria-label={`Ampliar figura: ${title}`}
          aria-controls={dialogId}
          aria-haspopup="dialog"
          title="Ampliar figura"
        >
          <Maximize2 size={16} aria-hidden="true" />
        </button>
      </figcaption>
      <dialog
        id={dialogId}
        ref={dialog}
        className={styles.diagramDialog}
        aria-labelledby={`${dialogId}-title`}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className={styles.diagramDialogHead}>
          <span id={`${dialogId}-title`}>{title}</span>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Fechar figura ampliada"
            title="Fechar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {open && (
          <div className={styles.diagramDialogBody} tabIndex={0} aria-label="Figura ampliada">
            {expanded}
          </div>
        )}
      </dialog>
    </figure>
  );
}
