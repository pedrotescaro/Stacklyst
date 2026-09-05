'use client';

import Loader from '@/components/Loader';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface RouteLoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export function RouteLoadingScreen({ title, subtitle }: RouteLoadingScreenProps) {
  const { text } = useLocalizedText();
  return (
    <main
      data-testid="route-loading-screen"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#08090b] px-6"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,131,254,0.13),transparent_38%)]"
        aria-hidden="true"
      />
      <Loader
        title={title ?? text('Carregando sua experiência...', 'Loading your experience...')}
        subtitle={
          subtitle ??
          text(
            'Só um instante enquanto preparamos a próxima página',
            'One moment while we prepare the next page'
          )
        }
        size="md"
        className="relative"
      />
    </main>
  );
}
