'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Screenshot {
  name: string;
  title: string;
  url: string;
  description: string;
}

export function ScreenshotCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayTheme, setDisplayTheme] = useState<'light' | 'dark'>('dark');
  const [isHovered, setIsHovered] = useState(false);

  const screenshots: Screenshot[] = [
    {
      name: 'feed',
      title: 'Feed Principal',
      url: 'stacklyst.com/feed',
      description:
        'Discussões técnicas em tempo real. Poste dúvidas de código e veja a comunidade debater soluções.',
    },
    {
      name: 'trails',
      title: 'Trilhas de Linguagem',
      url: 'stacklyst.com/trails',
      description:
        'Progresso ativo por linguagem. Acompanhe seu XP em TypeScript, Python, Rust, Go e suba de nível.',
    },
    {
      name: 'duels',
      title: 'Duelos de Performance',
      url: 'stacklyst.com/duels',
      description:
        'Batalhas de código com desafios estruturados e testes objetivos. Resolva, compare resultados e evolua no ranking.',
    },
    {
      name: 'leaderboard',
      title: 'Leaderboard Global',
      url: 'stacklyst.com/leaderboard',
      description:
        'Rankings semanais e gerais. Garanta seu lugar no topo e compita com engenheiros do mundo todo.',
    },
    {
      name: 'profile',
      title: 'Perfil Técnico',
      url: 'stacklyst.com/profile/pedrodev',
      description:
        'Seu currículo vivo. Exiba seu histórico de contribuições, badges raras e link do GitHub integrado.',
    },
  ];

  // Auto-play effect: changes slide every 4.5 seconds, pauses on hover
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, screenshots.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  const current = screenshots[currentIndex];
  const imagePath = `/screenshots/${current.name}_${displayTheme}.png`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 select-none">
      {/* Browser Mockup Frame */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative rounded-2xl border border-dd-border bg-dd-bg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300"
      >
        {/* Top Browser Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-dd-surface/40 border-b border-dd-border">
          {/* Window controls */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Address Bar */}
          <div className="flex items-center gap-1.5 px-6 py-1 rounded-md bg-dd-bg border border-dd-border/50 text-[10px] text-dd-muted font-mono w-48 md:w-80 justify-center">
            <span className="text-blue-500/80">https://</span>
            {current.url}
          </div>

          {/* Theme switcher control in address bar */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-dd-bg border border-dd-border/60">
            <button
              onClick={() => setDisplayTheme('light')}
              className={`p-1 rounded transition-colors ${
                displayTheme === 'light'
                  ? 'bg-blue-500 text-white'
                  : 'text-dd-muted hover:text-dd-text'
              }`}
              title="Modo Claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDisplayTheme('dark')}
              className={`p-1 rounded transition-colors ${
                displayTheme === 'dark'
                  ? 'bg-blue-500 text-white'
                  : 'text-dd-muted hover:text-dd-text'
              }`}
              title="Modo Escuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Screenshot Viewport Container */}
        <div className="relative aspect-[1440/900] bg-dd-surface/20 flex items-center justify-center overflow-hidden">
          {/* Motion image container using framer-motion AnimatePresence for smooth crossfades */}
          <AnimatePresence initial={false}>
            <motion.img
              key={imagePath}
              src={imagePath}
              alt={current.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full h-full object-cover absolute inset-0"
              onError={(e) => {
                e.currentTarget.src = '/logo.svg';
              }}
            />
          </AnimatePresence>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-dd-border bg-dd-bg/85 hover:bg-dd-bg text-dd-text flex items-center justify-center hover:scale-105 active:scale-[0.95] transition-all z-10 shadow-lg backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-dd-border bg-dd-bg/85 hover:bg-dd-bg text-dd-text flex items-center justify-center hover:scale-105 active:scale-[0.95] transition-all z-10 shadow-lg backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide dots indicator */}
      <div className="flex items-center justify-center gap-2 py-1">
        {screenshots.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx ? 'bg-blue-500 w-3.5' : 'bg-dd-border hover:bg-dd-muted'
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Screenshot Caption Description */}
      <div className="text-center max-w-xl mx-auto space-y-1 py-1">
        <h4 className="text-sm font-black text-dd-text uppercase tracking-wide">
          {current.title} ({displayTheme === 'light' ? 'Modo Claro' : 'Modo Escuro'})
        </h4>
        <p className="text-xs text-dd-muted leading-relaxed">{current.description}</p>
      </div>
    </div>
  );
}
