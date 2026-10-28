'use client';

import { useId, useMemo, useState } from 'react';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { getProfileFlagCatalog } from '@/lib/profile-flags';
import styles from './ContextSelectors.module.css';

const categories = [
  ['all', 'Todas'],
  ['countries', 'Países'],
  ['brazil', 'Estados do Brasil'],
  ['pride', 'LGBTQIA+'],
  ['community', 'Comunidade'],
] as const;
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
export function FlagSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [described, setDescribed] = useState<string | null>(null);
  const descriptionId = useId();
  const catalog = useMemo(() => getProfileFlagCatalog('pt-BR'), []);
  const filtered = catalog.filter(
    (flag) =>
      (category === 'all' || flag.category === category) &&
      normalize(`${flag.label} ${flag.description} ${flag.id}`).includes(normalize(query.trim()))
  );
  const choose = (id: string) => {
    if (disabled) return;
    setDescribed(id);
    if (value.includes(id)) onChange(value.filter((flag) => flag !== id));
    else if (value.length < 3) onChange([...value, id]);
  };
  return (
    <div className={styles.selector}>
      <p className={styles.help}>
        Escolha até três bandeiras. A seleção é livre e não define sua identidade no Stacklyst.
      </p>
      <div className={styles.selectedFlags} aria-label="Bandeiras selecionadas">
        {value.map((id) => {
          const flag = catalog.find((flag) => flag.id === id);
          return flag ? (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => choose(id)}
              aria-label={`Remover bandeira ${flag.label}`}
            >
              <Image src={flag.imageUrl} alt="" width={25} height={18} unoptimized />
              <span>{flag.label}</span>
              <X size={13} aria-hidden="true" />
            </button>
          ) : null;
        })}
        <span className={styles.help} aria-live="polite">
          {value.length}/3
        </span>
      </div>
      <label className={styles.search}>
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          aria-label="Pesquisar bandeira"
          placeholder="Pesquisar bandeira"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className={styles.categories} aria-label="Categorias de bandeiras">
        {categories.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={category === id}
            onClick={() => setCategory(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.flagGrid}>
        {filtered.map((flag) => (
          <button
            key={flag.id}
            type="button"
            aria-pressed={value.includes(flag.id)}
            disabled={disabled || (!value.includes(flag.id) && value.length >= 3)}
            onClick={() => choose(flag.id)}
            title={flag.description}
            aria-describedby={descriptionId}
            onFocus={() => setDescribed(flag.id)}
          >
            <Image src={flag.imageUrl} alt="" width={30} height={21} unoptimized />
            <span>{flag.label}</span>
          </button>
        ))}
      </div>
      <p id={descriptionId} className={styles.help} style={{ marginTop: 10, minHeight: '1.6em' }}>
        {catalog.find((flag) => flag.id === described)?.description ||
          'Selecione ou foque uma bandeira para ver sua descrição.'}
      </p>
      {!filtered.length && (
        <p className={styles.help} role="status">
          Nenhuma bandeira encontrada. Tente outro nome.
        </p>
      )}
    </div>
  );
}
