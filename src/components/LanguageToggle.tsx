'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './LanguageToggle.module.css';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const isEnglish = language === 'en';
  const flagSrc = isEnglish ? '/flags/flag-us.png' : '/flags/flag-br.png';
  const code = isEnglish ? 'EN' : 'BR';
  const tooltipText = isEnglish ? 'Português' : 'English';
  const ariaLabel = `${code}: ${isEnglish ? 'Mudar para português' : 'Switch to English'}`;

  const handleClick = useCallback(() => {
    toggleLanguage();

    // Trigger the flip animation
    setIsAnimating(true);
    const timer = window.setTimeout(() => {
      setIsAnimating(false);
    }, 520);

    return () => clearTimeout(timer);
  }, [toggleLanguage]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`${styles.languageToggle} ${isAnimating ? styles.isChanging : ''} ${
        className ?? ''
      }`}
      data-language-toggle
    >
      <Image
        src={flagSrc}
        alt=""
        width={20}
        height={20}
        className={styles.flag}
        aria-hidden="true"
        unoptimized
      />
      <span className={styles.code}>{code}</span>
      <ChevronDown className={styles.chevron} aria-hidden="true" />
      <span className={styles.tooltip} aria-hidden="true">
        {tooltipText}
      </span>
    </button>
  );
}

export default LanguageToggle;
