'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { Info, Pause, Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DemoViewport } from './DemoViewport';
import { SCENES, type SceneId } from './timeline';
import './product-demo.css';

const MOBILE_QUERY = '(max-width: 767px)';

function TabProgress({
  clock,
  duration,
  active,
}: {
  clock: MotionValue<number>;
  duration: number;
  active: boolean;
}) {
  const scaleX = useTransform(clock, (time) => (active ? Math.min(1, time / duration) : 0));
  return <motion.span className="demo-tab-progress" style={{ scaleX }} aria-hidden="true" />;
}

export default function ProductDemo() {
  const ref = useRef<HTMLElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  // One clock per scene: a scene that is fading out keeps its final state
  // instead of restarting while the next scene fades in.
  const clocks = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const inView = useInView(ref, { amount: 0.1 });
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const { t } = useLanguage();
  const scene = SCENES[index];
  const clock = clocks[index];
  const playing = inView && visible && !paused && !hovered && !reduced;
  // Warm-up only makes sense before the walkthrough has ever been on screen.
  const [started, setStarted] = useState(false);
  if (inView && !started) setStarted(true);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      media.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Reduced motion shows every scene settled, with manual navigation only.
  useEffect(() => {
    if (reduced) SCENES.forEach((item, i) => clocks[i].set(item.duration));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clocks are stable motion values
  }, [reduced]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last: number | undefined;
    const tick = (now: number) => {
      if (last !== undefined) {
        const next = clock.get() + Math.min((now - last) / 1000, 0.1);
        if (next >= scene.duration) {
          clock.set(scene.duration);
          clocks[(index + 1) % SCENES.length].set(0);
          setIndex((current) => (current + 1) % SCENES.length);
          return;
        }
        clock.set(next);
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clocks are stable motion values
  }, [playing, clock, scene.duration, index]);

  const goTo = useCallback(
    (next: number) => {
      const target = ((next % SCENES.length) + SCENES.length) % SCENES.length;
      clocks[target].set(reduced ? SCENES[target].duration : 0);
      setIndex(target);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clocks are stable motion values
    [reduced]
  );

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: SCENES.length - 1,
    };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    goTo(target);
    tabs.current[((target % SCENES.length) + SCENES.length) % SCENES.length]?.focus();
  };

  const tabId = (id: SceneId) => `product-demo-tab-${id}`;
  const current = t.demo.scenes[scene.id];

  return (
    <section
      ref={ref}
      id="platform"
      className="product-demo"
      aria-label={t.demo.sectionLabel}
      data-playing={playing}
      data-reduced={!!reduced}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false);
      }}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false);
      }}
    >
      <div
        id="product-demo-stage"
        role="tabpanel"
        aria-labelledby={tabId(scene.id)}
        className="demo-stage"
      >
        <p className="sr-only">
          <strong>{current.title}</strong> {current.caption}
        </p>
        <DemoViewport clock={clock} scene={scene.id} mobile={mobile} prewarm={!started} />
      </div>
      <p className="sr-only" aria-live="polite">
        {t.demo.currentScene}: {current.title}. {current.caption}
      </p>

      <div className="demo-controls">
        <span className="demo-label">
          STACKLYST <span>/ {t.demo.label}</span>
        </span>
        <div className="demo-tabs" role="tablist" aria-label={t.demo.scenesLabel}>
          {SCENES.map((item, i) => (
            <button
              key={item.id}
              ref={(element) => {
                tabs.current[i] = element;
              }}
              id={tabId(item.id)}
              type="button"
              role="tab"
              aria-selected={index === i}
              aria-controls="product-demo-stage"
              tabIndex={index === i ? 0 : -1}
              className="demo-tab dd-focus-ring"
              onClick={() => goTo(i)}
              onKeyDown={onTabKeyDown}
            >
              {t.demo.scenes[item.id].title}
              <TabProgress clock={clocks[i]} duration={item.duration} active={index === i} />
            </button>
          ))}
        </div>
        <div className="demo-playback">
          <button
            type="button"
            className="dd-focus-ring"
            aria-label={paused ? t.demo.play : t.demo.pause}
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            disabled={!!reduced}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            type="button"
            className="dd-focus-ring"
            aria-label={t.demo.restart}
            onClick={() => goTo(0)}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      <p className="demo-notice">
        <Info size={14} aria-hidden="true" />
        <span>{t.demo.notice}</span>
      </p>
      <p className="sr-only">{t.demo.summary}</p>
    </section>
  );
}
