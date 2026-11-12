import type { Metadata } from 'next';
import { Inter, Sora, Space_Grotesk, JetBrains_Mono, Bebas_Neue } from 'next/font/google';
import './globals.css';
import './landing.css';
import ConnectionBanner from '@/components/ConnectionBanner';
import PlatformPresence from '@/components/PlatformPresence';
import AchievementNotifications from '@/components/profile/AchievementNotifications';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import { FloatingMiniPlayer } from '@/components/music/FloatingMiniPlayer';
import { ThemeSync } from '@/components/ThemeSync';
import { themeBootstrap } from '@/lib/theme';

const themeScript = `
  (function() {
    try {
      ${themeBootstrap}
    } catch (e) {}

    try {
      const storedLang = localStorage.getItem('site-language');
      const lang = storedLang === 'en' ? 'en' : 'pt';
      document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
      document.documentElement.dataset.language = lang;
    } catch (e) {}
  })();
`;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: '600',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '700'],
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-bebas-neue',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Stacklyst — The Gamified Community for Developers',
  description:
    'Level up through real discussions, code duels, adaptive quizzes, and verifiable skills.',
  icons: {
    icon: '/icon.svg?v=2',
    shortcut: '/favicon.ico?v=2',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${sora.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Blocking inline script: applies the saved theme before the first paint so a
            dark choice never flashes light on reload. next/script's beforeInteractive
            runs after paint in the App Router, which caused that flash. */}
        <script id="theme-script" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-dd-bg text-dd-text min-h-screen font-sans" suppressHydrationWarning>
        <LanguageProvider>
          <MusicPlayerProvider>
            <ThemeSync />
            <PlatformPresence />
            <AchievementNotifications />
            {children}
            <FloatingMiniPlayer />
            <ConnectionBanner />
          </MusicPlayerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
