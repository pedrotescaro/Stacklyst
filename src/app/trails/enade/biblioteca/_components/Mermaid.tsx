'use client';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Maximize2, X } from 'lucide-react';
import styles from './article.module.css';

let sequence = 0;

/** Natural width of a rendered diagram, from its viewBox. */
function naturalWidth(svg: string) {
  const match = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) [\d.]+"/.exec(svg);
  return match ? Number(match[1]) : 0;
}

/**
 * A wide class diagram can be redrawn top-to-bottom to fit the reading column: its
 * layout carries no meaning. Flowcharts keep their direction (a V model or a pipeline
 * reads left to right on purpose).
 */
function verticalVariant(code: string) {
  if (!/^\s*classDiagram\b/.test(code)) return null;
  const vertical = code.replace(/^(\s*direction)\s+LR\b/m, '$1 TB');
  return vertical === code ? null : vertical;
}

/** Diagrams never shrink below this share of their natural size, so labels stay legible. */
const MIN_SCALE = 0.75;

/** Stacklyst palette for diagrams: blue-outlined nodes, readable text, quiet lines. */
function themeVariables(dark: boolean) {
  return dark
    ? {
        background: 'transparent',
        fontSize: '15px',
        primaryColor: '#0f2236',
        primaryBorderColor: '#3d9bff',
        primaryTextColor: '#e7e9ea',
        secondaryColor: '#16181c',
        secondaryBorderColor: '#536471',
        secondaryTextColor: '#e7e9ea',
        tertiaryColor: '#0f1419',
        tertiaryBorderColor: '#2f3336',
        tertiaryTextColor: '#e7e9ea',
        mainBkg: '#0f2236',
        nodeBorder: '#3d9bff',
        nodeTextColor: '#e7e9ea',
        textColor: '#e7e9ea',
        titleColor: '#e7e9ea',
        lineColor: '#8b98a5',
        edgeLabelBackground: '#16181c',
        clusterBkg: '#0b1117',
        clusterBorder: '#2f3336',
        noteBkgColor: '#2a2410',
        noteTextColor: '#f5e6b8',
        noteBorderColor: '#a3842a',
        actorBkg: '#0f2236',
        actorBorder: '#3d9bff',
        actorTextColor: '#e7e9ea',
        actorLineColor: '#536471',
        signalColor: '#c4cdd5',
        signalTextColor: '#e7e9ea',
        labelBoxBkgColor: '#16181c',
        labelBoxBorderColor: '#536471',
        labelTextColor: '#e7e9ea',
        loopTextColor: '#e7e9ea',
        activationBkgColor: '#1d3a5c',
        activationBorderColor: '#3d9bff',
        attributeBackgroundColorOdd: '#0f1419',
        attributeBackgroundColorEven: '#16181c',
      }
    : {
        background: 'transparent',
        fontSize: '15px',
        primaryColor: '#eef6ff',
        primaryBorderColor: '#0083fe',
        primaryTextColor: '#0f1419',
        secondaryColor: '#f7f9f9',
        secondaryBorderColor: '#cfd9de',
        secondaryTextColor: '#0f1419',
        tertiaryColor: '#ffffff',
        tertiaryBorderColor: '#cfd9de',
        tertiaryTextColor: '#0f1419',
        mainBkg: '#eef6ff',
        nodeBorder: '#0083fe',
        nodeTextColor: '#0f1419',
        textColor: '#0f1419',
        titleColor: '#0f1419',
        lineColor: '#536471',
        edgeLabelBackground: '#ffffff',
        clusterBkg: '#f7f9f9',
        clusterBorder: '#cfd9de',
        noteBkgColor: '#fff8e1',
        noteTextColor: '#3d3000',
        noteBorderColor: '#e0b84a',
        actorBkg: '#eef6ff',
        actorBorder: '#0083fe',
        actorTextColor: '#0f1419',
        actorLineColor: '#8b98a5',
        signalColor: '#36444f',
        signalTextColor: '#0f1419',
        labelBoxBkgColor: '#ffffff',
        labelBoxBorderColor: '#8b98a5',
        labelTextColor: '#0f1419',
        loopTextColor: '#0f1419',
        activationBkgColor: '#d9ebff',
        activationBorderColor: '#0083fe',
        attributeBackgroundColorOdd: '#ffffff',
        attributeBackgroundColorEven: '#f7f9f9',
      };
}

/**
 * Renders a Mermaid diagram on the client at its natural size (never shrunk into
 * illegibility), following the light/dark theme, with a full-screen view for big ones.
 */
export function Mermaid({ code, caption }: { code: string; caption: string }) {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);
  const [dark, setDark] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const figure = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const reactId = useId();
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let cancelled = false;
    void import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          themeVariables: themeVariables(dark),
          flowchart: { useMaxWidth: false, curve: 'basis', padding: 14, htmlLabels: true },
          sequence: { useMaxWidth: false, mirrorActors: false, boxMargin: 12 },
          class: { useMaxWidth: false },
          state: { useMaxWidth: false },
          er: { useMaxWidth: false },
          gantt: { useMaxWidth: false },
        });
        const base = `mmd-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
        const available = Math.max((figure.current?.clientWidth ?? 680) - 40, 280);
        let { svg: rendered } = await mermaid.render(`${base}-${++sequence}`, code);
        let natural = naturalWidth(rendered);
        const vertical = natural > available * 1.25 ? verticalVariant(code) : null;
        if (vertical) {
          const alternative = await mermaid.render(`${base}-${++sequence}`, vertical);
          const alternativeWidth = naturalWidth(alternative.svg);
          if (alternativeWidth && alternativeWidth < natural) {
            rendered = alternative.svg;
            natural = alternativeWidth;
          }
        }
        if (cancelled) return;
        setSvg(rendered);
        // Fit the column when possible; otherwise shrink at most to MIN_SCALE and scroll.
        setWidth(natural ? Math.min(natural, Math.max(available, natural * MIN_SCALE)) : null);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [code, dark, reactId]);
  return (
    <figure ref={figure} className={styles.diagram}>
      {failed ? (
        <pre>{code}</pre>
      ) : svg ? (
        <div className={styles.diagramFrame}>
          {/* Mermaid output is sanitized with securityLevel "strict"; the source is versioned content. */}
          <div
            className={styles.diagramSvg}
            style={width ? ({ '--diagram-width': `${width}px` } as CSSProperties) : undefined}
            role="img"
            aria-label={caption || 'Diagrama'}
            onClick={() => dialog.current?.showModal()}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <button
            type="button"
            className={styles.diagramExpand}
            onClick={() => dialog.current?.showModal()}
            aria-label="Ampliar diagrama"
            title="Ampliar"
          >
            <Maximize2 size={15} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className={styles.diagramLoading} aria-busy="true">
          Desenhando diagrama…
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
      {svg && (
        <dialog
          ref={dialog}
          className={styles.diagramDialog}
          aria-label={caption || 'Diagrama'}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
        >
          <div className={styles.diagramDialogHead}>
            <span>{caption || 'Diagrama'}</span>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Fechar"
              title="Fechar"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.diagramDialogBody} dangerouslySetInnerHTML={{ __html: svg }} />
        </dialog>
      )}
    </figure>
  );
}
