import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono, Bebas_Neue } from 'next/font/google';
import './globals.css';
import './landing.css';
import ConnectionBanner from '@/components/ConnectionBanner';
import { LanguageProvider } from '@/contexts/LanguageContext';

const themeScript = `
  (function() {
    try {
      const storedTheme = localStorage.getItem('theme');
      const theme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
      </head>
      <body className="bg-dd-bg text-dd-text min-h-screen font-sans" suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <ConnectionBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
