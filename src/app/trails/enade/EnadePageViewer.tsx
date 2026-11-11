'use client';

/* Exam page renders preserve the original diagrams and mathematical notation. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type KeyboardEvent } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Maximize, X, ZoomIn, ZoomOut } from 'lucide-react';
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import styles from './EnadePageViewer.module.css';

interface EnadePageViewerProps {
  src: string;
  year: number;
  page: number;
  label?: string;
}

export function EnadePageViewer({ src, year, page, label }: EnadePageViewerProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [imageError, setImageError] = useState(false);
  const transform = useRef<ReactZoomPanPinchRef>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const title = `${label || `Página ${page}`} · Enade ADS ${year}`;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      transform.current?.zoomIn(0.3, 0);
    } else if (event.key === '-') {
      event.preventDefault();
      transform.current?.zoomOut(0.3, 0);
    } else if (event.key === '0') {
      event.preventDefault();
      transform.current?.centerView(1, 0);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setScale(1);
          setImageError(false);
        }
      }}
    >
      <Dialog.Trigger
        className={styles.trigger}
        aria-label={
          label
            ? `Abrir e ampliar ${label[0].toLowerCase() + label.slice(1)} da prova Enade ADS ${year}`
            : `Abrir e ampliar página ${page} da prova Enade ADS ${year}`
        }
      >
        <img
          className={styles.preview}
          src={src}
          alt={`${label || `Página ${page}`} da prova Enade ADS ${year}. Texto disponível a seguir.`}
        />
        <span className={styles.openHint}>
          <ZoomIn size={16} aria-hidden="true" /> Abrir e ampliar
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup
          className={styles.viewer}
          initialFocus={closeButton}
          onKeyDown={handleKeyDown}
        >
          <header className={styles.header}>
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            <Dialog.Close
              ref={closeButton}
              className={styles.control}
              aria-label="Fechar visualizador"
              title="Fechar (Esc)"
            >
              <X size={22} aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className={styles.canvas}>
            {imageError ? (
              <p role="alert" className={styles.error}>
                Não foi possível carregar a imagem. Feche e tente abrir novamente.
              </p>
            ) : (
              <TransformWrapper
                ref={transform}
                initialScale={1}
                minScale={1}
                maxScale={6}
                centerOnInit
                centerZoomedOut
                smooth={false}
                wheel={{ step: 0.12 }}
                pinch={{ step: 2 }}
                panning={{ velocityDisabled: true }}
                doubleClick={{ mode: 'toggle', step: 1, animationTime: 0 }}
                zoomAnimation={{ disabled: true }}
                velocityAnimation={{ disabled: true }}
                autoAlignment={{ animationTime: 0 }}
                onTransform={(_, state) => setScale(Math.round(state.scale * 100) / 100)}
              >
                <TransformComponent
                  wrapperClass={styles.zoomViewport}
                  contentClass={styles.zoomContent}
                >
                  <img
                    src={src}
                    className={styles.fullImage}
                    alt={title}
                    draggable={false}
                    onLoad={() => transform.current?.centerView(1, 0)}
                    onError={() => setImageError(true)}
                  />
                </TransformComponent>
              </TransformWrapper>
            )}
          </div>
          <footer className={styles.footer}>
            <div className={styles.controls} role="group" aria-label="Controles de zoom">
              <button
                type="button"
                className={styles.control}
                disabled={imageError || scale <= 1}
                onClick={() => transform.current?.zoomOut(0.3, 0)}
                aria-label="Diminuir zoom"
                title="Diminuir zoom (−)"
              >
                <ZoomOut size={20} aria-hidden="true" />
              </button>
              <output className={styles.level} aria-label="Nível de zoom">
                {Math.round(scale * 100)}%
              </output>
              <button
                type="button"
                className={styles.control}
                disabled={imageError || scale >= 6}
                onClick={() => transform.current?.zoomIn(0.3, 0)}
                aria-label="Aumentar zoom"
                title="Aumentar zoom (+)"
              >
                <ZoomIn size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.control} ${styles.fit}`}
                disabled={imageError}
                onClick={() => transform.current?.centerView(1, 0)}
                aria-label="Ajustar página à tela"
                title="Ajustar à tela (0)"
              >
                <Maximize size={18} aria-hidden="true" />
                <span>Ajustar</span>
              </button>
            </div>
            <Dialog.Description className={styles.help}>
              Use pinça, dois toques ou a roda do mouse para ampliar. Arraste para explorar a
              página.
            </Dialog.Description>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
