import json
from pathlib import Path
P=Path(__file__).resolve().parent
d=json.loads((P/'source-data.json').read_text(encoding='utf8'))
d['groups']=[
 ['01 Conta e perfil',[1,2,3,30]],['02 Trilhas e progresso',[4,5,7,11]],
 ['03 Exercicio e avaliacao',[12,6,28,29]],['04 Duelos abertos',[8,9,10,29]],
 ['05 Credenciamento e parecer',[24,27,16]],['06 Comunidade e eventos',[13,14,15,23]],
 ['07 Administracao e notificacoes',[19,20,21]],['08 Vagas e empresas',[17,18,22,25,26]]]
d['actors']={'V':'Visitante','U':'Usuário autenticado','A':'Administrador','E':'Avaliador','R':'Recrutador','I':'Provedor de identidade','X':'Executor externo de código'}
d['participation']={'V':[1,2,18],'I':[1,2,30],'U':[3,4,5,6,7,8,9,10,11,12,13,14,15,18,21,22,23,24,25,30],'A':[16,17,19,20,27,26],'E':[16],'R':[17,26],'X':[29]}
extra=[
 (31,'Consultar e pesquisar feed','U','src/app/feed; src/app/api/posts; src/app/api/search','RF031','Informar filtro ou termo; consultar publicações e abrir conteúdo de interesse.','Exibir somente o conteúdo autorizado.'),
 (32,'Consultar perfil público','U','src/app/profile/[username]; src/app/api/profile/[username]','RF037, RF038','Selecionar usuário; consultar perfil e indicadores públicos.','Dados privados de conta não compõem a resposta pública.'),
 (33,'Seguir ou deixar de seguir usuário','U','src/app/explore/page.tsx; src/app/api/users/[id]/follow','Ampliação: relações sociais','Selecionar usuário; alternar acompanhamento; confirmar estado.','A ação usa a identidade autenticada e as regras de FollowService.'),
 (34,'Consultar publicações salvas','U','src/app/bookmarks/page.tsx; src/app/api/posts/[id]/bookmark','RF032','Abrir itens salvos; selecionar publicação; remover marcação se desejado.','A coleção pertence ao usuário autenticado.'),
 (35,'Editar ou excluir publicação própria','U','src/app/api/posts/[id]/route.ts','Ampliação: manutenção de publicação','Selecionar publicação própria; solicitar edição ou exclusão; confirmar resultado.','O servidor valida author_id; edição exige conteúdo com pelo menos 10 caracteres.'),
 (36,'Aceitar resposta de uma publicação','U','src/app/api/answers/[id]/accept/route.ts','Ampliação: resposta aceita','Autor seleciona resposta; confirma aceite; sistema registra aceite e recompensa elegível.','Somente autor da publicação; transação impede recompensa duplicada do mesmo aceite.'),
 (37,'Responder quiz diário','U','src/app/api/quiz/daily; src/app/api/quiz/[id]/attempt','RF008, RF009, RF011','Consultar quiz disponível; selecionar resposta; enviar e analisar resultado.','A correção ocorre no servidor; repetição não duplica a primeira recompensa.'),
 (38,'Consultar conversas e mensagens','U','src/app/messages/page.tsx; src/app/api/messages/chats; src/app/api/messages','Ampliação: mensagens','Abrir conversas; selecionar interlocutor; consultar histórico permitido.','O histórico envolve o usuário autenticado como remetente ou destinatário.'),
 (39,'Enviar mensagem privada','U','src/app/messages/page.tsx; src/app/api/messages/route.ts','Ampliação: mensagens','Selecionar interlocutor; escrever texto ou anexar imagem; enviar e consultar retorno.','Sessão válida e destinatário informado; envio sujeito a limite de frequência.'),
 (40,'Editar ou excluir mensagem própria','U','src/app/api/messages/[id]/route.ts','Ampliação: mensagens','Selecionar mensagem enviada; editar conteúdo ou excluir; atualizar conversa.','Somente remetente; edição não admite texto vazio.'),
 (41,'Reagir a mensagem','U','src/app/api/messages/[id]/react/route.ts','Ampliação: mensagens','Selecionar mensagem; escolher emoji; adicionar ou remover reação.','Somente remetente ou destinatário da mensagem.'),
 (42,'Consultar comunidades','U','src/app/guilds/GuildsClient.tsx; src/app/api/guilds','Ampliação: comunidades','Listar comunidades públicas e próprias; filtrar interesse; abrir detalhes autorizados.','Comunidades privadas exigem vínculo ou propriedade.'),
 (43,'Criar comunidade','U','src/app/guilds/GuildsClient.tsx; src/app/api/guilds','Ampliação: comunidades','Informar nome, descrição e linguagem; validar; criar comunidade e vínculo de proprietário.','Nome com pelo menos 3 caracteres e slug não duplicado.'),
 (44,'Entrar ou sair de comunidade','U','src/app/guilds/[slug]/page.tsx; src/app/api/guilds/[id]/members','Ampliação: comunidades','Selecionar comunidade; solicitar entrada ou saída; consultar associação atualizada.','Entrada pública, sem vínculo duplicado. Proprietário não pode sair por esta operação.'),
 (45,'Administrar comunidade própria','U','src/app/api/guilds/[id]/route.ts','Ampliação: comunidades','Selecionar comunidade sob gestão; editar campos permitidos ou solicitar exclusão.','Edição exige OWNER/ADMIN da guilda; exclusão exige OWNER. Contrato de API; painel completo de gestão não confirmado.'),
 (46,'Consultar eventos e desafios','U','src/app/events; src/app/api/events; src/app/api/events/[id]/challenges','RF041, RF049','Consultar eventos; abrir detalhes e desafios; analisar datas e condições.','Respostas esperadas dos desafios ficam restritas ao gestor autorizado.'),
 (47,'Excluir evento sob responsabilidade','U','src/app/api/events/[id]/route.ts; src/services/event.service.ts','RF041','Selecionar evento; solicitar exclusão; validar responsabilidade; confirmar remoção.','Somente criador ou Administrador, conforme regras de EventService.'),
 (48,'Gerenciar desafios de evento','U','src/app/api/events/[id]/challenges; src/services/event-challenge.service.ts','Ampliação: desafios de evento','Criador define conjunto de desafios; valida dados; salva e consulta conjunto.','Criador ou Administrador; evento concluído não admite alteração; respostas privadas não são públicas.'),
 (49,'Consultar métricas administrativas','A','src/app/api/admin/metrics/route.ts; src/services/admin.service.ts','Ampliação: indicadores administrativos','Abrir painel; solicitar métricas; analisar indicadores consolidados.','Exige Administrador; indicadores não equivalem a prova de segurança ou aceitação.'),
 (50,'Configurar preferências pessoais','U','src/app/settings/page.tsx','Ampliação: preferências','Abrir configurações; alterar aparência, sons ou idioma suportado; aplicar preferência.','Preferências locais não representam mudança de permissão no servidor.'),
 (51,'Personalizar avatar','U','src/app/avatar/AvatarCustomizer.tsx; src/app/api/avatar','RF004','Escolher características do avatar; salvar configuração; visualizar perfil atualizado.','A alteração pertence à própria conta.'),
 (52,'Testar código antes da submissão','U','src/app/api/exercises/[exerciseId]/run; src/app/api/duels/[id]/run','RF008, RF019','Preparar código; solicitar execução de teste; analisar saída e ajustar solução.','Execução de teste não implica conclusão nem concessão de XP.'),
 (53,'Consultar resultado de duelo','U','src/app/api/duels/[id]/route.ts; src/app/duels/[id]','RF020, RF021','Abrir duelo permitido; consultar estado, envios próprios e parecer disponível.','Duelo ativo restringe acesso a participantes, avaliadores e administradores.'),
 (54,'Excluir duelo elegível','U','src/app/api/duels/[id]/route.ts','Ampliação: manutenção de duelo','Criador seleciona duelo; solicita exclusão; servidor valida estado e propriedade.','Somente criador ou Administrador. Estados permitidos: PENDING, EXPIRED e CLOSED.'),
 (55,'Marcar notificações como lidas','U','src/app/api/notifications/route.ts','RF046','Abrir notificações; solicitar marcação; atualizar estado de leitura.','Operação afeta apenas as notificações do usuário autenticado.'),
 (56,'Consultar candidaturas de uma vaga','R','src/app/api/jobs/[id]/applications; src/services/job.service.ts','RF035, RF038, RF048','Selecionar vaga sob gestão; listar candidaturas; analisar informações autorizadas.','Recrutador responsável ou Administrador; validar vínculo com a empresa.')]
for n,name,actor,source,rf,flow,guard in extra:
    d['uc'].append(dict(id=f'UC{n:03}',name=name,actor=actor,source=source,rf=rf,flow=flow,guard=guard))
    d['participation'].setdefault(actor,[]).append(n)
d['participation']['A'] += [47,48,54,56]
d['groups'][0][1]+=[50,51]
d['groups'][1][1]+=[37]
d['groups'][2][1]+=[52]
d['groups'][3][1]+=[53,54]
d['groups'][5]=['06 Publicacoes e interacoes',[13,14,31,34,35,36]]
d['groups'][6][1]+=[49,55]
d['groups'][7][1]+=[56]
d['groups'] += [['09 Perfil e conexoes',[32,33]],['10 Mensagens privadas',[38,39,40,41]],['11 Comunidades',[42,43,44,45]],['12 Eventos e desafios',[15,23,46,47,48]]]
d['domains']=[
 ['01 Identidade e gamificacao',['User','LanguageTrail','Badge','UserBadge','EvaluatorApplication','EvaluatorProfile']],
 ['02 Grafo de conhecimento',['KnowledgeNode','KnowledgeEdge','LearningPath','LearningPathNode','Exercise']],
 ['03 Pratica e progresso',['User','Exercise','ExerciseTestCase','ExerciseRun','ExerciseSubmission','UserNodeProgress','LearningEvent','KnowledgeNode']],
 ['04 Quiz e historico',['User','Quiz','QuizAttempt','QuizLibrary']],
 ['05 Duelos',['User','Duel','DuelRequest','DuelSolution','DuelSubmission','DuelVote','DuelEvaluation']],
 ['06 Publicacoes e moderacao',['User','Post','Answer','PostVote','AnswerVote','Bookmark','Reaction','Report']],
 ['07 Mensagens e comunidade',['User','Message','MessageReaction','Follow','Guild','GuildMember','Notification']],
 ['08 Vagas e empresas',['User','Company','Job','JobRecruitmentStage','JobApplication']],
 ['09 Eventos',['User','Company','Event','EventChallenge','EventParticipant']],
 ['10 Suporte mobile',['User','MobileState','MobileDevice']]]
# Each flow has explicit decisions with two complete alternatives. Roles are human responsibilities.
d['activities']=[
 dict(id='AN01',name='Aprender em uma trilha',role='Estudante',pre=['Definir objetivo de estudo','Escolher percurso e analisar histórico'],q='Pré-requisitos cumpridos?',yes=['Estudar explicação e exemplos','Resolver exercícios e analisar feedback','Definir próximo objetivo de estudo'],no=['Retomar conhecimentos anteriores','Escolher etapa compatível']),
 dict(id='AN02',name='Participar de duelo',role='Participantes e avaliador autorizado',pre=['Escolher linguagem e procurar vaga','Abrir vaga ou entrar em duelo','Aguardar oponente por até 24 horas'],q='Oponente entrou no prazo?',yes=['Ler desafio e critérios do confronto','Elaborar e enviar soluções em até 2 horas','Consultar resultado ou aguardar parecer','Analisar feedback e próxima prática'],no=['Encerrar espera sem confronto'],note='Em empate técnico, avaliador não participante emite parecer (AN07B). Sem envios, não há vencedor; um envio elegível pode vencer. Falha de avaliação não confirma vitória.'),
 dict(id='AN03',name='Resolver exercício',role='Estudante',pre=['Ler enunciado e critérios','Planejar e elaborar solução','Consultar ajuda permitida, se necessário','Testar e submeter solução','Analisar feedback recebido'],q='Critérios atendidos?',yes=['Consolidar aprendizado e decidir próxima prática'],no=['Revisar solução com base no feedback'],loop=2),
 dict(id='AN04',name='Acompanhar evolução',role='Estudante',pre=['Consultar histórico e resultados','Comparar evolução com objetivos','Analisar XP, conquistas e ranking como apoio'],q='Há dificuldade recorrente?',yes=['Definir revisão e nova prática'],no=['Definir objetivo para avançar']),
 dict(id='AN05',name='Interagir com a comunidade',role='Autor, leitores e administrador',pre=['Autor prepara e revisa contribuição','Autor publica conteúdo na comunidade','Leitores leem e decidem como interagir'],q='Há possível violação das regras?',yes=['Leitor denuncia com justificativa','Administrador analisa procedência','Administrador mantém ou remove publicação'],no=['Leitores respondem, reagem, votam ou salvam','Autor e leitores acompanham contribuições']),
 dict(id='AN06',name='Consultar ajuda do exercício',role='Estudante',pre=['Identificar dúvida no exercício','Verificar material permitido no modo escolhido'],q='Ajuda disponível e permitida?',yes=['Consultar dica ou documentação','Interpretar orientação e retomar solução'],no=['Revisar material já estudado','Retomar solução ou adiar tentativa']),
 dict(id='AN07A',name='Obter credenciamento de avaliador',role='Candidato e administrador',pre=['Candidato verifica elegibilidade','Candidato apresenta motivação e tecnologias','Administrador examina candidatura e evidências'],q='Administrador aprova?',yes=['Administrador registra aprovação','Candidato toma ciência do credenciamento'],no=['Administrador registra rejeição','Candidato toma ciência da decisão'],note='Elegibilidade: uma trilha completa ou 1.000 XP. A aprovação encerra o credenciamento; avaliar um duelo é outro processo (AN07B).'),
 dict(id='AN07B',name='Emitir parecer de duelo',role='Avaliador autorizado',pre=['Selecionar empate técnico pendente','Verificar participação própria no duelo'],q='Há impedimento?',yes=['Abster-se e deixar o caso para outro avaliador'],no=['Comparar soluções e resultados dos testes','Informar pontuações, vencedor e justificativa','Apresentar parecer aos participantes']),
 dict(id='AN08A',name='Divulgar oportunidade',role='Representante da empresa e recrutador',pre=['Identificar empresa e responsável','Definir perfil, condições e etapas','Redigir a oportunidade'],q='Informações completas?',yes=['Conferir e publicar vaga'],no=['Corrigir informações da oportunidade'],loop=2,note='A publicação termina sem exigir candidato imediato. As candidaturas são tratadas em ciclos independentes (AN08B).'),
 dict(id='AN08B',name='Acompanhar candidatura',role='Candidato e recrutador responsável',pre=['Candidato lê vaga aberta','Candidato avalia compatibilidade'],q='Deseja candidatar-se?',yes=['Candidato envia candidatura única','Recrutador analisa dados públicos pertinentes','Recrutador informa etapa da seleção','Candidato acompanha situação'],no=['Encerrar consulta sem candidatura']),
 dict(id='AN09',name='Analisar demanda administrativa',role='Administrador',pre=['Identificar denúncia, permissão ou candidatura','Examinar informações e regras aplicáveis'],q='Há informação e competência?',yes=['Decidir procedência da solicitação','Registrar decisão e realizar ação autorizada','Verificar resultado e comunicar decisão'],no=['Solicitar esclarecimentos ou encaminhar demanda'],note='Candidaturas seguem AN07A. Não presumir trilha de auditoria completa: permanece um requisito a homologar.')]
covered={n for _,ns in d['domains'] for n in ns}
assert covered=={m['name'] for m in d['models']},covered^{m['name'] for m in d['models']}
(P/'model-data.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
print('Plan: 30 UC, 8 module views, 11 business flows, 10 data domains')
