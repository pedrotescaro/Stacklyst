'use client';

import { useCallback, useEffect, useState } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import ProductDemo from '@/components/product-demo/ProductDemo';
import LandingFooter from '@/components/landing/LandingFooter';
import SiteEntryLoader from '@/components/landing/SiteEntryLoader';

interface HomeClientProps {
  initialUser: any;
}

export default function HomeClient({ initialUser }: HomeClientProps) {
  const [showEntryLoader, setShowEntryLoader] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('lp-landing-page');

    return () => {
      document.documentElement.classList.remove('lp-landing-page');
    };
  }, []);

  const handleEntryComplete = useCallback(() => {
    setShowEntryLoader(false);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen bg-[var(--lp-bg)] text-[var(--lp-fg)] antialiased selection:bg-[var(--lp-accent)]/30 selection:text-white"
      data-force-motion="true"
    >
      {showEntryLoader && <SiteEntryLoader forceMotion onComplete={handleEntryComplete} />}

      {/* Background grain texture */}
      <div className="lp-grain" />

      {/* Navigation */}
      <LandingNav initialUser={initialUser} />

      {/* Hero Section */}
      <LandingHero initialUser={initialUser} isReady={!showEntryLoader} />

      {/* Redesigned product experience */}
      <main className="relative z-10">
        <ProductDemo />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
