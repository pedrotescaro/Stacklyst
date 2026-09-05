'use client';

import Link from 'next/link';
import { ThemeLogo } from '@/components/ThemeLogo';
import { useLocalizedText } from '@/i18n/useLocalizedText';

const footerLinks = [
  { label: 'Feed', href: '/feed' },
  { label: 'Trilhas', href: '/trails' },
  { label: 'Duelos', href: '#' },
  { label: 'Sobre', href: '#' },
  { label: 'Privacidade', href: '#' },
  { label: 'Termos', href: '#' },
];

const socialLinks = [
  {
    label: 'Twitter / X',
    href: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px]">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px]">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
      </svg>
    ),
  },
];

export function Footer() {
  const { text } = useLocalizedText();
  const localizedLinks = footerLinks.map((link) => ({
    ...link,
    label: text(
      link.label,
      (
        {
          Feed: 'Feed',
          Trilhas: 'Trails',
          Duelos: 'Duels',
          Sobre: 'About',
          Privacidade: 'Privacy',
          Termos: 'Terms',
        } as Record<string, string>
      )[link.label] ?? link.label
    ),
  }));
  return (
    <footer className="border-t border-dd-border bg-dd-bg mt-auto">
      {/* Top section — logo + nav links */}
      <div className="mx-auto max-w-5xl px-4 pt-10 pb-8">
        {/* Centered logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-dd-card border border-dd-border">
            <ThemeLogo
              alt="Stacklyst Logo"
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
            />
          </div>
          <span className="text-dd-text font-bold text-sm">Stacklyst</span>
        </div>

        {/* Nav links row */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {localizedLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-dd-muted hover:text-dd-text transition-colors font-semibold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Dotted separator */}
      <div className="mx-auto max-w-5xl px-4">
        <div
          className="h-px w-full"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--color-dd-border) 33%, transparent 33%)',
            backgroundSize: '6px 1px',
          }}
        />
      </div>

      {/* Bottom bar — copyright + socials */}
      <div className="mx-auto max-w-5xl px-4 py-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
        <span className="text-dd-muted text-[11px]">
          © {new Date().getFullYear()} Stacklyst.{' '}
          {text('Todos os direitos reservados.', 'All rights reserved.')}
        </span>

        <div className="flex items-center gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-dd-muted hover:text-dd-text transition-colors"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
