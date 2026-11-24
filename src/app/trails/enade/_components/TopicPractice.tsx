'use client';
import { useState } from 'react';
import { StartAttemptButton } from './StartAttemptButton';
import ui from './ui.module.css';

export function TopicPractice({
  topics,
  categories,
  initialTopic,
}: {
  topics: { slug: string; title: string; category: string; count: number }[];
  categories: { slug: string; title: string }[];
  initialTopic?: string;
}) {
  const [topic, setTopic] = useState(initialTopic ?? topics[0]?.slug ?? '');
  const [mode, setMode] = useState<'training' | 'exam'>('training');
  const [limit, setLimit] = useState(10);
  const selected = topics.find((t) => t.slug === topic);
  if (!topics.length) return null;
  return (
    <div className={ui.filters} style={{ alignItems: 'flex-end' }}>
      <label className={ui.label}>
        Assunto
        <select className={ui.select} value={topic} onChange={(e) => setTopic(e.target.value)}>
          {categories.map((category) => {
            const options = topics.filter((t) => t.category === category.slug);
            return options.length ? (
              <optgroup key={category.slug} label={category.title}>
                {options.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title} ({t.count})
                  </option>
                ))}
              </optgroup>
            ) : null;
          })}
        </select>
      </label>
      <label className={ui.label}>
        Questões
        <select
          className={ui.select}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              até {n}
            </option>
          ))}
        </select>
      </label>
      <div role="radiogroup" aria-label="Modo" className={ui.filters} style={{ margin: 0 }}>
        <button
          type="button"
          className={ui.chip}
          aria-pressed={mode === 'training'}
          onClick={() => setMode('training')}
        >
          Modo estudo
        </button>
        <button
          type="button"
          className={ui.chip}
          aria-pressed={mode === 'exam'}
          onClick={() => setMode('exam')}
        >
          Modo simulado
        </button>
      </div>
      <StartAttemptButton payload={{ kind: 'TOPIC', topic, limit, mode }} disabled={!selected}>
        Praticar {selected ? Math.min(limit, selected.count) : ''} questões
      </StartAttemptButton>
    </div>
  );
}
