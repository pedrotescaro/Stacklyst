'use client';

import { useId, useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import styles from './EvaluatorPages.module.css';

const criteria = [
  ['Correção', 'Confira se a solução produz o resultado esperado, inclusive nos casos limite.'],
  ['Aderência aos requisitos', 'Compare a solução com o enunciado, suas entradas e restrições.'],
  ['Legibilidade', 'Observe nomes, organização e clareza do código para quem precisa mantê-lo.'],
  ['Desempenho', 'Analise o uso de tempo e memória considerando as restrições do desafio.'],
  [
    'Tratamento de erros',
    'Verifique como o código lida com falhas e entradas previstas no enunciado.',
  ],
];

const checklist = [
  'Li o enunciado e comparei as duas soluções pelos mesmos critérios.',
  'Revisei as notas, inclusive quando preenchidas pela avaliação automática.',
  'Escolhi o vencedor e expliquei o desempate com evidências concretas do código.',
  'Identifiquei a qual participante cada observação se refere e revisei a clareza do feedback.',
];

export interface EvaluatorGuideProps {
  context: 'application' | 'evaluation';
  defaultExpanded?: boolean;
}

export function EvaluatorGuide({ context, defaultExpanded }: EvaluatorGuideProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? context === 'application');
  const panelId = useId();
  return (
    <section className={styles.guide}>
      <button
        type="button"
        className={styles.guideToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <BookOpen size={21} className={styles.accent} aria-hidden="true" />
        <span>
          <strong>Guia do Avaliador</strong>
          <small>Critérios, feedback e responsabilidades</small>
        </span>
        <span className={styles.muted}>{isExpanded ? 'Ocultar Guia' : 'Ver Guia'}</span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }}
        />
      </button>
      {isExpanded && (
        <div id={panelId} className={styles.guideBody}>
          <section>
            <h3>Seu papel e suas responsabilidades</h3>
            <p>
              Compare as duas soluções com imparcialidade. Avalie apenas tecnologias que domina e
              justifique a decisão com evidências do código. Você não pode revisar seus próprios
              duelos.
            </p>
          </section>
          <section>
            <h3>Os cinco critérios técnicos</h3>
            <dl>
              {criteria.map(([title, description]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <h3>Como escrever um feedback útil</h3>
            <p>
              Identifique o participante, cite o comportamento do código, explique seu impacto e
              sugira uma melhoria concreta. Reconheça os pontos fortes e explique as notas e a
              escolha do vencedor.
            </p>
          </section>
          <section>
            <h3>O que acontece após a avaliação</h3>
            <p>
              Ao homologar, você conclui o duelo e os participantes recebem o resultado nas
              notificações. Cada avaliação concluída rende 10 XP. As notas automáticas são um apoio:
              revise-as antes de confirmar.
            </p>
          </section>
          <section>
            <h3>Reputação e níveis</h3>
            <p>
              Você começa com 100 pontos de reputação. O nível Confiável exige 10 avaliações e
              reputação 80 ou mais; Especialista exige 50 avaliações e reputação 90 ou mais.
            </p>
            <p>
              Advertências justificadas pela administração retiram 10 pontos. De 60 a 79 pontos, o
              perfil fica em observação; abaixo de 60, fica suspenso. A administração precisa
              revisar a suspensão para liberar o acesso.
            </p>
          </section>
          {context === 'evaluation' && (
            <section>
              <h3>Checklist antes de homologar</h3>
              <ul>
                {checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
