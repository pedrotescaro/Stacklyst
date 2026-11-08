# Uso da documentação no seminário

## O que foi aproveitado do material fornecido

A lousa e a transcrição organizam a apresentação em duas escalas: visão geral uma vez e explicação específica por participante. Cada recorte deve ligar interface, requisitos, regras, modelagem, sequência, código e demonstração. A entrega escrita deve cobrir também funções que não caibam na exposição oral.

A entrega anterior identifica Pedro Antonio Silvestre Tescaro, Guilherme Alves de Campos e Paulo Henrique Leal dos Santos, nessa ordem proposta para aprendizagem, publicação de vaga e candidatura. Esta revisão conserva essa continuidade, com referência à entrega de 20/10/2026; não presume uma nova distribuição comunicada pelo grupo.

## Ordem lógica sugerida

| Bloco                       | Objetivo                                           | Material e preparação                                        |
| --------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| Abertura                    | Explicar problema, atores e jornada                | Visão do sistema, atividade do negócio e panorama de casos   |
| Identidade e arquitetura    | Explicar como tela chama servidor e quem pode agir | Guia de programação, classes de responsabilidade e DER geral |
| Aprendizagem                | Demonstrar o núcleo da proposta                    | Curso, lição, etapa, `run`, `submit`, progresso e XP         |
| Reconhecimento e comunidade | Mostrar como evidência e identidade aparecem       | Perfil, título, credencial, post e notificação               |
| Competição                  | Diferenciar juiz de duelo e combate RPG            | Duelo ou Mundinho/PvP com dois participantes preparados      |
| Oportunidades               | Consumir perfis e progresso em outro contexto      | Empresa, vaga, candidatura e funil; evento se houver tempo   |
| Fechamento                  | Mostrar limites e decisões de engenharia           | Atomicidade, proteção de dados e evidências de testes        |

Os blocos podem ser repartidos entre integrantes. A sequência evita demonstrar uma candidatura antes de existir vaga, ou revisão humana antes de existir avaliador e duelo elegível.

## Roteiro de cada funcionalidade

1. Abra a tela e explique quem a utiliza e para quê.
2. Aponte os requisitos funcionais, as propriedades de qualidade e as regras relevantes pelos IDs deste manual.
3. Mostre as responsabilidades de código e as tabelas daquele recorte.
4. Percorra a sequência completa sem mergulhar em todas as linhas.
5. Escolha dois ou três trechos reais e explique entrada, validação, autorização, decisão e efeito.
6. Execute a ação demonstrada e confira o resultado persistido visível.
7. Mostre uma alternativa importante: repetição, bloqueio, resposta incorreta ou falta de requisito.

Não apresente somente um arquivo de serviço sem explicar a interface e o objetivo. Também não apresente somente botões sem explicar como o servidor confirma a regra.

## Diagramas gerais e específicos

O [modelo de responsabilidades](modelagem.md) não pretende fingir que todos os serviços são classes JavaScript: vários são objetos literais e funções. Explique essa correspondência ao apresentar uma visão de classes conceitual.

O DER deriva do schema e contém relações com chaves. MER é o modelo de entidades e relacionamentos; DER é uma representação diagramática. A presença de FK depende do nível conceitual/lógico/físico escolhido, e não é por si uma definição universal que separa as siglas. Para atender à organização da disciplina, use a visão de banco com PK/FK e explique seus vínculos, evitando duplicar slides sem informação nova.

## Recortes de sequência e código

| Demonstração      | Trechos especialmente úteis                                      |
| ----------------- | ---------------------------------------------------------------- |
| Lição             | Rota de tentativa, `assessLessonStep`, `saveLessonAssessment`    |
| Exercício         | Avaliador, execução e `recordExerciseSubmission`                 |
| Baú               | `dayKey`, `credit`, ramo da ação `chest`                         |
| PvP               | `chooseArenaAttack`, `advanceArenaTurn`, conferências em `arena` |
| Duelo             | Política `decideDuelResolution` e persistência de resultado      |
| Vaga              | `applyForJob`, `requireCompanyAccess`, `updateApplicationStage`  |
| Evento            | `participate` e lock de capacidade                               |
| Perfil/credencial | Conciliação de conquista versus emissão de credencial            |

Os [recortes gerados](codigo-comentado.md) conservam origem e linhas; o arquivo completo deve estar disponível para responder perguntas.

## Dados preparados

Prepare contas de demonstração e papéis adequados. Use atividades e objetos controlados: lição com resposta conhecida, outro usuário para interação, vaga aberta, evento em datas válidas e adversário disponível. Se uma informação não será explicada, pode estar previamente criada, mas diga que é dado preparado.

Não prometa que um compilador externo estará disponível sem plano alternativo. Uma evidência gravada pode apoiar a explicação, desde que seja identificada como evidência de outra execução e não apresentada como resultado ao vivo.

## Tempo e divisão

O material fornecido menciona até uma hora. Esse é o contexto informado, não uma regra técnica do produto. Distribua o tempo por complexidade e dependência; reserve espaço para mudança de conta, carregamento e perguntas. Evite um integrante consumir a abertura inteira e outro mostrar apenas uma tela.

Todos precisam conseguir explicar a teoria e o código de seu recorte, inclusive quem trabalhou principalmente na documentação. O objetivo do encadeamento é permitir essa compreensão sem decorar o projeto inteiro linha por linha.

## Checklist de entrega

- Casos de uso escritos cobrem todos os módulos, não só os escolhidos para os slides.
- Diagramas gerais e vistas específicas estão coerentes com a mesma base.
- Regras citadas têm fonte e não confundem desejo futuro com implementação.
- Sequências terminam na confirmação/erro, não apenas na chamada à API.
- Dados de demonstração não envolvem membros reais sem autorização.
- Credenciais e capturas não expõem segredos ou dados privados.
- Relatórios antigos conservam sua data; esta edição não os declara atualizados automaticamente.
- O ensaio permite executar início, resultado e pelo menos uma alternativa importante.

As entregas históricas de Word, PDF, slides e Astah permanecem no [diretório da disciplina](../../laboratorio-engenharia-software/README.md). Esta edição é a documentação Markdown atualizada que pode orientar uma revisão futura desses artefatos.
