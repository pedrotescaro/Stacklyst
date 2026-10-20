from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[4]
REV=Path(__file__).resolve().parents[1]
OUT=REV/'analise-sistema'
OUT.mkdir(exist_ok=True)
audit=json.loads((REV/'fontes-extraidas/auditoria.json').read_text(encoding='utf-8'))
source={x['id']:x for x in audit['functional_requirements']}
rows=[]
def ev(path,needle):
    lines=(ROOT/path).read_text(encoding='utf-8').splitlines()
    n=next((i for i,s in enumerate(lines,1) if needle in s),None)
    if n is None: raise ValueError(f'No evidence needle: {path} {needle}')
    return f'{path}:{n}'
def add(id,state,priority,summary,evidence,gap='',observation=''):
    s=source[id]
    rows.append({'id':id,'nome':s['Nome'],'estado_documentado':s['Estado e referências de implementação'],'estado_verificado':state,'evidencia':[ev(p,n) for p,n in evidence],'constatacao':summary,'lacuna':gap,'prioridade_proposta':priority,'observacao':observation or 'Inspeção estática do código atual. Não representa homologação ou teste de execução.'})
add('RF001','parcial','P1','Cadastro possui validação, rate limit, unicidade, criação de identidade e perfil com trilhas.',[
 ('src/app/api/auth/register/route.ts','registerSchema.parse'),('src/app/api/auth/register/route.ts','prisma.$transaction'),('src/app/register/page.tsx',"fetch('/api/auth/confirm-email'"),('src/app/api/auth/confirm-email/route.ts',"action === 'verify' && !token && !token_hash")],
 'Quando a conta depende de confirmação de e-mail, a interface envia somente e-mail para um endpoint que exige token ou token_hash. O fallback recebe 400. Implementar a confirmação e o reenvio na interface, preservando a verificação do token. A rota declara action=resend, mas não executa um ramo de reenvio.')
add('RF002','parcial','P1','Login por senha e OAuth, com identidade verificada no servidor e papel lido do banco.',[
 ('src/app/login/page.tsx','auth.signInWithPassword'),('src/lib/auth-session.ts','auth.getClaims'),('src/lib/auth.ts','export async function requireRole'),('src/app/login/page.tsx',"body: JSON.stringify({ email: trimmedEmail })"),('src/app/api/auth/confirm-email/route.ts',"action === 'verify' && !token && !token_hash")],
 'O tratamento de e-mail não confirmado ainda tenta confirmação automática sem token e falha contra o contrato atual da API. Falta o percurso de confirmação/reenvio para essas contas; login de conta já confirmada tem implementação completa.')
add('RF003','implementado','P3','Menu e configurações chamam logout; servidor solicita signOut e remove o cookie JWT secundário.',[
 ('src/components/Sidebar.tsx',"fetch('/api/auth/logout'"),('src/app/api/auth/logout/route.ts','supabase.auth.signOut'),('src/app/api/auth/logout/route.ts','removeJwtCookie')],
 '', 'A referência documental LogoutButton.tsx está desatualizada; os controles atuais estão em Sidebar, Navbar e settings. Revogação da sessão depende de validação em ambiente de homologação.')
add('RF004','parcial','P2','Edição do próprio perfil, unicidade de username e bloqueio de sete dias estão implementados.',[
 ('src/app/api/profile/update/route.ts','if (!user)'),('src/app/api/profile/update/route.ts','USERNAME_COOLDOWN_MS'),('src/app/api/profile/update/route.ts','bio: bio !== undefined'),('src/components/EditProfileModal.tsx',"fetch('/api/profile/update'")],
 'A validação no servidor concentra-se em username e nome. Os demais campos são copiados do JSON sem schema de tipos/limites, e birthday é convertido diretamente em Date. Unificar validação de bio, links, pronome, data e configuração de avatar para evitar valores inválidos e erros 500.')
add('RF005','implementado','P3','Mapa e lista usam o mesmo grafo combinado do catálogo editorial com entidades publicadas do banco.',[
 ('src/app/trails/page.tsx','const unifiedMap = mergeLearningMaps'),('src/lib/learning/repository.ts','where: { is_published: true }'),('src/app/trails/TrailsContent.tsx','<LearningJourney'),('src/app/trails/LearningJourney.tsx',"data-view={mode}")])
add('RF006','implementado','P3','Seleção de curso é salva em preferência por usuário; o acesso à lição verifica pré-requisitos.',[
 ('src/app/trails/TrailsContent.tsx',"fetch('/api/trails/course-preferences'"),('src/app/api/trails/course-preferences/route.ts','serializeTrailCoursePreferences('),('src/lib/learning/lesson-progress.ts','export async function requireLessonAccess')],
 '', 'Preferência de curso é persistida em cookie HTTP-only do navegador; progresso das atividades permanece no banco. Persistência de preferência entre dispositivos é uma evolução, não comprovadamente exigida pelo RF.')
add('RF007','implementado','P3','Página de lição entrega conteúdo sanitizado, etapas e progresso, e trata lição inexistente ou bloqueada.',[
 ('src/app/lesson/[lessonId]/page.tsx','await requireLessonAccess'),('src/app/lesson/[lessonId]/page.tsx','lesson={publicLesson(lesson)}'),('src/app/lesson/[lessonId]/page.tsx','notFound();'),('src/lib/learning/assessment.ts','export function publicLesson')])
add('RF008','implementado','P3','Servidor valida a resposta e tipos de atividade, distingue testar de submeter e recusa executor indisponível.',[
 ('src/app/api/lessons/[lessonId]/attempt/route.ts','lessonAnswerSchema.safeParse'),('src/app/api/lessons/[lessonId]/attempt/route.ts',"if (answer.action === 'run')"),('src/app/api/lessons/[lessonId]/attempt/route.ts',"'RUNNER_UNAVAILABLE'"),('src/app/lesson/[lessonId]/LessonClient.tsx',"await sendAnswer('submit')")],
 '', 'Implementação funcional constatada. O tratamento de timeout nos provedores de execução precisa ser consolidado conforme a análise técnica de aprendizagem; inspeção estática não comprova disponibilidade operacional.')
add('RF009','implementado','P3','Tentativa, XP inicial e progresso são gravados em transação com lock por usuário.',[
 ('src/lib/learning/lesson-progress.ts','return learningTransaction'),('src/lib/learning/lesson-progress.ts','const firstCompletion ='),('src/lib/learning/lesson-progress.ts','else if (firstCompletion)'),('prisma/schema.prisma','@@unique([user_id, quiz_id])')],
 '', 'O registro único por usuário/atividade e a primeira recompensa são o contrato documentado deste RF. A ausência de histórico de eventos individual é tratada em RF010, sem invalidar a persistência e o desbloqueio atuais.')
add('RF010','parcial','P2','Perfil exibe agregados de acurácia, ofensiva, contagem semanal e progresso de trilha.',[
 ('src/app/api/quiz/weekly-activity/route.ts',"const targetUserId ="),('src/app/api/quiz/weekly-activity/route.ts','weekDays: Array.from'),('src/app/profile/[username]/ProfileContent.tsx',"fetch(`/api/quiz/weekly-activity"),('src/lib/learning/lesson-progress.ts','else if (firstCompletion)')],
 'Não há no fluxo inspecionado uma consulta navegável das tentativas e resultados individuais, somente agregados; as tentativas de lição sobrescrevem a primeira falha no acerto. A API semanal também aceita userId de outro usuário, comportamento usado pelo perfil. A política deve distinguir atividade pública de histórico privado autorizado.')
add('RF011','parcial','P1','XP é derivado no servidor e, nos exercícios, condicionado à primeira conclusão válida.',[
 ('src/lib/learning/lesson-progress.ts','const xpEarned = firstCompletion'),('src/lib/xp.ts','pg_advisory_xact_lock'),('src/lib/duels/resolution.ts','xp_awarded_at'),('src/lib/duels/resolution-policy.ts','function chooseBest')],
 'Há lacuna transversal nos duelos: a política pode escolher uma submissão JUDGE_UNAVAILABLE como vencedora no encerramento por prazo, permitindo a recompensa de vitória. Ver evidência offline da análise de domínios. A regra de não conceder XP em indisponibilidade precisa valer em todos os emissores.')
add('RF012','implementado','P3','Cálculo de nível usa limiares crescentes centralizados em rewards.ts e é aplicado em XP, perfil e ranking.',[
 ('src/lib/learning/rewards.ts','export function calculateLevel'),('src/lib/xp.ts','newLevel: calculateLevel'),('src/app/api/leaderboard/route.ts','level: calculateLevel')])
add('RF013','parcial','P2','Há badges persistidos, critérios de concessão e proteção de duplicidade, exibidos no perfil.',[
 ('src/lib/xp.ts','async function checkBadgeEligibility'),('src/lib/xp.ts','if (!language)'),('src/lib/xp.ts','await checkBadgeEligibility'),('prisma/schema.prisma','model UserBadge'),('src/components/BadgeGrid.tsx','export function BadgeGrid')],
 'A rotina retorna antes de verificar conquistas quando a atividade concede XP sem linguagem; assim, critérios gerais como sequência ou respostas podem ser verificados somente numa atividade futura com linguagem. Critérios são condicionais em código, sem versão registrada na conquista. Consolidar a concessão para todas as atividades elegíveis e versionar os critérios.')
add('RF014','parcial','P2','Ranking consulta XP real, aplica desempate determinístico e permite filtro por linguagem.',[
 ('src/app/api/leaderboard/route.ts','take: 50'),('src/lib/learning/language-xp.ts','ORDER BY t.xp DESC'),('src/app/leaderboard/LeaderboardClient.tsx',"fetch(`/api/leaderboard?language="),('src/app/leaderboard/LeaderboardClient.tsx',"useState<string>('ouro')"),('src/app/leaderboard/LeaderboardClient.tsx','6 dias restantes')],
 'A tabela real é apresentada com liga/divisão estática, prazo fixo de seis dias e promessa de promoção dos dez primeiros sem o mecanismo correspondente. A API atual retorna até 50, divergindo do top 10 descrito no documento. A posição de quem está fora da lista não é carregada neste painel.')
add('RF015','parcial','P2','O núcleo calcula cinco faixas de XP acumulado, mas a tela de ranking não usa esse cálculo.',[
 ('src/lib/learning/rewards.ts','export const XP_BANDS'),('src/services/duel.service.ts','export function getUserRankTier'),('src/app/leaderboard/LeaderboardClient.tsx','const DIVISIONS'),('src/app/leaderboard/LeaderboardClient.tsx',"useState<string>('ouro')")],
 'O núcleo usa Bronze/Prata/Ouro/Platina/Diamante. A interface usa seis divisões com Safira/Rubi, desbloqueios constantes e Ouro inicial para todos. Escolher uma regra de produto e propagá-la do servidor à interface, sem apresentar promoção/rebaixamento inexistentes.')
add('RF037','parcial','P1','Perfil oferece dados e indicadores públicos e omite e-mail, com paginação de publicações.',[
 ('src/app/api/profile/[username]/route.ts','user: {'),('src/app/api/profile/[username]/route.ts','birthday: viewerId === user.id'),('src/app/profile/[username]/page.tsx','birthday: profileUser.birthday'),('src/app/profile/[username]/page.tsx','profileUser={serializedProfileUser}')],
 'A API mascara birthday para visitantes do perfil, mas a página de servidor envia a data completa de qualquer dono de perfil ao componente cliente. Unificar o objeto público sanitizado nos dois caminhos. Informações não exibidas visualmente ainda são serializadas no navegador.')
add('RF038','parcial','P1','Perfil e lista de candidatos oferecem XP, respostas, acurácia e progresso permitido.',[
 ('src/app/profile/[username]/page.tsx','stats={{'),('src/services/job.service.ts','async getJobApplications'),('src/services/job.service.ts','user: true,'),('src/app/api/jobs/[id]/route.ts','application: updatedApplication')],
 'Consulta de candidaturas usa seleção pública, mas atualização devolve user:true, incluindo e-mail/data de nascimento e demais campos do usuário. Remover campos privados do retorno e centralizar seleção pública. Painel analítico além dos indicadores existentes continua uma evolução sem implementação completa.')
add('RF044','parcial','P2','Notificações são persistidas para o destinatário; falha do aviso não reverte a atualização da candidatura.',[
 ('src/services/notification.service.ts','async create(data:'),('src/services/job.service.ts',"type: 'JOB_APPLICATION_UPDATE'"),('src/services/job.service.ts','Failed to notify job application update'),('src/services/notification.service.ts',"return 'Notificacao Stacklyst'"),('src/services/notification.service.ts','return null;')],
 'JOB_APPLICATION_UPDATE e resourceType JOB não têm título, texto e link específicos no normalizador da web. A interface exibe aviso genérico e não leva à vaga/candidatura, embora o registro do evento exista. Campos title/content/link aceitos no input do serviço também não são persistidos.')
add('RF045','parcial','P2','A API consulta somente notificações da identidade autenticada e calcula contagem não lida.',[
 ('src/app/api/notifications/route.ts','getUserNotifications(user.id'),('src/services/notification.service.ts','async getUserNotifications'),('src/services/notification.service.ts','const takeVal = useCursor'),('src/app/notifications/page.tsx',"fetch('/api/notifications'")],
 'A tela usa a variante sem cursor, que omite take e carrega todas as notificações. Há paginação na API, mas falta integrá-la à interface e limitar parâmetros. Atualizações de candidatura também precisam de conteúdo/link próprios para serem compreensíveis.')
add('RF046','parcial','P2','Marcar todas como lidas existe e restringe a gravação ao usuário autenticado.',[
 ('src/app/api/notifications/route.ts','export const POST'),('src/services/notification.service.ts','async markAllAsRead'),('src/app/notifications/page.tsx','const handleMarkAllAsRead'),('src/app/notifications/page.tsx','}, 3000)')],
 'RF046 prevê marcar uma ou todas. A API atual oferece apenas todas e a tela executa essa ação automaticamente após três segundos. Implementar leitura individual e atualizar contagem de forma previsível; a referência documental /notifications/read não corresponde a uma rota atual.')
(OUT/'rf-autenticacao-aprendizagem-notificacoes.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
add('RF016','parcial','P2','Criação de vaga aberta e pareamento rápido usam linguagem e operações condicionais.',[
 ('src/app/api/duels/route.ts','export async function POST'),('src/app/api/duels/route.ts','return matchOrCreateDuel'),('src/lib/duels/lifecycle.ts','export')],
 'A manutenção pode vincular automaticamente um usuário recente a uma vaga vencida, em contraste com a adesão voluntária e a perda de elegibilidade da vaga expirada documentadas em UC008/009. Alinhar a política do produto e seu acionamento operacional.')
add('RF017','parcial','P2','Entrada na arena aberta verifica usuário, linguagem e disponibilidade da vaga.',[
 ('src/app/api/duels/route.ts','return matchOrCreateDuel'),('src/lib/duels/lifecycle.ts','export')],
 'A manutenção escolhe oponente de vaga vencida sem a solicitação voluntária prevista no documento. A entrada direta possui implementação; a lacuna está no comportamento paralelo de manutenção.')
add('RF018','legado','P2','Convites diretos, aceite e rejeição continuam implementados e acessíveis pela interface e API.',[
 ('src/app/api/duels/respond/route.ts','export const POST'),('src/app/api/duels/respond/route.ts','respondDuelRequest'),('src/app/profile/[username]/ProfileContent.tsx',"'/api/duels/request'")],
 'O documento classifica o recurso como histórico fora do escopo vigente, mas o produto ainda o oferece. Decidir por manter e documentar o comportamento atual ou desativar o percurso completo.',
 'Legado descreve a classificação documental. Não significa inativo: o código e os controles do convite permanecem ativos. Nenhuma rota foi desativada nesta auditoria.')
add('RF019','parcial','P1','Submissão de duelo autentica participante, limita entrada e verifica prazo antes de julgar.',[
 ('src/app/api/duels/[id]/solution/route.ts','export async function POST'),('src/app/api/duels/[id]/solution/route.ts','duel.challenger_id !== user.id'),('src/lib/duels/resolution-policy.ts','export function chooseBestDuelSubmission')],
 'No fechamento por prazo, uma submissão com executor indisponível pode ser escolhida como vencedora. Não basta proteger a rota de envio: a política de resolução deve excluir falhas de infraestrutura de resultados competitivos.')
add('RF020','parcial','P1','Julgamento e resolução automáticos encaminham empate técnico para revisão humana.',[
 ('src/lib/duels/resolution-policy.ts','export function decideDuelResolution'),('src/lib/duels/resolution.ts','export'),('src/app/api/evaluations/route.ts',"status: 'REVIEW_PENDING'")],
 'A resolução por prazo aceita JUDGE_UNAVAILABLE e pode produzir vitória sem execução válida. O indicador administrativo de avaliações pendentes também conta ACTIVE, enquanto a fila real usa REVIEW_PENDING.')
add('RF021','parcial','P1','Vitória concede 50 XP com proteção de recompensa duplicada.',[
 ('src/lib/duels/resolution.ts','xp_awarded_at'),('src/lib/duels/resolution.ts','awardXPInTransaction(tx, decision.winnerId')],
 'A idempotência está presente, porém a política anterior pode declarar vencedor a partir de indisponibilidade do executor e acionar a recompensa indevida. Corrigir a elegibilidade antes da concessão.')
add('RF022','implementado','P3','Workspace apresenta e registra dicas conforme o modo de assistência.',[
 ('src/app/lesson/[lessonId]/ExerciseWorkspace.tsx',"const canUseHints ="),('src/app/lesson/[lessonId]/ExerciseWorkspace.tsx','exercise.hints.slice'),('src/app/api/exercises/[exerciseId]/events/route.ts','export')])
add('RF023','implementado','P3','Quatro modos de assistência controlam dicas, documentação e autocomplete sem modificar a recompensa.',[
 ('src/components/lesson/AssistanceControls.tsx',"id: 'NO_ASSIST'"),('src/app/lesson/[lessonId]/ExerciseWorkspace.tsx','const canUseAutocomplete ='),('src/app/lesson/[lessonId]/ExerciseWorkspace.tsx','value={assistanceMode}')])
add('RF024','implementado','P3','Link editorial de documentação é exibido no workspace quando o modo permite.',[
 ('src/app/lesson/[lessonId]/ExerciseWorkspace.tsx',"const canUseDocumentation = assistanceMode !== 'NO_ASSIST'"),('src/app/lesson/[lessonId]/ExerciseWorkspace.tsx','href={exercise.documentationUrl}')])
add('RF025','implementado','P3','Editor recebe configuração de autocomplete segundo assistência permitida.',[
 ('src/components/CodeEditor.tsx','autocompletion = false'),('src/app/lesson/[lessonId]/ExerciseWorkspace.tsx','autocompletion={canUseAutocomplete}')])
add('RF026','implementado','P3','Candidatura a avaliador valida elegibilidade, motivação, tecnologia e candidatura pendente.',[
 ('src/services/evaluator.service.ts','async applyForEvaluator'),('src/services/evaluator.service.ts','const eligibility = await this.checkEligibility'),('src/app/api/evaluators/apply/route.ts','export')])
add('RF027','implementado','P3','Fila de avaliações requer papel e perfil ativo, filtra tecnologia e exclui o próprio participante.',[
 ('src/app/api/evaluations/route.ts','await requireEvaluator'),('src/app/api/evaluations/route.ts',"status: 'REVIEW_PENDING'"),('src/app/api/evaluations/route.ts','challenger_id: { not: evaluator.id }')],
 '', 'O indicador administrativo de pendências é inconsistente com a fila e é tratado em RF039/RF020. Isso não elimina o fluxo de recebimento de avaliações implementado.')
add('RF028','implementado','P3','Parecer humano valida pontuações e feedback e impede avaliação por participante do duelo.',[
 ('src/app/api/evaluations/route.ts','const evaluationSchema ='),('src/services/evaluator.service.ts','async submitDuelEvaluation'),('src/app/evaluations/page.tsx','export')])
add('RF029','implementado','P3','Serviço registra parecer e fecha o duelo com transição condicional e recompensa transacional.',[
 ('src/services/evaluator.service.ts','async submitDuelEvaluation'),('src/services/evaluator.service.ts','prisma.$transaction'),('prisma/schema.prisma','model DuelEvaluation')],
 '', 'Uma política de recurso/reavaliação permanece uma evolução explicitamente indicada nas fontes. O fluxo atual de decisão única foi constatado no código, sem homologação de concorrência.')
add('RF030','implementado','P3','Publicação exige autenticação, validação e rate limit, com post e XP na mesma transação.',[
 ('src/app/api/posts/route.ts','export const POST'),('src/app/api/posts/route.ts','createPostSchema.parseAsync'),('src/services/post.service.ts','prisma.$transaction'),('src/services/post.service.ts','XpService.awardXPInTransaction')])
add('RF031','implementado','P3','Feed possui filtros, cursor e lote limitado de 1 a 50 itens.',[
 ('src/app/api/posts/route.ts','const limit = Number.isFinite'),('src/services/post.service.ts','async getFeed'),('src/app/feed/page.tsx','export')])
add('RF032','implementado','P3','Respostas, votos, reações e favoritos possuem rotas e persistência ligadas à publicação.',[
 ('src/app/api/posts/[id]/answer/route.ts','createAnswerSchema.parse'),('src/app/api/posts/[id]/vote/route.ts','export'),('src/app/api/posts/[id]/bookmark/route.ts','export'),('src/app/api/posts/[id]/react/route.ts','export')])
add('RF033','implementado','P3','Denúncia exige identidade, publicação existente e motivo; denúncia anterior é atualizada.',[
 ('src/app/api/posts/[id]/report/route.ts','const existingReport ='),('src/app/api/posts/[id]/report/route.ts','prisma.report.update'),('src/app/api/posts/[id]/report/route.ts','prisma.report.create')],
 '', 'A remoção administrativa da publicação denunciada tem falha separada, registrada em RF043. A denúncia não remove o conteúdo automaticamente.')
add('RF034','parcial','P2','Usuário autenticado cadastra empresa e é promovido a recrutador quando ainda possui papel USER.',[
 ('src/app/api/companies/route.ts','export const POST'),('src/services/job.service.ts','async createCompany'),('src/services/job.service.ts','const company = await prisma.company.create'),('src/services/job.service.ts','await prisma.user.updateMany')],
 'Criação da empresa e promoção do responsável são duas operações sem uma transação conjunta. Falha da segunda pode deixar empresa criada e usuário sem papel para publicar. O slug único também torna o retry não idempotente. Cenário de falha não foi induzido no banco.')
add('RF035','parcial','P2','Publicar vaga exige papel e acesso à empresa e persiste etapas junto da oportunidade.',[
 ('src/app/api/jobs/route.ts','await requireCompanyAccess'),('src/services/job.service.ts','const defaultStages = stages ||'),('src/services/job.service.ts','const job = await prisma.job.create')],
 'O schema aceita stages:[] e ordens não limitadas. O fallback stages||defaults mantém o array vazio, criando vaga sem etapa inicial. Definir contrato para vazio e validar a ordem antes da persistência.')
add('RF036','implementado','P3','Listagem e detalhe de vagas são ligados ao banco e aceitam busca, nível, tecnologia, modalidade e contrato.',[
 ('src/app/api/jobs/route.ts','export const GET'),('src/services/job.service.ts','async listJobs'),('src/services/job.service.ts','async getJobById'),('src/app/jobs/[id]/JobDetailContent.tsx','export')],
 '', 'Vaga não aberta é rejeitada ao candidatar-se; mensagens de erro desse caso precisam evoluir em RF047. Paginação de volume elevado é uma evolução de desempenho.')
add('RF039','parcial','P1','Administração lista usuários com busca e paginação e permite alterar papéis.',[
 ('src/services/admin.service.ts','async listUsers'),('src/services/admin.service.ts','async updateUserRole'),('src/app/api/admin/users/route.ts','export const PATCH')],
 'Alterar papel não impede remover o último administrador e o log não identifica o ator da operação. Além disso, a métrica de avaliações pendentes usa duelos ACTIVE em vez de REVIEW_PENDING. Proteger invariantes e registrar auditoria com ator/alvo/antes/depois.')
add('RF040','parcial','P2','Existem revisão de denúncias e geração editorial de quiz no painel administrativo.',[
 ('src/app/admin/AdminContent.tsx','export'),('src/app/api/admin/reports/route.ts','export const GET'),('src/app/api/admin/quiz/generate-daily/route.ts','export'),('src/lib/learning/catalog.ts','LEARNING_LESSONS')],
 'CRUD editorial completo de catálogo não é entregue pelo painel existente; as lições são conteúdo versionado em código. A parcialidade já é declarada no documento. Definir se há necessidade real de um painel editorial antes de expandir o produto.')
add('RF041','parcial','P2','Eventos podem ser criados por usuário autenticado e removidos pelo criador ou administrador.',[
 ('src/app/api/events/route.ts','export const POST'),('src/services/event.service.ts','async createEvent'),('src/services/event.service.ts','async deleteEvent')],
 'O fluxo principal grava UPCOMING e usa status persistido, enquanto desafios calculam estado pelas datas. No código inspecionado não há transição uniforme de estado; jobs externos não foram verificados. Inscrição é funcional. Edição e premiação de competição são evoluções separadas, não exigências entregues por este RF.')
add('RF042','parcial','P1','RBAC no servidor protege alteração de papéis e funções privilegiadas.',[
 ('src/lib/auth.ts','export async function requireRole'),('src/app/api/admin/users/route.ts','await requireAdmin'),('src/services/admin.service.ts','async updateUserRole')],
 'Não há guarda para preservar o último ADMIN nem auditoria completa de mudanças com ator e retenção definida. O usuário comum não obtém acesso administrativo por essa lacuna; o risco é a ação de um administrador autorizado remover a última conta administrativa.')
add('RF043','parcial','P1','Admin consulta denúncias e oferece remoção da publicação denunciada.',[
 ('src/app/api/admin/reports/route.ts','export const DELETE'),('src/services/admin.service.ts','async deleteReportedPost'),('prisma/schema.prisma','model Report')],
 'post.delete remove as denúncias por cascata; em seguida report.delete procura uma linha já removida. A requisição pode terminar com P2025/500 depois de apagar o conteúdo. Corrigir remoção idempotente/transacional e validar vínculo publicação-denúncia. Recurso e política de sanções continuam pendentes no documento.')
add('RF047','parcial','P2','Candidatura cria vínculo usuário/vaga protegido por unique e recusa vaga não aberta.',[
 ('src/app/api/jobs/[id]/apply/route.ts','export const POST'),('src/services/job.service.ts','async applyForJob'),('prisma/schema.prisma','@@unique([job_id, user_id])')],
 'Vaga fechada ou candidatura repetida lançam Error comum e retornam 500 genérico; concorrência é protegida pela constraint, mas o conflito não é traduzido. Vagas criadas sem etapas recebem candidatura com stage_id nulo, contrariando a etapa inicial prevista.')
add('RF048','parcial','P1','API autoriza empresa e valida se candidatura e etapa pertencem à mesma vaga antes de atualizar.',[
 ('src/app/api/jobs/[id]/route.ts','export const PATCH'),('src/app/api/jobs/[id]/route.ts','technical_score: z.number().optional()'),('src/services/job.service.ts','user: true,'),('src/app/recruiter/RecruiterContent.tsx','application_id:')],
 'PATCH devolve o usuário completo da candidatura, expondo campos privados ao responsável. A UI opera apenas status, sem seleção de etapa, feedback ou nota; o candidato não vê feedback. A API também aceita nota técnica sem intervalo/int e a notificação web é genérica sem link. Completar o percurso e sanitizar o retorno.')
add('RF049','parcial','P2','Inscrição verifica capacidade sob lock de evento, nível, unicidade e encerramento; o usuário cancela a própria participação.',[
 ('src/services/event.service.ts','async participate'),('src/services/event.service.ts','pg_advisory_xact_lock'),('src/services/event.service.ts','async cancelParticipation'),('src/app/api/events/[id]/participate/route.ts','export const DELETE')],
 'Cancelamento bloqueia somente status COMPLETED, sem consultar end_date. Um evento vencido ainda UPCOMING/ONGOING permite cancelar. Reutilizar o mesmo critério temporal da inscrição.')
domain=json.loads((OUT/'lacunas-dominios.json').read_text(encoding='utf-8'))
flows=json.loads((OUT/'lacunas-fluxos.json').read_text(encoding='utf-8'))
for row in rows:
    did=[f for f in domain['findings'] if row['id'] in f['ids_rf']]
    fid=[f for f in flows['lacunas'] if row['id'] in f['requisitos']]
    row['achados_relacionados']=[f['id'] for f in did+fid]
    for f in did:
        row['evidencia'].extend(f"{e['path']}:{e['line']}" for e in f['evidencias'])
    for f in fid:
        row['evidencia'].extend(f"{e['arquivo']}:{e['linha']}" for e in f['evidencias'])
    row['evidencia']=list(dict.fromkeys(row['evidencia']))
    if row['id']=='RF007':
        row.update(estado_verificado='parcial',prioridade_proposta='P2',lacuna='Catálogo aplica pré-requisitos antes de renderizar. O ramo workspace entrega enunciado, dicas e editor sem requireExerciseAccess e só rejeita a ação de executar/submeter depois. Não é bypass de XP. Aplicar o gate também à leitura da URL direta.')
    if row['id']=='RF008':
        row.update(estado_verificado='parcial',prioridade_proposta='P1',lacuna='O fluxo de catálogo interrompe unavailable antes de salvar; o workspace grava submissão ERROR e altera progresso mesmo em indisponibilidade. Além disso, AbortError de transporte em Judge0/Wandbox é tratado como erro do programa e impede fallback, podendo ser salvo como tentativa incorreta. Separar indisponibilidade técnica de erro do aluno.')
    if row['id']=='RF009':
        row.update(estado_verificado='parcial',prioridade_proposta='P1',lacuna='Locks, primeira recompensa e gravação atômica existem. Porém o workspace registra submissão ERROR e UserNodeProgress em indisponibilidade do executor, enquanto o catálogo preserva progresso. Unificar o comportamento de falha essencial antes da persistência.')
rows.sort(key=lambda x:x['id'])
assert len(rows)==49 and len({r['id'] for r in rows})==49
for row in rows:
    for e in row['evidencia']:
        p,n=e.rsplit(':',1)
        assert (ROOT/p).is_file(), e
        assert 1<=int(n)<=len((ROOT/p).read_text(encoding='utf-8').splitlines()),e
(OUT/'matriz-rf.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
metadata={'data':'2026-10-20','commit':'bdbc861542626c512f5e0c2d51b2fc9cdc05d6fa','criterio':'Implementado significa mecanismo presente na inspeção estática; não homologação runtime. Parcial significa contrato, percurso de interface ou requisito documentado com lacuna concreta. Legado descreve classificação documental, podendo continuar ativo.','total':49,'estados':{s:sum(r['estado_verificado']==s for r in rows) for s in sorted({r['estado_verificado'] for r in rows})},'fontes':['fontes-extraidas/auditoria.json','analise-sistema/lacunas-dominios.json','analise-sistema/lacunas-fluxos.json'],'validacao':'49 IDs únicos e todas as referências path:line validadas no conteúdo atual. Nenhum produto, slide, banco ou produção alterados.'}
(OUT/'matriz-rf-metodo.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(metadata,ensure_ascii=False,indent=2))
