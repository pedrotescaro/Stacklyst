'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import './AnchoredPopover.css';

const GAP = 8;
const EDGE = 8;

interface Placement {
  left: number;
  width: number;
  maxHeight: number;
  /** Distance from the top of the viewport, when opening below the anchor. */
  top?: number;
  /** Distance from the bottom of the viewport, when opening above the anchor. */
  bottom?: number;
}

function computePlacement(anchor: HTMLElement, width: number, maxHeight: number): Placement {
  const rect = anchor.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const fittedWidth = Math.min(width, viewportWidth - EDGE * 2);
  const left = Math.min(Math.max(EDGE, rect.left), viewportWidth - fittedWidth - EDGE);

  const spaceAbove = rect.top - GAP - EDGE;
  const spaceBelow = viewportHeight - rect.bottom - GAP - EDGE;
  const openAbove = spaceAbove >= Math.min(maxHeight, 320) || spaceAbove > spaceBelow;
  const fittedHeight = Math.min(maxHeight, openAbove ? spaceAbove : spaceBelow);

  return openAbove
    ? { left, width: fittedWidth, maxHeight: fittedHeight, bottom: viewportHeight - rect.top + GAP }
    : { left, width: fittedWidth, maxHeight: fittedHeight, top: rect.bottom + GAP };
}

const samePlacement = (a: Placement, b: Placement) =>
  a.left === b.left &&
  a.width === b.width &&
  a.maxHeight === b.maxHeight &&
  a.top === b.top &&
  a.bottom === b.bottom;

interface AnchoredPopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  label: string;
  width: number;
  maxHeight: number;
  /** Take the full available height instead of sizing to the content. */
  fillHeight?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A popover rendered in a portal and pinned to its anchor button, so scrolling
 * or clipped containers (like the "Mais opções" card) can't cut it off.
 */
export function AnchoredPopover({
  anchorRef,
  popoverRef,
  onClose,
  label,
  width,
  maxHeight,
  fillHeight = false,
  className,
  children,
}: AnchoredPopoverProps) {
  const [placement, setPlacement] = useState<Placement | null>(null);

  useLayoutEffect(() => {
    const update = (event?: Event) => {
      // Scrolling inside the popover doesn't move the anchor.
      if (event?.target instanceof Node && popoverRef.current?.contains(event.target)) return;
      if (!anchorRef.current) return;
      const next = computePlacement(anchorRef.current, width, maxHeight);
      setPlacement((current) => (current && samePlacement(current, next) ? current : next));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef, popoverRef, width, maxHeight]);

  useEffect(() => {
    // Escape closes only the popover, not the composer dialog around it.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
      anchorRef.current?.focus();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [anchorRef, onClose]);

  if (!placement || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={label}
      className={cn('anchored-popover', className)}
      data-origin={placement.bottom !== undefined ? 'bottom' : 'top'}
      style={{
        top: placement.top,
        bottom: placement.bottom,
        left: placement.left,
        width: placement.width,
        maxHeight: placement.maxHeight,
        height: fillHeight ? placement.maxHeight : undefined,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
