'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DemoViewport } from './DemoViewport';
import { chapters, chapterAt, DURATION } from './timeline';
import './product-demo.css';

function ChapterProgress({
  time,
  start,
  end,
}: {
  time: MotionValue<number>;
  start: number;
  end: number;
}) {
  const scaleX = useTransform(time, (t) =>
    t >= start && t < end ? (t - start) / (end - start) : 0
  );
  return <motion.span className="demo-chapter-progress" style={{ scaleX }} aria-hidden="true" />;
}

export default function ProductDemo() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const time = useMotionValue(0);
  const inView = useInView(ref, { amount: 0.1 });
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(-1);
  const [duelPhase, setDuelPhase] = useState(0);
  const { isEnglish } = useLanguage();
  const lang = isEnglish ? 1 : 0;
  const playing = inView && visible && !paused && !reduced;
  useMotionValueEvent(time, 'change', (t) => {
    setActive((previous) => {
      const next = chapterAt(t);
      return previous === next ? previous : next;
    });
    setDuelPhase(t >= 12.1 && t < 14.7 ? 2 : t >= 11.6 && t < 12.1 ? 1 : 0);
  });
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  useEffect(() => {
    if (reduced) time.set(0);
  }, [reduced, time]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0,
      last: number | undefined;
    const tick = (now: number) => {
      if (last !== undefined)
        time.set((time.get() + Math.min((now - last) / 1000, 0.1)) % DURATION);
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, time]);
  const current = chapters[active];
  return (
    <section
      ref={ref}
      id="platform"
      className="product-demo"
      aria-label={
        isEnglish ? 'Animated Stacklyst demonstration' : 'Demonstração animada do Stacklyst'
      }
      data-playing={playing}
      data-reduced={!!reduced}
    >
      <div ref={stage} className="demo-stage">
        <DemoViewport
          time={time}
          width={width}
          active={active}
          duelPhase={duelPhase}
          reduced={!!reduced}
        />
      </div>
      <div className="sr-only" aria-hidden="true">
        <strong>{current ? current.title[lang] : 'Stacklyst'}</strong>
        <span>
          {current
            ? current.caption[lang]
            : isEnglish
              ? 'Learn. Build. Evolve.'
              : 'Aprenda. Construa. Evolua.'}
        </span>
      </div>
      <div className="demo-controls">
        <span className="demo-label">
          STACKLYST <span>/ {isEnglish ? 'Demonstration' : 'Demonstração'}</span>
        </span>
        <div
          className="demo-chapters"
          role="group"
          aria-label={isEnglish ? 'Demo scenes' : 'Cenas da demonstração'}
        >
          {chapters.map((chapter, i) => (
            <button
              key={chapter.id}
              type="button"
              aria-pressed={active === i}
              onClick={() => {
                time.set(chapter.start + 0.75);
              }}
              disabled={!!reduced}
            >
              {chapter.title[lang]}
              <ChapterProgress time={time} start={chapter.start} end={chapter.end} />
            </button>
          ))}
        </div>
        <div className="demo-playback">
          <button
            type="button"
            aria-label={
              paused
                ? isEnglish
                  ? 'Play demonstration'
                  : 'Reproduzir demonstração'
                : isEnglish
                  ? 'Pause demonstration'
                  : 'Pausar demonstração'
            }
            onClick={() => setPaused((p) => !p)}
            disabled={!!reduced}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            type="button"
            aria-label={isEnglish ? 'Restart demonstration' : 'Reiniciar demonstração'}
            onClick={() => time.set(0)}
            disabled={!!reduced}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
      <p className="sr-only">
        {isEnglish
          ? 'Product demonstration · illustrative activity'
          : 'Demonstração do produto · atividade ilustrativa'}
      </p>
      <p className="sr-only">
        {isEnglish
          ? 'A tour of the real Feed, learning paths, duels, profile and XP ranking. All actions in this preview are illustrative.'
          : 'Um passeio pelo Feed, Trilhas, Duelos, Perfil e Ranking de XP reais. As ações deste preview são ilustrativas.'}
      </p>
    </section>
  );
}
