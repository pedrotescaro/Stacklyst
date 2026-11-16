'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { EMOJI_CATEGORIES, EMOJI_NAMES } from '@/lib/post-composer';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { cn } from '@/lib/utils';
import './EmojiPicker.css';

const PICKER_WIDTH = 344;
const PICKER_MAX_HEIGHT = 400;
const GAP = 8;
const EDGE = 8;

interface EmojiPickerProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  pickerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

interface Placement {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  origin: 'top' | 'bottom';
}

function computePlacement(anchor: HTMLElement): Placement {
  const rect = anchor.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(PICKER_WIDTH, viewportWidth - EDGE * 2);
  const left = Math.min(Math.max(EDGE, rect.left), viewportWidth - width - EDGE);

  const spaceAbove = rect.top - GAP - EDGE;
  const spaceBelow = viewportHeight - rect.bottom - GAP - EDGE;
  const openAbove = spaceAbove >= 320 || spaceAbove > spaceBelow;
  const maxHeight = Math.min(PICKER_MAX_HEIGHT, openAbove ? spaceAbove : spaceBelow);

  return openAbove
    ? { top: rect.top - GAP - maxHeight, left, width, maxHeight, origin: 'bottom' }
    : { top: rect.bottom + GAP, left, width, maxHeight, origin: 'top' };
}

export function EmojiPicker({ anchorRef, pickerRef, onSelect, onClose }: EmojiPickerProps) {
  const { text } = useLocalizedText();
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].name);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const jumpLockRef = useRef(false);
  const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const update = (event?: Event) => {
      // Scrolling the emoji list itself doesn't move the anchor.
      if (event?.target instanceof Node && pickerRef.current?.contains(event.target)) return;
      if (!anchorRef.current) return;
      const next = computePlacement(anchorRef.current);
      setPlacement((current) =>
        current &&
        current.top === next.top &&
        current.left === next.left &&
        current.width === next.width &&
        current.maxHeight === next.maxHeight
          ? current
          : next
      );
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef, pickerRef]);

  useEffect(() => {
    // Escape closes only the picker, not the composer dialog around it.
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

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      searchRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return null;
    const seen = new Set<string>();
    return EMOJI_CATEGORIES.flatMap((category) => category.emojis).filter((emoji) => {
      if (seen.has(emoji)) return false;
      seen.add(emoji);
      const names = EMOJI_NAMES[emoji] ?? ['', ''];
      return names.some((name) => name.toLocaleLowerCase().includes(normalizedQuery));
    });
  }, [normalizedQuery]);

  const emojiName = (emoji: string) => {
    const names = EMOJI_NAMES[emoji];
    return names ? text(names[0], names[1]) : emoji;
  };

  const releaseLock = () => {
    jumpLockRef.current = false;
    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    lockTimeoutRef.current = null;
  };

  useEffect(() => releaseLock, []);

  const jumpTo = (name: string) => {
    setQuery('');
    setActiveCategory(name);
    // Hold the tab still while the smooth scroll runs, so it doesn't flick
    // through the categories it passes on the way.
    jumpLockRef.current = true;
    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    lockTimeoutRef.current = setTimeout(releaseLock, 700);
    requestAnimationFrame(() => {
      const section = sectionRefs.current[name];
      const scroller = scrollRef.current;
      if (section && scroller) scroller.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
    });
  };

  const handleScroll = () => {
    const scroller = scrollRef.current;
    if (!scroller || results || jumpLockRef.current) return;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
    let current = EMOJI_CATEGORIES[0].name;
    if (atBottom) {
      // The last section is too short to reach the top, so count the bottom as its own.
      current = EMOJI_CATEGORIES[EMOJI_CATEGORIES.length - 1].name;
    } else {
      for (const category of EMOJI_CATEGORIES) {
        const section = sectionRefs.current[category.name];
        if (section && section.offsetTop <= scroller.scrollTop + 12) current = category.name;
      }
    }
    setActiveCategory(current);
  };

  const activeIndex = EMOJI_CATEGORIES.findIndex((category) => category.name === activeCategory);

  const renderEmoji = (emoji: string, key: string) => (
    <button
      key={key}
      type="button"
      className="emoji-picker-item"
      aria-label={emojiName(emoji)}
      title={emojiName(emoji)}
      onPointerDown={(event) => event.preventDefault()}
      onMouseEnter={() => setHovered(emoji)}
      onFocus={() => setHovered(emoji)}
      onClick={() => onSelect(emoji)}
    >
      {emoji}
    </button>
  );

  if (!placement || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={pickerRef}
      role="dialog"
      aria-label="Emojis"
      className="emoji-picker"
      data-origin={placement.origin}
      style={{
        top: placement.top,
        left: placement.left,
        width: placement.width,
        height: placement.maxHeight,
      }}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="emoji-picker-search">
        <Search aria-hidden className="emoji-picker-search-icon" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={text('Buscar emojis', 'Search emojis')}
          aria-label={text('Buscar emojis', 'Search emojis')}
        />
        {query && (
          <button
            type="button"
            className="emoji-picker-clear"
            aria-label={text('Limpar busca', 'Clear search')}
            onClick={() => {
              setQuery('');
              searchRef.current?.focus();
            }}
          >
            <X />
          </button>
        )}
      </div>

      <div
        className="emoji-picker-tabs"
        role="tablist"
        aria-label={text('Categorias', 'Categories')}
        style={
          {
            '--tab-count': EMOJI_CATEGORIES.length,
            '--tab-index': Math.max(activeIndex, 0),
          } as React.CSSProperties
        }
      >
        {!results && <span aria-hidden className="emoji-picker-tab-indicator" />}
        {EMOJI_CATEGORIES.map((category) => (
          <button
            key={category.name}
            type="button"
            role="tab"
            aria-selected={!results && activeCategory === category.name}
            title={text(category.name, category.nameEn)}
            className={cn(
              'emoji-picker-tab',
              !results && activeCategory === category.name && 'is-active'
            )}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => jumpTo(category.name)}
          >
            <span aria-hidden>{category.emojis[0]}</span>
            <span className="emoji-picker-tab-label">{text(category.name, category.nameEn)}</span>
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="emoji-picker-body" onScroll={handleScroll}>
        {results ? (
          results.length ? (
            <section>
              <p className="emoji-picker-heading">{text('Resultados', 'Results')}</p>
              <div className="emoji-picker-grid">
                {results.map((emoji) => renderEmoji(emoji, `result-${emoji}`))}
              </div>
            </section>
          ) : (
            <p className="emoji-picker-empty">
              {text('Nenhum emoji encontrado', 'No emojis found')}
            </p>
          )
        ) : (
          EMOJI_CATEGORIES.map((category) => (
            <section
              key={category.name}
              ref={(node) => {
                sectionRefs.current[category.name] = node;
              }}
            >
              <p className="emoji-picker-heading">{text(category.name, category.nameEn)}</p>
              <div className="emoji-picker-grid">
                {category.emojis.map((emoji) => renderEmoji(emoji, `${category.name}-${emoji}`))}
              </div>
            </section>
          ))
        )}
      </div>

      <div className="emoji-picker-footer" aria-live="polite">
        {hovered ? (
          <>
            <span className="emoji-picker-preview" aria-hidden>
              {hovered}
            </span>
            <span className="emoji-picker-preview-name">{emojiName(hovered)}</span>
          </>
        ) : (
          <span className="emoji-picker-hint">{text('Escolha um emoji', 'Pick an emoji')}</span>
        )}
      </div>
    </div>,
    document.body
  );
}
