# Rastreabilidade do seminário

Base: commit `9256a4f`.

| Caso | Arquivo | Linhas | Evidência |
|---|---|---|---|
| UC005 — Estudar lição | `src/app/lesson/[lessonId]/page.tsx` | 59–64, 76–83 | Carrega a lição, valida o acesso e entrega conteúdo e progresso à interface. |
| UC006 — Resolver exercício | `src/app/api/lessons/[lessonId]/attempt/route.ts` | 21–40 | Avalia a resposta no servidor. Testar código não concede XP nem conclui a etapa. |
| UC017 — Publicar vaga | `src/app/api/jobs/route.ts` | 67–80, 89–94 | Exige papel de recrutador ou administrador e vínculo autorizado com a empresa. |
| UC022 — Candidatar-se a vaga | `src/services/job.service.ts` | 269–291 | Verifica a vaga aberta e cria uma candidatura vinculada ao usuário e à etapa inicial. |
| UC023 — Inscrever-se ou cancelar participação em evento | `src/app/api/events/[id]/participate/route.ts` | 6–16, 19–29 | POST confirma a inscrição. DELETE cancela a participação do usuário autenticado. |
| UC026 — Atualizar etapa de candidatura | `src/app/api/jobs/[id]/route.ts` | 30–46, 48–54 | Confere a empresa, a candidatura e a etapa antes de atualizar o processo. |
| UC013 — Criar publicação | `src/services/post.service.ts` | 25–38, 40–46 | A criação grava a publicação e concede XP na mesma transação. |
| UC011 — Consultar ranking de XP | `src/app/api/leaderboard/route.ts` | 31–55 | O servidor consulta e ordena os usuários. O caso de uso é consulta, sem manutenção manual do ranking. |
| UC056 — Consultar candidaturas de uma vaga | `src/app/api/jobs/[id]/applications/route.ts` | 1–13 | A rota exige papel autorizado. JobService também valida a responsabilidade pela empresa. |
| AUTO01 — Notificação da candidatura | `src/services/job.service.ts` | 309–333 | A atualização avisa o candidato associado à candidatura. O código não envia um alerta geral por intenção de vaga. |

## Operações das classes

| Responsável UML | Código | Operações |
|---|---|---|
| JobService | `src/services/job.service.ts` | listJobs(), getJobById(), createJob(), applyForJob(), updateApplicationStage(), getJobApplications(), createCompany() |
| EventService | `src/services/event.service.ts` | listEvents(), createEvent(), participate(), cancelParticipation(), deleteEvent() |
| LessonProgress | `src/lib/learning/lesson-progress.ts` | getLessonProgress(), requireLessonAccess(), saveLessonAssessment() |
| LessonAssessment | `src/lib/learning/assessment.ts` | assessLessonStep(), publicLesson() |
| LearningRepository | `src/lib/learning/repository.ts` | getKnowledgeMapForUser() |
| XpService | `src/services/xp.service.ts` | awardXP(), awardXPInTransaction() |
| QuizService | `src/services/quiz.service.ts` | generateDaily(), validateQuizAnswer() |
| DuelResolution | `src/lib/duels/resolution.ts` | resolveDuelIfReady(), resolveDuelAtDeadline(), awardDuelWinnerXP() |
| PostService | `src/services/post.service.ts` | create(), getFeed() |
| MessagesRoute | `src/app/api/messages/route.ts` | GET(), POST() |
| MobilePush | `src/lib/mobile/push.ts` | sendMobilePush() |
| NotificationService | `src/services/notification.service.ts` | create(), getUserNotifications(), markAllAsRead(), getUnreadCount() |
| EventChallengeService | `src/services/event-challenge.service.ts` | list(), replaceSet() |

## Cobertura da visão geral

| Grupo | Capacidade | Casos detalhados |
|---|---|---|
| G01 | Conta e perfil | UC001, UC002, UC003, UC030, UC050, UC051 |
| G02 | Estudar lições e acompanhar progresso | UC004, UC005, UC007, UC037 |
| G03 | Resolver exercícios e consultar ajuda | UC006, UC012, UC028, UC029, UC052 |
| G04 | Participar de duelos | UC008, UC009, UC010, UC053, UC054 |
| G05 | Consultar ranking | UC011 |
| G06 | Manter publicações e interagir no feed | UC013, UC014, UC031, UC034, UC035, UC036 |
| G07 | Consultar perfis e seguir pessoas | UC032, UC033 |
| G08 | Trocar mensagens | UC038, UC039, UC040, UC041 |
| G09 | Consultar e participar de eventos | UC023, UC046 |
| G10 | Consultar vagas e candidatar-se | UC018, UC022 |
| G11 | Consultar notificações | UC021, UC055 |
| G12 | Solicitar credenciamento de avaliador | UC024 |
| G13 | Gerenciar vagas, empresas e candidaturas | UC017, UC025, UC026, UC056 |
| G14 | Organizar eventos e desafios | UC015, UC047, UC048 |
| G15 | Avaliar empate técnico | UC016 |
| G16 | Administrar o sistema | UC019, UC020, UC027, UC049 |

## Imagens dos diagramas nos slides

Os 33 slides que contêm diagramas usam as imagens exportadas pelo Astah UML, a partir do projeto `Stacklyst-seminario.asta`. O pacote `06 Evidencias do seminario` reúne as nove vistas de casos de uso e a dependência de notificação usadas ao lado das capturas de código. Essas vistas reutilizam os elementos do modelo. As 23 demais imagens são as vistas gerais, classes, DER e atividades do negócio já presentes no projeto.
