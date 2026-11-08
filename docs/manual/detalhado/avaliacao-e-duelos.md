# Avaliação de código, duelos e revisão humana

## Contratos independentes

| Contexto          | Entrada avaliada           | Critério                            | Efeito possível                           |
| ----------------- | -------------------------- | ----------------------------------- | ----------------------------------------- |
| Lição             | Resposta da etapa          | Gabarito/contrato configurado       | Progresso e primeiro crédito elegível     |
| Exercício         | Código de função/programa  | Casos de teste e retorno esperado   | Execução, submissão e primeira conclusão  |
| Duelo competitivo | Soluções dos participantes | Correção e comparação ordenada      | Resultado, revisão e XP de vitória        |
| Mundinho          | Programa de cenário        | Traço e estruturas executadas       | Golpe, turno e combate                    |
| Revisão humana    | Parecer autorizado         | Elegibilidade e contrato do parecer | Registro de decisão e recompensa prevista |

Não existe uma única função de “nota de programação” que decide todos esses contextos. O mesmo código pode estar correto para um contrato e errado para outro.

## Execução de código

[code-execution/server.ts](../../../src/lib/code-execution/server.ts) prepara a linguagem e escolhe o caminho de execução. JS usa sandbox QuickJS; TS envolve transformação antes da execução correspondente. Outras linguagens dependem dos provedores e configurações disponíveis, como Judge0 e Wandbox.

O preparo pode envolver um programa incompleto numa estrutura esperada pela linguagem: classe `Main`, `main`, imports ou cabeçalhos. Isso melhora a usabilidade, mas não transforma qualquer fragmento em programa correto. O retorno distingue `ok`, `output`, `error`, `unavailable` e tempo de execução.

Os adaptadores usam timeout e tratam resposta do provedor. Falha HTTP, indisponibilidade e erro de compilação são situações diferentes. O servidor não deve executar código do aluno dentro do processo normal com `eval` irrestrito.

## Harness e testes

[exercises/evaluator.ts](../../../src/lib/exercises/evaluator.ts) constrói o programa de avaliação, prepara invocações e identifica resultados por marcadores. Saída extra do aluno não deve substituir o resultado estruturado esperado pelo avaliador.

Casos de teste têm entrada, saída esperada, ordem e indicação de sigilo. `run` usa prévia pública; submissão pode incluir ocultos. O DTO público não entrega gabarito de teste oculto. Um caso também pode especificar invocação, portanto o contrato não precisa ser apenas “ler stdin e imprimir”.

Para interpretar uma falha, siga: nome/assinatura da função → entrada → transformação → tipo do retorno → comparação → execução/parse → disponibilidade. Console correto com retorno incorreto é um exemplo comum de programa que ainda não cumpre o contrato.

## Convite e compromisso competitivo

O duelo competitivo é diferente da arena privada do Mundinho. As constantes atuais definem 72 horas para convite direto, 24 horas para uma janela pública quando autorizada e duas horas para a partida após início. Manutenção trata expiração e encerramento conforme estado.

Aceitar estabelece compromisso de participação. Recusar/ignorar convite não deve ser contabilizado como abandono de uma partida aceita. A política controla sequência de abandonos e cooldown de 24 horas após três consecutivos. Envio válido no fluxo correspondente reseta a sequência conforme a política implementada.

## Executar e submeter

A rota de execução oferece feedback de testes. A rota de solução registra submissão competitiva, com usuário pertencente ao duelo e estado/prazo compatível. Não basta enviar `duelId` e um vencedor desejado.

O registro de uma execução e a escolha da melhor submissão são responsabilidades diferentes. [chooseBestDuelSubmission](../../../src/lib/duels/resolution-policy.ts) seleciona a solução representativa de cada usuário com critérios que consideram validade e correção, em vez de tomar simplesmente o último texto salvo.

## Ordem da decisão automática

1. Indisponibilidade do juiz é tratada como condição operacional própria.
2. Ausência de submissões ou ausência de resultados válidos pode encerrar sem vencedor.
3. Correção e proporção de testes aprovados antecedem eficiência.
4. Se resultados equivalentes ainda não são ambos aceitos, pode haver empate técnico.
5. Se ambos foram aceitos e a sintaxe normalizada coincide, encaminha revisão humana.
6. Para soluções aceitas diferentes, complexidade estimada só compara quando há confiança prevista nas duas.
7. Linhas úteis/instruções sintáticas são o critério posterior.
8. Persistindo equivalência, encerra em empate automático.

Runtime e score histórico podem compor dados explicativos, mas não substituem essa ordem. O [documento de política](../../quality/duel-judging-policy.md) aprofunda o algoritmo vigente.

## Limites da análise

Normalização sintática reduz diferenças de formatação e representação, mas igualdade normalizada não prova plágio. Estimativa estática de Big-O não é uma prova formal e pode ter confiança limitada. Linhas úteis não medem sozinhas legibilidade. Tempo em provedores distintos não é comparação controlada de desempenho.

Esses limites precisam aparecer também na apresentação acadêmica: “o sistema estima e compara conforme a política” é uma descrição precisa; “o sistema prova a melhor solução possível” não é.

## Persistência e recompensas

[resolution.ts](../../../src/lib/duels/resolution.ts) coordena resolução e gravação. Atualização condicional do estado e transação protegem contra fechamentos concorrentes. XP de vitória é 50, concedido uma vez pelo fluxo de resultado; derrota não é débito de XP.

Notificações e entrega push não devem ser usadas como prova de que o resultado foi ou não gravado. Recuperar uma notificação pendente não reabre um duelo nem concede uma segunda recompensa.

## Candidatura a avaliador

[EvaluatorService.checkEligibility](../../../src/services/evaluator.service.ts) verifica progresso real da trilha ou XP suficiente. A política atual exige uma trilha completa ou pelo menos 1.000 XP. A candidatura também exige motivação normalizada de no mínimo 80 caracteres e tecnologias elegíveis.

Aprovação é ato administrativo com justificativa e registros correspondentes. Não é consequência automática de escrever “sou avaliador” na bio ou equipar um título. Rejeição, nova candidatura e moderação têm estados próprios no serviço.

## Reputação e autorização para revisar

A reputação inicial no fluxo de aprovação é 100. Os limites da política são 80 para faixa ativa e 60 para suspensão. Avisos e reativação alteram o estado segundo o serviço; o papel nominal não elimina a checagem desse estado.

Antes do parecer, o serviço confere identidade, papel, situação, tecnologia e conflito. Participante não pode avaliar seu próprio duelo. Os campos numéricos e o feedback devem respeitar o contrato. Revisão concluída rende 10 XP ao avaliador no fluxo de recompensa autorizado.

## Verificações recomendadas

| Cenário                               | Resultado a conferir                     |
| ------------------------------------- | ---------------------------------------- |
| Correta versus incorreta              | Correção prevalece sobre código menor    |
| Aceitas com normalização igual        | Revisão humana, sem acusação automática  |
| Diferentes com eficiência equivalente | Empate quando os critérios se esgotam    |
| Compilador indisponível               | Não inventar derrota pedagógica/abandono |
| Dois fechamentos simultâneos          | Um resultado e um crédito elegível       |
| Terceiro enviando solução             | Acesso negado                            |
| Avaliador participante                | Conflito rejeitado                       |
| Avaliador suspenso ou sem tecnologia  | Parecer não autorizado                   |

Veja [sequências](sequencias.md) e [código comentado](codigo-comentado.md) para acompanhar rotas, juiz, política e gravação.
