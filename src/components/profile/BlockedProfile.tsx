'use client';

import Link from 'next/link';
import { Ban } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { BlockUserButton } from '@/components/BlockUserButton';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export function BlockedProfile({
  userId,
  username,
  blockedByMe,
}: {
  userId: string;
  username: string;
  blockedByMe: boolean;
}) {
  const { text } = useLocalizedText();
  return (
    <main className="min-h-svh bg-dd-bg px-5 py-8 text-dd-text">
      <div className="mx-auto max-w-2xl">
        <Link href="/feed" aria-label={text('Voltar ao feed', 'Back to feed')}>
          <BrandLogo size={28} />
        </Link>
        <section className="py-20">
          <Ban className="mb-5 text-dd-muted" size={32} aria-hidden="true" />
          <h1 className="text-2xl font-bold">
            {blockedByMe
              ? text(`Você bloqueou @${username}`, `You blocked @${username}`)
              : text('Perfil indisponível', 'Profile unavailable')}
          </h1>
          <p className="mt-4 mb-6 text-sm leading-6 text-dd-muted">
            {text(
              'O conteúdo e as interações entre estas contas não estão disponíveis.',
              'Content and interactions between these accounts are unavailable.'
            )}
          </p>
          {blockedByMe && <BlockUserButton userId={userId} username={username} blocked />}
          <Link className="mt-6 inline-block text-sm font-semibold text-dd-accent" href="/feed">
            {text('Voltar ao feed', 'Back to feed')}
          </Link>
        </section>
      </div>
    </main>
  );
}
