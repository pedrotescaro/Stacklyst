'use client';

import { useRef, type RefObject } from 'react';
import { Search, X } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { EXPLORE_QUERY_MAX_LENGTH } from '@/lib/explore-search';
import styles from './ExploreSearchField.module.css';

export function ExploreSearchField({
  value,
  onChange,
  onClear,
  inputRef,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  compact?: boolean;
}) {
  const { text } = useLocalizedText();
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;
  const clear = () => {
    if (onClear) onClear();
    else onChange('');
    ref.current?.focus();
  };

  return (
    <div className={styles.field} data-compact={compact || undefined}>
      <button type="submit" className={styles.submit} aria-label={text('Pesquisar', 'Search')}>
        <Search aria-hidden="true" />
      </button>
      <input
        ref={ref}
        type="search"
        name="q"
        value={value}
        maxLength={EXPLORE_QUERY_MAX_LENGTH}
        enterKeyHint="search"
        placeholder={text('Pesquisar', 'Search')}
        aria-label={text('Pesquisar posts e pessoas', 'Search posts and people')}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Escape' || !value) return;
          event.preventDefault();
          clear();
        }}
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={clear}
          aria-label={text('Limpar pesquisa', 'Clear search')}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
