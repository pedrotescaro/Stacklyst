'use client';
import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import ui from './ui.module.css';

export type StartAttemptPayload =
  | { kind: 'STANDARD'; year: number; fresh?: boolean }
  | { kind: 'REVIEW'; topic?: string | null; scope?: 'due' | 'open' | 'all'; limit?: number }
  | { kind: 'TOPIC'; topic: string; limit?: number; mode?: 'exam' | 'training' }
  | { kind: 'PRACTICE'; questionId: string; mode?: 'exam' | 'training' }
  | { kind: 'REPEAT' | 'WRONG_ONLY'; parentId: string }
  | { kind: 'CUSTOM'; config: unknown };

export async function startAttempt(payload: StartAttemptPayload) {
  const response = await fetch('/api/enade/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.attempt?.id)
    throw new Error(data?.error?.message || data?.message || 'Não foi possível iniciar.');
  return data.attempt.id as string;
}

/** Creates (or resumes) an attempt on the server and opens it. */
export function StartAttemptButton({
  payload,
  children,
  variant = 'primary',
  disabled = false,
  className,
}: {
  payload: StartAttemptPayload;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return (
    <span className={className} style={{ display: 'inline-grid', gap: 4 }}>
      <button
        type="button"
        className={ui[variant]}
        disabled={disabled || pending}
        aria-busy={pending}
        onClick={async () => {
          setPending(true);
          setError('');
          try {
            const id = await startAttempt(payload);
            router.push(`/trails/enade/simulados/${id}`);
          } catch (e) {
            setError((e as Error).message);
            setPending(false);
          }
        }}
      >
        {pending ? 'Preparando...' : children}
      </button>
      {error && (
        <span className={ui.error} role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
