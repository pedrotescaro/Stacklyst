
# Stacklyst

Requisitos e regras do sistema

Laboratório de Engenharia de Software
Revisão de 3 de novembro de 2026
Base de código 6a2bfce e documentação local revisada

Pedro Antonio Silvestre Tescaro
Guilherme Alves de Campos
Paulo Henrique Leal dos Santos

Esta edição atualiza os modelos e a especificação do sistema. Os diagramas de atividades do negócio aprovados permanecem no documento 02, preservado integralmente. Os modelos revisados são editáveis no Astah UML. Cadastro e acesso usam o ator Usuário e declaram as pré-condições de sessão em cada caso.

As afirmações descrevem a fonte de implementação. Credenciais, infraestrutura externa, dispositivos e migrations dependem das verificações de ambiente indicadas. Esta revisão documental não representa execução de todos os fluxos em produção.


## Roteiro de leitura

O sumário é atualizado na exportação pelo Word. As fontes editáveis e a matriz de rastreabilidade acompanham o pacote.


## Requisitos funcionais, qualidade e regras de negócio

Esta identificação é própria do manual de novembro; não renumera os RF/RNF da entrega de outubro. Os IDs permitem referenciar regras em demonstrações, casos de uso e alterações futuras. As fontes citadas nos capítulos e recortes representam a implementação; os objetivos de qualidade não são automaticamente medições aprovadas.


### Diferença entre os três conceitos

Requisito funcional descreve uma capacidade: permitir submeter uma atividade. Regra de negócio limita ou decide esse comportamento: a primeira conclusão elegível pode render XP, mas uma repetição correta não rende o mesmo crédito de novo. Requisito não funcional descreve uma propriedade de qualidade: resistir a pedidos concorrentes sem duplicar recompensa.


### Capacidades por área

| ID | Capacidade funcional | Principal ponto de entrada |
| --- | --- | --- |
| F01 | Apresentar a plataforma e encaminhar a experiência conforme identidade | /, HomeClient |
| F02 | Registrar conta e confirmar identidade | /register, APIs de autenticação |
| F03 | Entrar, sair e recuperar acesso | /login, /forgot-password, /reset-password |
| F04 | Escolher curso/linguagem e modo de navegação das trilhas | /trails |
| F05 | Consultar caminhos, nós, pré-requisitos e recomendações | Mapa de conhecimentos e learning/repository.ts |
| F06 | Abrir lições e consultar progresso | /lesson/[lessonId] |
| F07 | Responder atividades de tipos diferentes | API de tentativa de lição |
| F08 | Executar código de exercício como prévia | API run de exercício |
| F09 | Submeter exercício e registrar evidência | API submit de exercício |
| F10 | Apresentar ajuda conforme modo de assistência | Workspace de exercícios |
| F11 | Conferir etapas especiais de trilha, baús e saltos | APIs de checkpoint, chest e jump |
| F12 | Acompanhar XP, nível, faixa e posição | Barras de progresso e ranking |
| F13 | Emitir e consultar credenciais elegíveis | Coleção de credenciais |
| F14 | Verificar credencial publicamente e gerar PDF | /certificates/[id] e APIs relacionadas |
| F15 | Criar publicações com conteúdo e recursos permitidos | Editor e /api/posts |
| F16 | Consultar feed por filtros, busca e paginação | /feed, PostService.getFeed |
| F17 | Responder e encadear comentários | Detalhe de publicação |
| F18 | Reagir, votar em enquete e salvar publicações | Ações do post |
| F19 | Personalizar perfil e consultar conquistas | Perfil e personalização |
| F20 | Seguir, descobrir sugestões e bloquear contas | Perfil, busca e configurações |
| F21 | Consultar e marcar notificações | /notifications |
| F22 | Enviar mensagens, consultar conversas e histórico | /messages |
| F23 | Consultar e remover itens salvos | /bookmarks |
| F24 | Configurar preferências da aplicação e da conta | /settings |
| F25 | Entrar no Mundinho e personalizar personagem | AdventureHub |
| F26 | Consultar saldo, inventário, equipamentos e extrato | API /api/mundinho |
| F27 | Resgatar check-in e baú da clareira | Ações autenticadas do RPG |
| F28 | Enfrentar criaturas e resolver desafios de código | Batalha do Mundinho |
| F29 | Convidar amigo mútuo para arena privada | Portal e pop-up multiplayer |
| F30 | Sincronizar presença, aparência e movimento | Sala da arena |
| F31 | Disputar combate PvP por turnos com equipamentos | MultiplayerArena |
| F32 | Convidar e aceitar duelo competitivo | /duels, DuelService |
| F33 | Executar, submeter e comparar soluções de duelo | Rotas de duelo e juiz |
| F34 | Resolver prazo, abandono, empate e revisão | Manutenção e resolução de duelos |
| F35 | Solicitar credenciamento como avaliador | /evaluators/apply |
| F36 | Administrar candidaturas e situação de avaliadores | Painel de administração |
| F37 | Emitir parecer humano quando autorizado | /evaluations |
| F38 | Criar e gerir empresa autorizada | Gestão de empresas |
| F39 | Criar e listar vagas com etapas | /jobs, /recruiter |
| F40 | Candidatar-se e consultar a própria candidatura | Detalhe da vaga |
| F41 | Acompanhar e movimentar candidatura no funil | Painel do recrutador |
| F42 | Consultar eventos e hackathons | /events |
| F43 | Inscrever-se e cancelar participação elegível | EventService |
| F44 | Gerenciar desafios de evento | EventChallengeService |
| F45 | Gerir recursos administrativos e registrar auditoria | /admin |
| F46 | Utilizar recursos equivalentes no cliente mobile | APIs mobile e aplicativo Expo |
| F47 | Importar comunidade editorial sem resetar o banco | community:seed |
| F48 | Consultar e responder quiz diário | APIs de quiz e generateDailyQuiz |
| F50 | Votar em enquetes e denunciar conteúdo | Ações da publicação |
| F51 | Enviar mídia pelo contrato do endpoint correspondente | Upload e recursos de mídia |


### Regras de identidade e acesso

| ID | Regra | Fonte de decisão |
| --- | --- | --- |
| R01 | A identidade de uma operação protegida vem da sessão, não de userId livre no payload | auth.ts, rotas protegidas |
| R02 | Permissão depende também do recurso: propriedade, participação, audiência e bloqueios | Serviços de acesso por domínio |
| R03 | Papel e estado de avaliador não são concedidos por nome, título, cor ou metadata editável | Fluxo de candidatura e administração |
| R04 | Recrutador não pode administrar automaticamente qualquer empresa | requireCompanyAccess |
| R05 | Seguir é direcional; amizade mútua requer ambas as relações | Follow, regras da arena |
| R06 | Bloqueio interfere em interações e consultas, não somente na apresentação | BlockService, filtros de visibilidade |
| R07 | Paginação e conhecimento do ID não concedem acesso ao recurso | Serviços de acesso e consultas |


### Regras pedagógicas e de progresso

| ID | Regra | Consequência |
| --- | --- | --- |
| R08 | Nó e lição têm representações e regras de acesso distintas | Não substituir pré-requisitos de lição por cor do nó |
| R09 | MASTERED, COMPLETED e IN_PROGRESS persistidos são preservados na derivação de disponibilidade do nó | Recomendações não apagam histórico |
| R10 | Requisito obrigatório não concluído mantém o nó ainda não iniciado indisponível na derivação | Relação recomendada não equivale a obrigatória |
| R11 | Lição já concluída legitimamente continua revisável após mudança de pré-requisitos | Atualizar currículo não deve impedir revisão |
| R12 | A API identifica a etapa no catálogo e avalia no servidor | Cliente não escolhe o gabarito |
| R13 | run de lição retorna prévia com xpEarned: 0 | Rodar não conclui |
| R14 | Primeiro acerto elegível é determinado sob lock por usuário | Pedidos concorrentes não podem duplicar o mesmo crédito |
| R15 | Repetir uma etapa já correta não concede novamente seu XP | Revisão e recompensa são operações diferentes |
| R16 | Falha operacional do executor retorna indisponibilidade, sem converter isso em conclusão ou erro pedagógico confirmado | A tentativa pode ser refeita |
| R17 | A serialização pública remove soluções, gabaritos e testes internos | Catálogo interno não é DTO público |
| R18 | Os multiplicadores atuais de assistência são todos 1 e os bônus de domínio são 0 | Modo mais difícil não cria bônus inexistente |
| R19 | Completar exercícios não prova domínio independente medido | A conclusão atual deriva COMPLETED, não MASTERED automaticamente |
| R20 | IDs de etapas ligam currículo a registros persistidos | Reordenar/renomear exige tratar compatibilidade |
| R21 | Resgates especiais de trilha não podem ser respondidos como quiz comum | Prefixos de recibos/checkpoints são protegidos |

Os valores-base em LEARNING_XP são 0 para conceito, 10 para recordação, 15 para atividade guiada, 25 para código e 40 para projeto; o catálogo pode declarar valores próprios. O valor efetivamente creditado vem da atividade elegível, não de uma multiplicação escolhida pela interface.


### XP, ranking e reconhecimento

| ID | Regra | Fonte |
| --- | --- | --- |
| R22 | XP total, XP por linguagem e movimentações por período não são a mesma consulta | xp.ts, learning/xp-periods.ts |
| R23 | Ranking geral ordena XP decrescente, username crescente e ID crescente | XP_RANK_ORDER |
| R24 | Faixa competitiva visual e nível numérico usam limites diferentes | getXpBand, calculateLevel |
| R25 | Credencial depende de evidência e snapshot de requisitos | credentials/repository.ts |
| R26 | Ler credenciais de perfil público não deve emitir novas credenciais | getEarnedCredentials |
| R27 | Revogação ou falha de integridade muda a validade consultada | Repositório e integridade de credenciais |
| R28 | Título visual não equivale a certificado e não concede autorização | Perfil e credenciais |

Limites numéricos de nível: 1 começa em 0; 2 em 500; 3 em 800; 4 em 1.100; 5 em 1.500; 6 em 2.000. A partir daí, o primeiro incremento é 600 e cresce 100 por nível. As faixas visuais começam em 0, 500, 1.200, 2.500 e 5.000 XP. Portanto, “nível 3” e “faixa Ouro” não são sinônimos.


### Regras sociais

| ID | Regra | Fonte |
| --- | --- | --- |
| R29 | audience e bloqueios são aplicados antes de entregar conteúdo | visiblePostWhere, assertPostAudience |
| R30 | client_id identifica repetição da criação de post por autor | PostService.create, unicidade do schema |
| R31 | Resposta pode apontar para outra resposta, mas continua vinculada ao mesmo post | Modelo Answer e rota de resposta |
| R32 | Reação de post é única por usuário/post; troca não significa nova reação independente | ReactionService, Reaction |
| R33 | Remover uma reação reverte seu crédito limitado, sem tornar XP negativo | ReactionService |
| R34 | Salvar é uma referência ao post, não uma cópia que elimina restrições de acesso | Bookmark e consultas |
| R35 | Notificação pertence ao destinatário; o destino continua protegido | NotificationService |
| R36 | Mensagem é consultada entre os dois participantes identificados e sujeita a bloqueios | /api/messages |
| R37 | Chat, reações de mensagem e reações de post têm associações distintas | Schema e rotas |
| R38 | Falha na notificação posterior não desfaz automaticamente uma mensagem/candidatura já gravada | Rotas e serviços respectivos |


### Mundinho e multiplayer

| ID | Regra | Fonte |
| --- | --- | --- |
| R39 | Saldo e inventário são confirmados no servidor | mundinho/repository.ts |
| R40 | Créditos usam chave única por usuário no extrato | RpgTransaction, função credit |
| R41 | Baú da clareira concede 10 moedas uma vez por dia civil de São Paulo | Chave chest:forest:&lt;dia&gt; |
| R42 | Check-in tem ciclo próprio e não é o mesmo resgate do baú | checkinStatus e CHECKIN_REWARDS |
| R43 | Aprendizagem elegível pode originar moedas por reconciliação incremental | sourceCoins e recibos learning:* |
| R44 | Compra verifica catálogo, posse e preço do servidor | Ação buy |
| R45 | Bônus só contam para itens possuídos e equipados no slot compatível | equipmentStats |
| R46 | Nível do encontro mostrado e nível salvo da batalha devem corresponder | Catálogo e snapshot enemyLevel |
| R47 | Criaturas de níveis 1–5 e chefe 10 pertencem ao catálogo; o chefe 10 tem 240 PV | types.ts, creatureStats |
| R48 | Chance-base de golpe direto é 75%; exercício é 25% | equipmentStats |
| R49 | Sorte adiciona pontos percentuais ao golpe direto; Caça-bugs possuído e equipado o torna 100% | Equipamentos e título |
| R50 | Chance de drop é um cálculo separado, base 50% mais sorte | Não trocar 50 por 25 indiscriminadamente |
| R51 | Entrada multiplayer exige amizade mútua e ausência de bloqueio | arena.ts |
| R52 | Nomes, aparência e nível vêm do banco; pacote de posição não é fonte de identidade | Visão pública da arena |
| R53 | Os dois jogadores confirmam o início | Estado ready da partida |
| R54 | Bônus de ambos são capturados no início e renovados na revanche | Snapshot match.stats |
| R55 | Aplicar conceito causa 30; Depurar causa 18 e cura até 20; Refatorar causa 45 e desgasta 8 | SKILLS, arena-rules.ts |
| R56 | Proteção do alvo reduz dano até o mínimo 1; cura respeita máximo; desgaste pode derrotar atacante | advanceArenaTurn |
| R57 | Exercício sorteado e golpe escolhido ficam presos ao turno | Repetir pedido não muda o sorteio |
| R58 | Turno PvP dura 120 segundos; após 20 turnos a vida restante desempata ou empata | Regras puras da arena |
| R59 | PvP do Mundinho não concede XP/moedas | Evita anunciar recompensa ausente |
| R60 | Respostas antigas não devem sobrescrever snapshots mais novos da mesma sala | Versão da sala e cliente |


### Duelos e avaliadores

| ID | Regra | Fonte |
| --- | --- | --- |
| R61 | Convite direto expira em 72 h; publicação opcional usa janela pública de 24 h | duels/constants.ts, convites |
| R62 | Partida competitiva tem limite de 2 h após início | Constantes e manutenção |
| R63 | Testar código não é submeter uma solução competitiva | Rotas run e solution |
| R64 | Correção antecede comparação de eficiência | decideDuelResolution |
| R65 | Código aceito e sintaxe normalizada igual encaminham revisão | Não é prova de plágio |
| R66 | Big-O só desempata quando as duas estimativas têm confiança comparável prevista | Política atual |
| R67 | Linhas úteis/instruções são critério posterior; runtime bruto não escolhe vencedor | Análise de fonte e política |
| R68 | Códigos diferentes ainda equivalentes podem encerrar em empate automático | technical_draw |
| R69 | Vitória concede 50 XP uma vez; derrota não subtrai XP | Resolução persistida |
| R70 | Três abandonos consecutivos após compromisso levam a cooldown de 24 h | Política de abandono |
| R71 | Recusar ou deixar expirar convite não equivale a abandonar partida aceita | Convites versus partidas |
| R72 | Candidatura a avaliador exige trilha completa ou 1.000 XP, motivação mínima de 80 caracteres e tecnologias elegíveis | Política e serviço de avaliador |
| R73 | Participante não emite parecer sobre seu próprio duelo | Verificação de conflito |
| R74 | Parecer exige papel, status e compatibilidade técnica; revisão concluída rende 10 XP ao avaliador | Serviço de avaliador |
| R75 | Estado de reputação considera limites 80 para ativo e 60 para suspensão | evaluators/policy.ts |


### Recrutamento e eventos

| ID | Regra | Fonte |
| --- | --- | --- |
| R76 | Vaga deve existir e estar aberta para aceitar candidatura | applyForJob |
| R77 | Usuário/vaga é uma candidatura única | JobApplication |
| R78 | Nova candidatura começa em APPLIED e aponta à primeira etapa quando existente | Serviço de vagas |
| R79 | Gestão de candidatos exige acesso à empresa; feedback interno não é dado da listagem pública | Rotas e JobService |
| R80 | Movimentação registra status/etapa e auditoria na transação | updateApplicationStage |
| R81 | Inscrição de evento é única por evento/usuário | EventParticipant |
| R82 | Inscrição confere capacidade e nível, sob serialização por evento | participate |
| R83 | Evento encerrado não admite nova inscrição/cancelamento nos fluxos correspondentes | Datas e status efetivo |
| R84 | Participação começa com score zero; inscrever-se não distribui automaticamente toda recompensa declarada | Serviço de eventos |
| R85 | Conjunto de desafios editável contém 3–20 desafios, cada um com 1–5 exemplos | event-challenges.ts |
| R86 | Só gestor autorizado recebe resposta esperada no gerenciamento de desafios | Serviço de desafios |
| R87 | Tipo hackathon não comprova fluxo completo de equipes, submissões e julgamento | Limite da implementação identificada |
| R88 | Importação editorial usa identidades reservadas e IDs estáveis; não reseta a comunidade | demo-community/publish.ts |


### Regras complementares de comunidade

| ID | Regra | Fonte |
| --- | --- | --- |
| R89 | Quiz diário seleciona no máximo uma questão revisada relacionada a posts por dia UTC, sem geração por IA; não usa posts restritos a seguidores | daily-quiz.service.ts |
| R91 | Voto de enquete pertence à enquete/opção e não é uma reação genérica de post | Rotas de enquete e schema |
| R92 | Denúncia registra ocorrência para gestão; não concede poder de exclusão ao denunciante | Rotas de report e administração |
| R93 | A rota genérica de imagem limita a 5 MiB, aceita JPEG/PNG/GIF/WebP e verifica assinatura do arquivo | /api/upload |


### Qualidade: propriedades e evidências necessárias

| ID | Propriedade esperada | Evidência adequada e limite |
| --- | --- | --- |
| Q01 | Controle de acesso por recurso | Testes com proprietário, terceiro e papéis; esconder botão não basta |
| Q02 | Integridade de recompensas | Testes de primeira conclusão, replay e concorrência real |
| Q03 | Privacidade de gabaritos e candidaturas | Verificação do DTO, APIs e páginas |
| Q04 | Responsividade e uso por teclado | Capturas e interação nos tamanhos/entradas suportados |
| Q05 | Resistência a falhas externas | Testes de indisponibilidade e preservação de progresso |
| Q06 | Observabilidade sem segredos | Código de erro, request ID e auditoria sem tokens/senhas |
| Q07 | Consultas limitadas e paginação | Filtros antes da seleção, limites, cursores e índices adequados |
| Q08 | Manutenibilidade | Contratos, funções puras, referências de código e testes relevantes |
| Q09 | Compatibilidade de histórico | IDs estáveis, snapshots e migrações versionadas |
| Q10 | Integridade documental | Links, fontes de diagramas, trechos sincronizados e data da base |
| Q11 | Reprodutibilidade | Lockfiles, scripts e distinção de dependências externas |
| Q12 | Confirmação clara na interface | Estado de espera, erro recuperável e resposta confirmada |

Não se atribui SLA, tempo de resposta garantido ou conformidade legal integral sem medição e avaliação específica. Documentar a intenção não comprova que todas as propriedades foram testadas nesta edição.


## Qualidade do sistema e classificação dos requisitos não funcionais

Esta seção aplica as duas referências visuais fornecidas pelo grupo: a classificação de requisitos não funcionais em produto, organização e fatores externos; e a divisão dos fatores de McCall em operação, revisão e transição do produto. Elas complementam a referência de UML de Gilleanes Guedes. As imagens orientam a análise; não são evidência de que a plataforma já atingiu todos os critérios.


### Como ler requisitos de qualidade

Um RF informa a capacidade oferecida. Uma RN define uma política de decisão do domínio. Um RNF caracteriza a qualidade, uma restrição técnica ou uma condição de operação. A matriz conserva F, R e Q como IDs dessas três categorias. Por exemplo, submeter uma resposta é RF; creditar apenas a primeira conclusão elegível é RN; preservar esse limite sob pedidos concorrentes é RNF de integridade/confiabilidade.

O exemplo de matriz enviado pelo grupo usa termos de um sistema de cinema. Seus conteúdos não foram transferidos como requisitos da Stacklyst. Também se evita classificar qualquer ação de “controlar” ou “contar” automaticamente como RNF: a classificação depende do que a exigência especifica.


### Requisitos do produto

| Categoria da referência | RNF relacionados | Aplicação à Stacklyst | Evidência de aceitação |
| --- | --- | --- | --- |
| Usabilidade | Q04, Q12 | Navegação por teclado, foco, telas responsivas, feedback de espera, confirmação e erro | Percorrer uma jornada por teclado e verificar o resultado nos tamanhos suportados |
| Eficiência: desempenho | Q07 | Feed e histórico paginados, filtros de acesso antes da seleção, limites de consulta | Inspecionar consulta e cursor; medir com massa e ambiente definidos antes de prometer tempo máximo |
| Eficiência: espaço | Q07, Q09 | Evitar carregar histórico integral e conservar snapshots e IDs necessários | Verificar tamanho de resposta, limites de mídia e política de retenção aprovada |
| Dependabilidade | Q02, Q05, Q09 | Repetições, concorrência e falhas externas preservam estado e recompensas | Repetir submissão, simular indisponibilidade e executar teste concorrente com banco real |
| Segurança da informação | Q01, Q03, Q06 | Sessão e autorização por recurso; gabaritos e dados privados não aparecem em DTO público | Conferir respostas para proprietário, terceiro, recrutador, avaliador e administrador |


### Requisitos organizacionais

| Categoria da referência | RNF relacionados | Regra de trabalho documentada | Evidência |
| --- | --- | --- | --- |
| Desenvolvimento | Q08, Q10, Q11 | Contratos, schema, migrations e documentação permanecem rastreáveis à versão do código | Typecheck, testes pertinentes, revisão de mudança e conferência das referências |
| Operacionais | Q05, Q06, Q11 | Configurar serviços externos, diagnosticar falhas com código de erro e identificar dependências | Teste de configuração e indisponibilidade; logs sem credenciais ou conteúdo sensível indevido |
| Ambientais | Q04, Q11 | Registrar versões do runtime, navegadores e plataformas efetivamente suportados | Reproduzir a instalação com lockfile e verificar cada ambiente declarado |


### Requisitos externos

A referência também cita categorias regulatórias, éticas, legislativas, contábeis e de segurança. Não se deve preencher todas com afirmações inventadas. O documento identifica o que exige decisão do grupo e mantém a aceitação verificável.

| Categoria | Tratamento no projeto |
| --- | --- |
| Éticos | Distinguir conteúdo editorial de pessoas reais; tratar bloqueio, privacidade e revisão de soluções sem transformar uma suspeita em prova. Relaciona-se a Q03 e às regras de comunidade e avaliação. |
| Legislativos e regulatórios | Levantar obrigações aplicáveis aos dados e ao contexto de implantação com o responsável pelo projeto. Os controles Q01, Q03 e Q06 contribuem para proteção, mas não certificam conformidade integral. |
| Contábeis | As moedas do Mundinho são um recurso interno do jogo. A documentação não presume processamento de pagamento, escrituração contábil ou conversão em dinheiro. Confirmar qualquer mudança de escopo antes de criar requisitos dessa natureza. |
| Segurança física (safety) | A referência distingue segurança física de segurança da informação. Não foi identificado no escopo documentado um dispositivo de controle físico ou uma função de segurança crítica. A categoria permanece avaliada quanto à aplicabilidade. |


### Fatores de qualidade de McCall

| Dimensão da imagem | Fator | Relação com o sistema | RNF de apoio |
| --- | --- | --- | --- |
| Operação do produto | Correção | Resultado da avaliação e atualização de progresso correspondem ao contrato e ao estado confirmado | Q02, Q09 |
| Operação do produto | Confiabilidade | Falha do executor ou repetição de pedido não é apresentada como nova conclusão válida | Q02, Q05 |
| Operação do produto | Usabilidade | O usuário identifica a ação, o resultado e a forma de recuperar uma falha | Q04, Q12 |
| Operação do produto | Integridade | Acesso, autoria, participação, dados privados e recompensas são protegidos no servidor | Q01, Q02, Q03, Q06 |
| Operação do produto | Eficiência | Consultas e respostas são limitadas e o custo é medido em ambiente definido | Q07 |
| Revisão do produto | Manutenção | O responsável localiza contrato, implementação, regra e teste ao alterar um fluxo | Q08, Q10 |
| Revisão do produto | Flexibilidade | Alterações de catálogo e regra preservam histórico e têm impacto rastreável | Q08, Q09 |
| Revisão do produto | Testabilidade | Funções de política e serviços permitem verificar sucesso, alternativa, erro e concorrência | Q08, Q11 |
| Transição do produto | Portabilidade | Web e mobile têm ambientes e limites registrados e verificações próprias | Q04, Q11 |
| Transição do produto | Reutilização | Contratos e políticas do domínio são compartilháveis sem duplicar regras incompatíveis | Q08 |
| Transição do produto | Interoperabilidade | Banco, autenticação, executor e clientes trocam dados por contratos conhecidos | Q05, Q09, Q11 |


### Registro de verificação

Para cada Q, registrar cenário, ambiente, versão do código, entrada, resultado esperado, resultado observado e evidência. Marcar como atendido somente após verificar o critério. Metas numéricas de desempenho precisam informar carga, amostra e infraestrutura. Esta revisão verifica documentos e modelos; a existência de um requisito não substitui homologação funcional ou medição em produção.


### Referências fornecidas

GUEDES, Gilleanes T. A. UML 2: uma abordagem prática. 3. ed. São Paulo: Novatec, 2018. Fundamentação da modelagem e documentação.

Imagem “Tipos de requisitos não funcionais”, fornecida pelo grupo: classificação em produto, organização e fatores externos. A imagem não inclui referência bibliográfica completa.

Imagem “Os Fatores da Qualidade de McCall (CHRISSIS, 2006)”, fornecida pelo grupo: dimensões e fatores transcritos na tabela acima. A indicação bibliográfica visível na imagem é preservada sem presumir título ou edição não informados.

Documento “exemplo de matriz de rastreabilidade.docx”, fornecido pelo grupo: estrutura das seis colunas da matriz.


## Contratos, segurança, falhas e operação


### Caminho de uma requisição

Interface → rota → identidade → validação → autorização do recurso → regra de domínio → persistência/efeitos → serialização → resposta. Nem todos os arquivos seguem exatamente a mesma distribuição, mas essas responsabilidades precisam ser localizadas antes de alterar o fluxo.

apiHandler [../../../src/lib/api-handler.ts] envolve rotas compatíveis, resolve sessão quando habilitado, oferece contexto e padroniza parte dos erros. Também cria request ID e associa informações de rate limit à execução por AsyncLocalStorage. A presença do wrapper não garante que a rota exigiu usuário: confira a condição do próprio endpoint.


### Identidade e banco

auth-session.ts [../../../src/lib/auth-session.ts] participa da leitura de sessão; auth.ts [../../../src/lib/auth.ts] resolve o usuário de domínio e oferece exigências de acesso. A implementação pode usar Prisma e fallback pela API de dados quando a conexão do banco falha em determinadas condições.

O ID validado pelo provedor precisa corresponder ao usuário usado no domínio. Metadata editável de perfil, nome de exibição e papel enviado no corpo não são prova de autorização. Checagens de administrador, avaliador, dono e participante pertencem ao servidor.

O runtime prioriza DATABASE_URL quando configurada; DIRECT_URL atende fluxos Prisma/administrativos e fallback previsto. Uma porta do banco inacessível e uma sessão inválida são falhas diferentes, mesmo quando ambas impedem uma página de carregar.


### Contratos públicos e internos

Um modelo Prisma descreve o registro persistido. Um DTO público é uma seleção segura e útil de dados. Exemplos de dados internos que exigem cuidado: soluções, respostas esperadas ocultas, feedback privado de candidatura, tokens, preferências privadas de chat e detalhes operacionais.

TypeScript ajuda durante desenvolvimento. Zod e verificações de domínio validam a entrada real. Mesmo após schema aprovado, podem faltar autorização, saldo, capacidade ou pré-requisito. Nunca trate safeParse(...).success como aprovação completa da ação.


### Erros HTTP

| Status | Interpretação típica neste código | O que conferir |
| --- | --- | --- |
| 400 | Forma/valor de entrada inválido | Schema, tipo e campos exigidos |
| 401 | Sessão ausente/inválida | Identidade e recuperação de acesso |
| 403 | Sem permissão ou requisito | Propriedade, papel, nível, pré-requisito |
| 404 | Recurso não encontrado para o fluxo | ID, existência e política de exposição |
| 409 | Conflito de estado, capacidade ou operação | Versão, duplicidade, encerramento e concorrência |
| 429 | Limite de pedidos atingido | Janela e headers de limite |
| 500 | Erro não classificado no wrapper | Logs associados ao request ID |
| 503 | Dependência indisponível | Executor, conexão ou serviço externo |

O catálogo extraído de erros [erros-do-codigo.md] apresenta literais encontrados na fonte. Não é uma promessa de que toda rota sempre usa o mesmo envelope: há endpoints que retornam NextResponse.json diretamente. Consulte o adaptador concreto.


### Concorrência e idempotência

| Operação | Recurso disputado | Proteção relevante |
| --- | --- | --- |
| Crédito pedagógico | Total/histórico do usuário | Transação, lock learning:&lt;id&gt; e primeira conclusão |
| Baú | Evento de resgate diário | Chave única usuário/dia e extrato |
| Capacidade de evento | Quantidade de vagas do evento | Lock por evento e checagem na transação |
| Fechamento de duelo | Estado e recompensa da partida | Atualização condicional e transação |
| Sala multiplayer | Participantes, versão e turno | Locks de sala/usuário e revalidação |
| Importação editorial | Conteúdo da coleção | Namespace, IDs estáveis e lock do publicador |

Uma transação protege suas operações de banco, não a Internet inteira. Compilar código, fazer upload ou entregar push pode falhar independentemente. Não mantenha um lock de banco durante espera de compilador se o fluxo pode executar externamente e revalidar ao voltar.


### Rede e recuperação

Erros recuperáveis precisam preservar o que já foi confirmado. Uma submissão antiga que volta depois de mudar o turno não deve causar dano novo. Uma notificação que falhou não deve desfazer a candidatura confirmada. Uma execução indisponível não deve conceder progresso nem consumir uma chance pedagógica como se o aluno tivesse errado.

O cliente deve distinguir enviar, aguardando, confirmado, falhou e estado desatualizado. “Tente de novo” só é seguro quando a operação reconhece repetição ou quando a interface consegue identificar que o primeiro pedido não foi confirmado.


### Rate limit, logs e auditoria

ratelimit.ts usa Redis quando configurado e fallback local por instância. Fallback local não é um limite global distribuído entre todas as instâncias. As rotas escolhem seus limites; os exemplos de 30/min de lição e mensagens não são uma regra universal para todas as APIs.

Logs operacionais ajudam a depurar indisponibilidade. SecurityAuditEvent registra operações sensíveis do domínio. Os registros devem permitir investigação sem copiar credenciais ou todo o conteúdo privado. Request ID ajuda a correlacionar uma resposta com a execução que a produziu.


### Banco, migrations e seeds

schema.prisma e migrations descrevem a evolução. A situação do schema local não comprova aplicação em produção. Confira histórico/checksum e ambiente antes de migrar. Não substitua esse processo por um reset de produção para “alinhar tudo”.

O seed de desenvolvimento atual limpa tabelas. A comunidade editorial tem importador incremental próprio. Ambos podem criar dados, mas seus escopos são radicalmente diferentes. Para documentação, não há necessidade de executar nenhum dos dois.


### Testes e significado das evidências

| Verificação | O que demonstra | O que não demonstra sozinha |
| --- | --- | --- |
| Typecheck | Compatibilidade estática dos tipos compilados | Contratos reais de rede e autorização completa |
| Teste unitário | Comportamento isolado nos casos cobertos | Banco real e concorrência entre processos |
| Integração com rollback | Consultas/regras no banco configurado | Homologação irrestrita da produção |
| Build | Geração do pacote no ambiente local | Publicação e funcionamento de provedores externos |
| Screenshot/interação local | Apresentação e comportamento observado | Todos os dispositivos físicos |
| Status de deploy | Provedor concluiu a implantação | Todos os fluxos autenticados foram testados |

Esta tarefa documental não precisa repetir testes caros da aplicação quando não altera sua execução. Os controles pertinentes são consistência de fontes, links, trechos, diagramas e ausência de credenciais no material produzido.


### Mobile

O cliente Expo usa contratos e estado próprios em apps/mobile. Os endpoints mobile reaproveitam partes do domínio e têm adaptadores de sessão e serialização. O documento gerado do Mundinho precisa ser atualizado quando muda a experiência embarcada; mudar apenas Markdown não exige regenerar arte ou APK.


### Manutenção da documentação

1. Atualize explicação e regra identificada.

2. Ajuste o catálogo de casos de uso se o fluxo mudou.

3. Atualize a sequência e os recortes associados.

4. Regenere inventários e diagramas derivados.

5. Confira links e leia uma amostra dos trechos contra a fonte.

6. Registre a data/base e o que foi efetivamente verificado.

Não copie .env.local, connection strings com senha, service keys ou tokens para exemplos. Nomes de variáveis bastam para explicar a operação.


## Matriz de rastreabilidade

Formato baseado no arquivo “exemplo de matriz de rastreabilidade.docx” fornecido pelo grupo. Os exemplos de cinema do arquivo servem apenas para a estrutura das colunas. Os relacionamentos abaixo pertencem à Stacklyst.

IDs preservados: F identifica RF, Q identifica RNF e R identifica RN. Intervalos como F01-F03 significam F01, F02 e F03. A relação significa participação no mesmo fluxo ou critério de qualidade aplicável, sem afirmar que um requisito chama outro. Células “A revisar” indicam lacuna de rastreio, não cobertura comprovada. As relações com Q são critérios de revisão a verificar, não resultados de teste.

| ID | Descrição | Tipo | Requisitos funcionais relacionados | Requisitos não funcionais relacionados | Regras de negócio relacionadas |
| --- | --- | --- | --- | --- | --- |
| F01 | Apresentar a plataforma e encaminhar a experiência conforme identidade | RF | — | Q01; Q04; Q06-Q08; Q10-Q12 | — |
| F02 | Registrar conta e confirmar identidade | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R01-R02 |
| F03 | Entrar, sair e recuperar acesso | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R01-R03 |
| F04 | Escolher curso/linguagem e modo de navegação das trilhas | RF | — | Q01-Q02; Q04-Q12 | R08-R10 |
| F05 | Consultar caminhos, nós, pré-requisitos e recomendações | RF | — | Q01-Q02; Q04-Q12 | R09-R10 |
| F06 | Abrir lições e consultar progresso | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R11-R12; R20 |
| F07 | Responder atividades de tipos diferentes | RF | — | Q01-Q06; Q08-Q12 | R12-R15; R17; R25 |
| F08 | Executar código de exercício como prévia | RF | — | Q01-Q06; Q08-Q12 | R12-R13; R16-R17 |
| F09 | Submeter exercício e registrar evidência | RF | — | Q01-Q06; Q08-Q12 | R14-R15; R18-R19; R25 |
| F10 | Apresentar ajuda conforme modo de assistência | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R18-R19 |
| F11 | Conferir etapas especiais de trilha, baús e saltos | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R14; R21 |
| F12 | Acompanhar XP, nível, faixa e posição | RF | — | Q01-Q02; Q04-Q12 | R22-R24 |
| F13 | Emitir e consultar credenciais elegíveis | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R25-R26; R28 |
| F14 | Verificar credencial publicamente e gerar PDF | RF | — | Q01-Q06; Q08-Q12 | R25-R28 |
| F15 | Criar publicações com conteúdo e recursos permitidos | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R29-R30 |
| F16 | Consultar feed por filtros, busca e paginação | RF | — | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | R02; R07; R29 |
| F17 | Responder e encadear comentários | RF | — | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | R29; R31 |
| F18 | Reagir, votar em enquete e salvar publicações | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R07; R29; R32-R34; R91 |
| F19 | Personalizar perfil e consultar conquistas | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R03; R28 |
| F20 | Seguir, descobrir sugestões e bloquear contas | RF | — | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | R02; R05-R06 |
| F21 | Consultar e marcar notificações | RF | — | Q01; Q04; Q06-Q08; Q10-Q12 | R35; R38 |
| F22 | Enviar mensagens, consultar conversas e histórico | RF | — | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | R06; R36-R38 |
| F23 | Consultar e remover itens salvos | RF | — | Q01; Q04; Q06-Q08; Q10-Q12 | R07; R29; R34 |
| F24 | Configurar preferências da aplicação e da conta | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R01; R03 |
| F25 | Entrar no Mundinho e personalizar personagem | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R39; R46 |
| F26 | Consultar saldo, inventário, equipamentos e extrato | RF | — | Q01-Q02; Q04-Q12 | R44-R45; R48-R50 |
| F27 | Resgatar check-in e baú da clareira | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R40-R43 |
| F28 | Enfrentar criaturas e resolver desafios de código | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R46-R49 |
| F29 | Convidar amigo mútuo para arena privada | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R05; R51-R52 |
| F30 | Sincronizar presença, aparência e movimento | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R52; R60 |
| F31 | Disputar combate PvP por turnos com equipamentos | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R53-R59 |
| F32 | Convidar e aceitar duelo competitivo | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R61-R62; R71 |
| F33 | Executar, submeter e comparar soluções de duelo | RF | — | Q01-Q06; Q08-Q12 | R63-R64 |
| F34 | Resolver prazo, abandono, empate e revisão | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R64-R70 |
| F35 | Solicitar credenciamento como avaliador | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R03; R72; R75 |
| F36 | Administrar candidaturas e situação de avaliadores | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R03; R72; R75 |
| F37 | Emitir parecer humano quando autorizado | RF | — | Q01-Q06; Q08-Q12 | R73-R75 |
| F38 | Criar e gerir empresa autorizada | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R04; R79 |
| F39 | Criar e listar vagas com etapas | RF | — | Q01; Q04; Q06-Q08; Q10-Q12 | R04; R79 |
| F40 | Candidatar-se e consultar a própria candidatura | RF | — | Q01-Q06; Q08-Q12 | R76-R78 |
| F41 | Acompanhar e movimentar candidatura no funil | RF | — | Q01-Q12 | R04; R79-R80 |
| F42 | Consultar eventos e hackathons | RF | — | Q01; Q04; Q06-Q08; Q10-Q12 | R83-R84; R87 |
| F43 | Inscrever-se e cancelar participação elegível | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R81-R84 |
| F44 | Gerenciar desafios de evento | RF | — | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | R85-R87 |
| F45 | Gerir recursos administrativos e registrar auditoria | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R02-R03 |
| F46 | Utilizar recursos equivalentes no cliente mobile | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R01; R39; R51 |
| F47 | Importar comunidade editorial sem resetar o banco | RF | — | Q01; Q04; Q06; Q08; Q10-Q12 | R88 |
| F48 | Consultar e responder quiz diário | RF | — | Q01-Q02; Q04-Q06; Q08-Q12 | R12; R14; R89 |
| F50 | Votar em enquetes e denunciar conteúdo | RF | — | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | R02; R29; R91-R92 |
| F51 | Enviar mídia pelo contrato do endpoint correspondente | RF | — | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | R02; R93 |
| Q01 | Controle de acesso por recurso | RNF | F01-F48; F50-F51 | — | R01-R89; R91-R93 |
| Q02 | Integridade de recompensas | RNF | F04-F14; F25-F37; F40-F41; F43; F48 | — | R03-R05; R08-R28; R39-R84; R89 |
| Q03 | Privacidade de gabaritos e candidaturas | RNF | F07-F09; F14; F16-F17; F20; F22; F33; F37; F40-F41; F44; F50-F51 | — | R02; R04-R07; R12-R19; R25-R29; R31; R36-R38; R63-R64; R73-R80; R85-R87; R91-R93 |
| Q04 | Responsividade e uso por teclado | RNF | F01-F48; F50-F51 | — | R01-R89; R91-R93 |
| Q05 | Resistência a falhas externas | RNF | F04-F14; F25-F37; F40-F41; F43; F48 | — | R03-R05; R08-R28; R39-R84; R89 |
| Q06 | Observabilidade sem segredos | RNF | F01-F48; F50-F51 | — | R01-R89; R91-R93 |
| Q07 | Consultas limitadas e paginação | RNF | F01; F04-F05; F12; F16; F20-F23; F26; F39; F41-F42 | — | R02; R04-R10; R22-R24; R29; R34-R38; R44-R45; R48-R50; R79-R80; R83-R84; R87 |
| Q08 | Manutenibilidade | RNF | F01-F48; F50-F51 | — | R01-R89; R91-R93 |
| Q09 | Compatibilidade de histórico | RNF | F04-F14; F25-F37; F40-F41; F43; F48 | — | R03-R05; R08-R28; R39-R84; R89 |
| Q10 | Integridade documental | RNF | F01-F48; F50-F51 | — | R01-R89; R91-R93 |
| Q11 | Reprodutibilidade | RNF | F01-F48; F50-F51 | — | R01-R89; R91-R93 |
| Q12 | Confirmação clara na interface | RNF | F01-F48; F50-F51 | — | R01-R89; R91-R93 |
| R01 | A identidade de uma operação protegida vem da sessão, não de userId livre no payload | RN | F02-F03; F24; F46 | Q01; Q04; Q06; Q08; Q10-Q12 | — |
| R02 | Permissão depende também do recurso: propriedade, participação, audiência e bloqueios | RN | F02-F03; F16; F20; F45; F50-F51 | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | — |
| R03 | Papel e estado de avaliador não são concedidos por nome, título, cor ou metadata editável | RN | F03; F19; F24; F35-F36; F45 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R04 | Recrutador não pode administrar automaticamente qualquer empresa | RN | F38-F39; F41 | Q01-Q12 | — |
| R05 | Seguir é direcional; amizade mútua requer ambas as relações | RN | F20; F29 | Q01-Q12 | — |
| R06 | Bloqueio interfere em interações e consultas, não somente na apresentação | RN | F20; F22 | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | — |
| R07 | Paginação e conhecimento do ID não concedem acesso ao recurso | RN | F16; F18; F23 | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | — |
| R08 | Nó e lição têm representações e regras de acesso distintas | RN | F04 | Q01-Q02; Q04-Q12 | — |
| R09 | MASTERED, COMPLETED e IN_PROGRESS persistidos são preservados na derivação de disponibilidade do nó | RN | F04-F05 | Q01-Q02; Q04-Q12 | — |
| R10 | Requisito obrigatório não concluído mantém o nó ainda não iniciado indisponível na derivação | RN | F04-F05 | Q01-Q02; Q04-Q12 | — |
| R11 | Lição já concluída legitimamente continua revisável após mudança de pré-requisitos | RN | F06 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R12 | A API identifica a etapa no catálogo e avalia no servidor | RN | F06-F08; F48 | Q01-Q06; Q08-Q12 | — |
| R13 | run de lição retorna prévia com xpEarned: 0 | RN | F07-F08 | Q01-Q06; Q08-Q12 | — |
| R14 | Primeiro acerto elegível é determinado sob lock por usuário | RN | F07; F09; F11; F48 | Q01-Q06; Q08-Q12 | — |
| R15 | Repetir uma etapa já correta não concede novamente seu XP | RN | F07; F09 | Q01-Q06; Q08-Q12 | — |
| R16 | Falha operacional do executor retorna indisponibilidade, sem converter isso em conclusão ou erro pedagógico confirmado | RN | F08 | Q01-Q06; Q08-Q12 | — |
| R17 | A serialização pública remove soluções, gabaritos e testes internos | RN | F07-F08 | Q01-Q06; Q08-Q12 | — |
| R18 | Os multiplicadores atuais de assistência são todos 1 e os bônus de domínio são 0 | RN | F09-F10 | Q01-Q06; Q08-Q12 | — |
| R19 | Completar exercícios não prova domínio independente medido | RN | F09-F10 | Q01-Q06; Q08-Q12 | — |
| R20 | IDs de etapas ligam currículo a registros persistidos | RN | F06 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R21 | Resgates especiais de trilha não podem ser respondidos como quiz comum | RN | F11 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R22 | XP total, XP por linguagem e movimentações por período não são a mesma consulta | RN | F12 | Q01-Q02; Q04-Q12 | — |
| R23 | Ranking geral ordena XP decrescente, username crescente e ID crescente | RN | F12 | Q01-Q02; Q04-Q12 | — |
| R24 | Faixa competitiva visual e nível numérico usam limites diferentes | RN | F12 | Q01-Q02; Q04-Q12 | — |
| R25 | Credencial depende de evidência e snapshot de requisitos | RN | F07; F09; F13-F14 | Q01-Q06; Q08-Q12 | — |
| R26 | Ler credenciais de perfil público não deve emitir novas credenciais | RN | F13-F14 | Q01-Q06; Q08-Q12 | — |
| R27 | Revogação ou falha de integridade muda a validade consultada | RN | F14 | Q01-Q06; Q08-Q12 | — |
| R28 | Título visual não equivale a certificado e não concede autorização | RN | F13-F14; F19 | Q01-Q06; Q08-Q12 | — |
| R29 | audience e bloqueios são aplicados antes de entregar conteúdo | RN | F15-F18; F23; F50 | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | — |
| R30 | client_id identifica repetição da criação de post por autor | RN | F15 | Q01; Q04; Q06; Q08; Q10-Q12 | — |
| R31 | Resposta pode apontar para outra resposta, mas continua vinculada ao mesmo post | RN | F17 | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | — |
| R32 | Reação de post é única por usuário/post; troca não significa nova reação independente | RN | F18 | Q01; Q04; Q06; Q08; Q10-Q12 | — |
| R33 | Remover uma reação reverte seu crédito limitado, sem tornar XP negativo | RN | F18 | Q01; Q04; Q06; Q08; Q10-Q12 | — |
| R34 | Salvar é uma referência ao post, não uma cópia que elimina restrições de acesso | RN | F18; F23 | Q01; Q04; Q06-Q08; Q10-Q12 | — |
| R35 | Notificação pertence ao destinatário; o destino continua protegido | RN | F21 | Q01; Q04; Q06-Q08; Q10-Q12 | — |
| R36 | Mensagem é consultada entre os dois participantes identificados e sujeita a bloqueios | RN | F22 | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | — |
| R37 | Chat, reações de mensagem e reações de post têm associações distintas | RN | F22 | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | — |
| R38 | Falha na notificação posterior não desfaz automaticamente uma mensagem/candidatura já gravada | RN | F21-F22 | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | — |
| R39 | Saldo e inventário são confirmados no servidor | RN | F25; F46 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R40 | Créditos usam chave única por usuário no extrato | RN | F27 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R41 | Baú da clareira concede 10 moedas uma vez por dia civil de São Paulo | RN | F27 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R42 | Check-in tem ciclo próprio e não é o mesmo resgate do baú | RN | F27 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R43 | Aprendizagem elegível pode originar moedas por reconciliação incremental | RN | F27 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R44 | Compra verifica catálogo, posse e preço do servidor | RN | F26 | Q01-Q02; Q04-Q12 | — |
| R45 | Bônus só contam para itens possuídos e equipados no slot compatível | RN | F26 | Q01-Q02; Q04-Q12 | — |
| R46 | Nível do encontro mostrado e nível salvo da batalha devem corresponder | RN | F25; F28 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R47 | Criaturas de níveis 1–5 e chefe 10 pertencem ao catálogo; o chefe 10 tem 240 PV | RN | F28 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R48 | Chance-base de golpe direto é 75%; exercício é 25% | RN | F26; F28 | Q01-Q02; Q04-Q12 | — |
| R49 | Sorte adiciona pontos percentuais ao golpe direto; Caça-bugs possuído e equipado o torna 100% | RN | F26; F28 | Q01-Q02; Q04-Q12 | — |
| R50 | Chance de drop é um cálculo separado, base 50% mais sorte | RN | F26 | Q01-Q02; Q04-Q12 | — |
| R51 | Entrada multiplayer exige amizade mútua e ausência de bloqueio | RN | F29; F46 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R52 | Nomes, aparência e nível vêm do banco; pacote de posição não é fonte de identidade | RN | F29-F30 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R53 | Os dois jogadores confirmam o início | RN | F31 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R54 | Bônus de ambos são capturados no início e renovados na revanche | RN | F31 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R55 | Aplicar conceito causa 30; Depurar causa 18 e cura até 20; Refatorar causa 45 e desgasta 8 | RN | F31 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R56 | Proteção do alvo reduz dano até o mínimo 1; cura respeita máximo; desgaste pode derrotar atacante | RN | F31 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R57 | Exercício sorteado e golpe escolhido ficam presos ao turno | RN | F31 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R58 | Turno PvP dura 120 segundos; após 20 turnos a vida restante desempata ou empata | RN | F31 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R59 | PvP do Mundinho não concede XP/moedas | RN | F31 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R60 | Respostas antigas não devem sobrescrever snapshots mais novos da mesma sala | RN | F30 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R61 | Convite direto expira em 72 h; publicação opcional usa janela pública de 24 h | RN | F32 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R62 | Partida competitiva tem limite de 2 h após início | RN | F32 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R63 | Testar código não é submeter uma solução competitiva | RN | F33 | Q01-Q06; Q08-Q12 | — |
| R64 | Correção antecede comparação de eficiência | RN | F33-F34 | Q01-Q06; Q08-Q12 | — |
| R65 | Código aceito e sintaxe normalizada igual encaminham revisão | RN | F34 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R66 | Big-O só desempata quando as duas estimativas têm confiança comparável prevista | RN | F34 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R67 | Linhas úteis/instruções são critério posterior; runtime bruto não escolhe vencedor | RN | F34 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R68 | Códigos diferentes ainda equivalentes podem encerrar em empate automático | RN | F34 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R69 | Vitória concede 50 XP uma vez; derrota não subtrai XP | RN | F34 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R70 | Três abandonos consecutivos após compromisso levam a cooldown de 24 h | RN | F34 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R71 | Recusar ou deixar expirar convite não equivale a abandonar partida aceita | RN | F32 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R72 | Candidatura a avaliador exige trilha completa ou 1.000 XP, motivação mínima de 80 caracteres e tecnologias elegíveis | RN | F35-F36 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R73 | Participante não emite parecer sobre seu próprio duelo | RN | F37 | Q01-Q06; Q08-Q12 | — |
| R74 | Parecer exige papel, status e compatibilidade técnica; revisão concluída rende 10 XP ao avaliador | RN | F37 | Q01-Q06; Q08-Q12 | — |
| R75 | Estado de reputação considera limites 80 para ativo e 60 para suspensão | RN | F35-F37 | Q01-Q06; Q08-Q12 | — |
| R76 | Vaga deve existir e estar aberta para aceitar candidatura | RN | F40 | Q01-Q06; Q08-Q12 | — |
| R77 | Usuário/vaga é uma candidatura única | RN | F40 | Q01-Q06; Q08-Q12 | — |
| R78 | Nova candidatura começa em APPLIED e aponta à primeira etapa quando existente | RN | F40 | Q01-Q06; Q08-Q12 | — |
| R79 | Gestão de candidatos exige acesso à empresa; feedback interno não é dado da listagem pública | RN | F38-F39; F41 | Q01-Q12 | — |
| R80 | Movimentação registra status/etapa e auditoria na transação | RN | F41 | Q01-Q12 | — |
| R81 | Inscrição de evento é única por evento/usuário | RN | F43 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R82 | Inscrição confere capacidade e nível, sob serialização por evento | RN | F43 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R83 | Evento encerrado não admite nova inscrição/cancelamento nos fluxos correspondentes | RN | F42-F43 | Q01-Q02; Q04-Q12 | — |
| R84 | Participação começa com score zero; inscrever-se não distribui automaticamente toda recompensa declarada | RN | F42-F43 | Q01-Q02; Q04-Q12 | — |
| R85 | Conjunto de desafios editável contém 3–20 desafios, cada um com 1–5 exemplos | RN | F44 | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | — |
| R86 | Só gestor autorizado recebe resposta esperada no gerenciamento de desafios | RN | F44 | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | — |
| R87 | Tipo hackathon não comprova fluxo completo de equipes, submissões e julgamento | RN | F42; F44 | Q01; Q03-Q04; Q06-Q08; Q10-Q12 | — |
| R88 | Importação editorial usa identidades reservadas e IDs estáveis; não reseta a comunidade | RN | F47 | Q01; Q04; Q06; Q08; Q10-Q12 | — |
| R89 | Quiz diário seleciona no máximo uma questão revisada relacionada a posts por dia UTC, sem geração por IA; não usa posts restritos a seguidores | RN | F48 | Q01-Q02; Q04-Q06; Q08-Q12 | — |
| R91 | Voto de enquete pertence à enquete/opção e não é uma reação genérica de post | RN | F18; F50 | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | — |
| R92 | Denúncia registra ocorrência para gestão; não concede poder de exclusão ao denunciante | RN | F50 | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | — |
| R93 | A rota genérica de imagem limita a 5 MiB, aceita JPEG/PNG/GIF/WebP e verifica assinatura do arquivo | RN | F51 | Q01; Q03-Q04; Q06; Q08; Q10-Q12 | — |


### Capacidades, casos e código

A lista complementar permite chegar da capacidade funcional à especificação do caso de uso e ao ponto de implementação. O catálogo de casos contém as pré-condições, o fluxo, as alternativas e as regras completas.

| RF | Casos de uso relacionados | Fonte de implementação dos casos |
| --- | --- | --- |
| F01 | Ponto de entrada, sem caso independente | src/app/page.tsx |
| F02 | UC001; UC002 | src/app/api/auth/register/route.ts; src/app/api/auth/reset-password/route.ts |
| F03 | UC002 | src/app/api/auth/reset-password/route.ts; src/lib/auth.ts |
| F04 | UC004 | src/app/trails/TrailsContent.tsx |
| F05 | UC004 | src/lib/learning/progress.ts |
| F06 | UC005 | src/lib/learning/lesson-progress.ts |
| F07 | UC006; UC026 | src/lib/learning/assessment.ts; src/lib/learning/lesson-progress.ts |
| F08 | UC006; UC027 | src/app/api/lessons/[lessonId]/attempt/route.ts; src/lib/exercises/repository.ts |
| F09 | UC006 | src/lib/exercises/repository.ts; src/lib/learning/lesson-progress.ts |
| F10 | UC012 | src/lib/exercises/repository.ts |
| F11 | UC005 | src/app/api/trails/chest/route.ts |
| F12 | UC007 | src/lib/learning/rewards.ts |
| F13 | UC007 | src/lib/credentials/repository.ts |
| F14 | UC007 | src/lib/credentials/pdf.ts; src/lib/credentials/repository.ts |
| F15 | UC013 | src/services/post.service.ts |
| F16 | UC014 | src/services/post.service.ts |
| F17 | UC014 | src/app/api/posts/[id]/answer/route.ts |
| F18 | UC014 | src/app/api/posts/[id]/poll/route.ts; src/app/bookmarks/page.tsx; src/services/reaction.service.ts |
| F19 | UC003 | src/services/profile-customization.service.ts |
| F20 | UC003 | src/services/block.service.ts; src/services/follow.service.ts |
| F21 | UC021 | src/services/notification.service.ts |
| F22 | mensagens privadas | src/app/api/messages/route.ts |
| F23 | UC014 | src/app/bookmarks/page.tsx |
| F24 | UC003 | src/app/settings/page.tsx |
| F25 | Módulo fora do escopo UML acadêmico | src/components/mundinho/World.tsx |
| F26 | Módulo fora do escopo UML acadêmico | src/lib/mundinho/equipment.ts |
| F27 | Módulo fora do escopo UML acadêmico | src/lib/mundinho/repository.ts |
| F28 | Módulo fora do escopo UML acadêmico | src/lib/mundinho/repository.ts |
| F29 | Módulo fora do escopo UML acadêmico | src/lib/mundinho/arena.ts |
| F30 | Módulo fora do escopo UML acadêmico | src/lib/mundinho/arena-rules.ts |
| F31 | Módulo fora do escopo UML acadêmico | src/lib/mundinho/arena-rules.ts |
| F32 | UC008 | src/services/duel.service.ts |
| F33 | UC006; UC010; UC027 | src/lib/duels/judge.ts |
| F34 | UC008 | src/lib/duels/resolution-policy.ts |
| F35 | UC019 / UC028; UC024 | src/services/evaluator.service.ts |
| F36 | UC019 / UC028; UC024 | src/services/evaluator.service.ts |
| F37 | UC016 | src/services/evaluator.service.ts |
| F38 | UC017 / UC018; UC025 | src/services/job.service.ts |
| F39 | UC017 / UC018; UC025 | src/services/job.service.ts |
| F40 | UC022 | src/services/job.service.ts |
| F41 | UC025 | src/services/job.service.ts |
| F42 | UC015 / UC023 | src/services/event.service.ts |
| F43 | UC015 | src/services/event.service.ts |
| F44 | UC015 / UC023 | src/services/event-challenge.service.ts |
| F45 | UC019 / UC028 | src/services/admin.service.ts |
| F46 | Cliente técnico dos mesmos casos, sem caso independente | apps/mobile/src/mundinho/AdventureScreen.tsx |
| F47 | UC019 / UC028 | prisma/demo-community/publish.ts |
| F48 | UC014 | src/services/daily-quiz.service.ts |
| F50 | UC014 | src/app/api/posts/[id]/poll/route.ts; src/app/api/posts/[id]/report/route.ts |
| F51 | UC003 | src/app/api/upload/route.ts |


## Correspondência com a vista Caso de Uso Geral

Os requisitos funcionais, não funcionais e as regras mantêm seus identificadores. A relação abaixo usa exclusivamente os nomes e IDs da vista vigente, distinguindo objetivo funcional de cenário técnico de implementação.

| Caso de uso | Cenários de implementação | Regras relacionadas |
| --- | --- | --- |
| UC001 Cadastrar Conta | C01 | R01, R02 |
| UC002 Fazer Login | C02, C03 | R01, R02, R03 |
| UC003 Gerenciar Perfil | C22, C28, C54 | R01, R02, R03, R28, R93 |
| UC004 Consultar Trilhas de Estudo | C04, C05 | R08, R09, R10 |
| UC005 Realizar Lição | C06 | R11, R12, R20 |
| UC006 Resolver exercício | C07, C08, C09, C10, C11, C50 | R12, R13, R14, R15, R16, R17, R18, R19, R25, R89 |
| UC007 Emitir Classificação e Desempenho | C14, C15, C16, C25 | R22, R23, R24, R25, R26, R27, R28 |
| UC008 Realizar Duelo | C36, C38 | R61, R62, R64, R65, R66, R67, R68, R69, R70, R71 |
| UC010 Enviar Solução de Duelo | C37 | R63, R64 |
| UC012 Consultar Ajuda de Exercício | C12 | R18, R19 |
| UC013 Gerenciar Publicações | C17, C18 | R02, R07, R29, R30 |
| UC014 Registrar Interação | C19, C20, C21, C52 | R07, R29, R31, R32, R33, R34, R91 |
| UC015 Gerenciar Eventos | C44, C45, C46 | R81, R82, R83, R84, R85, R86, R87 |
| UC016 Avaliar Duelo | C40 | R73, R74, R75 |
| UC017 Gerenciar Empresas | C41 | R04, R79 |
| UC018 Gerenciar Vagas | C41 | R04, R79 |
| UC019 Gerenciar Usuários | C47 | R02, R03 |
| UC021 Notificar Usuário | C26 | R35, R38 |
| UC022 Registrar Candidatura | C42 | R76, R77, R78 |
| UC023 Criar evento | C44 | R83, R84, R87 |
| UC024 Apresentar Pedido de Credenciamento | C39 | R03, R72, R75 |
| UC025 Gerenciar Candidaturas | C43 | R04, R79, R80 |
| UC026 Avaliar Resposta | C07, C08, C09, C10, C11 | R12, R13, R14, R15, R16, R17, R18, R19, R25 |
| UC027 Executar Código e Testes | C08, C10, C37 | R12, R13, R16, R17, R63, R64 |
| UC028 Gerenciar Denúncias | C47, C53 | R02, R03, R92 |
| UC029 Fazer Denúncia | C53 | R02, R92 |

