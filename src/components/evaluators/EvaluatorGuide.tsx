import { BookOpen } from 'lucide-react';

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

export function EvaluatorGuide({ context }: { context: 'application' | 'evaluation' }) {
  return (
    <section className="p-6 rounded-3xl bg-dd-surface border border-dd-border space-y-4">
      <h2 className="text-base font-black text-dd-text flex items-center gap-2">
        <BookOpen aria-hidden="true" className="w-5 h-5 shrink-0 text-blue-400" />
        Guia do Avaliador
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-dd-text">Seu papel e suas responsabilidades</h3>
          <p className="text-xs text-dd-muted font-medium leading-relaxed">
            Revise soluções de duelos que aguardam desempate humano. Sua responsabilidade é comparar
            os códigos, justificar a decisão e ajudar os participantes a melhorar.
          </p>
          <p className="text-xs text-dd-muted font-medium leading-relaxed">
            Atue nas tecnologias que domina e mantenha a imparcialidade: use os mesmos critérios
            para ambos os participantes, sem favorecer amizades, reputação ou preferências pessoais.
            Avalie o código com respeito e reconheça os limites da sua análise.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-dd-text">
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
            Cada avaliação concluída rende 10 XP. Os níveis são Iniciante, Confiável (10 avaliações
            e reputação 80+) e Especialista (50 avaliações e reputação 90+).
          </p>
        </div>
      </div>

      <details className="rounded-2xl bg-dd-bg border border-dd-border/60 p-4" open>
        <summary className="text-sm font-bold text-dd-text cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-4">
          Critérios e boas práticas de avaliação
        </summary>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {criteria.map(([title, description]) => (
            <div key={title} className="space-y-1">
              <dt className="text-xs font-bold text-dd-text">{title}</dt>
              <dd className="text-xs text-dd-muted font-medium leading-relaxed">{description}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 pt-4 border-t border-dd-border/60 space-y-2">
          <h3 className="text-sm font-bold text-dd-text">Como escrever um feedback útil</h3>
          <p className="text-xs text-dd-muted font-medium leading-relaxed">
            Relacione observação, impacto e melhoria: cite um trecho ou comportamento do código,
            explique seu efeito e sugira uma ação concreta. Identifique o participante, reconheça
            pontos fortes e fundamente as notas e a escolha do vencedor com essas evidências.
          </p>
          <p className="text-xs text-dd-muted font-medium leading-relaxed">
            Exemplo de melhoria: “Jogador 1: a validação da entrada está repetida em duas funções
            (observação), o que dificulta manter as regras consistentes (impacto). Extraia essa
            validação para uma função compartilhada (melhoria).”
          </p>
        </div>
      </details>

      <details className="rounded-2xl bg-dd-bg border border-dd-border/60 p-4">
        <summary className="text-sm font-bold text-dd-text cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-4">
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
            feedbacks fundamentados. Violações graves podem causar suspensão imediata ou revogação.
            Um administrador pode reintegrar o perfil após registrar a correção necessária.
          </p>
        </div>
      </details>

      {context === 'evaluation' && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
          <h3 className="text-sm font-bold text-dd-text">Checklist antes de homologar</h3>
          <p className="text-xs text-dd-muted font-medium">Use como apoio à sua revisão final:</p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-dd-muted font-medium leading-relaxed">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
