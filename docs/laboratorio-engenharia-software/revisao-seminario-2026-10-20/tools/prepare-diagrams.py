from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1]
S=R.parents[2]/'prisma/schema.prisma'
if not S.exists(): S=Path('prisma/schema.prisma')
names={'User':'Usuário','EvaluatorApplication':'Solicitação de credenciamento','EvaluatorProfile':'Perfil de avaliador','Company':'Empresa','Job':'Vaga','JobRecruitmentStage':'Etapa de seleção','JobApplication':'Candidatura','LanguageTrail':'Progresso na linguagem','KnowledgeNode':'Conteúdo de conhecimento','KnowledgeEdge':'Relação de conhecimento','LearningPath':'Trilha de aprendizado','LearningPathNode':'Conteúdo da trilha','Exercise':'Exercício','ExerciseTestCase':'Caso de teste','UserNodeProgress':'Progresso no conteúdo','ExerciseRun':'Execução de exercício','ExerciseSubmission':'Submissão de exercício','LearningEvent':'Evento de aprendizado','Post':'Publicação','Answer':'Resposta','Quiz':'Questão','QuizAttempt':'Tentativa de questão','DuelRequest':'Convite de duelo','Duel':'Duelo','DuelSolution':'Solução de duelo','DuelSubmission':'Submissão de duelo','DuelVote':'Voto em duelo','DuelEvaluation':'Avaliação de duelo','Event':'Evento','EventChallenge':'Desafio do evento','EventParticipant':'Participação em evento','Badge':'Conquista','UserBadge':'Conquista do usuário','PostVote':'Voto em publicação','AnswerVote':'Voto em resposta','Message':'Mensagem','MobileState':'Estado do aplicativo','MobileDevice':'Dispositivo móvel','MessageReaction':'Reação à mensagem','Bookmark':'Favorito','Notification':'Notificação','Report':'Denúncia','Follow':'Conexão entre usuários','Reaction':'Reação à publicação','Guild':'Comunidade','GuildMember':'Membro de comunidade','QuizLibrary':'Banco de questões'}
foreign={'user_id':'id_usuário','owner_id':'id_responsável','company_id':'id_empresa','job_id':'id_vaga','stage_id':'id_etapa','knowledge_node_id':'id_conteúdo','learning_path_id':'id_trilha','source_node_id':'id_origem','target_node_id':'id_destino','exercise_id':'id_exercício','post_id':'id_publicação','quiz_id':'id_questão','challenger_id':'id_desafiante','opponent_id':'id_oponente','winner_id':'id_vencedor','duel_id':'id_duelo','request_id':'id_convite','evaluator_id':'id_avaliador','event_id':'id_evento','created_by':'id_criador','creator_id':'id_criador','badge_id':'id_conquista','answer_id':'id_resposta','sender_id':'id_remetente','receiver_id':'id_destinatário','recipient_id':'id_destinatário','message_id':'id_mensagem','actor_id':'id_autor_ação','reporter_id':'id_denunciante','follower_id':'id_seguidor','following_id':'id_seguido','guild_id':'id_comunidade','reviewed_by':'id_revisor','challenge_id':'id_desafio','solution_id':'id_solução','invited_by':'id_convidante'}
foreign.update({'followerId':'id_seguidor','followingId':'id_seguido','userId':'id_usuário','actorId':'id_autor_ação','author_id':'id_autor','parent_id':'id_resposta_pai'})
keyattrs={'User':['nome de usuário','experiência total','papel'],'Company':['nome','verificada'],'Job':['título','situação','modalidade'],'JobRecruitmentStage':['título','ordem'],'JobApplication':['situação','parecer'],'Quiz':['enunciado','alternativas'],'QuizAttempt':['correta','experiência obtida'],'LanguageTrail':['linguagem','nível'],'KnowledgeNode':['título','publicado'],'Exercise':['título','linguagem'],'Post':['conteúdo','data de criação'],'Duel':['situação','linguagem'],'Event':['título','data de início'],'Notification':['tipo','lida'],'Message':['conteúdo','lida']}
models=[];relations=[]
for n,b in re.findall(r'model\s+(\w+)\s*\{(.*?)\n\}',S.read_text('utf-8'),re.S):
 fields=[]
 if '@@id(' in b: fields.append('PK (id_usuário, chave)' if n=='MobileState' else 'PK (id_seguidor, id_seguido)')
 for line in b.splitlines():
  mt=re.match(r'\s*(\w+)\s+(\w+)([?\[\]]*)\s*(.*)',line)
  if not mt:continue
  f,t,opt,rest=mt.groups()
  if '@id' in rest:fields.append('PK token' if n=='MobileDevice' else 'PK identificador')
  if t in names and 'fields:' in rest:
   fm=re.search(r'fields:\s*\[([^\]]+)\]',rest)
   for fk in fm.group(1).split(','):
    fk=fk.strip();pt=foreign.get(fk,'id_'+names[t].lower().replace(' ','_'))
    fields.append('FK '+pt+(' (opcional)' if '?' in opt else ''))
    relations.append({'from':n,'to':t,'role':pt,'optional':'?' in opt})
 fields.extend(keyattrs.get(n,[])[:2])
 models.append({'id':n,'name':names[n],'fields':fields,'definition':'Mapeamento físico: '+n+' em prisma/schema.prisma. Atributos chave e selecionados para projeção.'})

def seq(id,title,participants,messages,source,complete=True):
 return {'id':id,'title':title,'participants':participants,'messages':messages,'source':source,'complete':complete}
seqs=[]
seqs.append(seq('SQ01','Concluir atividade de uma lição',['Aluno','Tela da lição','Controlador\nda lição','Avaliação','Progresso\ne banco'],[
 [0,1,'Enviar resposta'],[1,2,'Solicitar avaliação'],[2,2,'Validar acesso'],[2,3,'Avaliar etapa'],[3,2,'Resultado da avaliação','return'],[2,4,'Salvar avaliação'],[4,4,'Primeira conclusão'],[4,4,'Gravar tentativa e XP'],[4,2,'Progresso atualizado','return'],[2,1,'Resultado e progresso','return'],[1,0,'Exibir retorno','return']],
 ['src/app/api/lessons/[lessonId]/attempt/route.ts','src/lib/learning/lesson-progress.ts']))
seqs.append(seq('SQ02','Publicar uma vaga',['Recrutador','Painel de vagas','Controlador\nde vagas','Serviço\nde vagas','Banco de dados'],[
 [0,1,'Preencher e publicar vaga'],[1,2,'Enviar dados da vaga'],[2,2,'Validar papel e empresa'],[2,3,'Criar vaga'],[3,4,'Gravar vaga e etapas'],[4,3,'Vaga criada','return'],[3,2,'Dados da vaga','return'],[2,1,'Confirmar publicação','return'],[1,1,'Recarregar listagem'],[1,0,'Exibir vaga publicada','return']],['src/app/api/jobs/route.ts','src/services/job.service.ts','src/app/recruiter/RecruiterContent.tsx']))
seqs.append(seq('SQ03','Candidatar-se a uma vaga',['Candidato','Tela da vaga','Controlador\nde candidatura','Serviço\nde vagas','Banco de dados'],[
 [0,1,'Confirmar candidatura'],[1,2,'Solicitar candidatura'],[2,3,'Candidatar usuário autenticado'],[3,4,'Consultar candidatura e vaga'],[4,3,'Vaga e etapas ordenadas','return'],[3,3,'Conferir vaga aberta'],[3,4,'Criar na primeira etapa'],[4,3,'Candidatura criada','return'],[3,2,'Candidatura e etapa','return'],[2,1,'Confirmar inscrição','return'],[1,0,'Exibir situação inicial','return']],['src/app/api/jobs/[id]/apply/route.ts','src/services/job.service.ts']))
seqs.append(seq('SQ04','Atualizar etapa de candidatura',['Recrutador','Painel de\ncandidaturas','Controlador\nde vagas','Serviço\nde vagas','Banco e\nnotificações'],[
 [0,1,'Alterar situação'],[1,2,'Solicitar alteração'],[2,4,'Conferir empresa, vaga e etapa'],[4,2,'Vínculos válidos','return'],[2,3,'Atualizar candidatura'],[3,4,'Gravar etapa e situação'],[4,3,'Candidatura atualizada','return'],[3,4,'Solicitar notificação'],[3,2,'Dados atualizados','return'],[2,1,'Confirmar atualização','return'],[1,0,'Exibir nova situação','return']],['src/app/api/jobs/[id]/route.ts','src/services/job.service.ts']))
small=[
 ('SQ01-A','Receber e avaliar resposta',['Tela da lição','Controlador','Avaliação'],[[0,1,'Enviar resposta'],[1,1,'Validar e localizar etapa'],[1,1,'Verificar acesso'],[1,2,'Avaliar etapa']],'SQ01'),
 ('SQ01-B','Salvar e devolver resultado',['Controlador','Progresso','Tela da lição'],[[0,0,'Verificar execução disponível'],[0,0,'Distinguir teste e envio'],[0,1,'Salvar avaliação no envio'],[0,2,'Devolver resultado e progresso']],'SQ01'),
 ('SQ01-C','Primeira conclusão e experiência',['Progresso','Banco de dados'],[[0,1,'Consultar tentativas'],[1,0,'Conclusões anteriores','return'],[0,0,'Calcular experiência inicial'],[0,1,'Registrar tentativa']],'SQ01'),
 ('SQ02-A','Autorizar publicação de vaga',['Painel de vagas','Controlador','Serviço\\nde vagas'],[[0,1,'Enviar dados'],[1,1,'Validar papel e dados'],[1,1,'Autorizar empresa'],[1,2,'Solicitar criação']],'SQ02'),
 ('SQ02-B','Persistir vaga e etapas',['Serviço\\nde vagas','Banco de dados'],[[0,1,'Criar vaga aberta e etapas'],[1,0,'Vaga com etapas','return']],'SQ02'),
 ('SQ02-C','Confirmar publicação na tela',['Controlador','Painel de vagas','Recrutador'],[[0,1,'Responder sucesso'],[1,1,'Exibir confirmação'],[1,1,'Recarregar listagem'],[1,2,'Mostrar vaga publicada']],'SQ02'),
 ('SQ03-A','Registrar candidatura',['Serviço\\nde vagas','Banco de dados'],[[0,0,'Conferir vaga aberta'],[0,0,'Selecionar etapa inicial'],[0,1,'Criar candidatura'],[1,0,'Candidatura na etapa inicial','return']],'SQ03'),
 ('SQ03-B','Autorizar alteração de etapa',['Controlador','Banco de dados'],[[0,0,'Autorizar acesso à empresa'],[0,1,'Conferir candidatura da vaga'],[0,1,'Conferir etapa da vaga'],[1,0,'Vínculos válidos','return']],'SQ04'),
 ('SQ03-C','Atualizar e notificar',['Serviço\\nde vagas','Banco de dados','Notificações'],[[0,1,'Atualizar etapa e situação'],[1,0,'Candidatura atualizada','return'],[0,2,'Criar notificação'],[0,0,'Registrar eventual falha do aviso']],'SQ04')]
for id,title,ps,ms,main in small:seqs.append(seq(id,title,ps,ms,main,False))

data={'models':models,'relations':relations,'sequences':seqs,'mapping':names}
(R/'tools/diagram-plan.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),'utf-8')
print(f'{len(models)} modelos, {len(relations)} relações, {len(seqs)} sequências')
