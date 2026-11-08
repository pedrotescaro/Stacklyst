'use client';

import { useLocalizedText } from '@/i18n/useLocalizedText';

export function DuelJudgingRules() {
  const { text } = useLocalizedText();

  return (
    <section
      className="mt-8 border-t border-dd-border pt-5 text-xs leading-6 text-dd-muted"
      aria-label={text('Como o duelo é decidido', 'How duels are decided')}
    >
      <h3 className="mb-2 text-sm font-bold text-dd-text">
        {text('Como o duelo é decidido', 'How duels are decided')}
      </h3>
      <ol className="list-decimal space-y-1 pl-4">
        <li>
          {text(
            'Correção primeiro: passar em todos os testes públicos e ocultos tem prioridade.',
            'Correctness first: passing all public and hidden test cases takes precedence.'
          )}
        </li>
        <li>
          {text(
            'Entre soluções aceitas, vence a menor complexidade Big-O quando a análise consegue compará-las.',
            'Among accepted solutions, lower Big-O complexity wins when analysis can compare them.'
          )}
        </li>
        <li>
          {text(
            'Persistindo a igualdade, vence o código com menos linhas úteis: instruções, sem contar comentários ou formatação.',
            'If still tied, the code with fewer effective statements (excluding comments and formatting) wins.'
          )}
        </li>
        <li>
          {text(
            'Soluções diferentes ainda empatadas encerram em empate automático. Só códigos idênticos após normalização seguem para revisão humana.',
            'Different solutions still tied end in an automatic draw. Only identical normalized code moves to human review.'
          )}
        </li>
      </ol>
      <p className="mt-3">
        {text(
          'Big-O é uma estimativa estática. Quando a análise é inconclusiva, esse critério é ignorado. Milissegundos variam entre execuções e não decidem o vencedor.',
          'Big-O is a static estimate. When analysis is inconclusive, this rule is skipped. Runtime variations in milliseconds do not decide the winner.'
        )}
      </p>
    </section>
  );
}
