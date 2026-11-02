'use client';

import { getLanguageColor, getLanguageLabel } from './LanguageTag';
import styles from './LanguageTrailBar.module.css';

interface LanguageTrailBarProps {
  language: string;
  xp: number;
  level: number;
  maxXp: number;
  compact?: boolean;
}

export function LanguageTrailBar({
  language,
  xp,
  level,
  maxXp,
  compact = false,
}: LanguageTrailBarProps) {
  const color = getLanguageColor(language);
  const label = getLanguageLabel(language);
  const percent = maxXp > 0 ? Math.max(0, Math.min((xp / maxXp) * 100, 100)) : 0;

  return (
    <div className={compact ? styles.compact : 'flex items-center gap-4'}>
      {/* Language name */}
      <span
        className={compact ? styles.label : 'text-xs font-bold w-24 shrink-0 truncate'}
        style={compact ? undefined : { color }}
      >
        {label}
      </span>

      {/* Progress bar */}
      <div
        className={`${compact ? styles.track : 'flex-1 h-1.5 bg-dd-surface rounded-full overflow-hidden'} dd-liquid-track`}
        role="progressbar"
        aria-label={`${label} · XP`}
        aria-valuemin={0}
        aria-valuemax={maxXp}
        aria-valuenow={Math.max(0, Math.min(xp, maxXp))}
      >
        <div
          className="h-full rounded-full dd-liquid-fill transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* XP text */}
      <span
        className={
          compact
            ? styles.xp
            : 'text-dd-muted text-[10px] font-semibold font-mono w-20 text-right shrink-0'
        }
      >
        {xp.toLocaleString()}/{maxXp.toLocaleString()} XP
      </span>

      {/* Level */}
      <span
        className={
          compact ? styles.level : 'text-[10px] font-bold px-2 py-0.5 rounded shrink-0 font-mono'
        }
        style={
          compact
            ? undefined
            : {
                backgroundColor: `${color}1A`,
                color: color,
                border: `1px solid ${color}33`,
              }
        }
      >
        Lv.{level}
      </span>
    </div>
  );
}
