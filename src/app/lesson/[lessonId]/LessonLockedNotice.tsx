'use client';

import Link from 'next/link';
import { useLocalizedText } from '@/i18n/useLocalizedText';

const LOCKED_PREFIX = 'Conclua primeiro: ';

export function LessonLockedNotice({ message, returnTo }: { message: string; returnTo: string }) {
  const { text, isEnglish } = useLocalizedText();
  const localizedMessage =
    isEnglish && message.startsWith(LOCKED_PREFIX)
      ? `Complete first: ${message.slice(LOCKED_PREFIX.length)}`
      : message;

  return (
    <main className="mx-auto max-w-xl p-8 text-dd-text">
      <h1 className="text-2xl font-bold">
        {text('Prepare o próximo passo', 'Get ready for the next step')}
      </h1>
      <p className="my-4">{localizedMessage}</p>
      <Link href={returnTo} className="dd-focus-ring text-blue-500">
        {text('Voltar à trilha', 'Back to the trail')}
      </Link>
    </main>
  );
}
