# Auditoria funcional do Stacklyst — 8 de novembro de 2026

Base analisada: `3179aa28ed43be5771ba428a42c206aa4ec95179`, com as correções de badge e consulta de feed descritas abaixo. Site consultado: https://stacklyst.vercel.app.

## Resultado e abrangência

Foram executados testes de componentes, APIs e regras de domínio; testes com PostgreSQL descartável; consultas somente de leitura ao banco configurado; requisições HTTP ao site publicado; executores reais de código; e inspeção visual do PDF afetado.

| Verificação                                                                       | Resultado final                                                  |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Suíte principal                                                                   | 1552 aprovados; 0 falhas; 53 testes opcionais separados          |
| Integrações opcionais em PostgreSQL isolado                                       | 52 aprovados, em 19 arquivos                                     |
| Coleção editorial publicada, somente leitura                                      | 1 aprovado                                                       |
| Testes adicionais que reproduzem problemas de denúncia, duelo e expiração de vaga | 5 reproduções confirmadas                                        |
| Filtros de feed, caracteres especiais, paginação e contagem no PostgreSQL         | 1 aprovado, com rollback                                         |
| Certificado afetado e renderização sem fontes do sistema                          | 1 aprovado; PDF renderizado e inspecionado                       |
| Executores reais                                                                  | JavaScript, TypeScript, Python, Rust, Go e Java aprovados        |
| TypeScript e build de produção                                                    | Aprovados, incluindo smoke do juiz e dos certificados compilados |
| Lint global                                                                       | Sem erros; 411 avisos na execução inicial                        |
| Arte de personagens do Mundinho                                                   | Verificação aprovada                                             |

Os 53 testes opcionais da suíte principal foram exercitados separadamente: 52 no ambiente isolado e 1 por leitura da coleção já publicada. Os testes de reprodução de problemas confirmam o comportamento defeituoso atual; sua aprovação não significa que esses problemas foram corrigidos.

### Cobertura por área

| Área                              | O que foi verificado                                                                                                                                       | Limite da evidência                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Vagas e recrutamento              | Listagem pública, filtros, detalhes, candidatura e painel em testes de componentes; isolamento de empresas, etapas, feedback e notificações com PostgreSQL | Nenhuma candidatura foi enviada a uma empresa real durante a auditoria                                                  |
| Denúncias e administração         | Proteção de acesso, exclusão de publicação denunciada, cascatas, registro de auditoria e preservação do último administrador                               | A criação de denúncias problemáticas foi reproduzida com dependências simuladas; não houve denúncia real contra usuário |
| Lições e exercícios               | Catálogo, soluções de referência JS/TS no sandbox, execução em seis linguagens, gravação de progresso, concorrência e idempotência de XP                   | Programa simples e lições de smoke não cobrem todo código possível enviado por usuários                                 |
| Duelos e avaliações               | Matchmaking, julgamento, critérios de empate, atomicidade, fila de avaliadores e notificações; execução dos módulos compilados                             | Não foi realizada uma partida entre duas sessões reais do site publicado                                                |
| Eventos                           | Listagem e contratos das rotas; consulta real aos desafios do evento existente                                                                             | A rota de desafios retorna 500 em produção, conforme achado A01                                                         |
| Feed, perfis, chat e notificações | Testes de componentes, paginação, busca, privacidade, bloqueio bidirecional, favoritos, mensagens e persistência em PostgreSQL                             | Sessão autenticada no navegador não foi percorrida visualmente                                                          |
| Certificados e badges             | Integridade do registro, emissão idempotente, revogação, arte por linguagem, links e QR do PDF; correção e comparação visual do caso informado             | A aparência corrigida precisa ser servida pelo deployment que contém a alteração                                        |
| Mundinho e arena                  | Regras, inventário, desafios, partida com estado autoritativo no PostgreSQL e verificação dos sprites                                                      | Não equivale a validação em todos os aparelhos físicos                                                                  |

## Problemas confirmados que permanecem abertos

### A01 — Desafios de eventos retornam erro 500

**Prioridade: alta. Evidência: HTTP real e consulta ao banco.**

`GET /api/events/[evento existente]/challenges` respondeu `500 INTERNAL_ERROR`. A comparação dos 61 modelos Prisma com o banco configurado encontrou a ausência da tabela `EventChallenge`; nenhuma coluna esperada dos demais modelos ou valor esperado dos enums estava ausente. O histórico consultado não registra como aplicada a migration `20260914233000_add_event_challenges`.

O serviço consulta diretamente essa tabela tanto para listar quanto para substituir desafios. A listagem geral de eventos responde 200, portanto ela não comprova que o detalhe de desafios funciona.

Fontes: [serviço](../../src/services/event-challenge.service.ts#L43), [rota](../../src/app/api/events/[id]/challenges/route.ts#L7), [migration existente](../../prisma/migrations/20260914233000_add_event_challenges/migration.sql#L2).

**Ação recomendada:** reconciliar o histórico e o esquema do ambiente que atende o site usando a migration existente, e testar leitura e edição de desafios com um evento de teste. Nenhuma migration foi aplicada ao banco remoto nesta auditoria.

### A02 — Etapas técnicas das vagas não conduzem à atividade

**Prioridade: alta para o fluxo de recrutamento técnico. Classificação: lacuna funcional.**

O modelo aceita `challenge_id`, mas os pontos encontrados no código apenas recebem e armazenam esse valor. O candidato recebe orientação para consultar o feedback da empresa; a tela não oferece uma ação associada para iniciar/submeter o desafio da candidatura nem vincula o duelo à etapa. Na vaga existente consultada, as etapas técnicas também não possuem `challenge_id`.

A candidatura, a mudança de etapa e o feedback funcionaram nos testes. O fluxo técnico completo, do convite à atividade até o retorno do resultado à candidatura, não está implementado nesses caminhos.

Fontes: [persistência da etapa](../../src/services/job.service.ts#L238), [orientações ao candidato](../../src/app/jobs/[id]/JobDetailContent.tsx#L61), [modelo](../../prisma/schema.prisma#L478).

**Ação recomendada:** definir a atividade de cada etapa, validar o vínculo e disponibilizar a ação ao candidato; registrar o resultado no processo seletivo com os controles de acesso correspondentes.

### A03 — Limite de execução dos duelos vira falha genérica

**Prioridade: média. Evidência: reprodução das rotas com o limitador excedido.**

Na submissão, `RateLimitError` é capturado pelo `catch` genérico e se transforma em resposta 500. Na execução de teste, o erro sai da função sem uma resposta HTTP tratada. O usuário deveria receber 429 e uma orientação de espera, não uma mensagem genérica de falha do servidor.

Fontes: [submissão](../../src/app/api/duels/[id]/solution/route.ts#L113), [execução](../../src/app/api/duels/[id]/run/route.ts#L23).

**Ação recomendada:** padronizar o tratamento de erros dessas rotas e preservar status 429 e informações de nova tentativa. Não foi necessário exceder a quota de uma conta real para reproduzir o problema.

### A04 — Denúncias têm falhas de validação e concorrência

**Prioridade: média. Evidência: duas reproduções controladas.**

Enviar um motivo que não é string, como `{ "reason": 123 }`, chega a `reason.trim()` e retorna 500 em vez de 400. O caminho `findFirst` seguido de `create` também pode colidir com a restrição única quando duas requisições da mesma denúncia ocorrem juntas; a violação `P2002` é convertida em 500.

Fontes: [validação](../../src/app/api/posts/[id]/report/route.ts#L17), [consulta e criação](../../src/app/api/posts/[id]/report/route.ts#L31), [restrição única](../../prisma/schema.prisma#L1223).

**Ação recomendada:** validar tipo e tamanho do motivo e usar uma operação idempotente sobre a chave única existente.

### A05 — Falta encerrar uma denúncia mantendo a publicação

**Prioridade: média. Classificação: lacuna funcional de moderação.**

O painel oferece visualizar e excluir a publicação. A API administrativa oferece GET e DELETE associado à exclusão do post. Não existe ação para concluir uma análise improcedente preservando a publicação, com motivo e registro da decisão.

Fontes: [API administrativa](../../src/app/api/admin/reports/route.ts#L18), [painel](../../src/app/admin/AdminContent.tsx#L813), [ação disponível no serviço](../../src/services/admin.service.ts#L252).

**Ação recomendada:** acrescentar resolução da denúncia, separada da exclusão do conteúdo, e registrar a decisão de moderação.

### A06 — Filtros inválidos de vagas retornam 500 em produção

**Prioridade: média. Evidência: requisições HTTP reais.**

`/api/jobs?level=INVALID` e `/api/jobs?status=INVALID` retornaram 500. Os parâmetros são convertidos por cast TypeScript, que não faz validação em runtime. A rota válida `/api/jobs` respondeu 200.

Fonte: [parâmetros da listagem](../../src/app/api/jobs/route.ts#L45).

**Ação recomendada:** validar enums antes da consulta e responder 400 para valores desconhecidos. O problema é de entrada da API; não foi demonstrado que as opções válidas da interface falhem.

### A07 — Uma vaga vencida ainda aceita candidatura se o status permanecer OPEN

**Prioridade: média. Evidência: reprodução controlada; não há vaga vencida OPEN nos dados consultados.**

O serviço verificou apenas `status === 'OPEN'` e aceitou uma candidatura sintética para uma vaga cujo `expires_at` estava no passado. A existência do campo de vencimento não é respeitada nesse caminho.

Fontes: [aceitação de candidatura](../../src/services/job.service.ts#L278), [campo de expiração](../../prisma/schema.prisma#L469).

**Ação recomendada:** aplicar a mesma regra de vencimento na listagem, no detalhe e na gravação da candidatura.

### A08 — O CI não é disparado por push direto na main

**Prioridade: média, operacional. Evidência: configuração do repositório.**

O workflow de CI está configurado apenas para `pull_request` com destino à main. Um push direto, como o usado na publicação anterior, dispara o deployment da Vercel, mas não essa suíte de testes do GitHub Actions.

Fonte: [workflow](../../.github/workflows/ci.yml#L3).

**Ação recomendada:** executar o CI também em `push` para a main ou exigir o fluxo de pull request com as verificações aplicáveis.

## Correções realizadas nesta sessão

### Badge no certificado

O certificado público indicado pelo usuário foi conferido: linguagem Python, tipo `practice`, legenda correta **PRÁTICA CONCLUÍDA**. O PDF remoto reproduzia a fita com quadradinhos.

A arte compartilhada usava `<text>` dentro do SVG que o servidor rasteriza. A correção substitui somente essa legenda por contornos vetoriais derivados de `Sora-Bold.ttf`, já incluída no projeto. Mantém o logo original da linguagem, cores, composição, acessibilidade pelo título da SVG e os dados imutáveis da credencial.

Foi acrescentado um gerador reproduzível, com validação de glifos, largura e modo `--check`. As seis legendas foram testadas. O mesmo certificado foi regenerado, seu hash de integridade foi validado e o PDF foi renderizado com Poppler. A badge também produziu PNGs idênticos em processos com fontes normais e com configuração Fontconfig vazia.

Arquivos: [renderizador](../../src/lib/credentials/badge-art.ts#L140), [contornos gerados](../../src/lib/credentials/badge-lettering.ts#L1), [gerador](../../scripts/build-credential-badge-lettering.mjs#L1).

### Consulta vazia nos testes de busca

A alteração anterior de feeds acrescentava `{}` ao array `AND` mesmo sem haver uma definição de feed. Isso quebrou duas expectativas estruturais em `post-search.test.ts`, mas não demonstrava perda dos filtros de busca ou privacidade. O serviço agora acrescenta condições de preferências apenas quando existe um feed selecionado. As expectativas originais são preservadas, sem enfraquecer os testes.

Fonte: [consulta](../../src/services/post.service.ts#L271).

## Ambiente, limitações e evidências

- O Docker/PostgreSQL de teste foi dedicado a esta auditoria, limitado ao localhost. As gravações e exclusões de teste ficaram nesse ambiente; as consultas ao banco configurado do projeto foram somente de leitura.
- O controle do Chrome foi encerrado pela ferramenta porque ela não conseguiu confirmar a URL atual no Windows. A auditoria não inclui uma navegação visual autenticada de ponta a ponta em produção. Requisições HTTP sem sessão confirmaram 401 nas APIs administrativas e 307 para login nas páginas privadas consultadas.
- A primeira execução geral teve 5 falhas: duas expectativas de busca e três timeouts. Os dois testes de PDF passaram isoladamente; o exemplo Python passou fora do sandbox. O ajuste de consulta e a execução final estão contabilizados acima.
- Os testes funcionais passaram em seus ambientes, mas os achados A01–A08 permanecem abertos conforme a evidência individual. Em particular, tabelas presentes no banco descartável não comprovam que a migration foi aplicada ao site publicado.
- Logs e JSONs de diagnóstico ficam em `.tmp/site-audit-*`. Eles incluem as execuções principal e de integração, respostas HTTP resumidas, inventário de esquema, executores e renderização do certificado. Credenciais de conexão e dados privados de candidatos não são reproduzidos neste relatório.

Ordem sugerida de trabalho: restaurar desafios de eventos; completar o vínculo das etapas técnicas; corrigir as respostas de quota e denúncias; adicionar resolução improcedente; tratar filtros e expiração de vagas; ajustar o disparo do CI.
