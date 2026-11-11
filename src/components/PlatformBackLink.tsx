'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export function PlatformBackLink({ className }: { className?: string }) {
  const { text } = useLocalizedText();
  return (
    <Link href="/feed" className={className} aria-label={text('Voltar ao feed', 'Back to feed')}>
      <ArrowLeft size={21} aria-hidden="true" />
    </Link>
  );
}
