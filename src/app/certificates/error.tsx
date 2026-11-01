'use client';

import Link from 'next/link';

export default function CertificatesError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-lg flex-col justify-center gap-5 px-6 text-dd-text">
      <h1 className="text-2xl font-bold">Não foi possível carregar os certificados</h1>
      <p className="text-base leading-relaxed text-dd-muted">
        Seus registros não foram alterados. Tente carregar novamente em instantes.
      </p>
      <button
        onClick={reset}
        className="min-h-11 w-fit rounded-full border border-dd-border px-5 py-3 font-semibold"
      >
        Tentar novamente
      </button>
      <Link href="/trails" className="py-3 text-sm underline underline-offset-4">
        Voltar para as trilhas
      </Link>
    </main>
  );
}
