'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, X } from 'lucide-react';
import styles from './ContextSelectors.module.css';

export function ContextPopover({
  label,
  children,
  triggerIcon,
  triggerText,
  className = '',
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  triggerIcon?: ReactNode;
  triggerText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 12, left: 12, maxHeight: 500 });
  const close = (restore = true) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  };
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const popup = panel.current;
      if (!anchor || !popup) return;
      const viewport = window.visualViewport;
      const height = viewport?.height || window.innerHeight;
      const offsetTop = viewport?.offsetTop || 0;
      const width = Math.min(420, window.innerWidth - 24);
      const below = height + offsetTop - anchor.bottom - 12;
      const above = anchor.top - offsetTop - 12;
      const actualHeight = Math.min(popup.scrollHeight, height - 24);
      const useAbove = below < Math.min(actualHeight, 260) && above > below;
      const maxHeight = Math.max(160, Math.min(height - 24, useAbove ? above : below));
      setPosition({
        left: Math.max(12, Math.min(anchor.left, window.innerWidth - width - 12)),
        top: useAbove
          ? Math.max(12 + offsetTop, anchor.top - Math.min(actualHeight, maxHeight) - 8)
          : Math.max(12 + offsetTop, Math.min(anchor.bottom + 8, height + offsetTop - 180)),
        maxHeight,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    window.visualViewport?.addEventListener('resize', place);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      window.visualViewport?.removeEventListener('resize', place);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const focus = window.setTimeout(() => {
      const target = panel.current?.querySelector<HTMLElement>(
        'input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([data-popover-close]):not([disabled]),a[href]'
      );
      (target || panel.current)?.focus();
    }, 0);
    const outside = (event: PointerEvent) => {
      if (
        !panel.current?.contains(event.target as Node) &&
        !trigger.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const moved = (event: FocusEvent) => {
      if (
        !panel.current?.contains(event.target as Node) &&
        !trigger.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keyboard, true);
    document.addEventListener('focusin', moved);
    return () => {
      window.clearTimeout(focus);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', keyboard, true);
      document.removeEventListener('focusin', moved);
    };
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={`${styles.trigger} ${className}`}
        aria-label={label}
        title={label}
        aria-expanded={open && !disabled}
        aria-haspopup="dialog"
        aria-controls={open ? id : undefined}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        {triggerIcon || <Pencil size={15} aria-hidden="true" />}
        {triggerText && <span>{triggerText}</span>}
      </button>
      {open &&
        !disabled &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-label={label}
            tabIndex={-1}
            className={styles.popover}
            style={position}
          >
            <header className={styles.popoverHeader}>
              <strong>{label}</strong>
              <button
                type="button"
                data-popover-close
                aria-label={`Fechar ${label.toLowerCase()}`}
                onClick={() => close()}
              >
                <X size={17} aria-hidden="true" />
              </button>
            </header>
            <div className={styles.popoverBody}>{children}</div>
          </div>,
          document.body
        )}
    </>
  );
}
