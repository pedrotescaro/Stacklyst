'use client';

import { CircleHelp, Code2, Shield, Sparkles } from 'lucide-react';
import type { AssistanceMode } from '@/lib/exercises/types';
import styles from './AssistanceControls.module.css';

interface AssistanceControlsProps {
  value: AssistanceMode;
  onChange: (mode: AssistanceMode) => void;
  disabled?: boolean;
}

const MODES = [
  {
    id: 'GUIDED',
    title: 'Guiado',
    description: 'Dicas, documentação e sugestões no editor.',
    icon: Sparkles,
  },
  {
    id: 'STANDARD',
    title: 'Padrão',
    description: 'Documentação e sugestões no editor, sem dicas.',
    icon: Code2,
  },
  {
    id: 'HARD',
    title: 'Difícil',
    description: 'Documentação disponível, sem dicas ou sugestões no editor.',
    icon: Shield,
  },
  {
    id: 'NO_ASSIST',
    title: 'Sem ajuda',
    description: 'Somente enunciado, editor e testes.',
    icon: CircleHelp,
  },
] satisfies Array<{
  id: AssistanceMode;
  title: string;
  description: string;
  icon: typeof Sparkles;
}>;

export function AssistanceControls({ value, onChange, disabled = false }: AssistanceControlsProps) {
  const selected = MODES.find((mode) => mode.id === value)!;

  return (
    <fieldset
      disabled={disabled}
      className={styles.controls}
      aria-describedby="assistance-description"
    >
      <legend>Modo de assistência</legend>
      <div className={styles.options}>
        {MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <label key={mode.id} className={styles.option} data-active={value === mode.id}>
              <input
                type="radio"
                name="assistance-mode"
                value={mode.id}
                checked={value === mode.id}
                onChange={() => onChange(mode.id)}
              />
              <Icon size={18} aria-hidden="true" />
              <span>{mode.title}</span>
            </label>
          );
        })}
      </div>
      <div className={styles.description} id="assistance-description">
        <p>{selected.description}</p>
        <span>100% XP em todos os modos</span>
      </div>
    </fieldset>
  );
}
