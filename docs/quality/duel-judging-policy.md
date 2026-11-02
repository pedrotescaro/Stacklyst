# Como os duelos são julgados

Política versão 2, de 2 de novembro de 2026. A correção dos testes é obrigatória antes de comparar eficiência. A política é específica do Stacklyst; as referências de juízes de programação orientam o uso de testes públicos, ocultos e limites de execução.

## Ordem exata da decisão

1. **Correção.** Uma solução `ACCEPTED` passou em todos os testes públicos e ocultos dentro do limite. Ela vence uma solução parcial, mesmo que a parcial tenha menos linhas ou rode mais rápido. No prazo final, entre soluções parciais, vence a maior proporção de testes aprovados; a comparação usa os contadores reais, sem arredondar a nota. Duas soluções parciais com a mesma cobertura empatam automaticamente.
2. **Igualdade de código.** Se ambas são aceitas e a árvore sintática normalizada é idêntica, o duelo segue para revisão humana. Comentários, espaços, quebras de linha e ponto e vírgula opcional não diferenciam códigos. Nomes, literais e a estrutura dos blocos Python são preservados. Não é um detector de plágio e não afirma que houve cópia. Produzir a mesma saída não indica igualdade: esse é o objetivo dos testes.
3. **Complexidade estimada.** Para códigos aceitos diferentes, se as duas análises são comparáveis, vence a menor ordem de crescimento: `O(1)` → `O(log n)` → `O(n)` → `O(n log n)` → `O(n²)` → `O(n³)`. `n` representa o tamanho da entrada ou o parâmetro percorrido. A seta indica custo crescente. Uma análise inconclusiva não ganha como se fosse `O(1)` e não provoca revisão humana; esse critério é ignorado quando uma das análises é inconclusiva.
4. **Linhas úteis.** Se a complexidade não desempata, vence o menor número de instruções sintáticas: declarações, atribuições, retornos e estruturas de controle. Comentários, linhas vazias e blocos delimitadores não contam. Um laço conta como instrução e seu corpo também conta. Compactar tudo em uma linha física não reduz essa contagem. Esse é um desempate de tamanho, não uma afirmação de que código curto é sempre mais legível.
5. **Empate automático.** Códigos diferentes que continuam empatados encerram como `CLOSED`, com motivo `technical_draw`, sem vencedor e sem XP de vitória. Não se escolhe arbitrariamente o primeiro jogador, a primeira submissão ou o menor tempo em milissegundos.

A partida é resolvida quando ambos têm uma solução aceita, ou ao terminar o tempo. A melhor tentativa de cada participante é escolhida com os mesmos critérios usados entre jogadores: correção, complexidade comparável e linhas úteis. Uma tentativa posterior pior não apaga uma solução melhor. Quando as próprias tentativas são equivalentes, a mais antiga apenas identifica qual registro auditar; isso não desempata jogadores.

## Exemplos

| Primeiro participante                       | Segundo participante           | Resultado                                    |
| ------------------------------------------- | ------------------------------ | -------------------------------------------- |
| Todos os testes; `O(n²)`                    | Falha em um teste; `O(n)`      | Primeiro: correção vem antes de eficiência   |
| Todos; `O(n)`; 8 instruções                 | Todos; `O(n²)`; 4 instruções   | Primeiro: menor Big-O comparável             |
| Todos; `O(n)`; 4 instruções                 | Todos; `O(n)`; 7 instruções    | Primeiro: menos linhas úteis                 |
| Todos; códigos diferentes; mesmos critérios | Todos; 3 ms de diferença       | Empate automático: milissegundos não decidem |
| Todos; mesmo código, com comentários a mais | Todos; mesmo código compactado | Revisão humana: sintaxe normalizada idêntica |
| 4/5 testes                                  | 3/5 testes                     | Primeiro, ao encerrar o prazo                |
| 4/5 testes                                  | 8/10 testes                    | Empate automático: mesma proporção           |

## O que a análise de Big-O consegue afirmar

`complexity.ts` usa os parsers de JavaScript, TypeScript e Python já disponíveis no projeto. A análise conta estrutura sintática real: laços aninhados, laços sem chaves, compreensões Python, callbacks de coleções e operações conhecidas como busca linear e ordenação. Laços sequenciais usam o maior custo, não a soma das profundidades. Comentários e strings não criam laços nem demonstram redução da entrada. Divisão inteira Python (`//`) continua sendo operador.

Laços com limites literais reconhecidos são constantes; redução incondicional reconhecida da variável de controle por fator constante pode ser logarítmica. A análise é estrutural, com hipóteses usuais de custo constante para operações primitivas e operações de mapa/conjunto. Ela não prova limites de algoritmos arbitrários, não mede memória e não infere de forma geral dependências de dados, recursão, memoização, código inacessível ou o custo de funções externas. Chamadas opacas, recursão e estruturas não suportadas ficam com confiança baixa e não decidem pelo critério de complexidade. Uma classificação estática continua sendo uma estimativa, mesmo quando é comparável.

O tempo retornado pelo executor pode incluir preparação e variações do ambiente. Ele serve para diagnóstico e para o limite de execução, não para premiar diferenças pequenas entre concorrentes. A nota de 0 a 1000 representa somente a proporção de testes aprovados. Os campos legados de nota ponderada e `complexity_score` são mantidos por compatibilidade; a resolução não soma correção, eficiência e tempo para escolher o vencedor.

## Revisão humana e entrega

`REVIEW_PENDING` com motivo `identical_code` é a fila persistida. As duas soluções e uma avaliação automática com a versão da política, IDs das submissões, critério e métricas são gravadas na mesma transação. Uma revisão não concede automaticamente vitória nem XP.

O encaminhamento gera notificações persistentes para administradores e avaliadores ativos/em observação da linguagem, excluindo os participantes do duelo. Cada par duelo/destinatário tem um ID estável: repetir a operação não duplica a notificação. Push é tentado depois do commit; uma falha do provedor não perde o item da caixa de notificações. A revisão pode ser aberta em `/evaluations?duel=<id>`; o acesso continua verificando papel, situação do avaliador, linguagem e conflito de interesse.

Ao abrir um pedido atual, a rotina pode recuperar notificações ausentes para destinatários elegíveis. Ausência de avaliador não inventa uma revisão concluída: o item permanece na fila. Igualdade de código é uma razão para análise, não prova de fraude.

## Falhas, concorrência e pedidos antigos

Indisponibilidade do juiz encerra sem vencedor e sem XP, abandono ou cooldown causado pela indisponibilidade. Sem submissões, ou sem testes válidos aprovados, nenhum vencedor é criado. Erros de compilação/execução e limite excedido não são soluções aceitas.

Uma falha da API aparece imediatamente em alerta e abre a aba Console. O resultado anterior é limpo para não deixar um “Aceita” antigo ao lado de uma tentativa que falhou. O rascunho continua disponível para edição e nova tentativa. Notificações antigas cujo duelo já saiu da fila mostram um caminho para abrir o resultado, em vez de parecer uma solicitação perdida.

O fechamento usa uma atualização condicional de estado antes de gravar soluções, avaliação, notificações e XP na mesma transação. Somente quem obtém essa transição conclui a operação; trabalhadores concorrentes não duplicam recompensas. O push fica fora da transação.

Empates antigos ainda pendentes com motivo `technical_tie` são recalculados a partir das submissões históricas ao abrir o duelo, consultar a fila ou executar a manutenção. Não se reexecuta código antigo nem se inventam testes. Apenas a estimativa e o desempate são recalculados. Casos sem histórico suficiente permanecem para análise. Resultados já encerrados e avaliações humanas concluídas não são alterados. A atualização condicional protege também contra um avaliador concluindo o pedido durante a recuperação.

## Onde está implementado

| Arquivo                                     | Responsabilidade                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `src/lib/duels/judge.ts`                    | Executar casos públicos/ocultos, validar resultado e calcular correção |
| `src/lib/duels/source-analysis.ts`          | Normalizar sintaxe e contar linhas úteis                               |
| `src/lib/duels/complexity.ts`               | Estimativa estática e confiança                                        |
| `src/lib/duels/resolution-policy.ts`        | Comparar tentativas e decidir por critérios ordenados                  |
| `src/lib/duels/resolution.ts`               | Persistência atômica, recuperação de pedidos antigos e XP              |
| `src/lib/evaluators/notifications.ts`       | Destinatários, notificação persistida e push                           |
| `src/app/api/evaluations/route.ts`          | Fila autorizada e envio de parecer                                     |
| `src/components/duels/DuelJudgingRules.tsx` | Regras explicadas dentro da arena                                      |

Os testes incluem correção antes de eficiência, laços e callbacks aninhados, diferenças de formatação, strings/literais, blocos Python, soluções parciais, indisponibilidade, recuperação de pedidos antigos e 50 resoluções concorrentes com uma única recompensa/notificação.

A validação desta revisão inclui a suíte geral (1.449 testes aprovados, 50 ignorados pela configuração existente), testes adicionais focados de correção, entrega de notificações e recuperação de erro, typecheck, lint e build de produção com smoke do juiz compilado. A conferência local usa os componentes reais e transporte simulado em 1440/820/390/320 px, nos dois temas; verifica a borda, ausência dos ícones nos títulos, leitura/edição, resultados, submissão e tratamento de falha sem perda do rascunho. A auditoria de dados pendentes foi somente de leitura. Esses checks não representam uma sessão autenticada em produção nem entrega de push em aparelho físico.

Referências primárias: [casos de teste do HackerRank](https://candidatesupport.hackerrank.com/articles/4513323466-evaluation-method-of-coding-questions) e [limites e autoria de problemas do beecrowd](https://judge.beecrowd.com/en/faqs/about/problems). A prioridade de Big-O e o desempate por linhas úteis descritos acima são regras próprias do Stacklyst solicitadas pelo proprietário.
