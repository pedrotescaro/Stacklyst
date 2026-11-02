# Avaliação de código, duelos e avaliadores

## Três contratos diferentes

| Contexto          | Decisão                                    | Fontes                                                              |
| ----------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Lição/exercício   | Resposta da etapa ou função contra testes  | `learning/assessment.ts`, `exercises/evaluator.ts`                  |
| Duelo competitivo | Correção e comparação ordenada de soluções | `duels/judge.ts`, `duels/resolution-policy.ts`                      |
| Mundinho          | Traço no cenário e estruturas exigidas     | `mundinho/codeChallenges.ts`, `mundinho/codeChallengeStructures.ts` |

Não existe uma única nota usada igualmente em todo o produto. Cada atividade define seu contrato.

## Execução

`code-execution/server.ts` seleciona execução por linguagem/configuração. `javascript-sandbox.ts` usa QuickJS; TypeScript envolve transformação. Outros caminhos dependem dos provedores configurados. Linguagens que o usuário resolve e linguagens usadas para construir o site não são a mesma lista.

Código do usuário não deve executar via `eval`/`new Function` na página. O harness envolve a solução com invocações e coleta resultados. Compilação, limites, saída e indisponibilidade precisam ser diferenciados. Serviço indisponível não comprova erro pedagógico.

## Exercícios

Casos declaram entrada, resultado esperado, posição e sigilo. O avaliador agrega resultados identificados por marcador. `run` usa a prévia pública; `submit` confere os casos necessários à conclusão. A camada de persistência decide XP e primeira conclusão. Não devolver respostas ou detalhes de testes ocultos na serialização pública.

Teste solução correta, retorno incorreto, exceção, saída extra e executor indisponível. Para depurar, separe contrato, harness, linguagem/provedor, execução, leitura do resultado e commit.

## Duelo competitivo: ciclo

Convite direto dura 72 horas, com publicação opcional após expirar; quando autorizada, a espera pública dura 24 horas. Aceitar assume compromisso; a partida tem duas horas para envio. Recusar/ignorar convite não é abandono.

`duel.service.ts` coordena casos de uso; `duels/invitations.ts` mantém convites; `lifecycle.ts` e `resolution.ts` tratam prazos e fechamento. Rotas de execução e solução distinguem testar de submeter.

## Ordem do julgamento

1. Correção nos testes públicos e ocultos.
2. Igualdade de sintaxe normalizada entre códigos aceitos.
3. Complexidade estimada, quando comparável.
4. Linhas úteis/instruções sintáticas.
5. Empate automático quando códigos diferentes continuam empatados.

Somente a igualdade normalizada encaminha a revisão humana na política atual. Não é prova de plágio. Big-O é estimativa estática; runtime isolado não prova superioridade entre ambientes. Consulte a [política completa](../quality/duel-judging-policy.md), que prevalece sobre o resumo histórico de “empate técnico” em `docs/RULES.md`.

Vitória concede 50 XP uma única vez; derrota não remove XP. Ausência de solução depois do aceite pode contar abandono. Três abandonos consecutivos geram cooldown de 24 horas; envio zera a sequência. Indisponibilidade do juiz não deve gerar penalidade de abandono.

## Revisão humana

Candidatura exige uma trilha integral ou 1.000 XP, motivação mínima de 80 caracteres e tecnologias elegíveis. Administrador analisa com justificativa; editar papel genericamente não substitui candidatura aprovada.

Antes do parecer, o serviço confere papel, status, tecnologia e conflito de interesse. Participante não revisa o próprio duelo. Revisão concluída concede 10 XP ao avaliador conforme o serviço. Reputação inicial é 100; progressão, advertências, observação e suspensão estão nas [regras de avaliadores](../RULES.md).

O parecer humano é um registro autorizado, não uma execução do sandbox. Campos de nota precisam respeitar o contrato da API.

## Atomicidade e notificações

O fechamento usa atualização condicional de estado para proteger resultado, XP e notificações contra concorrência. Push acontece fora do commit. Recuperar notificações ausentes não reabre resultado encerrado nem significa revisão concluída.

## Onde alterar

| Mudança                 | Arquivo/área                                                                  |
| ----------------------- | ----------------------------------------------------------------------------- |
| Testes e correção       | `duels/judge.ts`                                                              |
| Igualdade e linhas      | `duels/source-analysis.ts`                                                    |
| Big-O                   | `duels/complexity.ts`                                                         |
| Ordem de comparação     | `duels/resolution-policy.ts`                                                  |
| Gravação e recuperação  | `duels/resolution.ts`                                                         |
| Elegibilidade e parecer | `services/evaluator.service.ts`                                               |
| Destinatários           | `lib/evaluators/notifications.ts`                                             |
| Interface               | Páginas `/duels`, `/evaluations`, `/evaluators/apply` e componentes de duelos |
