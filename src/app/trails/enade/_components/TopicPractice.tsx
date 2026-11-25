'use client';
import { useState } from 'react';
import { StartAttemptButton } from './StartAttemptButton';
import { MenuSelect } from './MenuSelect';
import ui from './ui.module.css';
import { plural } from '@/lib/enade/format';

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
      <MenuSelect
        label="Assunto"
        className="w-full"
        value={topic}
        onChange={setTopic}
        groups={categories
          .map((category) => ({
            label: category.title,
            options: topics
              .filter((t) => t.category === category.slug)
              .map((t) => ({
                value: t.slug,
                label: t.title,
                detail: plural(t.count, 'questão', 'questões'),
              })),
          }))
          .filter((group) => group.options.length)}
      />
      <MenuSelect
        label="Questões"
        value={String(limit)}
        onChange={(value) => setLimit(Number(value))}
        options={[5, 10, 20].map((n) => ({ value: String(n), label: `até ${n}` }))}
      />
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
        {selected
          ? `Praticar ${plural(Math.min(limit, selected.count), 'questão', 'questões')}`
          : 'Praticar'}
      </StartAttemptButton>
    </div>
  );
}
