from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1]
ROOT=R.parents[2]
inventory=json.loads((R/'fontes/inventario-astah-usuario.json').read_text('utf-8'))
diagram=next(d for d in inventory['diagrams'] if d['name']=='Caso de Uso Geral')
canonical={re.search(r'UC\d{3}',p['modelName'])[0]:re.sub(r'^UC\d{3}\s*','',p['modelName']).strip() for p in diagram['presentations'] if p['type']=='UseCase'}
assert len(canonical)==26
technical={c['id']:c for c in json.loads((ROOT/'docs/manual/detalhado/catalogo-casos.json').read_text('utf-8'))}
# Cada item é um objetivo da vista fornecida, sem acrescentar casos técnicos.
# Campos: ator, objetivo, pré-condições, cenários de implementação, alternativas.
facts={
1:('Usuário','Criar uma identidade própria para acessar a plataforma.','Não possuir conta com o mesmo e-mail ou nome de usuário; fornecer os dados obrigatórios.',[1],[
 'A1 — E-mail ou nome já utilizado: o sistema informa o conflito, mantém os campos permitidos e solicita outro identificador. O fluxo retoma a validação.',
 'A2 — Dados inválidos: o sistema aponta o campo e impede a criação até a correção.',
 'A3 — Confirmação de e-mail exigida pelo ambiente: a conta aguarda a confirmação antes do acesso autenticado.']),
2:('Usuário','Estabelecer uma sessão autenticada e recuperar o acesso quando necessário.','Possuir conta válida para autenticação; cadastro e recuperação são acessíveis sem sessão.',[2,3],[
 'A1 — Credenciais recusadas ou conta indisponível: o sistema não cria sessão e apresenta a orientação de acesso.',
 'A2 — Esquecimento da senha: o titular solicita recuperação e segue o link válido enviado pelo provedor de autenticação.',
 'A3 — Sessão expirada durante uma operação protegida: o usuário autentica novamente e retorna ao recurso autorizado.']),
3:('Usuário','Consultar e atualizar seu perfil, aparência e preferências pessoais.','Sessão válida; alterações permitidas somente ao titular ou a papel autorizado pelo recurso.',[22,28,54],[
 'A1 — Nome indisponível, formato inválido ou intervalo de alteração não atendido: a edição é recusada com a causa correspondente.',
 'A2 — Título, moldura ou cosmético não desbloqueado: o sistema mantém a seleção anterior.',
 'A3 — Imagem incompatível ou falha no envio: o perfil mantém a imagem confirmada e permite nova tentativa.']),
4:('Usuário','Escolher uma linguagem e consultar o percurso, as unidades e seu progresso.','Sessão válida para consultar o progresso pessoal; currículo disponível na versão instalada.',[4,5],[
 'A1 — Troca de linguagem ou caminho: a interface carrega o percurso escolhido e seu progresso independente.',
 'A2 — Lição bloqueada por pré-requisito: o sistema identifica a etapa necessária e impede acesso indevido.',
 'A3 — Caminho concluído: as lições continuam disponíveis para revisão, sem repetir o crédito de conclusão.']),
5:('Usuário','Estudar o conteúdo de uma lição e avançar para suas atividades.','Sessão válida; lição existente e acessível no caminho selecionado.',[6],[
 'A1 — Retomar uma lição: o sistema usa o progresso persistido e permite continuar ou revisar.',
 'A2 — Sair antes de concluir: os registros já confirmados permanecem, enquanto a sessão local de estudo é encerrada.',
 'A3 — Lição inexistente ou bloqueada: o sistema orienta o retorno ao caminho e informa a restrição.']),
6:('Usuário','Resolver a atividade, verificar a resposta e confirmar o resultado da aprendizagem.','Sessão válida; atividade disponível e vinculada à lição ou ao exercício selecionado.',[7,8,9,10,11,50],[
 'A1 — Executar uma prévia: o código é testado, mas a prévia não conclui a atividade nem concede XP.',
 'A2 — Resposta incorreta: o sistema apresenta o retorno previsto para o tipo de atividade e permite nova tentativa conforme a regra de vidas e progresso.',
 'A3 — Solicitar ajuda: realiza-se UC012 e o estudante retorna à atividade com o modo de assistência registrado.',
 'A4 — Repetir atividade já concluída: o sistema permite a revisão sem duplicar a recompensa de primeira conclusão.']),
7:('Usuário, com atualização automática pelo sistema','Apurar e apresentar progresso, XP, nível, classificação e reconhecimento.','Existir resultado validado ou consulta de desempenho autorizada; usar o período e a linguagem selecionados.',[14,15,16,25],[
 'A1 — Filtro por linguagem ou período: a classificação é recalculada para o filtro escolhido.',
 'A2 — Reconhecimento ainda inelegível: o sistema mostra os requisitos faltantes e não emite uma credencial indevida.',
 'A3 — Credencial já emitida: o registro existente é reutilizado; verificações públicas e PDF seguem suas condições de acesso.']),
8:('Usuário e adversário','Participar de um confronto de programação, da formação da partida ao resultado.','Sessão válida; linguagem e participantes elegíveis; respeitar os limites da fila e as regras contra abandono.',[36,38],[
 'A1 — Fila sem adversário: o jogador aguarda ou cancela a busca antes da formação da partida.',
 'A2 — Convite recusado ou expirado: o sistema encerra o pedido conforme sua política, sem simular aceitação.',
 'A3 — Prazo, empate, abandono ou revisão: o serviço aplica a política de resolução e registra o motivo do encerramento.',
 'A4 — Solução do participante: o envio ocorre por UC010, com execução e testes de UC027.']),
10:('Participante do duelo','Enviar uma solução elegível ao duelo e registrar sua avaliação técnica.','Sessão válida; usuário participante; duelo existente e em fase que aceite submissão.',[37],[
 'A1 — Apenas executar: retorna a saída de teste sem confundir a prévia com o envio definitivo.',
 'A2 — Código inválido, teste reprovado ou execução indisponível: o sistema registra o resultado permitido e informa o erro; não declara aprovação fictícia.',
 'A3 — Usuário fora da partida ou prazo encerrado: o envio é recusado antes da alteração do resultado.']),
12:('Usuário','Consultar uma orientação para avançar na resolução de uma atividade.','Atividade acessível; usuário autenticado; modalidade de ajuda permitida.',[12],[
 'A1 — Ajuda sem revelar a resposta: o sistema apresenta a dica correspondente e mantém a atividade aberta.',
 'A2 — Assistência com efeito na recompensa: o modo utilizado é registrado e considerado pela política da atividade.',
 'A3 — Ajuda indisponível ou não autorizada: a atividade permanece acessível sem conceder assistência não prevista.']),
13:('Usuário','Criar, consultar, editar ou excluir uma publicação própria.','Sessão válida para alterações; autorização sobre o conteúdo; atender aos limites de texto, mídia e audiência.',[17,18],[
 'A1 — Editar ou excluir: o sistema verifica a autoria ou a permissão administrativa antes de confirmar a alteração.',
 'A2 — Incluir código, imagem, enquete ou outro recurso compatível: o conteúdo segue as validações específicas do recurso.',
 'A3 — Dados inválidos ou falha na persistência: o conteúdo não é tratado como publicado e o formulário permite correção.']),
14:('Usuário','Registrar uma interação permitida com o conteúdo exibido.','Sessão válida para persistir a ação; publicação acessível; respeitar bloqueios e restrições de audiência.',[19,20,21,52],[
 'A1 — Reagir novamente à mesma publicação: o serviço altera ou remove a reação conforme a ação, sem duplicação indevida.',
 'A2 — Responder a uma conversa: a resposta é vinculada à publicação e, quando aplicável, à resposta anterior.',
 'A3 — Salvar ou retirar dos itens salvos: somente a coleção pessoal do titular é modificada.',
 'A4 — Votar em enquete: opções inválidas, voto incompatível ou enquete encerrada impedem a alteração.']),
15:('Administrador ou responsável autorizado pelo evento','Consultar e administrar um evento, seus desafios e sua situação.','Sessão válida; autorização administrativa ou vínculo com o evento; evento existente.',[44,45,46],[
 'A1 — Atualizar os desafios: a ordenação, os enunciados e os dados de avaliação são validados antes da gravação.',
 'A2 — Participação do usuário: inscrição, lotação, repetição e cancelamento seguem o serviço de eventos e a janela permitida.',
 'A3 — Evento encerrado ou usuário sem autorização: o sistema mantém o registro e informa a restrição.']),
16:('Avaliador','Registrar um parecer humano autorizado sobre um duelo.','Sessão válida; credenciamento e autorização vigentes; duelo apto à avaliação; ausência de conflito de participação.',[40],[
 'A1 — Avaliador participante ou impedido: o sistema recusa o parecer para preservar a imparcialidade.',
 'A2 — Nota, justificativa ou critérios inválidos: o formulário requer correção antes da persistência.',
 'A3 — Parecer já existente ou duelo fora da fase elegível: o fluxo segue a política de avaliação e não duplica o resultado.']),
17:('Recrutador e administrador, conforme autorização do recurso','Manter o cadastro da empresa e o vínculo de seu responsável.','Sessão válida; papel e vínculo exigidos pela operação.',[41],[
 'A1 — Atualizar empresa existente: o sistema confere o vínculo do gestor antes de alterar os dados.',
 'A2 — Empresa inexistente, identificador em conflito ou dados inválidos: a ação é recusada com indicação da causa.',
 'A3 — Acesso a outra empresa sem vínculo: o sistema impede a operação, mesmo quando a interface apresentou o recurso.']),
18:('Recrutador ou administrador autorizado','Cadastrar e manter uma vaga vinculada à empresa correta.','Sessão válida; autorização sobre a empresa; campos da oportunidade e etapas válidos.',[41],[
 'A1 — Alterar, encerrar ou filtrar uma vaga: o sistema aplica a autorização e a situação atual do registro.',
 'A2 — Empresa sem autorização: a vaga não é criada ou alterada.',
 'A3 — Etapas ou dados inválidos: a operação retorna para correção sem confirmar publicação incompleta.']),
19:('Administrador','Consultar e administrar usuários e permissões dentro dos limites de acesso.','Sessão válida; papel administrativo confirmado pelo servidor.',[47],[
 'A1 — Solicitação de credenciamento: o administrador analisa o pedido e aprova ou rejeita com a justificativa correspondente.',
 'A2 — Filtro de usuários ou auditoria: o sistema retorna somente os registros e campos autorizados.',
 'A3 — Tentativa sem permissão: o recurso retorna recusa de acesso e não altera papéis ou dados.']),
21:('Sistema, com Usuário como destinatário','Registrar e disponibilizar o aviso produzido por uma operação relevante.','Ocorrer fato notificável; existir destinatário válido; respeitar os critérios da notificação.',[26],[
 'A1 — Consultar por categoria ou marcar leitura: somente as notificações do titular são afetadas.',
 'A2 — Nenhum aviso para o filtro: a interface apresenta o estado vazio.',
 'A3 — Falha na atualização automática: a interface mantém os dados confirmados e permite reconsulta, sem presumir que o destinatário leu o aviso.']),
22:('Usuário candidato','Registrar uma candidatura única a uma vaga aberta.','Sessão válida; vaga existente e aberta; usuário ainda não inscrito na mesma oportunidade.',[42],[
 'A1 — Candidatura já existente: o sistema informa a inscrição anterior e não cria outra.',
 'A2 — Vaga encerrada ou removida: o envio é recusado antes da gravação.',
 'A3 — Falha de rede: o usuário consulta a situação confirmada antes de repetir o envio.']),
23:('Usuário com permissão de criação no fluxo','Criar um evento ou hackathon com suas informações obrigatórias.','Sessão válida; permissão de criação confirmada; título, período, formato e demais campos válidos.',[44],[
 'A1 — Evento associado a empresa: o sistema confere a autorização sobre a empresa vinculada.',
 'A2 — Dados ou período inválidos: o formulário apresenta as correções necessárias.',
 'A3 — Confirmação do cadastro: o evento passa à situação inicial e os avisos elegíveis seguem UC021.']),
24:('Usuário candidato a avaliador','Apresentar motivação e conhecimentos para solicitar o credenciamento.','Sessão válida; cumprir os critérios de elegibilidade; não existir pedido pendente incompatível.',[39],[
 'A1 — Requisitos insuficientes: o sistema apresenta as condições ainda não atendidas e impede o pedido.',
 'A2 — Solicitação pendente ou papel já credenciado: o sistema informa a situação existente.',
 'A3 — Motivação ou tecnologias inválidas: o candidato corrige os campos; enviar o pedido não concede automaticamente o papel.']),
25:('Recrutador ou administrador autorizado','Consultar candidaturas e registrar sua movimentação no processo seletivo.','Sessão válida; vínculo autorizado com a empresa e a vaga; candidatura e etapa compatíveis.',[43],[
 'A1 — Nova etapa, situação ou feedback: o sistema valida os vínculos, grava a mudança e registra a comunicação elegível.',
 'A2 — Etapa pertencente a outra vaga: a movimentação é recusada.',
 'A3 — Ausência de candidatos ou filtro sem resultado: o painel apresenta um estado vazio; nenhum registro é criado.']),
26:('Sistema, acionado pela resposta do Usuário','Avaliar a resposta segundo o tipo de atividade e produzir um resultado consistente.','Resposta recebida em contexto de atividade válida; critérios de avaliação disponíveis no servidor.',[7,8,9,10,11],[
 'A1 — Atividade de código: a avaliação usa a execução e os testes de UC027 quando necessários.',
 'A2 — Atividade objetiva ou interativa: a resposta é comparada ao formato e ao critério da atividade, sem exigir um executor externo.',
 'A3 — Modo de prévia: o resultado retorna ao usuário sem creditar conclusão.',
 'A4 — Primeira aprovação confirmada: os registros de progresso e desempenho elegíveis são atualizados, sem duplicar o crédito em repetições.']),
27:('Executor de código, acionado pelo sistema','Executar código com limites e devolver saída, erros e resultado dos testes.','Requisição autorizada; linguagem suportada; código e testes compatíveis; executor disponível.',[8,10,37],[
 'A1 — Erro de sintaxe ou execução: a resposta diferencia falha do código de falha de infraestrutura.',
 'A2 — Tempo ou recurso excedido: a execução termina segundo os limites do executor e retorna a condição correspondente.',
 'A3 — Executor indisponível: o sistema informa a indisponibilidade; não converte a falha em teste aprovado.']),
28:('Administrador','Analisar uma denúncia e registrar a providência de moderação.','Sessão válida; papel administrativo; denúncia existente e acessível à moderação.',[47,53],[
 'A1 — Denúncia procedente: o administrador confirma a medida autorizada e o sistema registra o resultado.',
 'A2 — Denúncia improcedente ou já tratada: o registro segue a situação correspondente sem repetir a ação.',
 'A3 — Recurso removido ou dados insuficientes: o sistema informa a condição e preserva os registros necessários à análise.']),
29:('Usuário','Encaminhar uma denúncia sobre uma publicação acessível.','Sessão válida; conteúdo identificável; motivo e detalhes aceitos pelo formulário.',[53],[
 'A1 — Motivo inválido ou detalhe obrigatório ausente: o sistema solicita correção.',
 'A2 — Conteúdo indisponível ou denúncia incompatível: o envio é recusado com retorno adequado.',
 'A3 — Denúncia aceita: o sistema confirma o recebimento; a denúncia não decide por si só a procedência ou a punição.']),
}
flows={
1:['O usuário abre o cadastro e informa nome de usuário, e-mail e senha.','O sistema valida os campos e verifica os identificadores disponíveis.','O provedor de autenticação cria a identidade e o sistema registra os dados do perfil.','O sistema apresenta a orientação de confirmação ou de acesso.'],
2:['O usuário abre o acesso e informa suas credenciais.','O provedor de autenticação verifica a identidade.','O sistema resolve a conta e estabelece a sessão válida.','A interface encaminha o usuário ao conteúdo autorizado.'],
3:['O usuário abre seu perfil ou as preferências e escolhe os dados a alterar.','A interface apresenta os dados e as personalizações disponíveis.','O usuário confirma as alterações desejadas.','O servidor valida autoria, formatos, disponibilidade e elegibilidade.','O sistema persiste a alteração e reapresenta o perfil confirmado.'],
4:['O usuário abre Trilhas e seleciona linguagem, caminho e modo de visualização.','O sistema carrega o currículo e o progresso pessoal.','A interface apresenta unidades, lições, exercícios concluídos e requisitos.','O usuário seleciona uma lição disponível para continuar ou revisar.'],
5:['O usuário abre uma lição disponível.','O sistema verifica a lição e o progresso correspondente.','A interface apresenta conceito, exemplo e orientação da etapa.','O usuário lê o conteúdo e avança às atividades de UC006.','O sistema permite retornar ao percurso e consultar o progresso confirmado.'],
6:['O usuário abre a atividade e consulta enunciado, opções ou editor.','O usuário informa uma resposta compatível com o tipo da atividade.','O servidor valida o contexto e solicita UC026 para avaliar a resposta.','A interface apresenta acerto, erro ou orientação aplicável.','Na submissão elegível, o sistema registra a tentativa e confirma a conclusão e a recompensa permitida.'],
7:['O sistema recebe um resultado confirmado ou uma consulta de desempenho.','O sistema considera os registros válidos, a linguagem e o período aplicáveis.','O sistema apura XP, nível, progresso e critérios de reconhecimento.','A interface apresenta a classificação e o desempenho correspondentes.','Quando os critérios forem atendidos, o sistema disponibiliza o reconhecimento elegível.'],
8:['O usuário escolhe a linguagem e solicita a fila ou cria um desafio.','O sistema valida elegibilidade e forma a partida quando houver adversário compatível.','Os participantes recebem o problema e as condições da disputa.','Cada participante trabalha em sua solução e usa UC010 para enviar.','O sistema aplica a política de encerramento e apresenta o resultado.'],
10:['O participante abre o duelo e informa o código na linguagem permitida.','O participante solicita o envio da solução.','O servidor confirma participação, fase, prazo e limites da submissão.','O sistema solicita UC027 e registra os resultados de execução e testes.','O sistema vincula o envio ao duelo e apresenta a situação confirmada.'],
12:['Durante UC006, o usuário solicita a ajuda disponível.','O sistema verifica o contexto da atividade e o modo de assistência permitido.','O sistema registra a assistência aplicável e retorna a orientação.','O usuário retoma a resolução da atividade.'],
13:['O usuário abre o formulário de publicação ou uma publicação própria.','O usuário informa ou altera o texto e os recursos compatíveis.','O servidor verifica autorização, limites e referências dos anexos.','O sistema grava a publicação ou a alteração solicitada.','A interface apresenta o conteúdo confirmado no feed ou no perfil.'],
14:['O usuário consulta uma publicação e escolhe uma interação disponível.','O sistema verifica sessão, acesso ao conteúdo e validade da ação.','O serviço correspondente registra a reação, resposta, voto ou item salvo.','A interface atualiza o estado da interação a partir do resultado confirmado.'],
15:['O responsável abre a administração de eventos.','O sistema verifica a autorização e lista os eventos acessíveis.','O responsável consulta ou altera informações, desafios e situação do evento.','O sistema valida a operação e grava os dados permitidos.','A interface confirma a atualização e disponibiliza os avisos elegíveis de UC021.'],
16:['O avaliador abre um duelo elegível para revisão.','O sistema verifica credenciamento, autorização e impedimentos.','O avaliador consulta as soluções e os critérios e informa seu parecer.','O servidor valida notas, justificativa e situação da avaliação.','O sistema registra o parecer e aplica os efeitos previstos à resolução do duelo.'],
17:['O gestor abre a área de empresas e informa ou seleciona a empresa.','O sistema confere seu papel e o vínculo de responsabilidade.','O gestor informa ou atualiza os dados cadastrais permitidos.','O sistema valida e grava o cadastro da empresa.','A interface confirma a empresa e permite acessar suas oportunidades autorizadas.'],
18:['O gestor seleciona uma empresa autorizada e abre o cadastro ou a edição da vaga.','O gestor informa título, descrição, tecnologias, modalidade e etapas.','O servidor verifica o vínculo com a empresa e valida a oportunidade.','O sistema grava a vaga e suas etapas de recrutamento.','A interface confirma a oportunidade e os avisos elegíveis seguem UC021.'],
19:['O administrador abre a área restrita de usuários.','O servidor verifica o papel administrativo e carrega os registros autorizados.','O administrador consulta um usuário e solicita a operação permitida.','O sistema valida a alteração e registra os dados e a auditoria aplicável.','A interface apresenta o resultado confirmado.'],
21:['Uma operação de origem identifica um fato notificável e seu destinatário.','O sistema valida a categoria, o destinatário e os dados do aviso.','O serviço registra a notificação.','A interface do destinatário consulta ou recebe a atualização dos avisos.','O usuário pode filtrar, consultar e marcar suas notificações conforme a ação permitida.'],
22:['O usuário consulta uma vaga e solicita a candidatura.','O servidor verifica a sessão, a existência da vaga e sua situação aberta.','O sistema verifica se já existe candidatura do mesmo usuário à vaga.','O sistema cria a candidatura com sua situação inicial e os vínculos corretos.','A interface confirma a inscrição e disponibiliza seu acompanhamento.'],
23:['O usuário autorizado abre o formulário de criação do evento.','O usuário informa os dados obrigatórios e o vínculo com empresa, quando aplicável.','O servidor confirma a permissão de criação e valida os dados.','O serviço cria o evento com sua situação inicial.','O sistema confirma o evento e encaminha os avisos elegíveis para UC021.'],
24:['O usuário abre o pedido de credenciamento.','O sistema apresenta sua elegibilidade e os requisitos.','O candidato informa motivação e conhecimentos técnicos e envia o pedido.','O servidor verifica os requisitos e a inexistência de pedido pendente incompatível.','O sistema registra a solicitação para análise administrativa e apresenta sua situação.'],
25:['O gestor abre o painel de candidaturas de uma vaga autorizada.','O sistema valida o vínculo com a empresa e apresenta os candidatos.','O gestor seleciona uma candidatura e informa etapa, situação ou feedback.','O servidor verifica a compatibilidade entre candidatura, vaga e etapa.','O sistema grava a movimentação, registra a auditoria aplicável e encaminha a notificação elegível.'],
26:['O sistema recebe a resposta e identifica a atividade e seu tipo.','O avaliador do servidor valida formato e contexto.','O sistema compara a resposta aos critérios ou aciona UC027 quando houver execução de código.','O sistema produz um resultado de acerto, falha ou indisponibilidade.','Em uma submissão elegível, o sistema confirma tentativa, progresso e emissão de desempenho por UC007.'],
27:['O sistema prepara a requisição autorizada de código, linguagem e testes.','O executor recebe a requisição e aplica os limites de execução.','O executor executa o código e verifica os casos de teste.','O executor devolve saída, erros, duração e resultado técnico.','O serviço de origem interpreta o retorno segundo as regras da atividade ou do duelo.'],
28:['O administrador abre a área de denúncias.','O sistema verifica o papel e apresenta os registros para análise.','O administrador consulta o conteúdo, o motivo e a situação da denúncia.','O administrador informa a providência autorizada ou a conclusão da análise.','O sistema registra a situação e confirma o resultado da moderação.'],
29:['O usuário abre as opções da publicação e seleciona a denúncia.','O sistema apresenta os motivos e campos previstos.','O usuário informa o motivo e os detalhes e solicita o envio.','O servidor valida sessão, conteúdo e dados da denúncia.','O sistema registra o relato e confirma seu recebimento para moderação.'],
}
successes={1:'Identidade e perfil registrados, com situação de confirmação apresentada.',2:'Sessão válida estabelecida ou recuperação solicitada pelo fluxo próprio.',3:'Perfil e preferências autorizadas persistidos.',4:'Percurso e progresso apresentados para a seleção atual.',5:'Conteúdo estudado e etapas confirmadas disponíveis para continuidade.',6:'Tentativa avaliada e submissão elegível confirmada sem duplicação de recompensa.',7:'Desempenho, classificação e reconhecimento apresentados com base nos registros válidos.',8:'Partida formada e encerrada conforme sua política, com resultado registrado.',10:'Solução vinculada ao participante e ao duelo, com resultado técnico registrado.',12:'Orientação apresentada e modo de assistência registrado quando aplicável.',13:'Publicação criada ou mantida com a autorização correspondente.',14:'Interação confirmada no registro e refletida na interface.',15:'Evento administrado com os vínculos e limites preservados.',16:'Parecer autorizado registrado e considerado pela política de resolução.',17:'Empresa cadastrada ou atualizada e vinculada ao responsável autorizado.',18:'Vaga e etapas persistidas na empresa autorizada.',19:'Operação administrativa autorizada registrada.',21:'Aviso registrado para o destinatário e disponível para consulta.',22:'Candidatura única registrada na vaga aberta.',23:'Novo evento registrado com os dados válidos e situação inicial.',24:'Pedido registrado para análise, sem concessão automática do papel.',25:'Movimentação da candidatura persistida com os vínculos corretos.',26:'Resultado da avaliação produzido e efeitos elegíveis confirmados.',27:'Resultado técnico retornado ao fluxo de origem.',28:'Análise e providência de moderação registradas.',29:'Denúncia recebida e disponível à moderação.'}
catalog=[]
for id,title in sorted(canonical.items()):
 n=int(id[2:]);actor,goal,pre,scenario_ids,alternatives=facts[n]
 support=[technical[f'C{i:02}'] for i in scenario_ids]
 steps=flows[n]
 catalog.append(dict(id=id,title=title,actor=actor,objective=goal,preconditions=pre,
   trigger='O ator solicita a operação na interface ou o sistema recebe o evento previsto para este comportamento.',
   steps=steps,alternatives=alternatives,
   success=successes[n],
   failure='A operação informa a causa da recusa ou da falha e mantém a última situação confirmada. Recompensas, permissões e resultados dependem da confirmação do servidor.',
   sources=sorted({c['source'] for c in support}),rules=sorted({v for c in support for v in c['rules']}),
   scenarioIds=[c['id'] for c in support]))
(R/'catalogo-casos.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n','utf-8')
md=['# Catálogo dos casos de uso Stacklyst','','A vista **Caso de Uso Geral** fornecida pelo grupo é a referência dos **26 casos de uso** desta edição. Os IDs e nomes abaixo reproduzem essa vista. As funcionalidades descritas no manual técnico não recebem automaticamente novos números de caso de uso.','','| ID | Nome no diagrama | Ator |','| --- | --- | --- |']
md += [f"| {c['id']} | {c['title']} | {c['actor']} |" for c in catalog]
for c in catalog:
 md+=['',f"## {c['id']} {c['title']}",'', '**Objetivo:** '+c['objective'],'','**Ator:** '+c['actor'],'','**Pré-condições:** '+c['preconditions'],'','### Fluxo principal','']+[f'{i+1}. {s}' for i,s in enumerate(c['steps'])]
 md+=['','### Fluxos alternativos e exceções','']+['- '+a for a in c['alternatives']]
 md+=['','**Pós-condição de sucesso:** '+c['success'],'','**Garantia em caso de falha:** '+c['failure'],'','**Implementação:** '+', '.join('`'+s+'`' for s in c['sources'])+'.','','**Regras relacionadas:** '+', '.join(c['rules'])+'.']
(R/'catalogo-casos.md').write_text('\n'.join(md)+'\n','utf-8')
print('Catálogo:',len(catalog),'casos da vista Caso de Uso Geral')
