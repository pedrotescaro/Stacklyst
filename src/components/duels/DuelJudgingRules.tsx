export function DuelJudgingRules() {
  return (
    <section
      className="mt-8 border-t border-dd-border pt-5 text-xs leading-6 text-dd-muted"
      aria-label="Como o duelo é decidido"
    >
      <h3 className="mb-2 text-sm font-bold text-dd-text">Como o duelo é decidido</h3>
      <ol className="list-decimal space-y-1 pl-4">
        <li>Correção primeiro: passar em todos os testes públicos e ocultos tem prioridade.</li>
        <li>
          Entre soluções aceitas, vence a menor complexidade Big-O quando a análise consegue
          compará-las.
        </li>
        <li>
          Persistindo a igualdade, vence o código com menos linhas úteis: instruções, sem contar
          comentários ou formatação.
        </li>
        <li>
          Soluções diferentes ainda empatadas encerram em empate automático. Só códigos idênticos
          após normalização seguem para revisão humana.
        </li>
      </ol>
      <p className="mt-3">
        Big-O é uma estimativa estática. Quando a análise é inconclusiva, esse critério é ignorado.
        Milissegundos variam entre execuções e não decidem o vencedor.
      </p>
    </section>
  );
}
