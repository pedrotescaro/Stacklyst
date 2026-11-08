# Catálogo dos casos de uso Stacklyst

A vista **Caso de Uso Geral** fornecida pelo grupo é a referência dos **26 casos de uso** desta edição. Os IDs e nomes abaixo reproduzem essa vista. As funcionalidades descritas no manual técnico não recebem automaticamente novos números de caso de uso.

| ID | Nome no diagrama | Ator |
| --- | --- | --- |
| UC001 | Cadastrar Conta | Usuário |
| UC002 | Fazer Login | Usuário |
| UC003 | Gerenciar Perfil | Usuário |
| UC004 | Consultar Trilhas de Estudo | Usuário |
| UC005 | Realizar Lição | Usuário |
| UC006 | Resolver exercício | Usuário |
| UC007 | Emitir Classificação e Desempenho | Usuário, com atualização automática pelo sistema |
| UC008 | Realizar Duelo | Usuário e adversário |
| UC010 | Enviar Solução de Duelo | Participante do duelo |
| UC012 | Consultar Ajuda de Exercício | Usuário |
| UC013 | Gerenciar Publicações | Usuário |
| UC014 | Registrar Interação | Usuário |
| UC015 | Gerenciar Eventos | Administrador ou responsável autorizado pelo evento |
| UC016 | Avaliar Duelo | Avaliador |
| UC017 | Gerenciar Empresas | Recrutador e administrador, conforme autorização do recurso |
| UC018 | Gerenciar Vagas | Recrutador ou administrador autorizado |
| UC019 | Gerenciar Usuários | Administrador |
| UC021 | Notificar Usuário | Sistema, com Usuário como destinatário |
| UC022 | Registrar Candidatura | Usuário candidato |
| UC023 | Criar evento | Usuário com permissão de criação no fluxo |
| UC024 | Apresentar Pedido de Credenciamento | Usuário candidato a avaliador |
| UC025 | Gerenciar Candidaturas | Recrutador ou administrador autorizado |
| UC026 | Avaliar Resposta | Sistema, acionado pela resposta do Usuário |
| UC027 | Executar Código e Testes | Executor de código, acionado pelo sistema |
| UC028 | Gerenciar Denúncias | Administrador |
| UC029 | Fazer Denúncia | Usuário |

## UC001 Cadastrar Conta

**Objetivo:** Criar uma identidade própria para acessar a plataforma.

**Ator:** Usuário

**Pré-condições:** Não possuir conta com o mesmo e-mail ou nome de usuário; fornecer os dados obrigatórios.

### Fluxo principal

1. O usuário abre o cadastro e informa nome de usuário, e-mail e senha.
2. O sistema valida os campos e verifica os identificadores disponíveis.
3. O provedor de autenticação cria a identidade e o sistema registra os dados do perfil.
4. O sistema apresenta a orientação de confirmação ou de acesso.

### Fluxos alternativos e exceções

- A1 — E-mail ou nome já utilizado: o sistema informa o conflito, mantém os campos permitidos e solicita outro identificador. O fluxo retoma a validação.
- A2 — Dados inválidos: o sistema aponta o campo e impede a criação até a correção.
- A3 — Confirmação de e-mail exigida pelo ambiente: a conta aguarda a confirmação antes do acesso autenticado.

**Pós-condição de sucesso:** Identidade e perfil registrados, com situação de confirmação apresentada.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/auth/register/route.ts`.

**Regras relacionadas:** R01, R02.

## UC002 Fazer Login

**Objetivo:** Estabelecer uma sessão autenticada e recuperar o acesso quando necessário.

**Ator:** Usuário

**Pré-condições:** Possuir conta válida para autenticação; cadastro e recuperação são acessíveis sem sessão.

### Fluxo principal

1. O usuário abre o acesso e informa suas credenciais.
2. O provedor de autenticação verifica a identidade.
3. O sistema resolve a conta e estabelece a sessão válida.
4. A interface encaminha o usuário ao conteúdo autorizado.

### Fluxos alternativos e exceções

- A1 — Credenciais recusadas ou conta indisponível: o sistema não cria sessão e apresenta a orientação de acesso.
- A2 — Esquecimento da senha: o titular solicita recuperação e segue o link válido enviado pelo provedor de autenticação.
- A3 — Sessão expirada durante uma operação protegida: o usuário autentica novamente e retorna ao recurso autorizado.

**Pós-condição de sucesso:** Sessão válida estabelecida ou recuperação solicitada pelo fluxo próprio.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/auth/reset-password/route.ts`, `src/lib/auth.ts`.

**Regras relacionadas:** R01, R02, R03.

## UC003 Gerenciar Perfil

**Objetivo:** Consultar e atualizar seu perfil, aparência e preferências pessoais.

**Ator:** Usuário

**Pré-condições:** Sessão válida; alterações permitidas somente ao titular ou a papel autorizado pelo recurso.

### Fluxo principal

1. O usuário abre seu perfil ou as preferências e escolhe os dados a alterar.
2. A interface apresenta os dados e as personalizações disponíveis.
3. O usuário confirma as alterações desejadas.
4. O servidor valida autoria, formatos, disponibilidade e elegibilidade.
5. O sistema persiste a alteração e reapresenta o perfil confirmado.

### Fluxos alternativos e exceções

- A1 — Nome indisponível, formato inválido ou intervalo de alteração não atendido: a edição é recusada com a causa correspondente.
- A2 — Título, moldura ou cosmético não desbloqueado: o sistema mantém a seleção anterior.
- A3 — Imagem incompatível ou falha no envio: o perfil mantém a imagem confirmada e permite nova tentativa.

**Pós-condição de sucesso:** Perfil e preferências autorizadas persistidos.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/upload/route.ts`, `src/app/settings/page.tsx`, `src/services/profile-customization.service.ts`.

**Regras relacionadas:** R01, R02, R03, R28, R93.

## UC004 Consultar Trilhas de Estudo

**Objetivo:** Escolher uma linguagem e consultar o percurso, as unidades e seu progresso.

**Ator:** Usuário

**Pré-condições:** Sessão válida para consultar o progresso pessoal; currículo disponível na versão instalada.

### Fluxo principal

1. O usuário abre Trilhas e seleciona linguagem, caminho e modo de visualização.
2. O sistema carrega o currículo e o progresso pessoal.
3. A interface apresenta unidades, lições, exercícios concluídos e requisitos.
4. O usuário seleciona uma lição disponível para continuar ou revisar.

### Fluxos alternativos e exceções

- A1 — Troca de linguagem ou caminho: a interface carrega o percurso escolhido e seu progresso independente.
- A2 — Lição bloqueada por pré-requisito: o sistema identifica a etapa necessária e impede acesso indevido.
- A3 — Caminho concluído: as lições continuam disponíveis para revisão, sem repetir o crédito de conclusão.

**Pós-condição de sucesso:** Percurso e progresso apresentados para a seleção atual.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/trails/TrailsContent.tsx`, `src/lib/learning/progress.ts`.

**Regras relacionadas:** R08, R09, R10.

## UC005 Realizar Lição

**Objetivo:** Estudar o conteúdo de uma lição e avançar para suas atividades.

**Ator:** Usuário

**Pré-condições:** Sessão válida; lição existente e acessível no caminho selecionado.

### Fluxo principal

1. O usuário abre uma lição disponível.
2. O sistema verifica a lição e o progresso correspondente.
3. A interface apresenta conceito, exemplo e orientação da etapa.
4. O usuário lê o conteúdo e avança às atividades de UC006.
5. O sistema permite retornar ao percurso e consultar o progresso confirmado.

### Fluxos alternativos e exceções

- A1 — Retomar uma lição: o sistema usa o progresso persistido e permite continuar ou revisar.
- A2 — Sair antes de concluir: os registros já confirmados permanecem, enquanto a sessão local de estudo é encerrada.
- A3 — Lição inexistente ou bloqueada: o sistema orienta o retorno ao caminho e informa a restrição.

**Pós-condição de sucesso:** Conteúdo estudado e etapas confirmadas disponíveis para continuidade.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/lib/learning/lesson-progress.ts`.

**Regras relacionadas:** R11, R12, R20.

## UC006 Resolver exercício

**Objetivo:** Resolver a atividade, verificar a resposta e confirmar o resultado da aprendizagem.

**Ator:** Usuário

**Pré-condições:** Sessão válida; atividade disponível e vinculada à lição ou ao exercício selecionado.

### Fluxo principal

1. O usuário abre a atividade e consulta enunciado, opções ou editor.
2. O usuário informa uma resposta compatível com o tipo da atividade.
3. O servidor valida o contexto e solicita UC026 para avaliar a resposta.
4. A interface apresenta acerto, erro ou orientação aplicável.
5. Na submissão elegível, o sistema registra a tentativa e confirma a conclusão e a recompensa permitida.

### Fluxos alternativos e exceções

- A1 — Executar uma prévia: o código é testado, mas a prévia não conclui a atividade nem concede XP.
- A2 — Resposta incorreta: o sistema apresenta o retorno previsto para o tipo de atividade e permite nova tentativa conforme a regra de vidas e progresso.
- A3 — Solicitar ajuda: realiza-se UC012 e o estudante retorna à atividade com o modo de assistência registrado.
- A4 — Repetir atividade já concluída: o sistema permite a revisão sem duplicar a recompensa de primeira conclusão.

**Pós-condição de sucesso:** Tentativa avaliada e submissão elegível confirmada sem duplicação de recompensa.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/lessons/[lessonId]/attempt/route.ts`, `src/lib/exercises/repository.ts`, `src/lib/learning/assessment.ts`, `src/lib/learning/lesson-progress.ts`, `src/services/daily-quiz.service.ts`.

**Regras relacionadas:** R12, R13, R14, R15, R16, R17, R18, R19, R25, R89.

## UC007 Emitir Classificação e Desempenho

**Objetivo:** Apurar e apresentar progresso, XP, nível, classificação e reconhecimento.

**Ator:** Usuário, com atualização automática pelo sistema

**Pré-condições:** Existir resultado validado ou consulta de desempenho autorizada; usar o período e a linguagem selecionados.

### Fluxo principal

1. O sistema recebe um resultado confirmado ou uma consulta de desempenho.
2. O sistema considera os registros válidos, a linguagem e o período aplicáveis.
3. O sistema apura XP, nível, progresso e critérios de reconhecimento.
4. A interface apresenta a classificação e o desempenho correspondentes.
5. Quando os critérios forem atendidos, o sistema disponibiliza o reconhecimento elegível.

### Fluxos alternativos e exceções

- A1 — Filtro por linguagem ou período: a classificação é recalculada para o filtro escolhido.
- A2 — Reconhecimento ainda inelegível: o sistema mostra os requisitos faltantes e não emite uma credencial indevida.
- A3 — Credencial já emitida: o registro existente é reutilizado; verificações públicas e PDF seguem suas condições de acesso.

**Pós-condição de sucesso:** Desempenho, classificação e reconhecimento apresentados com base nos registros válidos.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/lib/credentials/pdf.ts`, `src/lib/credentials/repository.ts`, `src/lib/learning/rewards.ts`.

**Regras relacionadas:** R22, R23, R24, R25, R26, R27, R28.

## UC008 Realizar Duelo

**Objetivo:** Participar de um confronto de programação, da formação da partida ao resultado.

**Ator:** Usuário e adversário

**Pré-condições:** Sessão válida; linguagem e participantes elegíveis; respeitar os limites da fila e as regras contra abandono.

### Fluxo principal

1. O usuário escolhe a linguagem e solicita a fila ou cria um desafio.
2. O sistema valida elegibilidade e forma a partida quando houver adversário compatível.
3. Os participantes recebem o problema e as condições da disputa.
4. Cada participante trabalha em sua solução e usa UC010 para enviar.
5. O sistema aplica a política de encerramento e apresenta o resultado.

### Fluxos alternativos e exceções

- A1 — Fila sem adversário: o jogador aguarda ou cancela a busca antes da formação da partida.
- A2 — Convite recusado ou expirado: o sistema encerra o pedido conforme sua política, sem simular aceitação.
- A3 — Prazo, empate, abandono ou revisão: o serviço aplica a política de resolução e registra o motivo do encerramento.
- A4 — Solução do participante: o envio ocorre por UC010, com execução e testes de UC027.

**Pós-condição de sucesso:** Partida formada e encerrada conforme sua política, com resultado registrado.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/lib/duels/resolution-policy.ts`, `src/services/duel.service.ts`.

**Regras relacionadas:** R61, R62, R64, R65, R66, R67, R68, R69, R70, R71.

## UC010 Enviar Solução de Duelo

**Objetivo:** Enviar uma solução elegível ao duelo e registrar sua avaliação técnica.

**Ator:** Participante do duelo

**Pré-condições:** Sessão válida; usuário participante; duelo existente e em fase que aceite submissão.

### Fluxo principal

1. O participante abre o duelo e informa o código na linguagem permitida.
2. O participante solicita o envio da solução.
3. O servidor confirma participação, fase, prazo e limites da submissão.
4. O sistema solicita UC027 e registra os resultados de execução e testes.
5. O sistema vincula o envio ao duelo e apresenta a situação confirmada.

### Fluxos alternativos e exceções

- A1 — Apenas executar: retorna a saída de teste sem confundir a prévia com o envio definitivo.
- A2 — Código inválido, teste reprovado ou execução indisponível: o sistema registra o resultado permitido e informa o erro; não declara aprovação fictícia.
- A3 — Usuário fora da partida ou prazo encerrado: o envio é recusado antes da alteração do resultado.

**Pós-condição de sucesso:** Solução vinculada ao participante e ao duelo, com resultado técnico registrado.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/lib/duels/judge.ts`.

**Regras relacionadas:** R63, R64.

## UC012 Consultar Ajuda de Exercício

**Objetivo:** Consultar uma orientação para avançar na resolução de uma atividade.

**Ator:** Usuário

**Pré-condições:** Atividade acessível; usuário autenticado; modalidade de ajuda permitida.

### Fluxo principal

1. Durante UC006, o usuário solicita a ajuda disponível.
2. O sistema verifica o contexto da atividade e o modo de assistência permitido.
3. O sistema registra a assistência aplicável e retorna a orientação.
4. O usuário retoma a resolução da atividade.

### Fluxos alternativos e exceções

- A1 — Ajuda sem revelar a resposta: o sistema apresenta a dica correspondente e mantém a atividade aberta.
- A2 — Assistência com efeito na recompensa: o modo utilizado é registrado e considerado pela política da atividade.
- A3 — Ajuda indisponível ou não autorizada: a atividade permanece acessível sem conceder assistência não prevista.

**Pós-condição de sucesso:** Orientação apresentada e modo de assistência registrado quando aplicável.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/lib/exercises/repository.ts`.

**Regras relacionadas:** R18, R19.

## UC013 Gerenciar Publicações

**Objetivo:** Criar, consultar, editar ou excluir uma publicação própria.

**Ator:** Usuário

**Pré-condições:** Sessão válida para alterações; autorização sobre o conteúdo; atender aos limites de texto, mídia e audiência.

### Fluxo principal

1. O usuário abre o formulário de publicação ou uma publicação própria.
2. O usuário informa ou altera o texto e os recursos compatíveis.
3. O servidor verifica autorização, limites e referências dos anexos.
4. O sistema grava a publicação ou a alteração solicitada.
5. A interface apresenta o conteúdo confirmado no feed ou no perfil.

### Fluxos alternativos e exceções

- A1 — Editar ou excluir: o sistema verifica a autoria ou a permissão administrativa antes de confirmar a alteração.
- A2 — Incluir código, imagem, enquete ou outro recurso compatível: o conteúdo segue as validações específicas do recurso.
- A3 — Dados inválidos ou falha na persistência: o conteúdo não é tratado como publicado e o formulário permite correção.

**Pós-condição de sucesso:** Publicação criada ou mantida com a autorização correspondente.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/post.service.ts`.

**Regras relacionadas:** R02, R07, R29, R30.

## UC014 Registrar Interação

**Objetivo:** Registrar uma interação permitida com o conteúdo exibido.

**Ator:** Usuário

**Pré-condições:** Sessão válida para persistir a ação; publicação acessível; respeitar bloqueios e restrições de audiência.

### Fluxo principal

1. O usuário consulta uma publicação e escolhe uma interação disponível.
2. O sistema verifica sessão, acesso ao conteúdo e validade da ação.
3. O serviço correspondente registra a reação, resposta, voto ou item salvo.
4. A interface atualiza o estado da interação a partir do resultado confirmado.

### Fluxos alternativos e exceções

- A1 — Reagir novamente à mesma publicação: o serviço altera ou remove a reação conforme a ação, sem duplicação indevida.
- A2 — Responder a uma conversa: a resposta é vinculada à publicação e, quando aplicável, à resposta anterior.
- A3 — Salvar ou retirar dos itens salvos: somente a coleção pessoal do titular é modificada.
- A4 — Votar em enquete: opções inválidas, voto incompatível ou enquete encerrada impedem a alteração.

**Pós-condição de sucesso:** Interação confirmada no registro e refletida na interface.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/posts/[id]/answer/route.ts`, `src/app/api/posts/[id]/poll/route.ts`, `src/app/bookmarks/page.tsx`, `src/services/reaction.service.ts`.

**Regras relacionadas:** R07, R29, R31, R32, R33, R34, R91.

## UC015 Gerenciar Eventos

**Objetivo:** Consultar e administrar um evento, seus desafios e sua situação.

**Ator:** Administrador ou responsável autorizado pelo evento

**Pré-condições:** Sessão válida; autorização administrativa ou vínculo com o evento; evento existente.

### Fluxo principal

1. O responsável abre a administração de eventos.
2. O sistema verifica a autorização e lista os eventos acessíveis.
3. O responsável consulta ou altera informações, desafios e situação do evento.
4. O sistema valida a operação e grava os dados permitidos.
5. A interface confirma a atualização e disponibiliza os avisos elegíveis de UC021.

### Fluxos alternativos e exceções

- A1 — Atualizar os desafios: a ordenação, os enunciados e os dados de avaliação são validados antes da gravação.
- A2 — Participação do usuário: inscrição, lotação, repetição e cancelamento seguem o serviço de eventos e a janela permitida.
- A3 — Evento encerrado ou usuário sem autorização: o sistema mantém o registro e informa a restrição.

**Pós-condição de sucesso:** Evento administrado com os vínculos e limites preservados.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/event-challenge.service.ts`, `src/services/event.service.ts`.

**Regras relacionadas:** R81, R82, R83, R84, R85, R86, R87.

## UC016 Avaliar Duelo

**Objetivo:** Registrar um parecer humano autorizado sobre um duelo.

**Ator:** Avaliador

**Pré-condições:** Sessão válida; credenciamento e autorização vigentes; duelo apto à avaliação; ausência de conflito de participação.

### Fluxo principal

1. O avaliador abre um duelo elegível para revisão.
2. O sistema verifica credenciamento, autorização e impedimentos.
3. O avaliador consulta as soluções e os critérios e informa seu parecer.
4. O servidor valida notas, justificativa e situação da avaliação.
5. O sistema registra o parecer e aplica os efeitos previstos à resolução do duelo.

### Fluxos alternativos e exceções

- A1 — Avaliador participante ou impedido: o sistema recusa o parecer para preservar a imparcialidade.
- A2 — Nota, justificativa ou critérios inválidos: o formulário requer correção antes da persistência.
- A3 — Parecer já existente ou duelo fora da fase elegível: o fluxo segue a política de avaliação e não duplica o resultado.

**Pós-condição de sucesso:** Parecer autorizado registrado e considerado pela política de resolução.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/evaluator.service.ts`.

**Regras relacionadas:** R73, R74, R75.

## UC017 Gerenciar Empresas

**Objetivo:** Manter o cadastro da empresa e o vínculo de seu responsável.

**Ator:** Recrutador e administrador, conforme autorização do recurso

**Pré-condições:** Sessão válida; papel e vínculo exigidos pela operação.

### Fluxo principal

1. O gestor abre a área de empresas e informa ou seleciona a empresa.
2. O sistema confere seu papel e o vínculo de responsabilidade.
3. O gestor informa ou atualiza os dados cadastrais permitidos.
4. O sistema valida e grava o cadastro da empresa.
5. A interface confirma a empresa e permite acessar suas oportunidades autorizadas.

### Fluxos alternativos e exceções

- A1 — Atualizar empresa existente: o sistema confere o vínculo do gestor antes de alterar os dados.
- A2 — Empresa inexistente, identificador em conflito ou dados inválidos: a ação é recusada com indicação da causa.
- A3 — Acesso a outra empresa sem vínculo: o sistema impede a operação, mesmo quando a interface apresentou o recurso.

**Pós-condição de sucesso:** Empresa cadastrada ou atualizada e vinculada ao responsável autorizado.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/job.service.ts`.

**Regras relacionadas:** R04, R79.

## UC018 Gerenciar Vagas

**Objetivo:** Cadastrar e manter uma vaga vinculada à empresa correta.

**Ator:** Recrutador ou administrador autorizado

**Pré-condições:** Sessão válida; autorização sobre a empresa; campos da oportunidade e etapas válidos.

### Fluxo principal

1. O gestor seleciona uma empresa autorizada e abre o cadastro ou a edição da vaga.
2. O gestor informa título, descrição, tecnologias, modalidade e etapas.
3. O servidor verifica o vínculo com a empresa e valida a oportunidade.
4. O sistema grava a vaga e suas etapas de recrutamento.
5. A interface confirma a oportunidade e os avisos elegíveis seguem UC021.

### Fluxos alternativos e exceções

- A1 — Alterar, encerrar ou filtrar uma vaga: o sistema aplica a autorização e a situação atual do registro.
- A2 — Empresa sem autorização: a vaga não é criada ou alterada.
- A3 — Etapas ou dados inválidos: a operação retorna para correção sem confirmar publicação incompleta.

**Pós-condição de sucesso:** Vaga e etapas persistidas na empresa autorizada.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/job.service.ts`.

**Regras relacionadas:** R04, R79.

## UC019 Gerenciar Usuários

**Objetivo:** Consultar e administrar usuários e permissões dentro dos limites de acesso.

**Ator:** Administrador

**Pré-condições:** Sessão válida; papel administrativo confirmado pelo servidor.

### Fluxo principal

1. O administrador abre a área restrita de usuários.
2. O servidor verifica o papel administrativo e carrega os registros autorizados.
3. O administrador consulta um usuário e solicita a operação permitida.
4. O sistema valida a alteração e registra os dados e a auditoria aplicável.
5. A interface apresenta o resultado confirmado.

### Fluxos alternativos e exceções

- A1 — Solicitação de credenciamento: o administrador analisa o pedido e aprova ou rejeita com a justificativa correspondente.
- A2 — Filtro de usuários ou auditoria: o sistema retorna somente os registros e campos autorizados.
- A3 — Tentativa sem permissão: o recurso retorna recusa de acesso e não altera papéis ou dados.

**Pós-condição de sucesso:** Operação administrativa autorizada registrada.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/admin.service.ts`.

**Regras relacionadas:** R02, R03.

## UC021 Notificar Usuário

**Objetivo:** Registrar e disponibilizar o aviso produzido por uma operação relevante.

**Ator:** Sistema, com Usuário como destinatário

**Pré-condições:** Ocorrer fato notificável; existir destinatário válido; respeitar os critérios da notificação.

### Fluxo principal

1. Uma operação de origem identifica um fato notificável e seu destinatário.
2. O sistema valida a categoria, o destinatário e os dados do aviso.
3. O serviço registra a notificação.
4. A interface do destinatário consulta ou recebe a atualização dos avisos.
5. O usuário pode filtrar, consultar e marcar suas notificações conforme a ação permitida.

### Fluxos alternativos e exceções

- A1 — Consultar por categoria ou marcar leitura: somente as notificações do titular são afetadas.
- A2 — Nenhum aviso para o filtro: a interface apresenta o estado vazio.
- A3 — Falha na atualização automática: a interface mantém os dados confirmados e permite reconsulta, sem presumir que o destinatário leu o aviso.

**Pós-condição de sucesso:** Aviso registrado para o destinatário e disponível para consulta.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/notification.service.ts`.

**Regras relacionadas:** R35, R38.

## UC022 Registrar Candidatura

**Objetivo:** Registrar uma candidatura única a uma vaga aberta.

**Ator:** Usuário candidato

**Pré-condições:** Sessão válida; vaga existente e aberta; usuário ainda não inscrito na mesma oportunidade.

### Fluxo principal

1. O usuário consulta uma vaga e solicita a candidatura.
2. O servidor verifica a sessão, a existência da vaga e sua situação aberta.
3. O sistema verifica se já existe candidatura do mesmo usuário à vaga.
4. O sistema cria a candidatura com sua situação inicial e os vínculos corretos.
5. A interface confirma a inscrição e disponibiliza seu acompanhamento.

### Fluxos alternativos e exceções

- A1 — Candidatura já existente: o sistema informa a inscrição anterior e não cria outra.
- A2 — Vaga encerrada ou removida: o envio é recusado antes da gravação.
- A3 — Falha de rede: o usuário consulta a situação confirmada antes de repetir o envio.

**Pós-condição de sucesso:** Candidatura única registrada na vaga aberta.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/job.service.ts`.

**Regras relacionadas:** R76, R77, R78.

## UC023 Criar evento

**Objetivo:** Criar um evento ou hackathon com suas informações obrigatórias.

**Ator:** Usuário com permissão de criação no fluxo

**Pré-condições:** Sessão válida; permissão de criação confirmada; título, período, formato e demais campos válidos.

### Fluxo principal

1. O usuário autorizado abre o formulário de criação do evento.
2. O usuário informa os dados obrigatórios e o vínculo com empresa, quando aplicável.
3. O servidor confirma a permissão de criação e valida os dados.
4. O serviço cria o evento com sua situação inicial.
5. O sistema confirma o evento e encaminha os avisos elegíveis para UC021.

### Fluxos alternativos e exceções

- A1 — Evento associado a empresa: o sistema confere a autorização sobre a empresa vinculada.
- A2 — Dados ou período inválidos: o formulário apresenta as correções necessárias.
- A3 — Confirmação do cadastro: o evento passa à situação inicial e os avisos elegíveis seguem UC021.

**Pós-condição de sucesso:** Novo evento registrado com os dados válidos e situação inicial.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/event.service.ts`.

**Regras relacionadas:** R83, R84, R87.

## UC024 Apresentar Pedido de Credenciamento

**Objetivo:** Apresentar motivação e conhecimentos para solicitar o credenciamento.

**Ator:** Usuário candidato a avaliador

**Pré-condições:** Sessão válida; cumprir os critérios de elegibilidade; não existir pedido pendente incompatível.

### Fluxo principal

1. O usuário abre o pedido de credenciamento.
2. O sistema apresenta sua elegibilidade e os requisitos.
3. O candidato informa motivação e conhecimentos técnicos e envia o pedido.
4. O servidor verifica os requisitos e a inexistência de pedido pendente incompatível.
5. O sistema registra a solicitação para análise administrativa e apresenta sua situação.

### Fluxos alternativos e exceções

- A1 — Requisitos insuficientes: o sistema apresenta as condições ainda não atendidas e impede o pedido.
- A2 — Solicitação pendente ou papel já credenciado: o sistema informa a situação existente.
- A3 — Motivação ou tecnologias inválidas: o candidato corrige os campos; enviar o pedido não concede automaticamente o papel.

**Pós-condição de sucesso:** Pedido registrado para análise, sem concessão automática do papel.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/evaluator.service.ts`.

**Regras relacionadas:** R03, R72, R75.

## UC025 Gerenciar Candidaturas

**Objetivo:** Consultar candidaturas e registrar sua movimentação no processo seletivo.

**Ator:** Recrutador ou administrador autorizado

**Pré-condições:** Sessão válida; vínculo autorizado com a empresa e a vaga; candidatura e etapa compatíveis.

### Fluxo principal

1. O gestor abre o painel de candidaturas de uma vaga autorizada.
2. O sistema valida o vínculo com a empresa e apresenta os candidatos.
3. O gestor seleciona uma candidatura e informa etapa, situação ou feedback.
4. O servidor verifica a compatibilidade entre candidatura, vaga e etapa.
5. O sistema grava a movimentação, registra a auditoria aplicável e encaminha a notificação elegível.

### Fluxos alternativos e exceções

- A1 — Nova etapa, situação ou feedback: o sistema valida os vínculos, grava a mudança e registra a comunicação elegível.
- A2 — Etapa pertencente a outra vaga: a movimentação é recusada.
- A3 — Ausência de candidatos ou filtro sem resultado: o painel apresenta um estado vazio; nenhum registro é criado.

**Pós-condição de sucesso:** Movimentação da candidatura persistida com os vínculos corretos.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/services/job.service.ts`.

**Regras relacionadas:** R04, R79, R80.

## UC026 Avaliar Resposta

**Objetivo:** Avaliar a resposta segundo o tipo de atividade e produzir um resultado consistente.

**Ator:** Sistema, acionado pela resposta do Usuário

**Pré-condições:** Resposta recebida em contexto de atividade válida; critérios de avaliação disponíveis no servidor.

### Fluxo principal

1. O sistema recebe a resposta e identifica a atividade e seu tipo.
2. O avaliador do servidor valida formato e contexto.
3. O sistema compara a resposta aos critérios ou aciona UC027 quando houver execução de código.
4. O sistema produz um resultado de acerto, falha ou indisponibilidade.
5. Em uma submissão elegível, o sistema confirma tentativa, progresso e emissão de desempenho por UC007.

### Fluxos alternativos e exceções

- A1 — Atividade de código: a avaliação usa a execução e os testes de UC027 quando necessários.
- A2 — Atividade objetiva ou interativa: a resposta é comparada ao formato e ao critério da atividade, sem exigir um executor externo.
- A3 — Modo de prévia: o resultado retorna ao usuário sem creditar conclusão.
- A4 — Primeira aprovação confirmada: os registros de progresso e desempenho elegíveis são atualizados, sem duplicar o crédito em repetições.

**Pós-condição de sucesso:** Resultado da avaliação produzido e efeitos elegíveis confirmados.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/lessons/[lessonId]/attempt/route.ts`, `src/lib/exercises/repository.ts`, `src/lib/learning/assessment.ts`, `src/lib/learning/lesson-progress.ts`.

**Regras relacionadas:** R12, R13, R14, R15, R16, R17, R18, R19, R25.

## UC027 Executar Código e Testes

**Objetivo:** Executar código com limites e devolver saída, erros e resultado dos testes.

**Ator:** Executor de código, acionado pelo sistema

**Pré-condições:** Requisição autorizada; linguagem suportada; código e testes compatíveis; executor disponível.

### Fluxo principal

1. O sistema prepara a requisição autorizada de código, linguagem e testes.
2. O executor recebe a requisição e aplica os limites de execução.
3. O executor executa o código e verifica os casos de teste.
4. O executor devolve saída, erros, duração e resultado técnico.
5. O serviço de origem interpreta o retorno segundo as regras da atividade ou do duelo.

### Fluxos alternativos e exceções

- A1 — Erro de sintaxe ou execução: a resposta diferencia falha do código de falha de infraestrutura.
- A2 — Tempo ou recurso excedido: a execução termina segundo os limites do executor e retorna a condição correspondente.
- A3 — Executor indisponível: o sistema informa a indisponibilidade; não converte a falha em teste aprovado.

**Pós-condição de sucesso:** Resultado técnico retornado ao fluxo de origem.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/lessons/[lessonId]/attempt/route.ts`, `src/lib/duels/judge.ts`, `src/lib/exercises/repository.ts`.

**Regras relacionadas:** R12, R13, R16, R17, R63, R64.

## UC028 Gerenciar Denúncias

**Objetivo:** Analisar uma denúncia e registrar a providência de moderação.

**Ator:** Administrador

**Pré-condições:** Sessão válida; papel administrativo; denúncia existente e acessível à moderação.

### Fluxo principal

1. O administrador abre a área de denúncias.
2. O sistema verifica o papel e apresenta os registros para análise.
3. O administrador consulta o conteúdo, o motivo e a situação da denúncia.
4. O administrador informa a providência autorizada ou a conclusão da análise.
5. O sistema registra a situação e confirma o resultado da moderação.

### Fluxos alternativos e exceções

- A1 — Denúncia procedente: o administrador confirma a medida autorizada e o sistema registra o resultado.
- A2 — Denúncia improcedente ou já tratada: o registro segue a situação correspondente sem repetir a ação.
- A3 — Recurso removido ou dados insuficientes: o sistema informa a condição e preserva os registros necessários à análise.

**Pós-condição de sucesso:** Análise e providência de moderação registradas.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/posts/[id]/report/route.ts`, `src/services/admin.service.ts`.

**Regras relacionadas:** R02, R03, R92.

## UC029 Fazer Denúncia

**Objetivo:** Encaminhar uma denúncia sobre uma publicação acessível.

**Ator:** Usuário

**Pré-condições:** Sessão válida; conteúdo identificável; motivo e detalhes aceitos pelo formulário.

### Fluxo principal

1. O usuário abre as opções da publicação e seleciona a denúncia.
2. O sistema apresenta os motivos e campos previstos.
3. O usuário informa o motivo e os detalhes e solicita o envio.
4. O servidor valida sessão, conteúdo e dados da denúncia.
5. O sistema registra o relato e confirma seu recebimento para moderação.

### Fluxos alternativos e exceções

- A1 — Motivo inválido ou detalhe obrigatório ausente: o sistema solicita correção.
- A2 — Conteúdo indisponível ou denúncia incompatível: o envio é recusado com retorno adequado.
- A3 — Denúncia aceita: o sistema confirma o recebimento; a denúncia não decide por si só a procedência ou a punição.

**Pós-condição de sucesso:** Denúncia recebida e disponível à moderação.

**Garantia em caso de falha:** A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.

**Implementação:** `src/app/api/posts/[id]/report/route.ts`.

**Regras relacionadas:** R02, R92.
