'use client';

import { BrandLogo } from '@/components/BrandLogo';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
        setIsScrolled((previous) => window.scrollY > (previous ? 40 : 72));
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
      className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}
      data-scrolled={isScrolled}
    >
      <div className={styles.inner}>
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <BrandLogo size={27} className={styles.brand} />
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
