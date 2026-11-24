'use client';
import { useEffect, useId, useState } from 'react';
import styles from './article.module.css';

let sequence = 0;

/** Renders a Mermaid diagram on the client, following the light/dark theme. */
export function Mermaid({ code, caption }: { code: string; caption: string }) {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);
  const [dark, setDark] = useState(false);
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
          theme: dark ? 'dark' : 'neutral',
          fontFamily: 'inherit',
          themeVariables: {
            primaryColor: dark ? '#0b2a4a' : '#e6f2ff',
            primaryBorderColor: '#0083fe',
            lineColor: dark ? '#9aa4ad' : '#536471',
          },
        });
        const id = `mmd-${reactId.replace(/[^a-zA-Z0-9]/g, '')}-${++sequence}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) setSvg(rendered);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [code, dark, reactId]);
  return (
    <figure className={styles.diagram}>
      {failed ? (
        <pre>{code}</pre>
      ) : svg ? (
        // Mermaid output is sanitized with securityLevel "strict"; the source is versioned content.
        <div
          className={styles.diagramSvg}
          role="img"
          aria-label={caption || 'Diagrama'}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className={styles.diagramLoading} aria-busy="true">
          Desenhando diagrama…
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
