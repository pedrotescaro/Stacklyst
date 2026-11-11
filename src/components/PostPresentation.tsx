'use client';

import { useState, type ReactNode } from 'react';
import { EyeOff, MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface SensitiveContentGateProps {
  isSensitive: boolean;
  children: ReactNode;
}

export function SensitiveContentGate({ isSensitive, children }: SensitiveContentGateProps) {
  const { text } = useLocalizedText();
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isSensitive || isRevealed) {
    return <>{children}</>;
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setIsRevealed(true);
      }}
      aria-label={text('Mostrar conteúdo sensível', 'Show sensitive content')}
      data-testid="sensitive-content-gate"
      className="group/sensitive mb-3 flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dd-border bg-dd-surface/45 px-6 py-8 text-center transition-colors hover:bg-dd-surface/65"
    >
      <EyeOff className="mb-2 h-5 w-5 text-dd-muted" aria-hidden="true" />
      <span className="text-sm font-bold text-dd-text">
        {text('Este conteúdo pode ser sensível', 'This content may be sensitive')}
      </span>
      <span className="mt-1 max-w-sm text-xs leading-relaxed text-dd-muted">
        {text(
          'O autor marcou esta publicação como conteúdo sensível.',
          'The author marked this post as sensitive content.'
        )}
      </span>
      <span className="mt-3 text-xs font-bold text-blue-500 group-hover/sensitive:underline">
        {text('Mostrar', 'Show')}
      </span>
    </button>
  );
}

interface PostLocationProps {
  location: string | null | undefined;
  className?: string;
}

export function PostLocation({ location, className }: PostLocationProps) {
  if (!location) return null;

  return (
    <div
      data-testid="post-location"
      className={cn(
        'flex min-w-0 items-center gap-1 text-[11px] font-medium text-blue-500',
        className
      )}
    >
      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{location}</span>
    </div>
  );
}
