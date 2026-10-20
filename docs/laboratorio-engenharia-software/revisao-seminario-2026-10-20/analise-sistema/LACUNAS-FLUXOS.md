# Lacunas de recrutamento e aprendizagem

Base `bdbc861542626c512f5e0c2d51b2fc9cdc05d6fa`. Auditoria de código e requisitos, sem alteração do produto ou dados em produção.

Foram identificadas nove lacunas: três P1 e seis P2. A confirmação é estática, com os limites de reprodução indicados em cada registro. As sete suítes locais existentes passaram: **35/35 testes**. Esse resultado não cobre os cenários ausentes descritos abaixo.

| ID | Prioridade | Lacuna | Requisitos | Esforço | Evidência principal |
|---|---|---|---|---|---|
| FL01 | P1 | Atualizar candidatura devolve o registro privado completo do candidato | RF048, RNF005, RNF006, RN021, RN027 | Pequeno | `src/services/job.service.ts:318` |
| FL02 | P2 | API atualiza etapa e feedback, mas a interface só permite mudar situação | RF048, RN026 | Médio | `src/app/recruiter/RecruiterContent.tsx:186` |
| FL03 | P2 | Notificação é registrada, mas apresentada sem identificação da vaga e sem link | RF044, RF048, RN022, RN026 | Pequeno a médio | `src/services/job.service.ts:324` |
| FL04 | P2 | Rejeições esperadas de candidatura viram erro interno genérico | RF047, RN026 | Pequeno | `src/services/job.service.ts:263` |
| FL05 | P2 | API permite publicar vaga sem etapa e candidatar com etapa inicial nula | RF035, RF047, RN026 | Pequeno a médio | `src/app/api/jobs/route.ts:28` |
| FL06 | P2 | Criar empresa e promover responsável são operações separadas | RF034, RN020, RNF012 | Pequeno a médio | `src/services/job.service.ts:355` |
| FL07 | P1 | Indisponibilidade do executor ainda grava submissão e altera progresso no workspace | RF008, RF009, RNF012, RNF014 | Pequeno a médio | `src/lib/exercises/evaluator.ts:161` |
| FL08 | P1 | Timeout da requisição HTTP ao provedor é classificado como erro do código do aluno | RF008, RNF009, RNF012 | Médio | `src/lib/code-execution/server.ts:130` |
| FL09 | P2 | Workspace exibe conteúdo antes de verificar pré-requisitos | RF007, RN029 | Pequeno a médio | `src/app/lesson/[lessonId]/page.tsx:93` |

## FL01: Atualizar candidatura devolve o registro privado completo do candidato

Um recrutador autorizado a alterar uma candidatura recebe campos privados do candidato que não deveriam integrar o perfil público. A autorização da empresa está presente, mas não substitui a seleção de campos.

Estado de confirmação: Confirmado pelo contrato retornado no código; nenhuma informação privada real foi consultada.

Evidências:

- `src/services/job.service.ts:318`: O include de updateApplicationStage usa user:true, sem seleção de campos públicos.
- `src/app/api/jobs/[id]/route.ts:56`: O objeto atualizado é serializado integralmente como application na resposta PATCH.
- `prisma/schema.prisma:187`: O usuário possui email, birthday, discord_username e outros campos privados ou não necessários à gestão da candidatura.
- `src/services/job.service.ts:96`: A consulta de candidaturas já tem select de perfil público que pode servir de contrato comum.

Aceitação da correção:

- Usar DTO/select público explícito no PATCH e na consulta de candidaturas.
- Teste de contrato com email, birthday e demais campos privados de sentinela deve provar que nenhum aparece na resposta do recrutador.
- Preservar as verificações de papel, empresa e vínculo da candidatura.

Cobertura atual: job.service.test.ts cobre apenas listJobs e getJobApplications. Não há teste do payload de updateApplicationStage ou da resposta PATCH.

## FL02: API atualiza etapa e feedback, mas a interface só permite mudar situação

O caso UC026/RF048 só está completo na API. O responsável não consegue operar o avanço de etapa ou dar um retorno escrito pela tela; o candidato tampouco lê o feedback salvo por outro cliente.

Estado de confirmação: Confirmado pela renderização e pelo payload atual da interface.

Evidências:

- `src/app/recruiter/RecruiterContent.tsx:186`: O handler envia apenas application_id e status.
- `src/app/recruiter/RecruiterContent.tsx:688`: O controle disponível é o seletor de situação. Não há editor de etapa, feedback ou nota técnica.
- `src/app/api/jobs/[id]/route.ts:10`: A API aceita stage_id, feedback e technical_score.
- `src/app/jobs/[id]/JobDetailContent.tsx:100`: O candidato vê a situação, e o restante do componente mostra etapas, mas não renderiza application.feedback.

Aceitação da correção:

- Oferecer seleção de etapa da mesma vaga e campo de feedback no painel.
- Salvar e reconsultar os dados no candidato com autorização correta.
- Teste de interface deve selecionar etapa e informar feedback, conferir PATCH, refletir o retorno e cobrir falha sem confirmação prematura.

Cobertura atual: RecruiterContent.test.tsx valida o seletor de status. Esse teste passa, mas não cobre o comportamento ausente de etapa/feedback.

## FL03: Notificação é registrada, mas apresentada sem identificação da vaga e sem link

O candidato recebe um aviso genérico sem saber qual oportunidade mudou nem como abrir a candidatura correspondente.

Estado de confirmação: Confirmado pelo mapeamento de apresentação, sem negar a criação do registro.

Evidências:

- `src/services/job.service.ts:324`: A atualização cria JOB_APPLICATION_UPDATE com resourceType JOB e o id da vaga.
- `src/services/notification.service.ts:56`: Os helpers de título, conteúdo e link não tratam JOB_APPLICATION_UPDATE/JOB e caem em título/conteúdo genéricos e link null.
- `src/services/notification.service.ts:208`: A resposta consumida pela interface usa esses helpers.

Aceitação da correção:

- Mapear o tipo de candidatura com título/conteúdo úteis e link para a vaga autorizada.
- Não expor parecer privado a terceiros ao montar o aviso.
- Testar título, vaga, link e manutenção da operação principal se a notificação falhar.

Cobertura atual: As sete suítes executadas não verificam a apresentação de JOB_APPLICATION_UPDATE.

## FL04: Rejeições esperadas de candidatura viram erro interno genérico

O usuário recebe falha de servidor em casos normais, inclusive retry depois de uma candidatura já confirmada. A consistência de unicidade existe, mas o resultado concorrente não é tratado como conflito ou resposta idempotente.

Estado de confirmação: Tratamento 500 confirmado estaticamente. Corrida de duas candidaturas não executada contra banco; a constraint evita duplicação.

Evidências:

- `src/services/job.service.ts:263`: Candidatura existente, vaga ausente ou fechada lançam Error comum.
- `src/lib/api-handler.ts:60`: Erros sem tipo de domínio partem de status 500 e INTERNAL_ERROR.
- `src/lib/api-handler.ts:77`: Só AppError preserva o código e a mensagem de domínio; Error comum mantém resposta genérica.
- `src/services/job.service.ts:253`: Consulta prévia e criação são separadas. Requisições simultâneas podem passar da checagem e uma falhar na unicidade.
- `prisma/schema.prisma:355`: A unicidade usuário/vaga impede duplicação no banco; não foi encontrado tratamento de P2002 nesse fluxo.

Aceitação da correção:

- Mapear inexistente, fechada e duplicada para erros de domínio e mensagens em português.
- Tratar P2002 da chave usuário/vaga como conflito ou reconsulta idempotente.
- Testar segunda candidatura sequencial e concorrente, confirmando uma única linha e nenhuma resposta 500 para conflito esperado.

Cobertura atual: A suíte job.service.test.ts atual não contém applyForJob nem cenário concorrente.

## FL05: API permite publicar vaga sem etapa e candidatar com etapa inicial nula

Uma requisição válida pela API pode criar uma oportunidade que quebra o vínculo à etapa inicial exigido em RF047. A UI padrão omite stages e recebe defaults, mas outros clientes podem acionar o caso.

Estado de confirmação: Confirmado pela composição do schema de entrada, fallback e persistência; nenhum dado foi gravado.

Evidências:

- `src/app/api/jobs/route.ts:28`: O array stages é opcional, mas aceita [] quando informado, sem mínimo ou validação de ordem.
- `src/services/job.service.ts:191`: stages || defaults preserva [] porque array vazio é truthy.
- `src/services/job.service.ts:279`: A candidatura usa firstStage?.id e continua quando não há etapa.
- `prisma/schema.prisma:344`: stage_id é opcional, portanto o banco aceita a candidatura sem etapa.

Aceitação da correção:

- Definir contrato para array vazio: rejeitar ou aplicar etapas padrão.
- Validar ordem das etapas e existência de etapa inicial antes de aceitar candidatura.
- Testar POST com stages ausente, vazio, fora de ordem e duplicado, seguido da candidatura.

Cobertura atual: A suíte do serviço não contém createJob ou etapas vazias.

## FL06: Criar empresa e promover responsável são operações separadas

Se a promoção falhar após criar a empresa, a API responde erro embora a empresa exista e o usuário possa continuar sem o papel necessário para publicar. Repetir o cadastro com o mesmo nome pode colidir com o slug persistido.

Estado de confirmação: Falta de atomicidade confirmada por código. A falha entre operações é um cenário de risco, não foi induzida no banco.

Evidências:

- `src/services/job.service.ts:355`: company.create confirma antes de user.updateMany que promove USER para RECRUITER; não há transação envolvendo as duas operações.
- `prisma/schema.prisma:284`: O slug da empresa é único, portanto repetir a tentativa pode falhar se a criação anterior tiver persistido.
- `src/app/api/companies/route.ts:34`: A API depende do retorno conjunto do serviço antes de confirmar sucesso.

Aceitação da correção:

- Executar criação e promoção numa mesma transação ou definir recuperação idempotente explícita.
- Teste de falha na promoção deve provar rollback da empresa ou recuperação segura sem cadastro duplicado.
- Preservar os papéis já existentes que não sejam USER.

Cobertura atual: job.service.test.ts não contém createCompany e não demonstra rollback.

## FL07: Indisponibilidade do executor ainda grava submissão e altera progresso no workspace

A mesma indisponibilidade preserva o progresso numa lição e altera histórico/progresso no workspace. O usuário ganha uma tentativa ERROR e atividade de aprendizagem sem avaliação efetiva. Não concede XP, mas viola a expectativa de falha essencial sem alteração do progresso.

Estado de confirmação: Confirmado pelos dois fluxos. Não houve execução de dados ou avaliação real indisponível.

Evidências:

- `src/lib/exercises/evaluator.ts:161`: Falha do executor propaga unavailable no resultado de avaliação.
- `src/app/api/exercises/[exerciseId]/submit/route.ts:36`: A rota chama recordExerciseSubmission sem interromper evaluation.unavailable.
- `src/lib/exercises/repository.ts:246`: Registra submissão ERROR e cria/atualiza UserNodeProgress como IN_PROGRESS/last_activity_at mesmo em indisponibilidade.
- `src/app/api/lessons/[lessonId]/attempt/route.ts:26`: O fluxo de catálogo já interrompe unavailable com 503 antes de salvar; os dois caminhos divergem.

Aceitação da correção:

- Tratar indisponibilidade no workspace antes de gravar submissão/progresso, preservando eventual telemetria técnica separada.
- Retornar erro recuperável consistente com o fluxo de catálogo.
- Testar unavailable:true e demonstrar zero novas submissões/recompensas/mudanças de progresso e histórico do aluno; erro real de código deve continuar registrável.

Cobertura atual: lesson-attempt possui oito testes e cobre interrupção de outage. Não há teste da rota workspace submit entre os arquivos existentes localizados.

## FL08: Timeout da requisição HTTP ao provedor é classificado como erro do código do aluno

Uma conexão lenta ou indisponível pode ser atribuída à solução do aluno e persistida como resposta incorreta; o fallback também é pulado. Não há evidência de que o programa foi executado até atingir o limite.

Estado de confirmação: Classificação confirmada pelo catch. Timeout real de rede não provocado. Distinguir do timeout retornado pelo provedor ao executar código, que é erro legítimo do programa.

Evidências:

- `src/lib/code-execution/server.ts:130`: Judge0: AbortError do fetch retorna ok:false com erro de limite, sem unavailable:true.
- `src/lib/code-execution/server.ts:193`: Wandbox repete o mesmo tratamento do timeout da requisição.
- `src/lib/code-execution/server.ts:239`: Qualquer resultado truthy encerra a escolha do provedor, portanto timeout HTTP não aciona o fallback.
- `src/app/api/lessons/[lessonId]/attempt/route.ts:26`: Sem unavailable, o submit segue para saveLessonAssessment com isCorrect:false.

Aceitação da correção:

- Separar timeout de transporte de timeout de execução informado pelo provedor.
- Para transporte, acionar fallback dentro de um orçamento total limitado ou retornar unavailable:true sem alterar progresso.
- Com fetch simulado abortando e fallback saudável, provar uso do fallback; com todos indisponíveis, provar resposta recuperável sem gravação. Manter teste de laço infinito como falha legítima do programa.

Cobertura atual: server.test.ts cobre sandbox JS, TS, laço infinito, teto de saída e HTTP não-ok com fallback. Não cobre AbortError de transporte.

## FL09: Workspace exibe conteúdo antes de verificar pré-requisitos

Abrir diretamente a URL de um exercício bloqueado revela o conteúdo e o editor e só depois rejeita a prática. O aluno inicia visualmente uma atividade que o servidor não permite concluir.

Estado de confirmação: Divergência de acesso entre leitura e ação confirmada. Não é bypass de submissão ou XP, pois essas rotas verificam acesso.

Evidências:

- `src/app/lesson/[lessonId]/page.tsx:93`: O ramo workspace obtém dados e renderiza ExerciseWorkspace sem chamar requireExerciseAccess.
- `src/lib/exercises/repository.ts:76`: getExerciseWorkspaceForUser devolve enunciado, dicas e código inicial; não aplica requireExerciseAccess.
- `src/app/api/exercises/[exerciseId]/submit/route.ts:33`: A submissão verifica requireExerciseAccess e bloqueia pré-requisito faltante.

Aceitação da correção:

- Aplicar o gate também antes de renderizar o workspace, com mensagem de pré-requisito e navegação de retorno.
- Preservar a regra de revisão de conteúdo já concluído.
- Testar URL direta bloqueada e exercício já concluído após alteração de pré-requisitos.

Cobertura atual: A verificação de conteúdo inicial no ramo workspace não foi coberta nos sete arquivos executados.

## Testes executados

Comando executado com filtros explícitos de sete arquivos e reporter JSON. Log completo: `analise-sistema/testes-fluxos.json`.

| Arquivo | Testes aprovados |
|---|---|
| `src/lib/code-execution/server.test.ts` | 6 |
| `src/services/__tests__/job.service.test.ts` | 4 |
| `src/app/recruiter/__tests__/RecruiterContent.test.tsx` | 4 |
| `src/lib/exercises/__tests__/evaluator.test.ts` | 2 |
| `src/lib/mobile/__tests__/company-access.test.ts` | 6 |
| `src/lib/learning/__tests__/transaction.test.ts` | 5 |
| `src/app/api/lessons/[lessonId]/attempt/route.test.ts` | 8 |

Todos executaram mocks ou o sandbox JavaScript local. Não houve conexão com PostgreSQL ou execução remota. Os testes de concorrência PostgreSQL e smoke de linguagens externas existem sob opt-in e não foram executados.

## Implementação existente preservada na avaliação

- Publicação e consulta de candidatos já validam a empresa por requireCompanyAccess. Não afirmar falta geral de isolamento de empresa.
- Usuário/vaga possui unique no banco. Não afirmar que a corrida pode duplicar a candidatura persistida.
- Catálogo de lições e workspace são dois fluxos existentes e intencionais. A dualidade por si só não comprova defeito.
- Progresso e XP de catálogo usam lock por usuário e transação limitada. O workspace também usa lock para recompensa. Não afirmar duplicação de XP sem prova.
- getUserLanguageXp soma LanguageTrail e histórico ExerciseSubmission sem migrar ou duplicar registros. Não tratar a ausência de atualização de LanguageTrail no workspace isoladamente como perda de XP por linguagem.
- Os testes PostgreSQL concorrentes e os smoke tests de provedores existem, mas são opt-in LEARNING_DB_TEST e LEARNING_RUNNER_SMOKE. Eles não foram executados nesta auditoria por exigirem recursos externos.

## Ordem sugerida

1. Restringir o payload privado retornado no PATCH de candidatura (FL01).
2. Uniformizar indisponibilidade e timeout de transporte entre catálogo e workspace (FL07, FL08).
3. Completar a experiência de etapas, feedback e notificação (FL02, FL03).
4. Tratar conflitos de candidatura e integridade de etapas (FL04, FL05).
5. Tornar o cadastro de empresa atômico e aplicar o gate antes de abrir workspace (FL06, FL09).

Nenhuma correção foi implementada nesta auditoria.
