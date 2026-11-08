# Sequências completas e correspondência com o código

Cada diagrama representa uma jornada, incluindo confirmação e alternativas relevantes. Nomes como UI e Banco são participantes de responsabilidade, não nomes de arquivos. O [caderno de recortes](codigo-comentado.md) localiza as declarações reais e suas linhas.

## 1. Submeter etapa de lição

```mermaid
sequenceDiagram
  actor Aluno
  participant UI as Interface da licao
  participant API as Rota de tentativa
  participant Avaliador as assessLessonStep
  participant Progresso as saveLessonAssessment
  participant DB as PostgreSQL
  Aluno->>UI: Enviar resposta
  UI->>API: stepId, action e resposta
  API->>API: Sessao, limite, schema, licao e acesso
  API->>Avaliador: Avaliar etapa e resposta
  Avaliador-->>API: Correto, feedback ou indisponivel
  alt Executor indisponivel
    API-->>UI: 503 sem progresso alterado
  else action run
    API-->>UI: Previa e xpEarned zero
  else action submit
    API->>Progresso: Resultado autorizado
    Progresso->>DB: Transacao e lock por usuario
    Progresso->>DB: Consultar tentativa e primeira conclusao
    alt Primeiro acerto elegivel
      Progresso->>DB: Persistir acerto e XP
      Progresso->>DB: Conferir fechamento e credenciais
    else Repeticao ou erro
      Progresso->>DB: Preservar efeitos sem credito duplicado
    end
    DB-->>Progresso: Commit
    Progresso-->>API: Progresso confirmado
    API-->>UI: Resultado e total atualizado
  end
  UI-->>Aluno: Feedback correspondente
```

Recorte A: rota de tentativa, schema e `requireLessonAccess`. Recorte B: `assessLessonStep`, com despacho por tipo. Recorte C: `saveLessonAssessment`, com lock e `firstCompletion`. A demonstração deve repetir um acerto e mostrar que o segundo crédito é zero.

## 2. Executar e submeter exercício

```mermaid
sequenceDiagram
  actor Aluno
  participant API as API de exercicio
  participant Repo as Repositorio
  participant Judge as Avaliador de casos
  participant Runner as Executor
  participant DB as PostgreSQL
  Aluno->>API: run ou submit com codigo
  API->>Repo: Conferir acesso e carregar contrato
  Repo-->>API: Exercicio e casos apropriados
  API->>Judge: Avaliar codigo
  Judge->>Runner: Harness e linguagem
  Runner-->>Judge: Saida, erro ou indisponibilidade
  Judge-->>API: Resultado estruturado
  alt Previa
    API->>Repo: Registrar execucao
    Repo->>DB: ExerciseRun
  else Submissao valida para persistencia
    API->>Repo: Registrar submissao
    Repo->>DB: Transacao e primeira conclusao
    Repo->>DB: Progresso e recompensa elegivel
  end
  API-->>Aluno: Resultado sem revelar testes ocultos
```

Arquivos: `exercises/evaluator.ts`, `exercises/repository.ts` e rotas `run`/`submit`. Observe que execução e submissão têm registros distintos; o adaptador também precisa tratar indisponibilidade antes de afirmar conclusão.

## 3. Reconciliar e verificar credencial

```mermaid
sequenceDiagram
  actor Titular
  participant App as Fluxo de credenciais
  participant Repo as Repositorio de credenciais
  participant DB as PostgreSQL
  actor Usuário
  Titular->>App: Consultar progresso elegivel
  App->>Repo: Reconciliar em contexto autorizado
  Repo->>DB: Consultar evidencias e definicoes
  Repo->>Repo: Conferir requisitos e snapshot
  Repo->>DB: Inserir credenciais faltantes sem duplicacao
  Repo-->>App: Colecao e validade
  Usuário->>App: Abrir identificador publico
  App->>Repo: getPublicCredential
  Repo->>DB: Ler registro correspondente
  Repo->>Repo: Conferir integridade e revogacao
  Repo-->>Usuário: Estado de verificacao
```

A visita pública não chama a concessão de nova credencial. Recortes: `reconcileCredentialsInTransaction`, `getEarnedCredentials` e `getPublicCredential`.

## 4. Publicar e consultar feed

```mermaid
sequenceDiagram
  actor Autor
  participant UI as Editor
  participant API as API de posts
  participant Servico as PostService
  participant DB as PostgreSQL
  Autor->>UI: Compor publicacao
  UI->>API: Conteudo, anexos e client_id
  API->>API: Identidade e contrato
  API->>Servico: create
  Servico->>DB: Procurar autor e client_id
  alt Pedido repetido
    DB-->>Servico: Post ja existente
  else Novo pedido
    Servico->>DB: Conferir anexos do proprietario
    Servico->>DB: Persistir post e efeitos transacionais
  end
  Servico-->>UI: Post confirmado
  UI->>API: Solicitar pagina de feed
  API->>Servico: getFeed com contexto
  Servico->>DB: Filtros, audiencia, bloqueios e cursor
  DB-->>Servico: Pagina limitada
  Servico-->>UI: Itens e proximo cursor
```

Recortes: `PostService.create`, `getFeed` e `visiblePostWhere`. `client_id` é por autor; o acesso do leitor é conferido de novo na consulta.

## 5. Enviar mensagem e recuperar histórico

```mermaid
sequenceDiagram
  actor Remetente
  participant API as API de mensagens
  participant Acesso as BlockService
  participant DB as PostgreSQL
  participant Notificacao as NotificationService
  Remetente->>API: Destinatario e conteudo
  API->>API: Exigir sessao e limite
  API->>Acesso: Conferir interacao permitida
  API->>DB: Criar Message
  API->>Notificacao: Tentar registrar notificacao
  alt Falha posterior de notificacao
    Notificacao-->>API: Erro registrado separadamente
  else Notificacao criada
    Notificacao-->>API: Registro confirmado
  end
  API-->>Remetente: Mensagem gravada
  Remetente->>API: GET historico com destinatario e cursor
  API->>Acesso: Conferir interacao
  API->>DB: Consultar apenas as duas direcoes da conversa
  API-->>Remetente: Pagina privada e cursor
```

Fonte: `/api/messages`. Não inserir no desenho uma entrega em WebSocket obrigatória: o fluxo deve refletir o transporte realmente usado pelo cliente em cada superfície.

## 6. Resgatar baú diário

```mermaid
sequenceDiagram
  actor Jogador
  participant UI as World e AdventureHub
  participant API as API mundinho
  participant RPG as adventure
  participant DB as PostgreSQL
  Jogador->>UI: Abrir bau
  UI->>API: Acao chest
  API->>RPG: Usuario da sessao e acao validada
  RPG->>RPG: Calcular dia em Sao Paulo
  RPG->>DB: Transacao e recibo unico do dia
  alt Recibo novo elegivel
    RPG->>DB: Creditar 10 moedas e extrato
    DB-->>RPG: Commit
    RPG-->>UI: awarded true e recompensa
    UI-->>Jogador: Animacao e credito confirmado
  else Ja resgatado
    RPG-->>UI: awarded false e aviso
    UI-->>Jogador: Estado de hoje sem novo credito
  end
```

Recortes: `dayKey`, `credit` e o ramo `chest` da função `adventure`. Um erro de rede não deve ser desenhado como crédito bem-sucedido.

## 7. Convidar e entrar na arena

```mermaid
sequenceDiagram
  actor Host as Anfitriao
  participant API as API mundinho arena
  participant DB as PostgreSQL
  actor Amigo
  Host->>API: Entrar e consultar amigos elegiveis
  API->>DB: Conferir relacoes e bloqueios
  API-->>Host: Sala e amigos mutuos
  Host->>API: Convidar amigo
  API->>DB: Salvar convidado e validade
  Amigo->>API: Consultar convites
  API-->>Amigo: Convite valido
  Amigo->>API: Aceitar com linguagem escolhida
  API->>DB: Locks e revalidacao de acesso/convite
  alt Admissao elegivel
    API->>DB: Vincular convidado e posicao
    API-->>Host: Snapshot atualizado na sincronizacao
    API-->>Amigo: Sala autorizada
  else Convite ou acesso invalido
    API-->>Amigo: Recusa sem admissao
  end
```

Fonte: `arena.ts`. O convite não é mensagem enviada por e-mail; a implementação consultada o apresenta na interface do Mundinho.

## 8. Turno PvP com exercício

```mermaid
sequenceDiagram
  actor Jogador
  participant UI as MultiplayerArena
  participant API as arena
  participant Regras as Regras puras
  participant Runner as Executor
  participant DB as PostgreSQL
  Jogador->>UI: Escolher habilidade
  UI->>API: attack com sala, partida, turno e skill
  API->>DB: Lock e conferir ator/estado
  API->>Regras: chooseArenaAttack com sorteio do servidor
  alt Golpe direto
    Regras-->>API: Dano, cura/desgaste e proximo turno
    API->>DB: Persistir snapshot
    API-->>UI: Estado confirmado
  else Exercicio necessario
    Regras-->>API: skill e exerciseTurn travados
    API->>DB: Persistir escolha
    API-->>UI: Desafio publico do turno
    Jogador->>UI: Executar ou submeter codigo
    UI->>API: run com identificadores do desafio
    API->>Runner: Compilar fora do lock de sala
    Runner-->>API: Resultado
    API->>DB: Reabrir transacao e revalidar turno
    alt Submissao ainda elegivel
      API->>Regras: advanceArenaTurn
      API->>DB: Persistir efeitos uma vez
    else Turno mudou ou apenas previa
      API->>API: Nao repetir dano
    end
    API-->>UI: Resultado atual
  end
```

O snapshot inicial de equipamentos é criado quando os dois confirmam. Recortes: `equipmentStats`, `chooseArenaAttack`, `advanceArenaTurn` e verificações em `arena`.

## 9. Julgar e encerrar duelo competitivo

```mermaid
sequenceDiagram
  actor Participante
  participant API as Rota de solucao
  participant Juiz as Juiz e executor
  participant Politica as Politica de resolucao
  participant Resolucao as Persistencia da decisao
  participant DB as PostgreSQL
  Participante->>API: Submeter codigo ao duelo
  API->>API: Conferir sessao, participante, estado e prazo
  API->>Juiz: Avaliar casos apropriados
  Juiz-->>API: Resultado estruturado
  API->>DB: Registrar submissao
  API->>Politica: Selecionar e comparar resultados elegiveis
  alt Exige revisao humana
    Politica-->>Resolucao: review por igualdade normalizada
    Resolucao->>DB: Registrar estado pendente
  else Fechamento automatico ou de prazo
    Politica-->>Resolucao: closed, vencedor ou empate
    Resolucao->>DB: Atualizacao condicional e efeitos transacionais
    Resolucao->>DB: Credito unico de vitoria quando devido
  end
  Resolucao-->>Participante: Resultado ou situacao de revisao
```

Há também entrada por manutenção de prazo. Ela usa a mesma política de resultado quando cabível, em vez de depender de uma pessoa manter a página aberta.

## 10. Emitir parecer humano

```mermaid
sequenceDiagram
  actor Avaliador
  participant API as Adaptador de avaliacao
  participant Servico as EvaluatorService
  participant DB as PostgreSQL
  Avaliador->>API: Notas e feedback
  API->>Servico: submitDuelEvaluation com identidade
  Servico->>DB: Conferir papel, perfil e duelo
  Servico->>Servico: Tecnologia, status e conflito
  alt Nao autorizado
    Servico-->>API: Erro sem parecer
  else Contrato elegivel
    Servico->>DB: Transacao de parecer e efeitos previstos
    Servico->>DB: Recompensa elegivel ao avaliador
    DB-->>Servico: Commit
    Servico-->>API: Parecer confirmado
  end
  API-->>Avaliador: Resultado
```

Recortes: `checkEligibility` explica o acesso ao processo de candidatura; `submitDuelEvaluation` explica a autorização de um caso concreto. São conferências diferentes.

## 11. Candidatar e mover no recrutamento

```mermaid
sequenceDiagram
  actor Candidato
  participant API as APIs de vagas
  participant Job as JobService
  participant DB as PostgreSQL
  actor Gestor
  participant Acesso as requireCompanyAccess
  Candidato->>API: Candidatar-se
  API->>Job: applyForJob com usuario da sessao
  Job->>DB: Conferir duplicata e vaga aberta
  Job->>DB: Criar APPLIED e primeira etapa
  Job-->>Candidato: Candidatura confirmada
  Gestor->>API: Consultar ou mover candidatura
  API->>Acesso: Papel e empresa do recurso
  Acesso->>DB: Conferir propriedade da empresa
  API->>Job: Movimento validado
  Job->>DB: Transacao de alteracao e auditoria
  DB-->>Job: Commit
  Job->>Job: Tentar notificacao posterior
  Job-->>Gestor: Estado confirmado
```

O adaptador de movimentação também precisa validar a compatibilidade dos IDs recebidos. Não apresente o método isolado de atualização como responsável por toda a autorização.

## 12. Inscrever em evento com limite

```mermaid
sequenceDiagram
  actor Usuario
  participant API as API de participacao
  participant Evento as EventService
  participant DB as PostgreSQL
  Usuario->>API: Participar
  API->>Evento: participate com usuario e evento
  Evento->>DB: Transacao e lock do evento
  Evento->>DB: Ler usuario, evento, contagem e participacao
  alt Ja participa
    Evento-->>API: Participacao existente
  else Encerrado, lotado ou nivel insuficiente
    Evento-->>API: Erro de dominio
  else Elegivel
    Evento->>DB: Criar participacao unica com score zero
    DB-->>Evento: Commit
    Evento-->>API: Participacao confirmada
  end
  API-->>Usuario: Resultado
```

O lock é por evento porque a capacidade é disputada por todas as pessoas. Lock apenas por usuário não impediria duas contas diferentes de ocupar a última vaga simultaneamente.

## Relação entre diagramas e evidência

Os desenhos são explicações de implementação, não resultados de execução. Para provar cada comportamento em demonstração, use os testes e a ação correspondente no ambiente autorizado. Esta documentação não executa cadastros, candidaturas, mensagens ou partidas para produzir uma evidência fictícia.
