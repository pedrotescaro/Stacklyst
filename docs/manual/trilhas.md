# Trilhas: mapa, currículo, avaliação e progresso

## Modelo mental

| Conceito        | Significado                                        |
| --------------- | -------------------------------------------------- |
| Curso/linguagem | Contexto escolhido para estudar                    |
| Caminho/trilha  | Agrupamento recomendado de conhecimentos           |
| Nó              | Competência compartilhada no grafo                 |
| Relação         | Ligação com semântica de recomendação ou requisito |
| Lição           | Sequência de etapas pedagógicas do catálogo        |
| Etapa           | Explicação, pergunta ou tarefa avaliada            |
| Exercício       | Problema com testes e submissões próprios          |
| Progresso       | Evidência persistida do usuário                    |
| XP              | Recompensa acumulada de práticas elegíveis         |

O grafo não é apenas uma fila linear. Um conhecimento pode fazer parte de vários caminhos; progresso compartilhado não deve exigir conclusão duplicada. Lições do currículo também podem ter pré-requisitos explícitos. A regra de acesso da lição e a disponibilidade do grafo não são a mesma coisa.

## Da rota à apresentação

`src/app/trails/page.tsx` é a entrada; `TrailsContent.tsx` coordena a experiência. `TrailMap.tsx`, `TrailPathView.tsx`, `LearningJourney.tsx` e `JourneyOverview.tsx` apresentam navegação e evolução. Confira imports e condicionais antes de assumir que toda visualização existente está ativa em todas as larguras.

`TrailCourseSelector` escolhe curso; `TrailViewSwitcher` e `useResponsiveTrailViewMode` coordenam modos. `TrailMapLessonPopover` revela tarefas. `TrailResourceBar` e `TrailsProgressSidebar` apresentam recursos/progresso. Os arquivos `trailCurriculum`, `trailCourseKnowledge`, `trailPath`, `trailDailyProgress` e preferências transformam dados em apresentação; não devem inventar conclusões ausentes da API.

## Grafo de conhecimentos

`learning/repository.ts`, em `getKnowledgeMapForUser`, consulta primeiras conclusões de exercícios, nós e caminhos publicados e progresso persistido. Agrega relações, exercícios e associação entre caminho e nó.

`learning/progress.ts` contém regras puras. `deriveKnowledgeStatus` preserva `MASTERED`, `COMPLETED` e `IN_PROGRESS`; confere requisitos antes de recomendar/disponibilizar. `calculatePathProgress` conta nós concluídos e encontra a próxima recomendação. Recomendar não conclui nem concede XP.

Modelos centrais: `KnowledgeNode`, `KnowledgeEdge`, `LearningPath`, `LearningPathNode`, `UserNodeProgress`, exercícios e submissões. Consulte campos e vínculos no [dicionário do banco](referencias/banco.md).

## Currículo e IDs

`catalog.ts` agrega o currículo; `catalog-types.ts` define `LearningCourse`, `LearningLesson` e `defineLesson`; `foundations.ts` e `specializations.ts` separam conteúdo. Lições declaram linguagem, competências, pré-requisitos e etapas. Projetos podem declarar objetivo, requisitos, estágios e condições de conclusão.

`defineLesson` gera IDs de etapas a partir da lição/índice, aplica XP por tipo ou override e estima duração. Reordenar conteúdo publicado exige conferir IDs e `legacyStepIds`: não trate uma troca de posição como mudança sem efeito sobre histórico.

## Acesso e gravação

`lesson-progress.ts` confere pré-requisitos e mantém lições concluídas revisáveis após mudança de currículo. Ao salvar, usa transação e bloqueio por usuário compartilhado com outras recompensas de aprendizagem. Correção só rende XP na primeira conclusão elegível; revisar/repetir não deve duplicar recompensa.

`QuizAttempt` também registra resultados de etapas de lições. O nome histórico não significa que todo registro seja quiz diário. IDs de etapa ligam tentativas ao catálogo. `LearningEvent` e submissões registram outras evidências: não conte o mesmo fato duas vezes em relatórios.

## Avaliação das etapas

`learning/assessment.ts` valida o contrato `lessonAnswerSchema`, limitando opções, código, lacunas, tokens, pares e comandos.

| Tipo                                     | Conferência                                |
| ---------------------------------------- | ------------------------------------------ |
| `concept_explanation`                    | Etapa explicativa                          |
| `multiple_choice`, `output_prediction`   | Índice escolhido versus resposta correta   |
| `code_completion`                        | Lacunas contra alternativas esperadas      |
| `drag_drop`                              | Sequência de tokens                        |
| `ordering`                               | Ordem dos itens                            |
| `matching`                               | Correspondência dos pares                  |
| `terminal`                               | Comando esperado                           |
| `code_editor`, `debug`, `boss_challenge` | Código e contrato de avaliação no servidor |

`run` é uma prévia, com testes públicos disponíveis. `submit` avalia o necessário para conclusão, incluindo ocultos quando definidos. Console com saída não comprova aprovação. O repositório decide o que será persistido depois da avaliação.

`exercises/evaluator.ts` monta harness, invoca a função e lê resultados identificados por marcador. `exercises/repository.ts` coordena persistência e acesso; `progression.ts` atualiza conclusão de conhecimento. Resultados ocultos precisam de serialização que preserve seu sigilo.

## XP, nível e ranking

`learning/rewards.ts` declara referências: conceito 0, recordação 10, guiado 15, código 25 e projeto 40. `defineLesson` tem defaults por tipo e aceita XP explícito; isso não implica que toda tarefa de todo catálogo pague exatamente esses valores.

O nível começa nos limiares 0, 500, 800, 1100, 1500 e 2000 XP; depois usa incrementos crescentes. Faixas Bronze/Prata/Ouro/Platina/Diamante são outra classificação. XP mede prática acumulada, não rating competitivo ajustado pela força do oponente.

## Falhas e concorrência

`learning/transaction.ts` limita espera e duração das transações. Erros de gravação viram resposta recuperável, como `PROGRESS_SAVE_UNAVAILABLE`; não devem virar confirmação visual de conclusão. Compiladores externos ficam fora da transação. Repetir salvamento precisa preservar idempotência.

Para “acertei e não avançou”, confira: resposta de `submit`, avaliação, commit, pré-requisitos e atualização da tela. Para XP incorreto, examine primeira conclusão e registros da recompensa, não apenas o contador React.

## Adicionar conteúdo

1. Identifique a competência e se já existe no grafo.
2. Escolha curso e ID estável de lição.
3. Declare requisitos reais, sem transformar recomendação opcional em bloqueio.
4. Escreva explicações e tarefas verificáveis.
5. Para código, defina função, entradas, saídas e testes públicos/ocultos.
6. Teste solução correta, incorreta, erro e indisponibilidade.
7. Confira histórico antigo e ausência de recompensa duplicada.
8. Verifique mapa, lição, progresso e telas pequenas.

## Investigações típicas

- Nó disponível e lição bloqueada: compare requisitos do grafo e da lição.
- Caminhos mostrando progresso distinto: confira IDs compartilhados e fontes de dados.
- Falha de executor tratada como erro do aluno: separe indisponibilidade e incorreção.
- Revisão pagando novamente: investigue primeira conclusão, unicidade e bloqueio.

Os testes ficam em `src/lib/learning/__tests__`, `src/lib/exercises/__tests__` e `src/app/trails/__tests__`. Veja [avaliação](avaliacao.md) e [Mundinho](mundinho.md).
