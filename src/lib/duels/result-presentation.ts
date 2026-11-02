/** Public explanation only: no opponent source or hidden test inputs. */
export function duelResultExplanation(analysis: unknown) {
  const comparison = (
    analysis as {
      comparison?: {
        criterion?: string;
        first?: { complexity?: string; logicalLines?: number };
        second?: { complexity?: string; logicalLines?: number };
      };
    } | null
  )?.comparison;
  if (!comparison) return null;
  if (comparison.criterion === 'complexity')
    return `Decidido pela menor complexidade estimada: ${comparison.first?.complexity} × ${comparison.second?.complexity}.`;
  if (comparison.criterion === 'code_size')
    return `Decidido por menos linhas úteis: ${comparison.first?.logicalLines} × ${comparison.second?.logicalLines}. Comentários, linhas vazias e minificação não alteram a contagem.`;
  if (comparison.criterion === 'correctness')
    return 'Decidido pela correção nos testes públicos e ocultos. Uma solução aceita tem prioridade sobre uma solução parcial.';
  if (comparison.criterion === 'identical_code')
    return 'As duas soluções aceitas têm código idêntico após ignorar comentários e formatação. Estão na fila para um avaliador que não participou do duelo; isso não comprova cópia.';
  if (comparison.criterion === 'tie')
    return 'As soluções diferentes ficaram empatadas nos critérios aplicáveis. O empate foi encerrado automaticamente, sem revisão humana.';
  return null;
}
