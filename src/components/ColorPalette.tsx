'use client';

import styles from './ColorPalette.module.css';
import { foregroundOn } from '@/lib/profile-style';

export const PROFILE_COLORS = [
  '#000000',
  '#17191f',
  '#0d1117',
  '#161b22',
  '#ffffff',
  '#e7e9ea',
  '#71767b',
  '#56636f',
  '#0083fe',
  '#2f6bb2',
  '#435d9d',
  '#8e63ce',
  '#82507d',
  '#2b9c86',
  '#22c55e',
  '#d96168',
  '#ef4444',
  '#d28a2c',
  '#facc15',
  '#ec4899',
  '#06b6d4',
  '#f8fafc',
  '#cbd5e1',
  '#94a3b8',
  '#334155',
  '#7f1d1d',
  '#fb7185',
  '#fda4af',
  '#f97316',
  '#fdba74',
  '#78350f',
  '#a16207',
  '#fef08a',
  '#84cc16',
  '#bef264',
  '#166534',
  '#10b981',
  '#99f6e4',
  '#0e7490',
  '#67e8f9',
  '#2563eb',
  '#93c5fd',
  '#3730a3',
  '#a78bfa',
  '#d8b4fe',
  '#c026d3',
  '#f0abfc',
  '#9d174d',
] as const;

interface Props {
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  colors?: readonly string[];
  names?: readonly string[];
  'aria-label'?: string;
  id?: string;
  disabled?: boolean;
}

/** Fixed swatches. The change payload matches the value field used by form controls. */
export function ColorPalette({
  value,
  onChange,
  colors = PROFILE_COLORS,
  names,
  'aria-label': label = 'Cor',
  id,
  disabled,
}: Props) {
  return (
    <span id={id} className={styles.palette} role="group" aria-label={label}>
      {colors.map((color, index) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          aria-label={`${label}: ${names?.[index] ?? color}`}
          aria-pressed={value.toLowerCase() === color.toLowerCase()}
          title={names?.[index] ?? color}
          className={styles.swatch}
          style={{ backgroundColor: color }}
          onClick={() => onChange({ target: { value: color } })}
        >
          {value.toLowerCase() === color.toLowerCase() && (
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ stroke: foregroundOn(color) }}>
              <path d="m5 12 4 4L19 6" />
            </svg>
          )}
        </button>
      ))}
    </span>
  );
}
