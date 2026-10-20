"""Source-backed revision plan. Run with the bundled Python runtime."""
import json, re, hashlib
from pathlib import Path
ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parents[1]
OLD = OUT.parent/'revisao-astah-2026-09-28'
data = json.loads((OLD/'tools/model-data.json').read_text(encoding='utf-8'))

def activity(id, name, purpose, lanes, nodes, edges, difficulty, result):
    return dict(id=id,name=name,purpose=purpose,lanes=lanes,nodes=nodes,edges=edges,difficulty=difficulty,result=result)
# Nodes: id, UML kind, label, x, y, width, height, responsible lane.
def n(id,label,x,y,lane=0): return [id,'action',label,x,y,200,65,lane]
def d(id,label,x,y,lane=0): return [id,'decision',label,x,y,44,44,lane]
def m(id,x,y,lane=0): return [id,'merge','',x,y,26,26,lane]
def end(id,x,y,lane=0): return [id,'final','',x,y,22,22,lane]
def start(x,y,lane=0): return ['start','initial','',x,y,20,20,lane]
A=[]
A.append(activity('AN01','Estudar programação','Compreender um assunto e aplicar o conteúdo sem depender do Stacklyst.',
 ['Estudante'],[start(55,135),n('goal','Definir assunto e\nobjetivo de estudo',110,112),n('plan','Organizar horários\ne cronograma',380,112),n('search','Pesquisar no Google,\nYouTube ou IA',650,112),n('study','Assistir à aula ou\nler o material',920,112),
 m('retry',1000,263),n('practice','Procurar exercícios\ne tentar resolver',920,330),d('ok','Conseguiu explicar\ne aplicar?',660,340),n('help','Revisar o material\nou buscar ajuda',375,330),n('record','Anotar o aprendido\ne planejar revisão',650,525),end('end',980,547)],
 [['start','goal'],['goal','plan'],['plan','search'],['search','study'],['study','retry'],['retry','practice'],['practice','ok'],['ok','help','não'],['help','retry','',[[475,290],[1013,290]]],['ok','record','sim'],['record','end']],
 'Materiais dispersos e dificuldade para decidir o que estudar ou revisar.','Conteúdo estudado e aplicação verificada pelo estudante.'))
A.append(activity('AN03','Praticar exercícios de programação','Praticar a solução de um problema e conferir o resultado.',
 ['Estudante'],[start(55,135),n('choose','Escolher exercício\nem livro ou site',110,112),n('read','Ler o enunciado\ne identificar entradas',380,112),m('retry',740,130),n('solve','Escrever a solução\nem papel ou editor',900,112),n('test','Testar exemplos e\ncomparar resultados',900,330),d('ok','Resultado\ncorreto?',660,340),n('fix','Investigar o erro\ne revisar a solução',375,330),n('explain','Explicar a solução\ne registrar dúvidas',650,525),end('end',980,547)],
 [['start','choose'],['choose','read'],['read','retry'],['retry','solve'],['solve','test'],['test','ok'],['ok','fix','não'],['fix','retry','',[[475,260],[753,260]]],['ok','explain','sim'],['explain','end']],
 'Correção manual e falta de retorno imediato sobre erros.','Solução conferida e dúvidas identificadas.'))
A.append(activity('AN04','Acompanhar a própria aprendizagem','Revisar registros de estudo e ajustar o planejamento.',
 ['Estudante'],[start(55,135),n('gather','Reunir anotações\ne exercícios feitos',110,112),n('compare','Comparar resultados\ncom os objetivos',380,112),d('gap','Há dificuldade\nrecorrente?',685,122),n('revise','Reservar horário\npara revisão',900,112),n('advance','Definir o próximo\nassunto de estudo',380,340),m('merge',740,360),n('schedule','Atualizar cronograma\nem agenda ou planilha',900,340),end('end',1000,560)],
 [['start','gather'],['gather','compare'],['compare','gap'],['gap','revise','sim'],['gap','advance','não',[[707,270],[480,270]]],['revise','merge'],['advance','merge'],['merge','schedule'],['schedule','end']],
 'Registros incompletos e acompanhamento em ferramentas diferentes.','Cronograma ajustado às dificuldades e aos objetivos.'))
A.append(activity('AN06','Buscar ajuda para uma dúvida','Esclarecer uma dificuldade e conferir a resposta recebida.',
 ['Estudante','Colega ou professor'],[start(55,145),n('describe','Descrever a dúvida\ne o que já tentou',110,122),n('research','Consultar documentação,\nvídeo ou IA',380,122),d('solved','Dúvida\nesclarecida?',685,132),n('check','Conferir a explicação\ncom um exemplo',915,122),end('end',1185,145),
 n('ask','Pedir ajuda com\nenunciado e tentativa',380,350),n('explain','Analisar a dúvida\ne explicar o raciocínio',680,460,1),m('merge',985,270)],
 [['start','describe'],['describe','research'],['research','solved'],['solved','check','sim'],['solved','ask','não',[[707,300],[480,300]]],['ask','explain'],['explain','merge','',[[1010,492]]],['merge','check'],['check','end']],
 'Respostas podem ser incompletas ou incorretas e precisam ser verificadas.','Dúvida esclarecida com exemplo conferido.'))
A.append(activity('AN08A','Divulgar oportunidade de trabalho','Descrever uma necessidade de contratação e iniciar a busca de candidatos.',
 ['Representante da empresa','Recrutador responsável'],[start(55,145),n('need','Identificar a empresa\ne o responsável',110,122),n('profile','Definir perfil, condições\ne requisitos da vaga',395,122),n('write','Redigir a oportunidade',110,410,1),m('merge',430,430,1),n('check','Conferir a vaga',535,410,1),d('ok','Informações\ncorretas?',815,420,1),n('fix','Corrigir informações',535,565,1),n('publish','Divulgar em portais,\nredes ou contatos',960,410,1),n('search','Procurar currículos\ne contatar candidatos',960,565,1),end('end',1185,588,1)],
 [['start','need'],['need','profile'],['profile','write','',[[495,275],[210,275]]],['write','merge'],['merge','check'],['check','ok'],['ok','publish','sim'],['ok','fix','não',[[837,598]]],['fix','merge','',[[443,598]]],['publish','search'],['search','end']],
 'Divulgação em canais separados e busca manual de currículos.','Oportunidade divulgada e candidatos contatados quando encontrados.'))
A.append(activity('AN08B','Candidatar-se e acompanhar a seleção','Enviar uma candidatura e acompanhar a resposta do recrutador.',
 ['Candidato','Recrutador responsável'],[start(55,145),n('find','Encontrar vaga em\nportal, rede ou indicação',110,122),n('send','Conferir requisitos\ne enviar currículo',395,122),n('receive','Receber e analisar\no currículo',680,410,1),n('contact','Informar retorno\nou próximos passos',960,410,1),n('track','Acompanhar e-mail\ne contatos recebidos',960,122),d('next','Há próxima\netapa?',685,132),n('attend','Responder e realizar\na etapa combinada',395,275),n('finish','Registrar o resultado\nda candidatura',680,275),end('end',995,297),m('merge',775,355,1)],
 [['start','find'],['find','send'],['send','merge','',[[780,155]]],['merge','receive'],['receive','contact'],['contact','track'],['track','next'],['next','attend','sim',[[520,154]]],['attend','merge','',[[495,360]]],['next','finish','não'],['finish','end']],
 'O candidato acompanha respostas em canais dispersos e pode não receber retorno.','Próxima etapa cumprida ou resultado registrado.'))
A.append(activity('AN09','Descobrir e participar de um evento','Localizar um evento, conferir condições e organizar a participação.',
 ['Pessoa interessada','Organizador do evento'],[start(55,145),n('find','Pesquisar eventos em\nredes, sites ou indicação',110,122),n('check','Conferir tema, data,\nlocal e condições',395,122),d('can','Pode\nparticipar?',690,132),n('register','Inscrever-se no canal\ninformado pelo evento',920,122),n('confirm','Confirmar inscrição\ne enviar orientações',920,440,1),n('agenda','Anotar na agenda\ne comparecer',640,285),end('end',410,307),end('decline',712,224)],
 [['start','find'],['find','check'],['check','can'],['can','register','sim'],['can','decline','não'],['register','confirm'],['confirm','agenda','',[[740,472]]],['agenda','end']],
 'Datas e inscrições se perdem entre canais de divulgação e agendas pessoais.','Participação organizada ou evento descartado.'))

services=[]
def service(name,path,ops,entities,diagrams,kind='objeto TypeScript'):
    text=(ROOT/path).read_text(encoding='utf-8')
    for op in ops:
        if not re.search(r'\b'+re.escape(op[0])+r'\s*(?:<[^>]+>)?(?:\(|=)',text): raise ValueError((path,op))
    services.append(dict(name=name,path=path,ops=ops,entities=entities,diagrams=diagrams,kind=kind))
service('JobService','src/services/job.service.ts',[
 ['listJobs','filters?: JobFilters','Promise'],['getJobById','jobId: string, currentUserId?: string','Promise'],['createJob','params: CreateJobParams','Promise'],['applyForJob','userId: string, jobId: string','Promise'],['updateApplicationStage','params: ApplicationUpdate','Promise'],['getJobApplications','jobId: string, currentUserId: string, userRole: string','Promise'],['createCompany','params: CompanyInput','Promise']],['Job','JobApplication','Company','JobRecruitmentStage'],['CL08','CL12'])
service('EventService','src/services/event.service.ts',[
 ['listEvents','status?: EventStatus, currentUserId?: string','Promise'],['createEvent','params: CreateEventParams','Promise'],['participate','userId: string, eventId: string','Promise'],['cancelParticipation','userId: string, eventId: string','Promise'],['deleteEvent','eventId: string, userId: string, isAdmin?: boolean','Promise']],['Event','EventParticipant'],['CL09','CL12'])
service('LessonProgress','src/lib/learning/lesson-progress.ts',[
 ['getLessonProgress','userId: string, lesson: Lesson','Promise'],['requireLessonAccess','userId: string, lesson: Lesson','Promise<void>'],['saveLessonAssessment','userId: string, lesson: Lesson, step: LessonStep, isCorrect: boolean, selectedIndex: number','Promise']],['Quiz','QuizAttempt','User','Lesson','LessonStep'],['CL03','CL11','CL12'],'módulo TypeScript')
service('LessonAssessment','src/lib/learning/assessment.ts',[
 ['assessLessonStep','lesson: Lesson, step: LessonStep, answer: LessonAnswer','Promise'],['publicLesson','lesson: Lesson','Lesson']],['Lesson','LessonStep','Exercise'],['CL03','CL11'],'módulo TypeScript')
service('LearningRepository','src/lib/learning/repository.ts',[
 ['getKnowledgeMapForUser','userId: string','Promise<KnowledgeMapData>']],['LearningPath','KnowledgeNode','UserNodeProgress'],['CL02'],'módulo TypeScript')
service('XpService','src/services/xp.service.ts',[
 ['awardXP','userId: string, language: Language, amount: number','Promise'],['awardXPInTransaction','tx: TransactionClient, userId: string, language: Language, amount: number','Promise']],['User','LanguageTrail','Badge','UserBadge'],['CL01','CL12'])
service('QuizService','src/services/quiz.service.ts',[
 ['generateDaily','scheduledFor: Date','Promise'],['validateQuizAnswer','userId: string, quizId: string, selectedIndex: number','Promise']],['Quiz','QuizAttempt','QuizLibrary'],['CL04'])
service('DuelResolution','src/lib/duels/resolution.ts',[
 ['resolveDuelIfReady','duelId: string','Promise'],['resolveDuelAtDeadline','duelId: string','Promise'],['awardDuelWinnerXP','duelId: string, winnerId: string, language: Language','Promise']],['Duel','DuelSubmission','User'],['CL05'],'módulo TypeScript')
service('PostService','src/services/post.service.ts',[
 ['create','userId: string, data: CreatePostInput, clientId?: string','Promise'],['getFeed','userId: string, params: FeedQuery','Promise']],['Post','User'],['CL06','CL12'])
service('MessagesRoute','src/app/api/messages/route.ts',[
 ['GET','req: Request','Promise<Response>'],['POST','req: Request','Promise<Response>']],['Message','User'],['CL07'],'módulo de rotas')
service('MobilePush','src/lib/mobile/push.ts',[
 ['sendMobilePush','userId: string, notificationId: string','Promise']],['DeviceToken','Notification','User'],['CL10'],'módulo TypeScript')
service('NotificationService','src/services/notification.service.ts',[
 ['create','data: CreateNotificationInput','Promise'],['getUserNotifications','userId: string, cursor?: string, limit?: number, useCursor?: boolean','Promise'],['markAllAsRead','userId: string','Promise'],['getUnreadCount','userId: string','Promise<number>']],['Notification','User'],['CL08','CL12'])
service('EventChallengeService','src/services/event-challenge.service.ts',[
 ['list','eventId: string, viewer?: EventChallengeViewer','Promise'],['replaceSet','eventId: string, challengeIds: string[]','Promise']],['Event','EventChallenge','Challenge'],['CL09'])

# IDs remain those of the Astah model to avoid silently renumbering existing cases.
ucs=[u for u in data['uc'] if not 42<=int(u['id'][2:])<=45]
for u in ucs:
    if u['id']=='UC023': u['name']='Inscrever-se ou cancelar participação em evento'
overview=[
 ('G01','Conta e perfil',[1,2,3,30,50,51],'Usuário'),
 ('G02','Estudar lições e\nacompanhar progresso',[4,5,7,37],'Usuário autenticado'),
 ('G03','Resolver exercícios\ne consultar ajuda',[6,12,28,29,52],'Usuário autenticado'),
 ('G04','Participar de duelos',[8,9,10,53,54],'Usuário autenticado'),
 ('G05','Consultar ranking',[11],'Usuário autenticado'),
 ('G06','Manter publicações\ne interagir no feed',[13,14,31,34,35,36],'Usuário autenticado'),
 ('G07','Consultar perfis\ne seguir pessoas',[32,33],'Usuário autenticado'),
 ('G08','Trocar mensagens',[38,39,40,41],'Usuário autenticado'),
 ('G09','Consultar e participar\nde eventos',[23,46],'Usuário autenticado'),
 ('G10','Consultar vagas\ne candidatar-se',[18,22],'Usuário autenticado'),
 ('G11','Consultar notificações',[21,55],'Usuário autenticado'),
 ('G12','Solicitar credenciamento\nde avaliador',[24],'Usuário autenticado'),
 ('G13','Gerenciar vagas, empresas\ne candidaturas',[17,25,26,56],'Recrutador'),
 ('G14','Organizar eventos\ne desafios',[15,47,48],'Usuário autenticado'),
 ('G15','Avaliar empate técnico',[16],'Avaliador'),
 ('G16','Administrar o sistema',[19,20,27,49],'Administrador')]
assert set(n for _,_,ids,_ in overview for n in ids)==set(int(u['id'][2:]) for u in ucs)
plan=dict(activities=A,services=services,uc=ucs,overview=overview,
 removedCases=['UC042','UC043','UC044','UC045','UC057','UC058','UC059'],
 sourceCommit='9256a4f',date='06/10/2026',sourceSha256=hashlib.sha256((OLD/'Stacklyst-revisado-simplificado_v2.asta').read_bytes()).hexdigest())
(OUT/'tools/revision-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
print('Plan:',len(A),'business processes,',len(ucs),'use cases,',len(services),'operation owners')
