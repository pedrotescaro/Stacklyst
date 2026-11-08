# Requisitos funcionais, qualidade e regras de negócio

Esta identificação é própria do manual de novembro; não renumera os RF/RNF da entrega de outubro. Os IDs permitem referenciar regras em demonstrações, casos de uso e alterações futuras. As fontes citadas nos capítulos e recortes representam a implementação; os objetivos de qualidade não são automaticamente medições aprovadas.

## Diferença entre os três conceitos

**Requisito funcional** descreve uma capacidade: permitir submeter uma atividade. **Regra de negócio** limita ou decide esse comportamento: a primeira conclusão elegível pode render XP, mas uma repetição correta não rende o mesmo crédito de novo. **Requisito não funcional** descreve uma propriedade de qualidade: resistir a pedidos concorrentes sem duplicar recompensa.

## Capacidades por área

| ID  | Capacidade funcional                                                   | Principal ponto de entrada                       |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| F01 | Apresentar a plataforma e encaminhar a experiência conforme identidade | `/`, `HomeClient`                                |
| F02 | Registrar conta e confirmar identidade                                 | `/register`, APIs de autenticação                |
| F03 | Entrar, sair e recuperar acesso                                        | `/login`, `/forgot-password`, `/reset-password`  |
| F04 | Escolher curso/linguagem e modo de navegação das trilhas               | `/trails`                                        |
| F05 | Consultar caminhos, nós, pré-requisitos e recomendações                | Mapa de conhecimentos e `learning/repository.ts` |
| F06 | Abrir lições e consultar progresso                                     | `/lesson/[lessonId]`                             |
| F07 | Responder atividades de tipos diferentes                               | API de tentativa de lição                        |
| F08 | Executar código de exercício como prévia                               | API `run` de exercício                           |
| F09 | Submeter exercício e registrar evidência                               | API `submit` de exercício                        |
| F10 | Apresentar ajuda conforme modo de assistência                          | Workspace de exercícios                          |
| F11 | Conferir etapas especiais de trilha, baús e saltos                     | APIs de checkpoint, chest e jump                 |
| F12 | Acompanhar XP, nível, faixa e posição                                  | Barras de progresso e ranking                    |
| F13 | Emitir e consultar credenciais elegíveis                               | Coleção de credenciais                           |
| F14 | Verificar credencial publicamente e gerar PDF                          | `/certificates/[id]` e APIs relacionadas         |
| F15 | Criar publicações com conteúdo e recursos permitidos                   | Editor e `/api/posts`                            |
| F16 | Consultar feed por filtros, busca e paginação                          | `/feed`, `PostService.getFeed`                   |
| F17 | Responder e encadear comentários                                       | Detalhe de publicação                            |
| F18 | Reagir, votar em enquete e salvar publicações                          | Ações do post                                    |
| F19 | Personalizar perfil e consultar conquistas                             | Perfil e personalização                          |
| F20 | Seguir, descobrir sugestões e bloquear contas                          | Perfil, busca e configurações                    |
| F21 | Consultar e marcar notificações                                        | `/notifications`                                 |
| F22 | Enviar mensagens, consultar conversas e histórico                      | `/messages`                                      |
| F23 | Consultar e remover itens salvos                                       | `/bookmarks`                                     |
| F24 | Configurar preferências da aplicação e da conta                        | `/settings`                                      |
| F25 | Entrar no Mundinho e personalizar personagem                           | `AdventureHub`                                   |
| F26 | Consultar saldo, inventário, equipamentos e extrato                    | API `/api/mundinho`                              |
| F27 | Resgatar check-in e baú da clareira                                    | Ações autenticadas do RPG                        |
| F28 | Enfrentar criaturas e resolver desafios de código                      | Batalha do Mundinho                              |
| F29 | Convidar amigo mútuo para arena privada                                | Portal e pop-up multiplayer                      |
| F30 | Sincronizar presença, aparência e movimento                            | Sala da arena                                    |
| F31 | Disputar combate PvP por turnos com equipamentos                       | `MultiplayerArena`                               |
| F32 | Convidar e aceitar duelo competitivo                                   | `/duels`, `DuelService`                          |
| F33 | Executar, submeter e comparar soluções de duelo                        | Rotas de duelo e juiz                            |
| F34 | Resolver prazo, abandono, empate e revisão                             | Manutenção e resolução de duelos                 |
| F35 | Solicitar credenciamento como avaliador                                | `/evaluators/apply`                              |
| F36 | Administrar candidaturas e situação de avaliadores                     | Painel de administração                          |
| F37 | Emitir parecer humano quando autorizado                                | `/evaluations`                                   |
| F38 | Criar e gerir empresa autorizada                                       | Gestão de empresas                               |
| F39 | Criar e listar vagas com etapas                                        | `/jobs`, `/recruiter`                            |
| F40 | Candidatar-se e consultar a própria candidatura                        | Detalhe da vaga                                  |
| F41 | Acompanhar e movimentar candidatura no funil                           | Painel do recrutador                             |
| F42 | Consultar eventos e hackathons                                         | `/events`                                        |
| F43 | Inscrever-se e cancelar participação elegível                          | `EventService`                                   |
| F44 | Gerenciar desafios de evento                                           | `EventChallengeService`                          |
| F45 | Gerir recursos administrativos e registrar auditoria                   | `/admin`                                         |
| F46 | Utilizar recursos equivalentes no cliente mobile                       | APIs mobile e aplicativo Expo                    |
| F47 | Importar comunidade editorial sem resetar o banco                      | `community:seed`                                 |
| F48 | Consultar e responder quiz diário                                      | APIs de quiz e `generateDailyQuiz`               |
| F50 | Votar em enquetes e denunciar conteúdo                                 | Ações da publicação                              |
| F51 | Enviar mídia pelo contrato do endpoint correspondente                  | Upload e recursos de mídia                       |

## Regras de identidade e acesso

| ID  | Regra                                                                                     | Fonte de decisão                        |
| --- | ----------------------------------------------------------------------------------------- | --------------------------------------- |
| R01 | A identidade de uma operação protegida vem da sessão, não de `userId` livre no payload    | `auth.ts`, rotas protegidas             |
| R02 | Permissão depende também do recurso: propriedade, participação, audiência e bloqueios     | Serviços de acesso por domínio          |
| R03 | Papel e estado de avaliador não são concedidos por nome, título, cor ou metadata editável | Fluxo de candidatura e administração    |
| R04 | Recrutador não pode administrar automaticamente qualquer empresa                          | `requireCompanyAccess`                  |
| R05 | Seguir é direcional; amizade mútua requer ambas as relações                               | `Follow`, regras da arena               |
| R06 | Bloqueio interfere em interações e consultas, não somente na apresentação                 | `BlockService`, filtros de visibilidade |
| R07 | Paginação e conhecimento do ID não concedem acesso ao recurso                             | Serviços de acesso e consultas          |

## Regras pedagógicas e de progresso

| ID  | Regra                                                                                                                  | Consequência                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| R08 | Nó e lição têm representações e regras de acesso distintas                                                             | Não substituir pré-requisitos de lição por cor do nó                 |
| R09 | `MASTERED`, `COMPLETED` e `IN_PROGRESS` persistidos são preservados na derivação de disponibilidade do nó              | Recomendações não apagam histórico                                   |
| R10 | Requisito obrigatório não concluído mantém o nó ainda não iniciado indisponível na derivação                           | Relação recomendada não equivale a obrigatória                       |
| R11 | Lição já concluída legitimamente continua revisável após mudança de pré-requisitos                                     | Atualizar currículo não deve impedir revisão                         |
| R12 | A API identifica a etapa no catálogo e avalia no servidor                                                              | Cliente não escolhe o gabarito                                       |
| R13 | `run` de lição retorna prévia com `xpEarned: 0`                                                                        | Rodar não conclui                                                    |
| R14 | Primeiro acerto elegível é determinado sob lock por usuário                                                            | Pedidos concorrentes não podem duplicar o mesmo crédito              |
| R15 | Repetir uma etapa já correta não concede novamente seu XP                                                              | Revisão e recompensa são operações diferentes                        |
| R16 | Falha operacional do executor retorna indisponibilidade, sem converter isso em conclusão ou erro pedagógico confirmado | A tentativa pode ser refeita                                         |
| R17 | A serialização pública remove soluções, gabaritos e testes internos                                                    | Catálogo interno não é DTO público                                   |
| R18 | Os multiplicadores atuais de assistência são todos 1 e os bônus de domínio são 0                                       | Modo mais difícil não cria bônus inexistente                         |
| R19 | Completar exercícios não prova domínio independente medido                                                             | A conclusão atual deriva `COMPLETED`, não `MASTERED` automaticamente |
| R20 | IDs de etapas ligam currículo a registros persistidos                                                                  | Reordenar/renomear exige tratar compatibilidade                      |
| R21 | Resgates especiais de trilha não podem ser respondidos como quiz comum                                                 | Prefixos de recibos/checkpoints são protegidos                       |

Os valores-base em `LEARNING_XP` são 0 para conceito, 10 para recordação, 15 para atividade guiada, 25 para código e 40 para projeto; o catálogo pode declarar valores próprios. O valor efetivamente creditado vem da atividade elegível, não de uma multiplicação escolhida pela interface.

## XP, ranking e reconhecimento

| ID  | Regra                                                                           | Fonte                                    |
| --- | ------------------------------------------------------------------------------- | ---------------------------------------- |
| R22 | XP total, XP por linguagem e movimentações por período não são a mesma consulta | `xp.ts`, `learning/xp-periods.ts`        |
| R23 | Ranking geral ordena XP decrescente, username crescente e ID crescente          | `XP_RANK_ORDER`                          |
| R24 | Faixa competitiva visual e nível numérico usam limites diferentes               | `getXpBand`, `calculateLevel`            |
| R25 | Credencial depende de evidência e snapshot de requisitos                        | `credentials/repository.ts`              |
| R26 | Ler credenciais de perfil público não deve emitir novas credenciais             | `getEarnedCredentials`                   |
| R27 | Revogação ou falha de integridade muda a validade consultada                    | Repositório e integridade de credenciais |
| R28 | Título visual não equivale a certificado e não concede autorização              | Perfil e credenciais                     |

Limites numéricos de nível: 1 começa em 0; 2 em 500; 3 em 800; 4 em 1.100; 5 em 1.500; 6 em 2.000. A partir daí, o primeiro incremento é 600 e cresce 100 por nível. As faixas visuais começam em 0, 500, 1.200, 2.500 e 5.000 XP. Portanto, “nível 3” e “faixa Ouro” não são sinônimos.

## Regras sociais

| ID  | Regra                                                                                         | Fonte                                     |
| --- | --------------------------------------------------------------------------------------------- | ----------------------------------------- |
| R29 | `audience` e bloqueios são aplicados antes de entregar conteúdo                               | `visiblePostWhere`, `assertPostAudience`  |
| R30 | `client_id` identifica repetição da criação de post por autor                                 | `PostService.create`, unicidade do schema |
| R31 | Resposta pode apontar para outra resposta, mas continua vinculada ao mesmo post               | Modelo `Answer` e rota de resposta        |
| R32 | Reação de post é única por usuário/post; troca não significa nova reação independente         | `ReactionService`, `Reaction`             |
| R33 | Remover uma reação reverte seu crédito limitado, sem tornar XP negativo                       | `ReactionService`                         |
| R34 | Salvar é uma referência ao post, não uma cópia que elimina restrições de acesso               | `Bookmark` e consultas                    |
| R35 | Notificação pertence ao destinatário; o destino continua protegido                            | `NotificationService`                     |
| R36 | Mensagem é consultada entre os dois participantes identificados e sujeita a bloqueios         | `/api/messages`                           |
| R37 | Chat, reações de mensagem e reações de post têm associações distintas                         | Schema e rotas                            |
| R38 | Falha na notificação posterior não desfaz automaticamente uma mensagem/candidatura já gravada | Rotas e serviços respectivos              |

## Mundinho e multiplayer

| ID  | Regra                                                                                             | Fonte                                    |
| --- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| R39 | Saldo e inventário são confirmados no servidor                                                    | `mundinho/repository.ts`                 |
| R40 | Créditos usam chave única por usuário no extrato                                                  | `RpgTransaction`, função `credit`        |
| R41 | Baú da clareira concede 10 moedas uma vez por dia civil de São Paulo                              | Chave `chest:forest:<dia>`               |
| R42 | Check-in tem ciclo próprio e não é o mesmo resgate do baú                                         | `checkinStatus` e `CHECKIN_REWARDS`      |
| R43 | Aprendizagem elegível pode originar moedas por reconciliação incremental                          | `sourceCoins` e recibos `learning:*`     |
| R44 | Compra verifica catálogo, posse e preço do servidor                                               | Ação `buy`                               |
| R45 | Bônus só contam para itens possuídos e equipados no slot compatível                               | `equipmentStats`                         |
| R46 | Nível do encontro mostrado e nível salvo da batalha devem corresponder                            | Catálogo e snapshot `enemyLevel`         |
| R47 | Criaturas de níveis 1–5 e chefe 10 pertencem ao catálogo; o chefe 10 tem 240 PV                   | `types.ts`, `creatureStats`              |
| R48 | Chance-base de golpe direto é 75%; exercício é 25%                                                | `equipmentStats`                         |
| R49 | Sorte adiciona pontos percentuais ao golpe direto; Caça-bugs possuído e equipado o torna 100%     | Equipamentos e título                    |
| R50 | Chance de drop é um cálculo separado, base 50% mais sorte                                         | Não trocar 50 por 25 indiscriminadamente |
| R51 | Entrada multiplayer exige amizade mútua e ausência de bloqueio                                    | `arena.ts`                               |
| R52 | Nomes, aparência e nível vêm do banco; pacote de posição não é fonte de identidade                | Visão pública da arena                   |
| R53 | Os dois jogadores confirmam o início                                                              | Estado `ready` da partida                |
| R54 | Bônus de ambos são capturados no início e renovados na revanche                                   | Snapshot `match.stats`                   |
| R55 | Aplicar conceito causa 30; Depurar causa 18 e cura até 20; Refatorar causa 45 e desgasta 8        | `SKILLS`, `arena-rules.ts`               |
| R56 | Proteção do alvo reduz dano até o mínimo 1; cura respeita máximo; desgaste pode derrotar atacante | `advanceArenaTurn`                       |
| R57 | Exercício sorteado e golpe escolhido ficam presos ao turno                                        | Repetir pedido não muda o sorteio        |
| R58 | Turno PvP dura 120 segundos; após 20 turnos a vida restante desempata ou empata                   | Regras puras da arena                    |
| R59 | PvP do Mundinho não concede XP/moedas                                                             | Evita anunciar recompensa ausente        |
| R60 | Respostas antigas não devem sobrescrever snapshots mais novos da mesma sala                       | Versão da sala e cliente                 |

## Duelos e avaliadores

| ID  | Regra                                                                                                                | Fonte                           |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| R61 | Convite direto expira em 72 h; publicação opcional usa janela pública de 24 h                                        | `duels/constants.ts`, convites  |
| R62 | Partida competitiva tem limite de 2 h após início                                                                    | Constantes e manutenção         |
| R63 | Testar código não é submeter uma solução competitiva                                                                 | Rotas `run` e `solution`        |
| R64 | Correção antecede comparação de eficiência                                                                           | `decideDuelResolution`          |
| R65 | Código aceito e sintaxe normalizada igual encaminham revisão                                                         | Não é prova de plágio           |
| R66 | Big-O só desempata quando as duas estimativas têm confiança comparável prevista                                      | Política atual                  |
| R67 | Linhas úteis/instruções são critério posterior; runtime bruto não escolhe vencedor                                   | Análise de fonte e política     |
| R68 | Códigos diferentes ainda equivalentes podem encerrar em empate automático                                            | `technical_draw`                |
| R69 | Vitória concede 50 XP uma vez; derrota não subtrai XP                                                                | Resolução persistida            |
| R70 | Três abandonos consecutivos após compromisso levam a cooldown de 24 h                                                | Política de abandono            |
| R71 | Recusar ou deixar expirar convite não equivale a abandonar partida aceita                                            | Convites versus partidas        |
| R72 | Candidatura a avaliador exige trilha completa ou 1.000 XP, motivação mínima de 80 caracteres e tecnologias elegíveis | Política e serviço de avaliador |
| R73 | Participante não emite parecer sobre seu próprio duelo                                                               | Verificação de conflito         |
| R74 | Parecer exige papel, status e compatibilidade técnica; revisão concluída rende 10 XP ao avaliador                    | Serviço de avaliador            |
| R75 | Estado de reputação considera limites 80 para ativo e 60 para suspensão                                              | `evaluators/policy.ts`          |

## Recrutamento e eventos

| ID  | Regra                                                                                                    | Fonte                                |
| --- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| R76 | Vaga deve existir e estar aberta para aceitar candidatura                                                | `applyForJob`                        |
| R77 | Usuário/vaga é uma candidatura única                                                                     | `JobApplication`                     |
| R78 | Nova candidatura começa em `APPLIED` e aponta à primeira etapa quando existente                          | Serviço de vagas                     |
| R79 | Gestão de candidatos exige acesso à empresa; feedback interno não é dado da listagem pública             | Rotas e `JobService`                 |
| R80 | Movimentação registra status/etapa e auditoria na transação                                              | `updateApplicationStage`             |
| R81 | Inscrição de evento é única por evento/usuário                                                           | `EventParticipant`                   |
| R82 | Inscrição confere capacidade e nível, sob serialização por evento                                        | `participate`                        |
| R83 | Evento encerrado não admite nova inscrição/cancelamento nos fluxos correspondentes                       | Datas e status efetivo               |
| R84 | Participação começa com score zero; inscrever-se não distribui automaticamente toda recompensa declarada | Serviço de eventos                   |
| R85 | Conjunto de desafios editável contém 3–20 desafios, cada um com 1–5 exemplos                             | `event-challenges.ts`                |
| R86 | Só gestor autorizado recebe resposta esperada no gerenciamento de desafios                               | Serviço de desafios                  |
| R87 | Tipo hackathon não comprova fluxo completo de equipes, submissões e julgamento                           | Limite da implementação identificada |
| R88 | Importação editorial usa identidades reservadas e IDs estáveis; não reseta a comunidade                  | `demo-community/publish.ts`          |

## Regras complementares de comunidade

| ID  | Regra                                                                                                                                          | Fonte                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| R89 | Quiz diário seleciona no máximo uma questão revisada relacionada a posts por dia UTC, sem geração por IA; não usa posts restritos a seguidores | `daily-quiz.service.ts`         |
| R91 | Voto de enquete pertence à enquete/opção e não é uma reação genérica de post                                                                   | Rotas de enquete e schema       |
| R92 | Denúncia registra ocorrência para gestão; não concede poder de exclusão ao denunciante                                                         | Rotas de report e administração |
| R93 | A rota genérica de imagem limita a 5 MiB, aceita JPEG/PNG/GIF/WebP e verifica assinatura do arquivo                                            | `/api/upload`                   |

## Qualidade: propriedades e evidências necessárias

| ID  | Propriedade esperada                    | Evidência adequada e limite                                          |
| --- | --------------------------------------- | -------------------------------------------------------------------- |
| Q01 | Controle de acesso por recurso          | Testes com proprietário, terceiro e papéis; esconder botão não basta |
| Q02 | Integridade de recompensas              | Testes de primeira conclusão, replay e concorrência real             |
| Q03 | Privacidade de gabaritos e candidaturas | Verificação do DTO, APIs e páginas                                   |
| Q04 | Responsividade e uso por teclado        | Capturas e interação nos tamanhos/entradas suportados                |
| Q05 | Resistência a falhas externas           | Testes de indisponibilidade e preservação de progresso               |
| Q06 | Observabilidade sem segredos            | Código de erro, request ID e auditoria sem tokens/senhas             |
| Q07 | Consultas limitadas e paginação         | Filtros antes da seleção, limites, cursores e índices adequados      |
| Q08 | Manutenibilidade                        | Contratos, funções puras, referências de código e testes relevantes  |
| Q09 | Compatibilidade de histórico            | IDs estáveis, snapshots e migrações versionadas                      |
| Q10 | Integridade documental                  | Links, fontes de diagramas, trechos sincronizados e data da base     |
| Q11 | Reprodutibilidade                       | Lockfiles, scripts e distinção de dependências externas              |
| Q12 | Confirmação clara na interface          | Estado de espera, erro recuperável e resposta confirmada             |

Não se atribui SLA, tempo de resposta garantido ou conformidade legal integral sem medição e avaliação específica. Documentar a intenção não comprova que todas as propriedades foram testadas nesta edição.
