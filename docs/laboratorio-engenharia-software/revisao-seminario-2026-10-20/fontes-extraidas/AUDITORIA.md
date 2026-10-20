# Auditoria das fontes do seminário

Contagens: 49 RF, 25 RNF, 29 RN, 56 especificações UC, 52 UC declarados no Astah e 18 elipses na imagem geral.

## Atividades e imagens

- AN01 Estudar programação: `02/image5.jpg`. Identificador visível original: AN01.
- AN02 Praticar exercícios de programação: `02/image1.jpg`. Identificador visível original: AN03.
- AN03 Acompanhar a própria aprendizagem: `02/image2.png`. Identificador visível original: AN04.
- AN04 Buscar ajuda para uma dúvida: `02/image3.jpg`. Identificador visível original: AN06.
- AN05A Divulgar oportunidade de trabalho: `02/image6.jpg`. Identificador visível original: AN08A.
- AN05B Candidatar-se e acompanhar a seleção: `02/image7.jpg`. Identificador visível original: AN08B.
- AN06 Descobrir e participar de um evento: `02/image4.jpg`. Identificador visível original: AN09.

## Identificadores do diagrama geral original

- UC001 Cadastrar conta
- UC002 Fazer login
- UC003 Editar perfil
- UC013 Manter publicação
- UC008 Criar duelo aberto
- UC010 Enviar solução de duelo
- UC020 Manter denúncias
- UC005 Estudar lição
- UC058 Manter intenção de vaga
- UC006 Resolver exercício
- UC029 Executar código e testes
- UC059 Manter interesse em Evento
- UC015 Criar evento
- UC011 Manter ranking de XP
- UC017 Publicar vaga
- UC057 Notificar usuário
- UC048 Gerenciar desafios de evento
- UC019 Gerenciar permissões de usuários

## Requisitos funcionais

- RF001 Cadastrar usuário
- RF002 Fazer login
- RF003 Encerrar sessão
- RF004 Gerenciar perfil
- RF005 Visualizar trilhas
- RF006 Iniciar trilha
- RF007 Acessar lição
- RF008 Resolver exercício
- RF009 Registrar progresso
- RF010 Consultar histórico
- RF011 Atribuir XP
- RF012 Atualizar nível
- RF013 Gerenciar conquistas
- RF014 Consultar ranking
- RF015 Derivar faixa de XP
- RF016 Criar duelo aberto
- RF017 Entrar em duelo
- RF018 Aceitar ou rejeitar convite de duelo legado
- RF019 Enviar solução de duelo
- RF020 Avaliar resultado
- RF021 Atualizar classificação após duelo
- RF022 Consultar ajuda do exercício
- RF023 Selecionar modo de assistência
- RF024 Consultar documentação
- RF025 Utilizar sugestões do editor
- RF026 Candidatar-se a avaliador
- RF027 Receber avaliações pendentes
- RF028 Avaliar solução
- RF029 Registrar decisão de avaliação
- RF030 Criar publicação
- RF031 Visualizar feed
- RF032 Interagir com publicação
- RF033 Denunciar conteúdo
- RF034 Cadastrar empresa
- RF035 Publicar vaga
- RF036 Consultar vagas
- RF037 Visualizar perfil público de desenvolvedor
- RF038 Consultar indicadores permitidos do usuário
- RF047 Candidatar-se a vaga
- RF048 Atualizar etapa de candidatura
- RF039 Gerenciar usuários
- RF040 Gerenciar conteúdo
- RF041 Criar e gerenciar eventos
- RF042 Gerenciar permissões de usuários
- RF043 Tratar denúncias
- RF044 Gerar notificação
- RF045 Consultar notificações
- RF046 Atualizar leitura de notificações
- RF049 Inscrever-se ou cancelar participação em evento

## Requisitos não funcionais

- RNF001 Autenticação protegida
- RNF002 Autorização por papel
- RNF003 Proteção de entrada e abuso
- RNF004 Segredos somente no servidor
- RNF005 Separação público/privado
- RNF006 Privacidade no recrutamento
- RNF007 Tempo de resposta das APIs
- RNF008 Carregamento de página
- RNF009 Execução limitada
- RNF010 Responsividade
- RNF011 Acessibilidade básica
- RNF012 Degradação de serviço externo
- RNF013 Meta de disponibilidade
- RNF014 Consistência de XP
- RNF015 Consistência de duelo e avaliação
- RNF016 Crescimento de listas
- RNF017 Navegadores suportados
- RNF018 Compatibilidade com web móvel
- RNF019 Modularização
- RNF020 Cobertura de qualidade
- RNF021 Conteúdo editorial confiável
- RNF022 Privacidade na execução de código
- RNF023 Disponibilidade do executor
- RNF024 Auditoria de ações sensíveis
- RNF025 Retenção de auditoria

## Regras de negócio

- RN001 Elegibilidade de XP: XP somente é concedido após atividade válida e confirmada; repetir a mesma tentativa não gera nova recompensa.
- RN002 Valores de XP: No catálogo: explicação 0, prática conceitual 10, atividade guiada explicitamente configurada 15, código 25 e projeto 40. Atividades legadas preservam valores já ganhos. Checkpoint/baú não concedem XP livre pelo cliente.
- RN003 Níveis: Níveis usam os limiares de 500, 800, 1.100, 1.500 e 2.000 XP; após o nível 6 o incremento cresce em 100 XP por nível.
- RN004 Sequência e conquistas: Atividade em dias consecutivos atualiza a sequência; conquistas não podem ser duplicadas e incluem critérios de 7 e 30 dias.
- RN005 Faixas de XP: Bronze 0–499; Prata 500–1199; Ouro 1200–2499; Platina 2500–4999; Diamante a partir de 5000. Promoção por XP acumulado; derrota não rebaixa. Não é Elo.
- RN006 Ordenação do ranking: XP decrescente, username e id crescentes. Por linguagem, agregar LanguageTrail e primeiro acerto de ExerciseSubmission, sem migrar nem somar novamente o histórico global.
- RN007 Entrada em duelos: Na fila rápida, procurar a vaga pendente mais antiga de outro usuário na mesma linguagem. Sem vaga, criar espera de até 24 horas. Entrada direta exige vaga disponível de outro usuário. O fluxo vigente não usa convite, destinatário ou faixa de XP.
- RN008 Prazo do convite legado: No fluxo legado, o convite expirava em 30 segundos. Regra histórica, sem aplicação aos duelos abertos vigentes.
- RN009 Rejeição e cooldown legados: No fluxo legado, três rejeições consecutivas aplicavam cooldown de 5 minutos. Regra histórica, sem aplicação aos duelos abertos vigentes.
- RN010 Tempo do desafio: O confronto dura duas horas a partir da entrada do segundo participante. A espera por oponente, antes do confronto, é de até 24 horas. O registro de expiração depende da manutenção, sem prorrogar a elegibilidade após o prazo.
- RN011 Prazo e resultado do duelo: Na resolução por prazo, sem envios fecha sem vencedor; um envio elegível pode vencer; dois envios são comparados. A manutenção efetiva depende de acionamento.
- RN012 Avaliação de duelo: Testes e pontuação automática; diferença de score até 5 e runtime até 5% (ou ausente) encaminha empate técnico a REVIEW_PENDING. Vitória recebe 50 XP uma única vez.
- RN013 Assistência editorial: Dicas, documentação e autocomplete dependem do modo escolhido; a consulta não altera o XP.
- RN014 Elegibilidade de avaliador: O usuário deve concluir ao menos uma trilha completa ou possuir 1.000 XP antes de se candidatar.
- RN015 Aprovação de avaliador: A elegibilidade permite candidatura, mas somente o administrador atribui o papel EVALUATOR.
- RN016 Parecer humano: As pontuações variam de 0 a 1.000, exigem vencedor e feedback com pelo menos 5 caracteres.
- RN017 Controle por papel: Usuário autenticado usa as funções gerais e pode criar e participar de eventos; Avaliador avalia duelos autorizados; Administrador gerencia permissões e pode avaliar; Recrutador gerencia empresas e vagas autorizadas. Criador ou Administrador pode excluir evento.
- RN018 Publicação comunitária: Publicação exige autenticação, validação e limite de corpo de até 5.000 caracteres.
- RN019 Moderação: Denúncia deve ser registrada uma vez por usuário/publicação e analisada por administrador; sanções e recurso ainda dependem de política.
- RN020 Publicação de vaga: Somente RECRUITER ou ADMIN com acesso autorizado à empresa pode publicar vaga ou consultar suas candidaturas. A atualização de candidatura também exige vínculo com a empresa e consistência entre vaga, candidatura e etapa.
- RN021 Acesso de empresas: Empresas consultam somente informações públicas do perfil; decisões de contratação permanecem sob responsabilidade humana.
- RN022 Notificações: Eventos relevantes geram notificação ao destinatário. A atualização de candidatura notifica automaticamente o usuário associado à candidatura. Falha de notificação não desfaz a operação principal.
- RN023 Participação em evento: Usuário inscreve-se uma vez por evento via POST, respeitando evento não encerrado, nível mínimo e capacidade. Pode cancelar a própria participação via DELETE antes do encerramento.
- RN024 Falha do executor: Timeout, indisponibilidade ou resposta inválida do executor não confirma acerto, XP ou vitória.
- RN025 Identidade e sessão: E-mail e username são únicos; rotas protegidas exigem sessão verificada.
- RN026 Candidatura a vaga: Usuário pode candidatar-se uma vez a uma vaga aberta, com vínculo à etapa inicial. O responsável autorizado atualiza a etapa ou o status, após validar os vínculos, e o candidato associado recebe notificação automática.
- RN027 Privacidade do perfil: Perfis públicos não expõem e-mail, tokens ou dados de sessão; rotas de edição exigem o titular autenticado.
- RN028 Integridade competitiva: XP, ranking, duelo e avaliação devem rejeitar duplicidade, manipulação pelo cliente e transições inválidas.
- RN029 Pré-requisitos de aprendizagem: Uma lição pode ser iniciada quando seus pré-requisitos estiverem cumpridos. Lições já concluídas podem ser revisitadas; a revisão não duplica a recompensa da mesma atividade.

## Casos de uso textuais

- UC001 Cadastrar conta
- UC002 Fazer login
- UC003 Editar perfil
- UC004 Selecionar trilha
- UC005 Estudar lição
- UC006 Resolver exercício
- UC007 Consultar progresso
- UC008 Criar duelo aberto
- UC009 Entrar em duelo
- UC010 Enviar solução de duelo
- UC011 Consultar ranking de XP
- UC012 Consultar ajuda do exercício
- UC013 Criar publicação
- UC014 Interagir com publicação
- UC015 Criar evento
- UC016 Avaliar empate técnico
- UC017 Publicar vaga
- UC018 Consultar vagas
- UC019 Gerenciar permissões de usuários
- UC020 Tratar denúncias
- UC021 Consultar notificações
- UC022 Candidatar-se a vaga
- UC023 Inscrever-se ou cancelar participação em evento
- UC024 Candidatar-se a avaliador
- UC025 Cadastrar empresa
- UC026 Atualizar etapa de candidatura
- UC027 Aprovar ou rejeitar candidatura de avaliador
- UC028 Avaliar resposta
- UC029 Executar código e testes
- UC030 Encerrar sessão
- UC031 Consultar e pesquisar feed
- UC032 Consultar perfil público
- UC033 Seguir ou deixar de seguir usuário
- UC034 Consultar publicações salvas
- UC035 Editar ou excluir publicação própria
- UC036 Aceitar resposta de uma publicação
- UC037 Responder quiz diário
- UC038 Consultar conversas e mensagens
- UC039 Enviar mensagem privada
- UC040 Editar ou excluir mensagem própria
- UC041 Reagir a mensagem
- UC042 Consultar comunidades
- UC043 Criar comunidade
- UC044 Entrar ou sair de comunidade
- UC045 Administrar comunidade própria
- UC046 Consultar eventos e desafios
- UC047 Excluir evento sob responsabilidade
- UC048 Gerenciar desafios de evento
- UC049 Consultar métricas administrativas
- UC050 Configurar preferências pessoais
- UC051 Personalizar avatar
- UC052 Testar código antes da submissão
- UC053 Consultar resultado de duelo
- UC054 Excluir duelo elegível
- UC055 Marcar notificações como lidas
- UC056 Consultar candidaturas de uma vaga

## Ressalvas encontradas nas fontes

- DOCX04 fala em 20 casos no diagrama geral, mas há 18 elipses na imagem.
- DOCX04 mantém 56 especificações, das quais UC042–UC045 são cobertura textual complementar e não têm elementos no Astah atual.
- UC057, UC058 e UC059 da imagem geral são rótulos legados, sem especificações próprias. DOCX orienta correspondência com candidatura UC022, evento UC023 e notificação interna de UC026.
- Texto e legendas DOCX02 foram renumerados, mas seis das sete imagens têm números antigos.
- Tabela final de evidências do DOCX03 preserva numeração antiga de atividades e slides. Deve usar documentos atualizados e a nova apresentação como referência para renumeração.