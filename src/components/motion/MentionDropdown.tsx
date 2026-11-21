'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { getAuthorDisplayName } from '@/lib/profile-style';

export interface MentionTarget {
  field: HTMLElement;
  from: number;
  to: number;
  query: string;
  rect: () => Pick<DOMRect, 'top' | 'bottom' | 'left'>;
}
interface Person {
  id: string;
  username: string;
  avatar_url: string | null;
  avatar_config?: unknown;
}

export function MentionDropdown({
  target,
  onPick,
  onClose,
}: {
  target: MentionTarget;
  onPick: (username: string) => void;
  onClose: () => void;
}) {
  const { text } = useLocalizedText();
  const listId = useId();
  const menu = useRef<HTMLDivElement>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState(0);
  const { field, query } = target;

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/users/search?q=' + encodeURIComponent(query), {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error();
        const rows: Person[] = await res.json();
        if (!controller.signal.aborted) {
          setPeople(rows);
          setPhase('ready');
        }
      } catch {
        if (!controller.signal.aborted) setPhase('error');
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useLayoutEffect(() => {
    function position() {
      const panel = menu.current;
      if (!panel) return;
      const r = target.rect();
      const below = window.innerHeight - r.bottom - 10;
      const above = r.top - 10;
      const up = below < panel.scrollHeight && above > below;
      panel.style.maxHeight = Math.max(60, up ? above : below) + 'px';
      panel.style.left =
        Math.max(8, Math.min(r.left, window.innerWidth - panel.offsetWidth - 8)) + 'px';
      panel.style.top = Math.max(4, up ? r.top - panel.offsetHeight - 4 : r.bottom + 4) + 'px';
    }
    position();
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [target, phase, people]);

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      if (event.isComposing) return;
      if (event.key === 'Escape') onClose();
      else if (!people.length) return;
      else if (event.key === 'Enter') onPick(people[selected].username);
      else if (event.key === 'ArrowDown' || event.key === 'ArrowUp')
        setSelected(
          (index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + people.length) % people.length
        );
      else return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !field.contains(event.target) &&
        !menu.current?.contains(event.target)
      )
        onClose();
    }
    field.setAttribute('aria-autocomplete', 'list');
    field.setAttribute('aria-controls', listId);
    if (people[selected]) field.setAttribute('aria-activedescendant', listId + '-' + selected);
    field.addEventListener('keydown', keyDown, true);
    document.addEventListener('pointerdown', outside);
    return () => {
      field.removeEventListener('keydown', keyDown, true);
      document.removeEventListener('pointerdown', outside);
      for (const attr of ['aria-controls', 'aria-activedescendant', 'aria-autocomplete'])
        field.removeAttribute(attr);
    };
  }, [field, listId, onClose, onPick, people, selected]);

  useEffect(() => {
    const option = menu.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (option && menu.current) {
      const panel = menu.current;
      if (option.offsetTop < panel.scrollTop) panel.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > panel.scrollTop + panel.clientHeight)
        panel.scrollTop = option.offsetTop + option.offsetHeight - panel.clientHeight;
    }
  }, [selected]);
  return createPortal(
    <div
      ref={menu}
      className="fixed z-[250] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain rounded-2xl border border-dd-border bg-dd-bg py-1 text-dd-text shadow-xl"
    >
      <div
        role="listbox"
        id={listId}
        aria-label={text('Pessoas para mencionar', 'People to mention')}
        aria-busy={phase === 'loading'}
      >
        {people.map((person, index) => (
          <button
            key={person.id}
            id={listId + '-' + index}
            type="button"
            role="option"
            aria-selected={selected === index}
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={() => setSelected(index)}
            onClick={() => onPick(person.username)}
            className={
              'flex w-full items-center gap-3 px-4 py-2.5 text-left ' +
              (selected === index ? 'bg-dd-surface' : '')
            }
          >
            <AuthorAvatar
              username={person.username}
              avatar_url={person.avatar_url}
              avatar_config={person.avatar_config}
              size="md"
            />
            <span className="min-w-0">
              <strong className="block truncate text-sm">{getAuthorDisplayName(person)}</strong>
              <span className="block truncate text-sm text-dd-muted">@{person.username}</span>
            </span>
          </button>
        ))}
      </div>
      {!people.length && (
        <p role="status" className="px-4 py-3 text-sm text-dd-muted">
          {phase === 'loading'
            ? text('Buscando pessoas…', 'Searching people…')
            : phase === 'error'
              ? text('Não foi possível buscar pessoas.', 'Could not search for people.')
              : text('Nenhuma pessoa encontrada.', 'No people found.')}
        </p>
      )}
    </div>,
    field.closest('dialog') ?? document.body
  );
}
