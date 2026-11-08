"""Small conceptual views, selected relational views and Portuguese labels."""
from pathlib import Path
import re,json
R=Path(__file__).resolve().parents[1];ROOT=R.parents[2]
p=json.loads((R/'tools/astah-plan.json').read_text(encoding='utf-8'))
schema=(ROOT/'prisma/schema.prisma').read_text(encoding='utf-8')
models={n:b for n,b in re.findall(r'^model (\w+) \{(.*?)^\}',schema,re.M|re.S) if not n.startswith('Guild')}
relations=[];fields={}
for name,body in models.items():
    fields[name]=[];composite=[v.strip() for group in re.findall(r'@@id\(\[([^\]]+)\]',body) for v in group.split(',')]
    for line in body.splitlines():
        m=re.match(r'^[ \t]*(\w+)[ \t]+(\w+)(\[\]|\?)?[ \t]*(.*)$',line)
        if not m:continue
        field,typ,opt,rest=m.groups();opt=opt or ''
        if typ in models:
            fk=re.search(r'fields:\s*\[([^\]]+)\]',rest)
            if fk:
                fks=[v.strip() for v in fk[1].split(',')]
                scalar_lines=[l for l in body.splitlines() if any(re.match(r'\s*'+re.escape(f)+r'\s',l) for f in fks)]
                unique=any('@unique' in l or re.search(r'@id\b',l) for l in scalar_lines) or any(set(v.strip() for v in group.split(','))==set(fks) for group in re.findall(r'@@unique\(\[([^\]]+)\]',body))
                relations.append(dict(parent=typ,child=name,role=field,parentMultiplicity='0..1' if opt=='?' else '1',childMultiplicity='0..1' if unique else '0..*',fk=fks))
            continue
        fields[name].append(dict(name=field,type=typ+opt,pk=bool(re.search(r'@id\b',rest)) or field in composite,fk=False))
for name,fs in fields.items():
    for f in fs:f['fk']=any(r['child']==name and f['name'] in r['fk'] for r in relations)
p['models']=[dict(name=n,fields=fields[n],definition=b) for n,b in models.items()];p['relations']=relations
# Classes describe the domain. Attributes and operations are deliberately concise.
C={
'usuario':('Usuário',['identificador: Texto','nome: Texto'],['atualizarPerfil()'],'User'),
'trilha':('Trilha',['código: Texto','linguagem: Texto'],['consultarPercurso()'],'src/lib/learning'),
'licao':('Lição',['identificador: Texto','título: Texto'],['abrirConteúdo()'],'src/lib/learning/catalog.ts'),
'atividade':('Atividade',['identificador: Texto','pontos: Inteiro'],['avaliarResposta()'],'Quiz / Exercise'),
'tentativa':('Tentativa',['acertou: Lógico','pontosGanhos: Inteiro'],['registrarResultado()'],'QuizAttempt / ExerciseSubmission'),
'credencial':('Credencial',['identificador: Texto','situação: Texto'],['verificarValidade()'],'LearningCredential'),
'duelo':('Duelo',['identificador: Texto','situação: Texto'],['resolverResultado()'],'Duel'),
'solucao':('Solução',['código: Texto','aprovada: Lógico'],['submeter()'],'DuelSubmission'),
'parecer':('Parecer',['justificativa: Texto','decisão: Texto'],['registrarDecisão()'],'DuelEvaluation'),
'avaliador':('Perfil de avaliador',['reputação: Inteiro','situação: Texto'],['conferirHabilitação()'],'EvaluatorProfile'),
'publicacao':('Publicação',['identificador: Texto','conteúdo: Texto'],['publicar()'],'Post'),
'comentario':('Comentário',['conteúdo: Texto','data: DataHora'],['responder()'],'Answer'),
'perfil':('Perfil',['biografia: Texto','aparência: Dados'],['personalizar()'],'User / ProfileCustomization'),
'empresa':('Empresa',['identificador: Texto','nome: Texto'],['conferirResponsável()'],'Company'),
'vaga':('Vaga',['identificador: Texto','situação: Texto'],['publicar()'],'Job'),
'etapa':('Etapa da seleção',['ordem: Inteiro','título: Texto'],['conferirVínculo()'],'JobRecruitmentStage'),
'candidatura':('Candidatura',['situação: Texto','retorno: Texto'],['movimentar()'],'JobApplication'),
'evento':('Evento',['identificador: Texto','início: DataHora'],['conferirInscrição()'],'Event'),
'inscricao':('Inscrição',['pontuação: Inteiro','posição: Inteiro'],['confirmar()'],'EventParticipant'),
'desafio':('Desafio de evento',['título: Texto','ordem: Inteiro'],['validarContrato()'],'EventChallenge'),
'mensagem':('Mensagem',['conteúdo: Texto','enviadaEm: DataHora'],['enviar()'],'Message'),
'notificacao':('Notificação',['tipo: Texto','lida: Lógico'],['marcarComoLida()'],'Notification'),
'preferencia':('Preferência',['chave: Texto','valor: Dados'],['alterar()'],'User metadata / MobileState')}
def v(names,edges,positions):return dict(names=names,edges=[dict(a=a,b=b,label=label,ma=ma,mb=mb) for a,b,label,ma,mb in edges],positions=positions)
P={}
P['GERAL']=v(['usuario','trilha','atividade','duelo','publicacao','vaga','evento','mensagem'],[
('usuario','trilha','estuda','0..*','0..*'),('trilha','atividade','organiza','1','0..*'),('usuario','atividade','resolve','0..*','0..*'),('usuario','duelo','disputa','1..2','0..*'),('usuario','publicacao','publica','1','0..*'),('usuario','vaga','candidata-se','0..*','0..*'),('usuario','evento','participa','0..*','0..*'),('usuario','mensagem','envia','1','0..*')],{'usuario':[600,600],'trilha':[60,60],'atividade':[600,60],'duelo':[1140,60],'publicacao':[1140,600],'vaga':[1140,1140],'evento':[600,1140],'mensagem':[60,1140]})
P['APRENDIZAGEM']=v(['trilha','licao','atividade','tentativa','usuario','credencial'],[
('trilha','licao','organiza','1','0..*'),('licao','atividade','propõe','1','0..*'),('atividade','tentativa','recebe','1','0..*'),('usuario','tentativa','realiza','1','0..*'),('usuario','credencial','conquista','1','0..*'),('trilha','credencial','fundamenta','0..1','0..*')],{'trilha':[60,60],'licao':[600,60],'atividade':[1140,60],'tentativa':[1140,500],'usuario':[600,500],'credencial':[60,500]})
P['COMUNIDADE']=v(['usuario','perfil','publicacao','comentario','mensagem','notificacao'],[
('usuario','perfil','mantém','1','1'),('usuario','publicacao','publica','1','0..*'),('publicacao','comentario','recebe','1','0..*'),('usuario','comentario','escreve','1','0..*'),('usuario','mensagem','envia','1','0..*'),('usuario','notificacao','recebe','1','0..*')],{'usuario':[600,500],'perfil':[60,500],'publicacao':[600,60],'comentario':[1140,60],'mensagem':[1140,500],'notificacao':[600,940]})
P['DUELOS']=v(['usuario','duelo','solucao','avaliador','parecer'],[
('usuario','duelo','disputa','1..2','0..*'),('duelo','solucao','recebe','1','0..*'),('usuario','solucao','envia','1','0..*'),('usuario','avaliador','pode possuir','1','0..1'),('avaliador','parecer','emite','1','0..*'),('duelo','parecer','recebe','1','0..*')],{'usuario':[60,60],'duelo':[600,60],'solucao':[600,500],'avaliador':[60,940],'parecer':[600,940]})
P['RECRUTAMENTO']=v(['usuario','empresa','vaga','etapa','candidatura'],[
('usuario','empresa','administra','1','0..*'),('empresa','vaga','publica','1','0..*'),('vaga','etapa','organiza','1','0..*'),('vaga','candidatura','recebe','1','0..*'),('usuario','candidatura','envia','1','0..*'),('etapa','candidatura','acolhe','0..1','0..*')],{'usuario':[60,60],'empresa':[600,60],'vaga':[1140,60],'etapa':[1140,500],'candidatura':[600,500]})
P['EVENTOS']=v(['usuario','evento','inscricao','desafio'],[
('usuario','evento','organiza','1','0..*'),('usuario','inscricao','realiza','1','0..*'),('evento','inscricao','recebe','1','0..*'),('evento','desafio','propõe','1','0..*')],{'usuario':[60,60],'evento':[600,60],'inscricao':[600,500],'desafio':[1140,60]})
P['IDENTIDADE']=v(['usuario','perfil','avaliador','preferencia'],[
('usuario','perfil','mantém','1','1'),('usuario','avaliador','pode possuir','1','0..1'),('usuario','preferencia','configura','1','0..*')],{'usuario':[60,500],'perfil':[600,60],'avaliador':[600,500],'preferencia':[600,940]})
p['conceptual']={'classes':{k:dict(name=a,attributes=b,operations=c,source=d) for k,(a,b,c,d) in C.items()},'views':P}
p['relationalViews']={
'GERAL':['User','QuizAttempt','Duel','Post','Company','Job','JobApplication','Event','EventParticipant','Message'],
'APRENDIZAGEM':['User','LanguageTrail','Quiz','QuizAttempt','LearningCredential'],
'COMUNIDADE':['User','Post','Answer','Message','Notification'],
'DUELOS':['User','Duel','DuelSubmission','DuelEvaluation','EvaluatorProfile'],
'RECRUTAMENTO':['User','Company','Job','JobRecruitmentStage','JobApplication'],
'EVENTOS':['User','Event','EventParticipant','EventChallenge'],
'IDENTIDADE':['User','ProfileCustomization','UserProfileAchievement','ProfileAchievementCatalog']}
p['tableLabels']={'User':'Usuário','LanguageTrail':'Progresso da linguagem','Quiz':'Atividade','QuizAttempt':'Tentativa','LearningCredential':'Credencial','Post':'Publicação','Answer':'Comentário','Message':'Mensagem','Notification':'Notificação','Company':'Empresa','Job':'Vaga','JobRecruitmentStage':'Etapa da seleção','JobApplication':'Candidatura','Duel':'Duelo','DuelSubmission':'Solução enviada','DuelEvaluation':'Parecer','EvaluatorProfile':'Perfil de avaliador','Event':'Evento','EventParticipant':'Inscrição','EventChallenge':'Desafio de evento','ProfileCustomization':'Personalização','UserProfileAchievement':'Título conquistado','ProfileAchievementCatalog':'Título disponível'}
p['fieldLabels']={'id':'identificador','user_id':'usuário','username':'nome de usuário','owner_id':'responsável','company_id':'empresa','job_id':'vaga','stage_id':'etapa','quiz_id':'atividade','author_id':'autor','post_id':'publicação','duel_id':'duelo','evaluator_id':'avaliador','challenger_id':'desafiante','challenged_id':'adversário','opponent_id':'adversário','sender_id':'remetente','receiver_id':'destinatário','creator_id':'criador','event_id':'evento','achievement_id':'título','title_id':'título','body':'conteúdo','content':'conteúdo','status':'situação','title':'título','level':'nível','xp':'pontos','score':'pontuação','rank':'posição','is_correct':'acertou','selected_index':'opção selecionada','xp_earned':'pontos ganhos','created_at':'criado em','updated_at':'atualizado em','profile_frame':'moldura','name_color':'cor do nome'}
# The original sequence specification remains the implementation trace. Visible
# names are translated here; actual identifiers stay in definitions and source.
exact={'Aluno':'Estudante','Autor':'Autor','API':'Rota da aplicação','UI':'Interface','DB':'Banco de dados','Acesso':'Controle de acesso','Avaliador':'Avaliador da atividade','Progresso':'Serviço de progresso','JobService':'Serviço de vagas','Notificacoes':'Serviço de notificações','assessLessonStep':'Avaliador da atividade','saveLessonAssessment':'Serviço de progresso','PostService':'Serviço de publicações','BlockService':'Controle de bloqueios','NotificationService':'Serviço de notificações','RecruiterContent':'Painel do recrutador','POST /api/jobs':'Rota de publicação de vaga','requireRole / requireCompanyAccess':'Controle de autorização'}
replacements=[('action submit','envio para confirmação'),('action run','modo de teste'),('APPLIED','INSCRITA'),('firstCompletion','primeiro acerto'),('xpEarned','pontos ganhos'),('client_id','identificador da requisição'),('stepId','etapa'),('action','ação'),('payload','dados enviados'),('schema','contrato'),('snapshot','estado registrado'),('lock','bloqueio transacional'),('run','testar'),('submit','submeter'),('QuizAttempt','Tentativa'),('ExerciseRun','Execução de teste'),('ExerciseSubmission','Submissão de exercício'),('getPublicCredential','consultar credencial pública'),('requireLessonAccess','conferir acesso à lição'),('requireCompanyAccess','conferir acesso à empresa'),('createJob','criar vaga'),('applyForJob','registrar candidatura'),('updateApplicationStage','movimentar candidatura'),('getFeed','consultar publicações'),('getUserNotifications','consultar notificações'),('requireRole','conferir papel'),('assessLessonStep','avaliar atividade'),('saveLessonAssessment','registrar progresso'),('clientVersion','versão do estado'),('serverVersion','versão confirmada'),('heartbeat','sinal de presença'),('TTL','prazo de validade'),('Redis','Serviço de sincronização'),('SSE','fluxo de atualizações'),('polling','consulta periódica'),('DuelService','Serviço de duelos'),('EvaluatorService','Serviço de avaliadores'),('EventService','Serviço de eventos'),('EventChallengeService','Serviço de desafios'),('DuelSubmission','Solução enviada'),('EventParticipant','Inscrição'),('commit','confirmação'),('Commit','Confirmação'),('rate limit','limite de requisições'),('REST','interface de requisições')]
def translate(s):
    s=exact.get(s,s)
    for a,b in replacements:s=s.replace(a,b)
    return s
extra={'PostgreSQL':'Banco de dados','World e AdventureHub':'Interface do mundo','API mundinho':'Rota do mundo','adventure':'Serviço do mundo','API mundinho arena':'Rota da arena','MultiplayerArena':'Interface da arena','arena':'Serviço da arena','API de exercicio':'Rota do exercício','API de posts':'Rota de publicações','API de mensagens':'Rota de mensagens','APIs de vagas':'Rotas de vagas','API de participacao':'Rota de inscrição','World':'Mundo','AdventureHub':'Interface do mundo'}
phrases={'chooseArenaAttack':'preparar ataque','skill e exerciseTurn':'golpe e atividade do turno','advanceArenaTurn':'avançar turno','submeterDuelEvaluation':'registrar parecer','feedback':'retorno','testartime':'tempo de execução','testarner':'Executor','DTO':'dados de resposta','JSON':'dados estruturados','clientVersion':'versão local','expectedVersion':'versão esperada','ttl':'prazo de validade'}
accents={'licao':'lição','Repositorio':'Repositório','Anfitriao':'Anfitrião','solucao':'solução','avaliacao':'avaliação','Politica':'Política','Persistencia':'Persistência','decisao':'decisão','Usuario':'Usuário','participacao':'participação','colecao':'coleção','indice':'índice','nao':'não','transacao':'transação','conclusao':'conclusão','codigo':'código','sessao':'sessão','conexao':'conexão','reputacao':'reputação','permissoes':'permissões','inscricao':'inscrição','aprovacao':'aprovação','previa':'prévia','Previa':'Prévia','indisponivel':'indisponível','Notificacoes':'Notificações','catalogo':'catálogo','correcao':'correção','autorizacao':'autorização','versao':'versão','versoes':'versões','presenca':'presença','posicao':'posição','movimentacao':'movimentação','confirmacao':'confirmação','operacao':'operação','Criacao':'Criação','solucoes':'soluções','publicacao':'publicação','transacoes':'transações','variacoes':'variações','criterios':'critérios','elegivel':'elegível','Repeticao':'Repetição'}
def polish(s):
    s=extra.get(s,s)
    for a,b in phrases.items():s=s.replace(a,b)
    for a,b in accents.items():s=re.sub(r'\b'+re.escape(a)+r'\b',lambda m:b[:1].upper()+b[1:] if m[0][0].isupper() else b,s,flags=re.I)
    s=s.replace('Harness','Programa de testes').replace('harness','programa de testes').replace('feed','fluxo de publicações').replace('pagina','página').replace('PvP','entre jogadores')
    return s
p['fieldLabels'].update({'actorId':'responsável','userId':'usuário','parent_id':'comentário anterior','winner_id':'vencedor'})
for seq in p['sequences']:
    seq['title']=polish(seq['title'])
    seq.setdefault('sourceParticipants',seq['participants'][:]);seq['participants']=[polish(translate(x)) for x in seq['participants']]
    for m in seq['messages']:
        m[2]=polish(translate(m[2]))
        if len(m)>4:m[4]=polish(translate(m[4]))
    seq['conditions']=[polish(translate(x)) for x in seq['conditions']]
    seq['conditions']=[re.sub(r'^alt\s+','Condição: ',re.sub(r'^else\s+','Alternativa: ',c)) for c in seq['conditions'] if c!='end']
    seq['conditions']=['Recorte da sequência; consulte a correspondência com o código.' if 'Recorte vinculado a ' in c else c for c in seq['conditions']]
    if seq['id']=='SQ10':seq['participants'][0]='Avaliador'
(R/'tools/astah-plan.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'evidencias-codigo/correspondencia-modelos.json').write_text(json.dumps({'conceptual':p['conceptual']['classes'],'tables':p['tableLabels'],'sequenceParticipants':{s['id']:dict(zip(s['participants'],s['sourceParticipants'])) for s in p['sequences']}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Conceptual overview: 8 classes; specific views: 4–6. Relational overview: 10 selected tables.')
