'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

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

  return (
    <section className="rounded-2xl sm:rounded-3xl bg-dd-surface border border-dd-border transition-all overflow-hidden">
      {/* Header bar / Toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
        aria-expanded={isExpanded}
        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-dd-bg/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <BookOpen aria-hidden="true" className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-dd-text">Guia do Avaliador</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                5 critérios técnicos
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-dd-muted font-medium truncate mt-0.5">
              Critérios de qualidade, boas práticas de feedback e checklist de homologação
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          aria-expanded={isExpanded}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dd-border bg-dd-bg hover:bg-dd-surface text-xs font-bold text-dd-text transition-all shrink-0 cursor-pointer"
        >
          <span className="hidden sm:inline">{isExpanded ? 'Ocultar Guia' : 'Ver Guia'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expanded Guide Content */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 space-y-4 sm:space-y-5 border-t border-dd-border/60 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3.5 sm:p-4 rounded-2xl bg-dd-bg/60 border border-dd-border/40">
              <h3 className="text-xs sm:text-sm font-bold text-dd-text">
                Seu papel e suas responsabilidades
              </h3>
              <p className="text-xs text-dd-muted font-medium leading-relaxed">
                Revise soluções de duelos que aguardam desempate humano. Sua responsabilidade é
                comparar os códigos, justificar a decisão e ajudar os participantes a melhorar.
              </p>
              <p className="text-xs text-dd-muted font-medium leading-relaxed">
                Atue nas tecnologias que domina e mantenha a imparcialidade: use os mesmos critérios
                para ambos os participantes, sem favorecer amizades ou preferências pessoais.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 sm:p-4 rounded-2xl bg-dd-bg/60 border border-dd-border/40">
              <h3 className="text-xs sm:text-sm font-bold text-dd-text">
                {context === 'application'
                  ? 'Como atuar após a aprovação'
                  : 'A revisão humana do duelo'}
              </h3>
              <p className="text-xs text-dd-muted font-medium leading-relaxed">
                {context === 'application'
                  ? 'Após a aprovação administrativa, acesse a Central de Avaliação Técnica e selecione um duelo pendente. Leia o enunciado, compare as soluções e registre notas, vencedor e feedback.'
                  : 'A Central reúne duelos encaminhados para desempate técnico. Confira as soluções e fundamente a escolha do vencedor; as notas automáticas disponíveis são um apoio à sua análise.'}
              </p>
              <p className="text-xs text-dd-muted font-medium leading-relaxed">
                Ao homologar, você conclui o duelo e os participantes são notificados do resultado.
              </p>
              <p className="text-xs text-dd-muted font-medium leading-relaxed">
                Cada avaliação concluída rende 10 XP. Os níveis são Iniciante, Confiável (10
                avaliações e reputação 80+) e Especialista (50 avaliações e reputação 90+).
              </p>
            </div>
          </div>

          <details className="rounded-2xl bg-dd-bg border border-dd-border/60 p-3.5 sm:p-4" open>
            <summary className="text-xs sm:text-sm font-bold text-dd-text cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-4 select-none">
              Critérios e boas práticas de avaliação
            </summary>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {criteria.map(([title, description]) => (
                <div
                  key={title}
                  className="space-y-1 p-2.5 rounded-xl bg-dd-surface/50 border border-dd-border/30"
                >
                  <dt className="text-xs font-bold text-dd-text flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    {title}
                  </dt>
                  <dd className="text-[11px] text-dd-muted font-medium leading-relaxed">
                    {description}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 pt-4 border-t border-dd-border/60 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-dd-text">
                Como escrever um feedback útil
              </h4>
              <p className="text-xs text-dd-muted font-medium leading-relaxed">
                Relacione observação, impacto e melhoria: cite um trecho ou comportamento do código,
                explique seu efeito e sugira uma ação concreta. Identifique o participante,
                reconheça pontos fortes e fundamente as notas e a escolha do vencedor com essas
                evidências.
              </p>
              <p className="text-[11px] text-dd-muted font-mono bg-dd-surface/70 p-2.5 rounded-xl border border-dd-border/40">
                Exemplo: “Jogador 1: a validação da entrada está repetida em duas funções
                (observação), o que dificulta manter as regras consistentes (impacto). Extraia essa
                validação para uma função compartilhada (melhoria).”
              </p>
            </div>
          </details>

          <details className="rounded-2xl bg-dd-bg border border-dd-border/60 p-3.5 sm:p-4">
            <summary className="text-xs sm:text-sm font-bold text-dd-text cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-4 select-none">
              Como manter — ou perder — a função
            </summary>
            <div className="mt-4 space-y-2 text-xs text-dd-muted font-medium leading-relaxed">
              <p>
                A reputação começa em 100. Advertências administrativas, sempre acompanhadas de uma
                justificativa, retiram 10 pontos. Entre 60 e 79 pontos o perfil fica em observação;
                abaixo de 60, fica suspenso e não pode avaliar.
              </p>
              <p>
                Avalie apenas as tecnologias aprovadas no seu perfil, mantenha decisões imparciais e
                feedbacks fundamentados. Violações graves podem causar suspensão imediata ou
                revogação. Um administrador pode reintegrar o perfil após registrar a correção
                necessária.
              </p>
            </div>
          </details>

          {context === 'evaluation' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-dd-text">
                  Checklist antes de homologar
                </h3>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-dd-muted font-medium leading-relaxed pt-1">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-blue-400 font-black shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
