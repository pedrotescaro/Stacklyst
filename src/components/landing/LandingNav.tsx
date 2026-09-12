'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import styles from './LandingNav.module.css';

interface LandingNavProps {
  initialUser: any;
}

export default function LandingNav({ initialUser }: LandingNavProps) {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let animationFrame = 0;

    const syncScrollState = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 56);
      });
    };

    syncScrollState();
    window.addEventListener('scroll', syncScrollState, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', syncScrollState);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      data-force-motion="true"
      className={`fixed inset-x-0 z-50 mx-auto overflow-visible border font-sans transition-[top,width,max-width,background-color,border-color,border-radius,box-shadow,backdrop-filter] duration-500 ease-out ${
        isScrolled
          ? 'top-3 sm:top-4 w-[calc(100%_-_1.25rem)] sm:w-[calc(100%_-_3rem)] max-w-6xl rounded-2xl border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl'
          : 'top-2 sm:top-3 w-[calc(100%_-_1.25rem)] sm:w-[calc(100%_-_1.5rem)] max-w-[1536px] rounded-none border-transparent bg-transparent shadow-none backdrop-blur-none'
      }`}
    >
      <div
        className={`relative flex w-full items-center justify-between transition-[padding] duration-500 ease-out ${
          isScrolled ? 'px-3 py-2 sm:px-6 sm:py-3' : 'px-3 py-3 sm:px-10 sm:py-5'
        }`}
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <Image
            src="/logo.svg"
            alt="Stacklyst Logo"
            width={366}
            height={283}
            className="h-6 w-auto sm:h-7 sm:w-auto object-contain"
          />
          <span
            className="font-sans text-base sm:text-xl font-extrabold tracking-tight"
            style={{ color: 'var(--lp-fg)' }}
          >
            Stacklyst
          </span>
        </Link>

        {/* ── Right side (Language Toggle & Auth) ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageToggle />

          {initialUser ? (
            <Link href="/feed" className={styles.signUpButton} data-force-motion="true">
              {t.nav.goToFeed}
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className={styles.loginLink} data-force-motion="true">
                {t.nav.login}
              </Link>
              <Link href="/register" className={styles.signUpButton} data-force-motion="true">
                {t.nav.signUp}
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
