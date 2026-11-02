# Eventos, hackathons e desafios

## Representação

Hackathon é um valor de `EventType`. A existência do tipo não comprova equipes, entrega de repositório ou julgamento automático. Cada capacidade precisa de rota e persistência próprias.

`EventService` lista, consulta, cria e gerencia participação/exclusão. `event-status.ts` combina datas e estado persistido: início alcançado pode tornar o evento em andamento; término passado o torna concluído.

## Participação

A inscrição identifica o usuário e confere evento, capacidade e nível mínimo conforme o serviço. O nível vem de `calculateLevel`. Evento/usuário é uma associação única; a inclusão usa operação idempotente e score inicial zero. Inscrever-se não deve ser confundido com concluir desafios ou receber toda a recompensa declarada.

Cancelamento rejeita evento encerrado. Exclusão exige criador ou administrador. O detalhe carrega uma quantidade limitada de participantes para classificação; esse limite de consulta não representa o total de inscritos.

## Desafios

`EventChallengeService.list` entrega desafios ordenados e só inclui resposta esperada para quem pode gerenciar. `replaceSet` exige criador/administrador, bloqueia mudanças depois do término e substitui o conjunto em transação. Limites/contratos ficam em `lib/event-challenges.ts`.

Resposta esperada de evento não equivale ao harness de exercícios com casos públicos e ocultos. Antes de anunciar pontuação automática de hackathon, localize endpoint de submissão e avaliador efetivos. Coleção editável de desafios não implementa sozinha esse ciclo.

## Dados e operação

Consulte `Event`, `EventParticipant` e `EventChallenge` no dicionário. Schema local e arquivo de migration não comprovam aplicação no ambiente. Durante a arena foi identificada uma migration antiga de desafios de eventos pendente, que não foi aplicada naquele trabalho. Confira o ambiente antes de depender da tabela.

Testes: `event-participation.test.ts`, `event-challenge.service.test.ts` e regras de status. Alterações de data/capacidade precisam cobrir início, término, lotação, inscrição repetida e cancelamento.
