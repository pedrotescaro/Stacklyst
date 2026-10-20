# Análise de completude e evolução do Stacklyst

Revisão de 20/10/2026. Base do código: `bdbc861542626c512f5e0c2d51b2fc9cdc05d6fa`.

O sistema tem implementação conectada de autenticação, aprendizagem, progresso, publicações, recrutamento, eventos, duelos e avaliação. O principal trabalho agora é fechar inconsistências entre interface, regras e servidor, corrigir falhas de integridade e privacidade e comprovar os requisitos de qualidade. Criar mais módulos antes disso aumentaria as diferenças entre o que está documentado e o que o usuário consegue realizar.

Esta análise compara os quatro documentos fornecidos, a modelagem usada no seminário e o código atual. A matriz acompanha 49 requisitos funcionais e 25 não funcionais. Também foram consultadas as 29 regras de negócio e os casos de uso relacionados aos achados. A presença de implementação foi distinguida de homologação em execução.

Na matriz estática dos RF, 17 têm implementação presente sem lacuna identificada no recorte, 31 têm alguma parcialidade e um está classificado como legado embora continue ativo. Uma mesma falha transversal pode afetar vários RF. Essa contagem não significa 31 funcionalidades ausentes nem aprovação em execução dos outros 17.

Foram executados 35 testes locais em sete arquivos, todos aprovados, e uma simulação determinística da política de duelo. Não houve acesso a dados de produção, teste com banco real ou homologação completa do sistema. Nenhuma correção de produto foi implementada nesta etapa.

## O que está entregue no seminário

A apresentação tem 51 slides e foi exportada e revisada no PowerPoint. Inclui grupo, atividades do negócio atualizadas, diagrama geral original de casos de uso, protótipos, RF/RNF/regras, classes e banco gerais e específicos, MER, DER, quatro sequências completas e nove recortes com código. As notas organizam a demonstração dos três integrantes e o planejamento de 55 minutos.

O diagrama geral da fonte tem 18 elipses. As 56 especificações escritas representam outra contagem. O DER cobre nominalmente os 47 modelos persistidos e 74 relações do plano. Esses números não medem funcionalidades concluídas.

As atividades removidas do documento 02 foram retiradas do seminário de atividades. Isso não determina a exclusão dessas funcionalidades do produto. Duelo, avaliador e comunidades precisam ser avaliados conforme o escopo do sistema.

## Correções prioritárias

P1 significa corrigir antes de considerar o fluxo pronto para uso real ou apresentar seu comportamento como garantido. P2 indica a próxima entrega funcional. P3 identifica evolução de produto ou decisão de escopo. A ordem abaixo considera impacto e dependências, sem estimativas de dias sem planejamento da equipe.

### 1. Restringir os dados retornados no recrutamento

**P1. RF048, RNF005, RNF006, RN021 e RN027.**

`updateApplicationStage` usa `user: true` e o PATCH devolve esse objeto integralmente. Um recrutador autorizado à vaga recebe campos do registro completo do candidato, além da projeção pública prevista. A autorização da empresa já existe e deve ser preservada.

Evidências: `src/services/job.service.ts:318` e `src/app/api/jobs/[id]/route.ts:56`. A listagem já possui seleção limitada de perfil em `src/services/job.service.ts:96`.

**Entrega esperada:** um contrato explícito de campos permitidos, compartilhado pelas respostas de consulta e alteração. Aceitar quando um teste de resposta comprovar ausência de e-mail, data de nascimento, dados de sessão e demais campos privados de sentinela. Não é necessário consultar dados privados reais para testar isso.

### 2. Concluir confirmação e reenvio de e-mail

**P1. RF001 e RF002.**

A API de confirmação exige código ou `token_hash`. Os fallbacks de login e cadastro enviam apenas o e-mail. Para contas que dependem de confirmação, a resposta é 400 e o percurso da interface não resolve o problema. A API declara a ação `resend`, mas não implementa um ramo real de reenvio.

Evidências: `src/app/api/auth/confirm-email/route.ts:19`, `src/app/login/page.tsx:155` e `src/app/register/page.tsx:193`.

**Entrega esperada:** confirmação por link/código válido, reenvio e mensagens de expiração/erro na interface. Preservar a exigência de verificação do token. Aceitar com testes de conta confirmada, pendente, link expirado e reenvio. O login de contas já confirmadas tem implementação presente.

### 3. Impedir vitória e XP por indisponibilidade do juiz

**P1. RF019–RF021, RN024, RN028 e RNF015.**

No encerramento por prazo, a escolha da melhor submissão aceita também `JUDGE_UNAVAILABLE`. A simulação da política atual mostrou que, se esse for o único envio de um participante, ele pode ser declarado vencedor com zero pontos. O fluxo de persistência concede 50 XP ao vencedor.

Evidências: `src/lib/duels/resolution-policy.ts:46`, `src/lib/duels/resolution-policy.ts:67`, `src/lib/duels/resolution.ts:39` e `src/lib/duels/resolution.ts:116`. A reprodução local está em `evidencia-politica-duelo.json`.

**Entrega esperada:** indisponibilidade de infraestrutura não ser um envio competitivo elegível. Definir reexecução/adiamento ou fechamento sem vencedor conforme a regra escolhida. Testar um envio indisponível, dois indisponíveis, falha contra envio válido e fechamento concorrente, sem recompensa indevida.

### 4. Uniformizar falhas do executor nos fluxos de aprendizagem

**P1. RF008, RF009, RN024, RNF009, RNF012, RNF014 e RNF023.**

Há dois problemas diferentes. O timeout da requisição HTTP ao provedor retorna falha comum, sem a marca de indisponibilidade, e pode ser tratado como erro do código do aluno. Além disso, o envio do workspace chama a persistência mesmo quando a avaliação informa `unavailable`, gravando erro e alterando o progresso. O fluxo de lição já tem uma guarda para preservar o progresso nesse caso.

Evidências: `src/lib/code-execution/server.ts:130`, `src/lib/code-execution/server.ts:193`, `src/app/api/exercises/[exerciseId]/submit/route.ts:36`, `src/lib/exercises/repository.ts:246` e `src/app/api/lessons/[lessonId]/attempt/route.ts:26`.

**Entrega esperada:** distinguir erro do programa, timeout do programa e falha de transporte/provedor em um contrato comum. Uma indisponibilidade deve permitir nova tentativa e preservar os dados de aprendizagem. Adicionar testes dos dois fluxos, incluindo `AbortError`, resposta inválida e falha de gravação. Os testes já existentes para indisponibilidade da lição passaram; a lacuna está nos cenários e fluxos não cobertos.

### 5. Corrigir a exclusão de publicações denunciadas

**P1. RF033, RF043 e UC020.**

O serviço apaga a publicação e depois apaga a denúncia. A relação do banco já remove a denúncia por cascata, portanto a segunda exclusão pode gerar erro depois de o conteúdo ter sido removido. A conclusão decorre do código e do contrato do schema, sem execução contra banco nesta revisão.

Evidências: `src/services/admin.service.ts:226` e `prisma/schema.prisma:1010`.

**Entrega esperada:** operação vinculada, idempotente e com resposta consistente. Testar a remoção com uma ou várias denúncias, repetição da solicitação e falha intermediária, confirmando o estado final correto.

## Funcionalidades que precisam ser concluídas ou alinhadas

| Área | O que está incompleto | Próxima entrega e aceitação | Evidência principal |
|---|---|---|---|
| Recrutamento, RF048 | API aceita etapa, feedback e nota, mas a interface altera só a situação. O candidato não lê o feedback pela tela. | Selecionar etapa da mesma vaga, registrar retorno, reconsultar no candidato e validar limites da nota. | `src/app/recruiter/RecruiterContent.tsx:186`, `src/app/api/jobs/[id]/route.ts:10` |
| Notificações, RF044/RF045/RF048 | O aviso da candidatura é persistido, mas o normalizador não apresenta a vaga nem um destino útil. | Tratar `JOB_APPLICATION_UPDATE`/`JOB`, com título, situação e link autorizado. Testar aviso e falha de notificação sem desfazer a atualização. | `src/services/notification.service.ts:56` |
| Candidatura, RF047 | Vaga fechada, inexistente e candidatura duplicada lançam erro comum e podem produzir 500. A unicidade no banco evita duplicação, mas o conflito não é tratado. | Erros de domínio claros e tratamento de conflito/repetição. Testar inscrição sequencial e concorrente em banco de testes. | `src/services/job.service.ts:263`, `src/lib/api-handler.ts:60` |
| Vaga e empresa, RF034/RF035/RF047 | A API pode receber etapas vazias. Criar empresa e promover o responsável são operações separadas. | Garantir etapa inicial, validação do payload e atomicidade empresa/papel. | `src/app/api/jobs/route.ts:28`, `src/services/job.service.ts:355` |
| Acesso ao workspace, RF007/RN029 | O conteúdo pode ser montado antes da verificação de pré-requisitos feita no envio. | Aplicar o mesmo gate antes de entregar conteúdo protegido. Testar acesso direto à URL e envio. | `src/app/lesson/[lessonId]/page.tsx:93` |
| Ranking e faixas, RF014/RF015 | A regra descreve cinco faixas por XP. A interface usa seis divisões com desbloqueios fixos, divisão inicial Ouro e contagem de dias constante. | Usar a mesma política de XP em interface e servidor ou especificar ligas reais como nova funcionalidade. | `src/app/leaderboard/LeaderboardClient.tsx:65`, `:411`, `:534` |
| Histórico, RF010 | Há agregados semanais e contagens. Falta um histórico navegável de tentativas e resultados como o requisito descreve. | Listagem paginada por atividade, data e resultado, com política de privacidade explícita. | Matriz RF010 em `matriz-rf.json` |
| Conversas, UC038 | O histórico web busca as 100 mensagens mais antigas. A lista de conversas deriva apenas das últimas 200 mensagens globais. | Buscar primeiro mensagens recentes, paginar por cursor e listar a última mensagem por interlocutor. Testar conversa com mais de 100 mensagens e contatos antigos. | `src/app/api/messages/route.ts:130`, `src/app/api/messages/chats/route.ts:13` |
| Mensagens, UC039 | O servidor web permite conteúdo vazio e não compartilha a validação mais estrita do endpoint mobile. | Contrato comum exigindo texto ou imagem válida, limites e tratamento de repetição. | `src/app/api/messages/route.ts:60`, `src/app/api/mobile/messages/route.ts:10` |
| Eventos, RF041/RF049/RN023 | Inscrição confere a data de encerramento, mas cancelamento confere só o status. Exibição e desafios também calculam a situação de formas diferentes. | Política única de encerramento por data/status, verificando antes se existe manutenção externa. Testar as fronteiras de início/fim. | `src/services/event.service.ts:193`, `:234`, `src/services/event-challenge.service.ts:16` |
| Administração | O indicador de pareceres pendentes conta duelos `ACTIVE`, enquanto a fila real usa `REVIEW_PENDING`. Não há proteção para remover o último administrador. | Corrigir a métrica e definir a regra transacional do último ADMIN, com auditoria do ator. | `src/services/admin.service.ts:52`, `:144` |
| Perfil e notificações | Há validações parciais do perfil, divergência de projeção da data de nascimento entre página/API, leitura de notificações principalmente em lote e listagens sem consumir paginação. | Padronizar schemas, projeção pública e contratos de leitura/paginação. | Matriz RF004, RF037, RF045 e RF046 em `matriz-rf.json` |

Os itens da tabela são predominantemente P2. A proteção do último administrador e a auditoria das alterações de papel, RF039/RF042, e a projeção de dados privados no perfil, RF037, mantêm a prioridade P1 registrada na matriz.

## Requisitos de qualidade que ainda precisam de evidência

O código contém mecanismos de autenticação, autorização, execução limitada, transações e paginação. As metas quantitativas do documento exigem validações próprias.

| Requisitos | Evidência que falta ou precisa evoluir |
|---|---|
| RNF007 e RNF016 | Teste com 20 usuários simultâneos e massa de 10.000 registros, medindo P95 de até 2 segundos fora da execução de código. |
| RNF008 | LCP de até 2,5 segundos em desktop e 4 segundos em móvel com 4G simulada. |
| RNF010/RNF018 | Fluxos aprovados em 360×800, 768×1024 e 1440×900, preservando ações essenciais. |
| RNF011 | Accessibility >=90 e roteiro manual de teclado, foco e nomes acessíveis. |
| RNF013 | Histórico que comprove 99,5% de disponibilidade mensal. O healthcheck atual retorna 200 fixo e não fornece esse histórico. |
| RNF014/RNF015 | Concorrência e rollback com banco de testes, além dos testes unitários com mocks. |
| RNF017 | Matriz real de Chrome, Edge, Firefox e Safari nas versões previstas. |
| RNF020 | CI já declara lint, typecheck e testes. Falta configurar e cobrar a cobertura mínima de 70% dos módulos críticos. |
| RNF024/RNF025 | Auditoria com ator, ação, alvo, instante e resultado, além de retenção de 90 dias e acesso controlado. Os logs atuais são console JSON e nem todas as ações incluem o ator. Configuração de retenção do provedor não foi consultada. |

A classificação completa, os critérios de aceitação originais e as evidências estão em `matriz-rnf.json`. Não se deve marcar um RNF como cumprido só porque o projeto compila ou porque existe uma função correspondente.

## Decisões de produto e documentação

1. **Convites de duelo:** RF018 os chama de legado fora do fluxo vigente, mas o perfil, a arena e as APIs continuam usando convites. Decidir seu papel e versionar o requisito. Não desativá-los apenas porque saíram do diagrama de atividades do seminário.
2. **Pareamento por prazo:** a manutenção pode selecionar um usuário recente como oponente de uma vaga vencida, apesar da entrada voluntária e expiração descritas em UC008/UC009. Alinhar a política antes de avaliar abandono ou aplicar consequências.
3. **Comunidades:** o menu está oculto, mas páginas e APIs existem. Para publicar a ampliação, faltam descoberta e gestão completa. Para mantê-la desativada, o bloqueio deve abranger todas as superfícies. UC042–UC045 já tratam essa área como ampliação; não é correto considerar tudo ausente.
4. **Eventos competitivos:** inscrição e desafios editoriais existem. Submissão competitiva, classificação final e prêmio de XP são uma evolução separada. O campo de recompensa no banco e sua exibição não significam que a premiação esteja implementada.
5. **Moderação:** política de sanções, recursos e gestão editorial integral é uma entrega de produto a especificar. Corrigir a exclusão de denúncias vem antes de expandir esses recursos.
6. **Documentação:** normalizar os rótulos históricos UC057–UC059, as referências antigas de atividades e os estados de implementação. Mensagens/comunidades têm UC adicionais sem RF numerado equivalente; incluir essa rastreabilidade na próxima revisão escrita.

## Ordem recomendada de execução

**Entrega 1: integridade, privacidade e acesso.** Corrigir os cinco grupos P1 descritos em detalhe, a projeção pública do perfil e a proteção/auditoria das alterações de papel. Criar os testes de regressão dos respectivos cenários. Restringir os dados do recrutamento é uma correção pequena e de alto impacto. Confirmar o fluxo de e-mail em ambiente de testes com a configuração real de autenticação.

**Entrega 2: percurso completo de aprendizagem e seleção.** Concluir etapa/feedback e a notificação útil, tratar conflitos da candidatura, garantir a etapa inicial e uniformizar os gates e falhas do aprendizado. Validar o percurso inteiro em interface e banco de testes, usando as sequências do seminário como roteiro de aceitação.

**Entrega 3: coerência dos módulos existentes.** Corrigir paginação do chat, política temporal dos eventos, faixas/ranking, histórico e indicadores administrativos. Resolver as decisões sobre convites, manutenção e comunidades com os requisitos atualizados.

**Entrega 4: operação e qualidade mensuráveis.** Cobertura de testes dos módulos críticos, carga, acessibilidade, navegadores, auditoria e monitoramento. Essas atividades podem avançar em paralelo às correções, mas precisam produzir evidência reproduzível.

## Arquivos de apoio

- `matriz-rf.json`: situação documentada e situação encontrada nos 49 RF.
- `matriz-rnf.json`: 25 RNF, critérios originais e validações seguintes.
- `lacunas-fluxos.json` e `LACUNAS-FLUXOS.md`: recrutamento e aprendizagem, com esforço relativo e critérios de aceitação.
- `lacunas-dominios.json`: social, mensagens, eventos, duelos, avaliação, administração e comunidades.
- `testes-fluxos.json`: relatório dos 35 testes locais aprovados.
- `evidencia-politica-duelo.json` e `verify-duel-policy.mjs`: resultado e reprodução da política pura, sem rede ou banco.

O próximo trabalho de implementação deve usar esses critérios de aceitação e registrar separadamente o que foi corrigido, o que passou em testes locais e o que foi homologado com interface, banco e integrações reais.
