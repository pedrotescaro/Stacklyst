'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import styles from './AuthHero.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), {
  ssr: false,
});

export default function AuthHero() {
  const { isEnglish } = useLanguage();
  const [canRenderRipple, setCanRenderRipple] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const syncViewport = () => setCanRenderRipple(media.matches);

    syncViewport();
    media.addEventListener('change', syncViewport);

    return () => media.removeEventListener('change', syncViewport);
  }, []);

  return (
    <aside
      className={`${styles.hero} relative m-3 mr-0 hidden min-h-[calc(100svh-24px)] overflow-hidden rounded-xl lg:flex lg:items-center lg:justify-center`}
      data-testid="auth-visual-hero"
    >
      <div className={styles.effect} aria-hidden="true" data-testid="auth-ripple-effect">
        {canRenderRipple ? (
          <RippleDistortion
            src="/hero.png"
            brushSize={150}
            strength={0.2}
            swirl={1}
            rings={4}
            grayscale={false}
            tint="#0085FE"
            highlightColor="#0085FE"
            trigger="both"
            quality="medium"
            forceMotion
          />
        ) : null}
      </div>

      <div className={styles.overlay} aria-hidden="true" />

      <div className="relative z-10 flex w-full -translate-y-[1.5%] flex-col items-center px-10 text-center">
        <Link href="/" className="inline-flex items-center gap-5">
          <Image
            src="/logo.svg"
            alt="Stacklyst logo"
            width={62}
            height={62}
            className={`${styles.brandLogo} h-[62px] w-[62px] object-contain`}
          />
          <span
            className={`${styles.brandText} text-[43px] font-bold tracking-[-0.055em] text-white`}
          >
            Stacklyst
          </span>
        </Link>

        <h1
          className={`${styles.brandText} mt-8 max-w-[560px] text-[32px] font-semibold leading-[1.14] tracking-[-0.045em] text-white xl:text-[36px]`}
        >
          {isEnglish
            ? 'Unlock the best of Stacklyst. Access to the future community.'
            : 'Desbloqueie o melhor do Stacklyst. Acesse a comunidade do futuro.'}
        </h1>
        <p
          className={`${styles.brandText} mt-7 text-[17px] font-medium tracking-[-0.025em] text-white/85`}
        >
          {isEnglish
            ? 'Developers creating amazing experiences.'
            : 'Desenvolvedores criando experiências incríveis.'}
        </p>
      </div>
    </aside>
  );
}
