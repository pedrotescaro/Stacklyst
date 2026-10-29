'use client';

import { cn } from '@/lib/cn';

interface LanguageStyle {
  color: string;
  borderColor: string;
  borderBottomColor: string;
  bg: string;
  label: string;
}

const LANGUAGE_CONFIG: Record<string, LanguageStyle> = {
  PYTHON: {
    color: '#34d399',
    borderColor: 'rgba(52, 211, 153, 0.35)',
    borderBottomColor: '#059669',
    bg: 'rgba(16, 185, 129, 0.14)',
    label: 'Python',
  },
  JS: {
    color: '#fbbf24',
    borderColor: 'rgba(251, 191, 36, 0.35)',
    borderBottomColor: '#d97706',
    bg: 'rgba(245, 158, 11, 0.14)',
    label: 'JavaScript',
  },
  TS: {
    color: '#38bdf8',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderBottomColor: '#0284c7',
    bg: 'rgba(14, 165, 233, 0.14)',
    label: 'TypeScript',
  },
  JAVA: {
    color: '#fb923c',
    borderColor: 'rgba(251, 146, 60, 0.35)',
    borderBottomColor: '#ea580c',
    bg: 'rgba(249, 115, 22, 0.14)',
    label: 'Java',
  },
  RUST: {
    color: '#f87171',
    borderColor: 'rgba(248, 113, 113, 0.35)',
    borderBottomColor: '#dc2626',
    bg: 'rgba(239, 68, 68, 0.14)',
    label: 'Rust',
  },
  GO: {
    color: '#22d3ee',
    borderColor: 'rgba(34, 211, 238, 0.35)',
    borderBottomColor: '#0891b2',
    bg: 'rgba(6, 182, 212, 0.14)',
    label: 'Go',
  },
  KOTLIN: {
    color: '#c084fc',
    borderColor: 'rgba(192, 132, 252, 0.35)',
    borderBottomColor: '#9333ea',
    bg: 'rgba(168, 85, 247, 0.14)',
    label: 'Kotlin',
  },
  SWIFT: {
    color: '#fb923c',
    borderColor: 'rgba(251, 146, 60, 0.35)',
    borderBottomColor: '#d97706',
    bg: 'rgba(245, 158, 11, 0.14)',
    label: 'Swift',
  },
  CPP: {
    color: '#60a5fa',
    borderColor: 'rgba(96, 165, 250, 0.35)',
    borderBottomColor: '#2563eb',
    bg: 'rgba(59, 130, 246, 0.14)',
    label: 'C++',
  },
};

interface LanguageTagProps {
  language: string;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
  flat?: boolean;
}

export function getLanguageColor(language: string): string {
  if (!language) return '#888899';
  return LANGUAGE_CONFIG[language.toUpperCase()]?.color ?? '#888899';
}

export function getLanguageLabel(language: string): string {
  if (!language) return language || '';
  return LANGUAGE_CONFIG[language.toUpperCase()]?.label ?? language;
}

export function LanguageTag({
  language,
  size = 'sm',
  className,
  showDot = true,
  flat = false,
}: LanguageTagProps) {
  if (!language) return null;

  const key = language.toUpperCase();
  const config = LANGUAGE_CONFIG[key] ?? {
    color: '#94a3b8',
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderBottomColor: '#475569',
    bg: 'rgba(100, 116, 139, 0.14)',
    label: language,
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 select-none transition-colors duration-150',
        flat
          ? 'rounded-lg border font-semibold normal-case tracking-normal'
          : 'rounded-xl border-2 border-b-[3px] shadow-sm font-black tracking-wider uppercase',
        flat
          ? 'text-xs px-2.5 py-0.5'
          : isSmall
            ? 'text-[10px] px-2.5 py-0.5 min-h-[22px]'
            : 'text-[11px] px-3.5 py-1 min-h-[28px]',
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.borderColor,
        borderBottomColor: flat ? config.borderColor : config.borderBottomColor,
      }}
    >
      {showDot && !flat && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
          style={{ backgroundColor: config.color }}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
