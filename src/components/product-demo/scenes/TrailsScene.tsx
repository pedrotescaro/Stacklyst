import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Check, Star, ArrowRight } from 'lucide-react';
import { TrailLanguageLogo } from '@/app/trails/TrailLanguageLogo';
import journey from '@/app/trails/LearningJourney.module.css';
import { smooth } from '../timeline';

// LearningJourney's actual DOM geometry and CSS module; only the visible first
// unit is projected, avoiding the live mascot's storage/scroll side effects.
export function TrailsScene({ time }: { time: MotionValue<number> }) {
  const y = useTransform(time, (t) => -340 * smooth(6.8, 9.3, t));
  const progress = useTransform(time, (t) => 0.15 + 0.08 * smooth(8.3, 9.1, t));
  const highlight = useTransform(
    time,
    (t) => 0.35 + 0.65 * (smooth(7.8, 8.3, t) - smooth(9.3, 9.8, t))
  );
  return (
    <div>
      <div className="demo-scene-header">
        <div className="flex gap-5">
          <b className="text-blue-400">Mapa</b>
          <span>Trilha</span>
        </div>
        <TrailLanguageLogo language="JS" className="h-6 w-6" />
      </div>
      <motion.div style={{ y }} className="px-8 py-6">
        <h2 className="text-3xl font-bold">JavaScript do zero</h2>
        <p className="mt-2 text-sm text-dd-muted">
          Da primeira instrução a um projeto com dados e testes.
        </p>
        <p className="mt-5 text-sm">2/13 lições · 4/26 exercícios · 4 unidades</p>
        <div className="demo-progress mt-3">
          <motion.div style={{ scaleX: progress }} />
        </div>
        <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold">
          Começar: Guardar e atualizar valores <ArrowRight size={17} />
        </div>
        <div className="my-6 flex gap-2 text-xs">
          <span className="rounded-lg border border-dd-border p-3">1. Primeiros programas</span>
          <span className="rounded-lg border border-dd-border p-3">2. Decisões e repetições</span>
        </div>
        <header className="rounded-2xl border-b-[6px] border-blue-700 bg-blue-500 px-5 py-5">
          <h3 className="text-xl font-extrabold">Unidade 1 · Primeiros programas</h3>
          <p className="mt-1 text-sm">2/3 lições · 4/6 exercícios</p>
        </header>
        <ol className={journey.path}>
          {[
            'Seu primeiro programa',
            'Textos, números e operações',
            'Guardar e atualizar valores',
          ].map((title, i) => (
            <li key={title} className={`relative ${journey.stop}`}>
              {i < 2 && (
                <svg className={journey.connector} viewBox="0 0 100 248" preserveAspectRatio="none">
                  <path
                    d={`M ${i === 0 ? 50 : 34} 0 C ${i === 0 ? 50 : 34} 125 ${i === 0 ? 34 : 50} 123 ${i === 0 ? 34 : 50} 248`}
                    stroke="currentColor"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="3 9"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <div className={journey.station} style={{ left: `${i === 1 ? 34 : 50}%` }}>
                {i === 2 && (
                  <motion.span className={journey.nextLabel} style={{ opacity: highlight }}>
                    SUA PRÓXIMA LIÇÃO
                  </motion.span>
                )}
                <div
                  className={`${journey.node} flex shrink-0 items-center justify-center rounded-full ${i < 2 ? 'border-emerald-700 bg-emerald-500' : 'border-blue-700 bg-blue-500'}`}
                >
                  {i < 2 ? <Check size={36} /> : <Star size={36} fill="currentColor" />}
                </div>
                <div className={journey.caption}>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-dd-muted">
                    {i < 2
                      ? 'Lição · 2/2 exercícios · Concluída'
                      : 'Projeto · 0/2 exercícios · Você está aqui'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </motion.div>
    </div>
  );
}
