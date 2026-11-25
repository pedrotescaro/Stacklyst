'use client';

import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

interface PostActionDialogProps {
  titleId: string;
  descriptionId?: string;
  busy?: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
  variant?: 'default' | 'confirm' | 'report';
}

const panelClasses = {
  default: 'max-w-md space-y-4 overflow-y-auto border border-dd-border bg-dd-surface p-5',
  confirm: 'max-w-[320px] overflow-y-auto bg-dd-bg p-8 shadow-2xl outline-none',
  report:
    'flex max-w-[456px] flex-col overflow-hidden border border-dd-border bg-dd-bg outline-none',
};

export function PostActionDialog({
  titleId,
  descriptionId,
  busy = false,
  onClose,
  returnFocusRef,
  children,
  variant = 'default',
}: PostActionDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const returnFocus = returnFocusRef.current;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>('[data-dialog-initial-focus]') || panel)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (!busyRef.current) closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const controls = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!controls.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === panel)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      (returnFocus?.isConnected ? returnFocus : previousFocus)?.focus();
    };
  }, [returnFocusRef]);

  // Feed items animate with transforms; keep viewport dialogs outside those containing blocks.
  return createPortal(
    <div
      className={
        variant === 'default'
          ? 'fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm'
          : 'fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/40 p-4 dark:bg-[#5b7083]/40'
      }
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={busy || undefined}
        tabIndex={-1}
        className={`relative w-full max-h-[calc(100dvh-2rem)] rounded-2xl text-left ${panelClasses[variant]}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
