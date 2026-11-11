'use client';

import { CircleHelp, Code2, Shield, Sparkles } from 'lucide-react';
import type { AssistanceMode } from '@/lib/exercises/types';
import styles from './AssistanceControls.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface AssistanceControlsProps {
  value: AssistanceMode;
  onChange: (mode: AssistanceMode) => void;
  disabled?: boolean;
}

const MODES = [
  {
    id: 'GUIDED',
    title: 'Guiado',
    titleEn: 'Guided',
    description: 'Dicas, documentação e sugestões no editor.',
    descriptionEn: 'Hints, documentation and editor suggestions.',
    icon: Sparkles,
  },
  {
    id: 'STANDARD',
    title: 'Padrão',
    titleEn: 'Standard',
    description: 'Documentação e sugestões no editor, sem dicas.',
    descriptionEn: 'Documentation and editor suggestions, no hints.',
    icon: Code2,
  },
  {
    id: 'HARD',
    title: 'Difícil',
    titleEn: 'Hard',
    description: 'Documentação disponível, sem dicas ou sugestões no editor.',
    descriptionEn: 'Documentation available, no hints or editor suggestions.',
    icon: Shield,
  },
  {
    id: 'NO_ASSIST',
    title: 'Sem ajuda',
    titleEn: 'No help',
    description: 'Somente enunciado, editor e testes.',
    descriptionEn: 'Only the prompt, editor and tests.',
    icon: CircleHelp,
  },
] satisfies Array<{
  id: AssistanceMode;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: typeof Sparkles;
}>;

export function AssistanceControls({ value, onChange, disabled = false }: AssistanceControlsProps) {
  const { text } = useLocalizedText();
  const selected = MODES.find((mode) => mode.id === value)!;

  return (
    <fieldset
      disabled={disabled}
      className={styles.controls}
      aria-describedby="assistance-description"
    >
      <legend>{text('Modo de assistência', 'Assistance mode')}</legend>
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
              <span>{text(mode.title, mode.titleEn)}</span>
            </label>
          );
        })}
      </div>
      <div className={styles.description} id="assistance-description">
        <p>{text(selected.description, selected.descriptionEn)}</p>
        <span>{text('100% XP em todos os modos', '100% XP in every mode')}</span>
      </div>
    </fieldset>
  );
}
