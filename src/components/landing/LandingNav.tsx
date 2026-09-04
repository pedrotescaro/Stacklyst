'use client';

import { useEffect, useState, useMemo } from 'react';
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

  const navLinks = useMemo(
    () => [
      { label: t.nav.howItWorks, href: '#how' },
      { label: t.nav.platform, href: '#platform' },
      { label: t.nav.tracks, href: '#trails' },
      { label: t.nav.duels, href: '#duels' },
    ],
    [t.nav]
  );

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
          ? 'top-4 w-[calc(100%_-_3rem)] max-w-6xl rounded-2xl border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl'
          : 'top-3 w-[calc(100%_-_1.5rem)] max-w-[1536px] rounded-none border-transparent bg-transparent shadow-none backdrop-blur-none'
      }`}
    >
      <div
        className={`relative flex w-full items-center justify-between transition-[padding] duration-500 ease-out ${
          isScrolled ? 'px-4 py-3 sm:px-6' : 'px-4 py-5 sm:px-10'
        }`}
      >
        {/* ── Logo & Language Toggle ── */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.svg"
              alt="Stacklyst Logo"
              width={366}
              height={283}
              className="h-auto w-8 object-contain"
            />
            <span
              className="font-sans text-xl font-extrabold tracking-tight"
              style={{ color: 'var(--lp-fg)' }}
            >
              Stacklyst
            </span>
          </Link>

          <LanguageToggle />
        </div>

        {/* ── Center links (hidden on mobile) ── */}
        <div className={styles.centerLinks}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="lp-nav-link">
              {link.label}
            </a>
          ))}
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auth links or CTA */}
          {initialUser ? (
            <Link href="/feed" className={styles.signUpButton} data-force-motion="true">
              {t.nav.goToFeed}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
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
